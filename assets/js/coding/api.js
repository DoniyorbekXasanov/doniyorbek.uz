/**
 * Official Codeforces API Service
 *
 * Enforces Codeforces rate limit (max 1 request every 2 seconds),
 * deduplicates concurrent requests, and caches responses in localStorage.
 */

const CF_API_BASE = 'https://codeforces.com/api/';
const MIN_REQUEST_INTERVAL_MS = 2150;
const CACHE_PREFIX = 'cf_api_v2:';
const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

let lastRequestAt = 0;
let rateQueue = Promise.resolve();
const inflightRequests = new Map();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function enqueueRateLimited(task) {
  const next = rateQueue.then(async () => {
    const elapsed = Date.now() - lastRequestAt;
    if (lastRequestAt > 0 && elapsed < MIN_REQUEST_INTERVAL_MS) {
      await sleep(MIN_REQUEST_INTERVAL_MS - elapsed);
    }
    lastRequestAt = Date.now();
    return task();
  });

  rateQueue = next.catch(() => {});
  return next;
}

function getCacheKey(method, params) {
  const qs = new URLSearchParams(params).toString();
  return `${CACHE_PREFIX}${method}?${qs}`;
}

function readCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.timestamp !== 'number' || !('data' in parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Call an official Codeforces API method with caching, deduplication, and rate limiting.
 * @param {string} method
 * @param {Record<string, string|number>} params
 * @param {{ forceRefresh?: boolean, ttlMs?: number }} [options]
 * @returns {Promise<{ result: any, cached: boolean, fetchedAt: number }>}
 */
export async function callCodeforcesApi(method, params = {}, options = {}) {
  const { forceRefresh = false, ttlMs = DEFAULT_TTL_MS } = options;
  const cacheKey = getCacheKey(method, params);
  const cachedEntry = readCache(cacheKey);

  if (!forceRefresh && cachedEntry && Date.now() - cachedEntry.timestamp < ttlMs) {
    return {
      result: cachedEntry.data,
      cached: true,
      fetchedAt: cachedEntry.timestamp,
    };
  }

  if (inflightRequests.has(cacheKey)) {
    return inflightRequests.get(cacheKey);
  }

  const requestPromise = enqueueRateLimited(async () => {
    const url = new URL(method, CF_API_BASE);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, String(v));
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new Error(`Invalid JSON from Codeforces API (${method}, HTTP ${response.status})`);
    }

    if (!response.ok || !payload || payload.status !== 'OK') {
      const comment = payload && payload.comment ? payload.comment : `HTTP ${response.status}`;
      throw new Error(`Codeforces API error (${method}): ${comment}`);
    }

    writeCache(cacheKey, payload.result);
    return {
      result: payload.result,
      cached: false,
      fetchedAt: Date.now(),
    };
  })
    .catch((err) => {
      // Fallback to stale cache if network/rate-limit fails
      if (cachedEntry) {
        return {
          result: cachedEntry.data,
          cached: true,
          stale: true,
          fetchedAt: cachedEntry.timestamp,
          warning: err.message,
        };
      }
      throw err;
    })
    .finally(() => {
      inflightRequests.delete(cacheKey);
    });

  inflightRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

/**
 * Fetch user profile via `user.info`.
 */
export async function fetchUserInfo(handle, options = {}) {
  const res = await callCodeforcesApi('user.info', { handles: handle }, options);
  if (!Array.isArray(res.result) || res.result.length === 0) {
    throw new Error(`Codeforces user "${handle}" not found.`);
  }
  return {
    ...res,
    result: res.result[0],
  };
}

/**
 * Fetch user contest rating history via `user.rating`.
 */
export async function fetchUserRating(handle, options = {}) {
  return callCodeforcesApi('user.rating', { handle }, options);
}

/**
 * Fetch all user submissions via `user.status` (paginating if > 1000).
 */
export async function fetchUserSubmissions(handle, options = {}) {
  const pageSize = 1000;
  let from = 1;
  let all = [];
  let latestMeta = { cached: true, fetchedAt: Date.now() };

  while (true) {
    const res = await callCodeforcesApi(
      'user.status',
      { handle, from, count: pageSize },
      options
    );
    latestMeta = res;
    const batch = Array.isArray(res.result) ? res.result : [];
    all = all.concat(batch);
    if (batch.length < pageSize) {
      break;
    }
    from += pageSize;
  }

  return {
    result: all,
    cached: latestMeta.cached,
    stale: latestMeta.stale,
    fetchedAt: latestMeta.fetchedAt,
  };
}
