/* ===================================================================
   Codeforces Dashboard — doniyorbek.uz/coding/
   Data source: https://codeforces.com/apiHelp (public, CORS-enabled)
   =================================================================== */
(function () {
  'use strict';

  var HANDLE = 'DoniyorbekXasanov';
  var API_BASE = 'https://codeforces.com/api/';
  var CF_BASE = 'https://codeforces.com';
  var CACHE_KEY = 'cf-dashboard-v1';
  var CACHE_FRESH_MS = 2 * 60 * 1000;
  var SOLVED_PAGE_SIZE = 15;
  var SUB_PAGE_SIZE = 20;
  var TAG_PREVIEW = 10;
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var DAY_MS = 86400000;

  var VERDICT_LABELS = {
    OK: 'Accepted',
    WRONG_ANSWER: 'Wrong answer',
    TIME_LIMIT_EXCEEDED: 'Time limit exceeded',
    MEMORY_LIMIT_EXCEEDED: 'Memory limit exceeded',
    IDLENESS_LIMIT_EXCEEDED: 'Idleness limit exceeded',
    RUNTIME_ERROR: 'Runtime error',
    COMPILATION_ERROR: 'Compilation error',
    PRESENTATION_ERROR: 'Presentation error',
    PARTIAL: 'Partial',
    CHALLENGED: 'Hacked',
    SKIPPED: 'Skipped',
    REJECTED: 'Rejected',
    FAILED: 'Failed',
    CRASHED: 'Crashed',
    SECURITY_VIOLATED: 'Security violated',
    INPUT_PREPARATION_CRASHED: 'Input preparation crashed',
    TESTING: 'In queue'
  };

  var BAD_VERDICTS = {
    WRONG_ANSWER: 1, TIME_LIMIT_EXCEEDED: 1, MEMORY_LIMIT_EXCEEDED: 1,
    IDLENESS_LIMIT_EXCEEDED: 1, RUNTIME_ERROR: 1, PRESENTATION_ERROR: 1, CHALLENGED: 1
  };

  var PARTICIPANT_LABELS = {
    CONTESTANT: 'Contest',
    PRACTICE: 'Practice',
    VIRTUAL: 'Virtual',
    OUT_OF_COMPETITION: 'Unofficial',
    MANAGER: 'Manager'
  };

  // Official Codeforces rating-graph bands.
  var RATING_BANDS = [
    [0, 1200, '#cccccc'], [1200, 1400, '#77ff77'], [1400, 1600, '#77ddbb'],
    [1600, 1900, '#aaaaff'], [1900, 2100, '#ff88ff'], [2100, 2300, '#ffcc88'],
    [2300, 2400, '#ffbb55'], [2400, 2600, '#ff7777'], [2600, 3000, '#ff3333'],
    [3000, 5000, '#aa0000']
  ];

  var state = {
    data: null,
    heatmapRange: '12m',
    solvedPage: 1,
    subPage: 1,
    tagsExpanded: false,
    loading: false
  };

  /* ------------------------------ Helpers ------------------------------ */

  function byId(id) { return document.getElementById(id); }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function svgEl(tag, attrs) {
    var node = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs || {}).forEach(function (key) { node.setAttribute(key, attrs[key]); });
    return node;
  }

  function clear(node) {
    while (node && node.firstChild) node.removeChild(node.firstChild);
    return node;
  }

  function link(href, text, className) {
    var a = el('a', className, text);
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    return a;
  }

  function fmt(n) {
    return Number.isFinite(Number(n)) ? Number(n).toLocaleString('en-US') : '-';
  }

  function fmtDate(seconds, withTime) {
    var opts = { year: 'numeric', month: 'short', day: 'numeric' };
    if (withTime) { opts.hour = '2-digit'; opts.minute = '2-digit'; }
    return new Date(seconds * 1000).toLocaleString('en-US', opts);
  }

  function relativeTime(seconds) {
    var diff = Date.now() / 1000 - seconds;
    if (diff < 60) return 'just now';
    var units = [[31536000, 'year'], [2592000, 'month'], [86400, 'day'], [3600, 'hour'], [60, 'minute']];
    for (var i = 0; i < units.length; i++) {
      var value = Math.floor(diff / units[i][0]);
      if (value >= 1) return value + ' ' + units[i][1] + (value > 1 ? 's' : '') + ' ago';
    }
    return 'just now';
  }

  function dayKey(date) {
    var m = date.getMonth() + 1;
    var d = date.getDate();
    return date.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d;
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function addDays(date, days) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  }

  function rankClass(rating) {
    if (rating === undefined || rating === null) return 'cf-rank-unrated';
    if (rating < 1200) return 'cf-rank-newbie';
    if (rating < 1400) return 'cf-rank-pupil';
    if (rating < 1600) return 'cf-rank-specialist';
    if (rating < 1900) return 'cf-rank-expert';
    if (rating < 2100) return 'cf-rank-cm';
    if (rating < 2400) return 'cf-rank-master';
    return 'cf-rank-gm';
  }

  function rankVar(rating) {
    return 'var(--' + rankClass(rating) + ')';
  }

  function verdictLabel(verdict) {
    if (!verdict) return 'In queue';
    return VERDICT_LABELS[verdict] || verdict.charAt(0) + verdict.slice(1).toLowerCase().replace(/_/g, ' ');
  }

  function verdictKind(verdict) {
    if (verdict === 'OK') return 'ok';
    return BAD_VERDICTS[verdict] ? 'bad' : 'other';
  }

  function problemKey(problem) {
    return (problem.contestId || problem.problemsetName || '') + '-' + problem.index;
  }

  function problemId(problem) {
    return (problem.contestId || '') + problem.index;
  }

  function isGym(contestId) { return contestId >= 100000; }

  function problemUrl(problem) {
    if (!problem.contestId) {
      return CF_BASE + '/problemsets/' + encodeURIComponent(problem.problemsetName || 'acmsguru') +
        '/problem/99999/' + encodeURIComponent(problem.index);
    }
    return CF_BASE + (isGym(problem.contestId) ? '/gym/' : '/contest/') + problem.contestId +
      '/problem/' + encodeURIComponent(problem.index);
  }

  function contestUrl(contestId) {
    return CF_BASE + (isGym(contestId) ? '/gym/' : '/contest/') + contestId;
  }

  function submissionUrl(sub) {
    if (!sub.contestId) return CF_BASE + '/profile/' + HANDLE;
    return contestUrl(sub.contestId) + '/submission/' + sub.id;
  }

  /* ------------------------------ Tooltip ------------------------------ */

  var tooltip = null;

  function showTooltip(target, lines) {
    if (!tooltip) {
      tooltip = el('div', 'cf-tooltip');
      tooltip.setAttribute('role', 'tooltip');
      document.body.appendChild(tooltip);
    }
    clear(tooltip);
    lines.forEach(function (line, i) {
      var row = el(i === 0 ? 'strong' : 'div', null, line);
      if (i === 0) row.style.display = 'block';
      tooltip.appendChild(row);
    });
    var rect = target.getBoundingClientRect();
    tooltip.style.left = Math.max(80, Math.min(window.innerWidth - 80, rect.left + rect.width / 2)) + 'px';
    tooltip.style.top = rect.top + 'px';
    tooltip.classList.add('is-visible');
  }

  function hideTooltip() {
    if (tooltip) tooltip.classList.remove('is-visible');
  }

  function bindTooltip(container, selector, getLines) {
    function onEnter(event) {
      var target = event.target.closest ? event.target.closest(selector) : null;
      if (target && container.contains(target)) showTooltip(target, getLines(target));
    }
    container.addEventListener('mouseover', onEnter);
    container.addEventListener('focusin', onEnter);
    container.addEventListener('mouseleave', hideTooltip);
    container.addEventListener('focusout', hideTooltip);
  }

  window.addEventListener('scroll', hideTooltip, { passive: true });

  /* ------------------------------ API ------------------------------ */

  function wait(ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); }

  function apiCall(method, params, attempt) {
    attempt = attempt || 0;
    var query = Object.keys(params).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
    }).join('&');

    return fetch(API_BASE + method + '?' + query, { headers: { Accept: 'application/json' } })
      .then(function (response) {
        return response.json().catch(function () {
          throw new Error('Codeforces returned HTTP ' + response.status);
        });
      })
      .then(function (body) {
        if (body.status === 'OK') return body.result;
        var apiError = new Error(body.comment || 'Codeforces API error');
        apiError.permanent = !/limit/i.test(body.comment || '');
        throw apiError;
      })
      .catch(function (error) {
        // The API allows roughly one call per two seconds; back off and retry
        // on rate limits and network failures, but not on permanent errors.
        if (!error.permanent && attempt < 3) return wait(2100 * (attempt + 1)).then(function () { return apiCall(method, params, attempt + 1); });
        throw error;
      });
  }

  function slimSubmission(s) {
    return {
      id: s.id,
      contestId: s.contestId,
      creationTimeSeconds: s.creationTimeSeconds,
      problem: {
        contestId: s.problem.contestId,
        problemsetName: s.problem.problemsetName,
        index: s.problem.index,
        name: s.problem.name,
        rating: s.problem.rating,
        tags: s.problem.tags || []
      },
      participantType: s.author && s.author.participantType,
      programmingLanguage: s.programmingLanguage,
      verdict: s.verdict,
      passedTestCount: s.passedTestCount,
      timeConsumedMillis: s.timeConsumedMillis,
      memoryConsumedBytes: s.memoryConsumedBytes
    };
  }

  function fetchAll() {
    return Promise.all([
      apiCall('user.info', { handles: HANDLE }),
      apiCall('user.rating', { handle: HANDLE }),
      apiCall('user.status', { handle: HANDLE }),
      apiCall('user.blogEntries', { handle: HANDLE }).catch(function () { return []; })
    ]).then(function (results) {
      return {
        time: Date.now(),
        info: results[0][0],
        rating: results[1],
        status: results[2].map(slimSubmission),
        blogs: results[3].map(function (b) {
          return { id: b.id, title: b.title, creationTimeSeconds: b.creationTimeSeconds, rating: b.rating };
        })
      };
    });
  }

  function readCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      var data = raw ? JSON.parse(raw) : null;
      return data && data.info && Array.isArray(data.status) ? data : null;
    } catch (e) { return null; }
  }

  function writeCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (e) { /* quota or private mode */ }
  }

  /* ------------------------------ Derived data ------------------------------ */

  function derive(data) {
    var subs = data.status.slice().sort(function (a, b) { return b.creationTimeSeconds - a.creationTimeSeconds; });
    var solvedMap = {};
    var contestSolved = {};
    var verdicts = {};
    var languages = {};
    var days = {};
    var accepted = 0;

    subs.forEach(function (s) {
      var v = s.verdict || 'TESTING';
      verdicts[v] = (verdicts[v] || 0) + 1;
      languages[s.programmingLanguage] = (languages[s.programmingLanguage] || 0) + 1;

      var key = dayKey(new Date(s.creationTimeSeconds * 1000));
      var day = days[key] || (days[key] = { total: 0, ok: 0 });
      day.total++;

      if (s.verdict === 'OK') {
        accepted++;
        day.ok++;
        var pk = problemKey(s.problem);
        var existing = solvedMap[pk];
        // Iterating newest to oldest, so the last assignment is the first accept.
        solvedMap[pk] = {
          problem: s.problem,
          solvedAt: s.creationTimeSeconds,
          language: s.programmingLanguage,
          accepts: existing ? existing.accepts + 1 : 1
        };
        if (s.participantType === 'CONTESTANT' && s.contestId) {
          var set = contestSolved[s.contestId] || (contestSolved[s.contestId] = {});
          set[s.problem.index] = true;
        }
      }
    });

    var solved = Object.keys(solvedMap).map(function (k) { return solvedMap[k]; });
    var tags = {};
    var difficulty = {};
    var hardest = null;

    solved.forEach(function (item) {
      (item.problem.tags || []).forEach(function (t) { tags[t] = (tags[t] || 0) + 1; });
      var r = item.problem.rating;
      var bucket = r ? String(r) : 'Unrated';
      difficulty[bucket] = (difficulty[bucket] || 0) + 1;
      if (r && (!hardest || r > hardest.problem.rating)) hardest = item;
    });

    var streaks = computeStreaks(days);

    return {
      subs: subs,
      solved: solved,
      verdicts: verdicts,
      languages: languages,
      tags: tags,
      difficulty: difficulty,
      days: days,
      accepted: accepted,
      hardest: hardest,
      contestSolved: contestSolved,
      streaks: streaks
    };
  }

  function computeStreaks(days) {
    var keys = Object.keys(days).sort();
    var longest = 0;
    var run = 0;
    var prev = null;
    keys.forEach(function (k) {
      var parts = k.split('-');
      var date = new Date(+parts[0], +parts[1] - 1, +parts[2]);
      run = prev && dayKey(addDays(prev, 1)) === k ? run + 1 : 1;
      longest = Math.max(longest, run);
      prev = date;
    });

    var current = 0;
    var cursor = startOfDay(new Date());
    if (!days[dayKey(cursor)]) cursor = addDays(cursor, -1); // today may not have started yet
    while (days[dayKey(cursor)]) {
      current++;
      cursor = addDays(cursor, -1);
    }
    return { longest: longest, current: current };
  }

  /* ------------------------------ Renderers ------------------------------ */

  function renderProfile(info) {
    var root = clear(byId('cf-profile'));
    var img = el('img', 'cf-profile-avatar');
    img.src = info.titlePhoto || info.avatar;
    img.alt = info.handle + ' profile photo';
    img.width = 96;
    img.height = 96;
    img.loading = 'lazy';
    img.decoding = 'async';
    root.appendChild(img);

    var body = el('div', 'cf-profile-body');
    var cls = rankClass(info.rating);
    body.appendChild(el('div', 'cf-profile-rank ' + cls, info.rank || 'Unrated'));

    var handle = el('h2', 'cf-profile-handle ' + cls);
    handle.appendChild(link(CF_BASE + '/profile/' + encodeURIComponent(info.handle), info.handle));
    body.appendChild(handle);

    var facts = el('ul', 'cf-profile-facts');
    function fact(label, value) {
      if (value === undefined || value === null || value === '') return;
      var li = el('li');
      li.appendChild(document.createTextNode(label + ': '));
      li.appendChild(el('strong', null, value));
      facts.appendChild(li);
    }
    var name = [info.firstName, info.lastName].filter(Boolean).join(' ');
    fact('Name', name);
    fact('From', [info.city, info.country].filter(Boolean).join(', '));
    fact('Organization', info.organization);
    fact('Contribution', (info.contribution > 0 ? '+' : '') + info.contribution);
    fact('Friend of', fmt(info.friendOfCount) + (info.friendOfCount === 1 ? ' user' : ' users'));
    fact('Registered', fmtDate(info.registrationTimeSeconds));
    fact('Last visit', relativeTime(info.lastOnlineTimeSeconds));
    body.appendChild(facts);
    root.appendChild(body);
  }

  function setMetric(id, value, sub, className) {
    var node = clear(byId('cf-metric-' + id));
    node.textContent = value;
    node.className = 'cf-metric-value' + (className ? ' ' + className : '');
    if (sub !== undefined) byId('cf-metric-' + id + '-sub').textContent = sub;
  }

  function renderMetrics(data, d) {
    var info = data.info;
    var unrated = info.rating === undefined;
    setMetric('rating', unrated ? 'Unrated' : fmt(info.rating), unrated ? 'No rated contests yet' : info.rank, rankClass(info.rating));
    setMetric('max', unrated ? '-' : fmt(info.maxRating), unrated ? 'Peak rating' : 'Peak: ' + info.maxRank, rankClass(info.maxRating));
    setMetric('solved', fmt(d.solved.length), 'Unique problems accepted');

    var best = data.rating.reduce(function (min, r) { return min === null || r.rank < min ? r.rank : min; }, null);
    setMetric('contests', fmt(data.rating.length), best ? 'Best place: #' + fmt(best) : 'Rated contests');
    setMetric('subs', fmt(d.subs.length), 'Total attempts');

    var acc = d.subs.length ? Math.round((d.accepted / d.subs.length) * 100) : 0;
    setMetric('acc', acc + '%', fmt(d.accepted) + ' accepted');
    setMetric('days', fmt(Object.keys(d.days).length), 'Longest streak: ' + d.streaks.longest + (d.streaks.longest === 1 ? ' day' : ' days'));

    if (d.hardest) {
      setMetric('hardest', fmt(d.hardest.problem.rating), problemId(d.hardest.problem) + ' · ' + d.hardest.problem.name, rankClass(d.hardest.problem.rating));
    } else {
      setMetric('hardest', '-', 'No rated problems solved');
    }
  }

  var BAND_EDGES = [1200, 1400, 1600, 1900, 2100, 2300, 2400, 2600, 3000];
  var RANK_TITLES = [
    [3000, 'legendary grandmaster'], [2600, 'international grandmaster'], [2400, 'grandmaster'],
    [2300, 'international master'], [2100, 'master'], [1900, 'candidate master'],
    [1600, 'expert'], [1400, 'specialist'], [1200, 'pupil'], [0, 'newbie']
  ];

  function rankTitle(rating) {
    for (var i = 0; i < RANK_TITLES.length; i++) if (rating >= RANK_TITLES[i][0]) return RANK_TITLES[i][1];
    return 'newbie';
  }

  function signed(n) { return (n >= 0 ? '+' : '') + n; }

  // Rating axis: pad around the data and keep the next rank band in view.
  function ratingScale(lo, hi) {
    var yMin = Math.max(0, Math.floor((lo - 100) / 100) * 100);
    var yMax = Math.ceil((hi + 100) / 100) * 100;
    for (var i = 0; i < BAND_EDGES.length; i++) {
      if (BAND_EDGES[i] > hi) {
        if (BAND_EDGES[i] - hi <= 600) yMax = Math.max(yMax, BAND_EDGES[i] + 100);
        break;
      }
    }
    return { min: yMin, max: yMax };
  }

  function ratingTicks(yMin, yMax, toPx) {
    var range = yMax - yMin;
    var step = range <= 800 ? 100 : range <= 1600 ? 200 : range <= 3000 ? 300 : 500;
    var edges = BAND_EDGES.filter(function (e) { return e > yMin && e < yMax; });
    var ticks = edges.slice();
    for (var r = Math.ceil(yMin / step) * step; r <= yMax; r += step) {
      var tooClose = edges.some(function (e) { return e !== r && Math.abs(toPx(e) - toPx(r)) < 16; });
      if (!tooClose && ticks.indexOf(r) === -1) ticks.push(r);
    }
    return ticks.sort(function (a, b) { return a - b; });
  }

  // Date axis: weekly ticks for short histories, month ticks otherwise.
  function timeTicks(t0, t1, maxTicks) {
    var ticks = [];
    var days = (t1 - t0) / 86400;
    var d;
    if (days <= 90) {
      var stepDays = [7, 14, 28].filter(function (s) { return days / s <= maxTicks; })[0] || 28;
      d = startOfDay(new Date(t0 * 1000));
      d = addDays(d, (8 - d.getDay()) % 7); // next Monday
      for (; d.getTime() / 1000 <= t1; d = addDays(d, stepDays)) {
        ticks.push({ t: d.getTime() / 1000, label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) });
      }
      return ticks;
    }
    var months = days / 30.4;
    var stepMonths = [1, 2, 3, 4, 6, 12, 24].filter(function (s) { return months / s <= maxTicks; })[0] || 24;
    var start = new Date(t0 * 1000);
    d = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    while (d.getMonth() % Math.min(stepMonths, 12) !== 0) d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    for (; d.getTime() / 1000 <= t1; d = new Date(d.getFullYear(), d.getMonth() + stepMonths, 1)) {
      ticks.push({
        t: d.getTime() / 1000,
        label: stepMonths >= 12 ? String(d.getFullYear()) : d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      });
    }
    return ticks;
  }

  function renderRatingChart(history) {
    var root = clear(byId('cf-rating-chart'));
    state.ratingHistory = history;
    if (!history.length) {
      root.appendChild(el('div', 'cf-empty', 'No rated contests yet. The graph appears after the first rated contest.'));
      return;
    }

    var W = Math.max(280, Math.round(root.clientWidth || 760));
    var H = W < 520 ? 240 : 300;
    var PL = 44, PR = 10, PT = 8, PB = 26;
    var plotW = W - PL - PR, plotH = H - PT - PB;
    state.chartWidth = W;

    var ratings = history.map(function (h) { return h.newRating; });
    var scale = ratingScale(Math.min.apply(null, ratings), Math.max.apply(null, ratings));
    var yMin = scale.min, yMax = scale.max;

    var t0 = history[0].ratingUpdateTimeSeconds;
    var t1 = history[history.length - 1].ratingUpdateTimeSeconds;
    var pad = Math.max((t1 - t0) * 0.04, 10 * 86400);
    var xMin = t0 - pad, xMax = t1 + pad;

    function x(t) { return PL + ((t - xMin) / (xMax - xMin)) * plotW; }
    function y(r) { return PT + (1 - (r - yMin) / (yMax - yMin)) * plotH; }

    var last = history[history.length - 1];
    var svg = svgEl('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, class: 'cf-chart-svg', role: 'img',
      'aria-label': 'Rating graph: ' + history.length + ' rated contests, current rating ' + last.newRating +
        ', max rating ' + Math.max.apply(null, ratings) });

    var clipId = 'cf-chart-clip';
    var defs = svgEl('defs');
    var clip = svgEl('clipPath', { id: clipId });
    clip.appendChild(svgEl('rect', { x: PL, y: PT, width: plotW, height: plotH }));
    defs.appendChild(clip);
    svg.appendChild(defs);

    // Rank bands
    var bands = svgEl('g', { class: 'cf-chart-bands', 'clip-path': 'url(#' + clipId + ')' });
    RATING_BANDS.forEach(function (band) {
      var top = Math.min(band[1], yMax), bottom = Math.max(band[0], yMin);
      if (top <= bottom) return;
      bands.appendChild(svgEl('rect', { x: PL, width: plotW, y: y(top), height: y(bottom) - y(top), fill: band[2] }));
    });
    svg.appendChild(bands);

    // Grid + axis labels
    var grid = svgEl('g', { class: 'cf-chart-grid' });
    var axis = svgEl('g', { class: 'cf-chart-axis' });
    ratingTicks(yMin, yMax, y).forEach(function (r) {
      grid.appendChild(svgEl('line', { x1: PL, x2: PL + plotW, y1: y(r), y2: y(r) }));
      var label = svgEl('text', { x: PL - 6, y: y(r) + 3.5, 'text-anchor': 'end' });
      label.textContent = r;
      axis.appendChild(label);
    });
    timeTicks(xMin, xMax, Math.max(2, Math.floor(plotW / 95))).forEach(function (tick) {
      var tx = x(tick.t);
      grid.appendChild(svgEl('line', { x1: tx, x2: tx, y1: PT, y2: PT + plotH }));
      var label = svgEl('text', { x: tx, y: H - 8, 'text-anchor': 'middle' });
      label.textContent = tick.label;
      axis.appendChild(label);
    });
    svg.appendChild(grid);
    svg.appendChild(svgEl('rect', { x: PL + 0.5, y: PT + 0.5, width: plotW - 1, height: plotH - 1, class: 'cf-chart-frame' }));
    svg.appendChild(axis);

    // Rating line and points
    var series = svgEl('g', { 'clip-path': 'url(#' + clipId + ')' });
    series.appendChild(svgEl('polyline', {
      points: history.map(function (h) { return x(h.ratingUpdateTimeSeconds).toFixed(1) + ',' + y(h.newRating).toFixed(1); }).join(' '),
      class: 'cf-chart-line'
    }));
    svg.appendChild(series);

    history.forEach(function (h, idx) {
      var delta = h.newRating - h.oldRating;
      var g = svgEl('g', { class: 'cf-chart-point', tabindex: 0, role: 'link', 'data-idx': idx,
        'aria-label': h.contestName + ': rating ' + h.newRating + ' (' + signed(delta) + '), rank ' + h.rank + '. Opens contest.' });
      var cx = x(h.ratingUpdateTimeSeconds), cy = y(h.newRating);
      g.appendChild(svgEl('circle', { cx: cx, cy: cy, r: 9, class: 'cf-chart-halo' }));
      g.appendChild(svgEl('circle', { cx: cx, cy: cy, r: 3.5, class: 'cf-chart-dot' }));
      svg.appendChild(g);
    });

    root.appendChild(svg);

    bindTooltip(svg, '.cf-chart-point', function (node) {
      var h = history[+node.getAttribute('data-idx')];
      return [
        '= ' + h.newRating + ' (' + signed(h.newRating - h.oldRating) + '), ' + rankTitle(h.newRating),
        'Rank: ' + fmt(h.rank),
        h.contestName,
        fmtDate(h.ratingUpdateTimeSeconds)
      ];
    });

    function openContest(event) {
      var node = event.target.closest ? event.target.closest('.cf-chart-point') : null;
      if (!node) return;
      if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      window.open(contestUrl(history[+node.getAttribute('data-idx')].contestId), '_blank', 'noopener');
    }
    svg.addEventListener('click', openContest);
    svg.addEventListener('keydown', openContest);
  }

  function renderContestTable(history, contestSolved) {
    var root = clear(byId('cf-contest-table'));
    if (!history.length) {
      root.appendChild(el('div', 'cf-empty', 'No rated contests yet.'));
      return;
    }
    var table = el('table', 'cf-table');
    var thead = el('thead');
    var hr = el('tr');
    [['#', 'cf-num'], ['Contest'], ['Date'], ['Place', 'cf-num'], ['Solved', 'cf-num'], ['Change', 'cf-num'], ['Rating', 'cf-num']]
      .forEach(function (c) { var th = el('th', c[1], c[0]); th.scope = 'col'; hr.appendChild(th); });
    thead.appendChild(hr);
    table.appendChild(thead);

    var tbody = el('tbody');
    history.slice().reverse().forEach(function (h, i) {
      var tr = el('tr');
      var delta = h.newRating - h.oldRating;
      tr.appendChild(el('td', 'cf-num', history.length - i));
      var name = el('td', 'cf-wrap');
      name.appendChild(link(contestUrl(h.contestId), h.contestName));
      tr.appendChild(name);
      tr.appendChild(el('td', null, fmtDate(h.ratingUpdateTimeSeconds)));
      tr.appendChild(el('td', 'cf-num', fmt(h.rank)));
      tr.appendChild(el('td', 'cf-num', Object.keys(contestSolved[h.contestId] || {}).length));
      tr.appendChild(el('td', 'cf-num ' + (delta >= 0 ? 'cf-delta-up' : 'cf-delta-down'), (delta >= 0 ? '+' : '') + delta));
      tr.appendChild(el('td', 'cf-num ' + rankClass(h.newRating), h.newRating));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    root.appendChild(table);
  }

  function renderHeatmap(data, d) {
    var area = clear(byId('cf-heatmap-grid-area'));
    var summary = clear(byId('cf-heatmap-summary'));
    var today = startOfDay(new Date());
    var start;

    if (state.heatmapRange === 'all') {
      var first = d.subs.length ? d.subs[d.subs.length - 1].creationTimeSeconds : data.info.registrationTimeSeconds;
      start = startOfDay(new Date(Math.min(first, data.info.registrationTimeSeconds) * 1000));
      if ((today - start) / DAY_MS < 364) start = addDays(today, -364);
    } else {
      start = addDays(today, -364);
    }
    start = addDays(start, -start.getDay()); // align to Sunday

    var cells = [];
    var max = 0, total = 0, ok = 0, active = 0, best = null;
    for (var day = start; day <= today; day = addDays(day, 1)) {
      var entry = d.days[dayKey(day)] || { total: 0, ok: 0 };
      cells.push({ date: day, entry: entry });
      if (entry.total) {
        active++;
        total += entry.total;
        ok += entry.ok;
        if (entry.total > max) { max = entry.total; best = day; }
      }
    }

    function stat(label, value) {
      var span = el('span');
      span.appendChild(el('strong', null, value));
      span.appendChild(document.createTextNode(' ' + label));
      summary.appendChild(span);
    }
    stat('submissions', fmt(total));
    stat('accepted', fmt(ok));
    stat('active days', fmt(active));
    stat('day current streak', d.streaks.current);
    stat('day longest streak', d.streaks.longest);
    if (best) stat('on best day (' + best.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ')', max);

    var months = el('div', 'cf-heatmap-months');
    var grid = el('div', 'cf-heatmap-grid');
    grid.setAttribute('role', 'grid');
    grid.setAttribute('aria-label', 'Daily submissions heatmap');
    var lastMonth = -1;

    cells.forEach(function (cell, i) {
      var level = cell.entry.total ? Math.min(4, Math.ceil((cell.entry.total / max) * 4)) : 0;
      var node = el('span', 'cf-heatmap-cell');
      node.setAttribute('data-level', level);
      node.setAttribute('data-i', i);
      node.tabIndex = cell.entry.total ? 0 : -1;
      node.setAttribute('role', 'gridcell');
      node.setAttribute('aria-label', cellText(cell));
      grid.appendChild(node);

      if (cell.date.getDay() === 0 && cell.date.getMonth() !== lastMonth) {
        lastMonth = cell.date.getMonth();
        var label = el('span', null, cell.date.toLocaleDateString('en-US', { month: 'short' }));
        label.style.left = (Math.floor(i / 7) * 15) + 'px';
        months.appendChild(label);
      }
    });

    area.appendChild(months);
    area.appendChild(grid);
    months.style.width = (Math.ceil(cells.length / 7) * 15) + 'px';

    bindTooltip(grid, '.cf-heatmap-cell', function (node) {
      var cell = cells[+node.getAttribute('data-i')];
      return [cellText(cell)];
    });

    var wrap = area.closest('.cf-heatmap-scroll-wrap');
    if (wrap) wrap.scrollLeft = wrap.scrollWidth;
  }

  function cellText(cell) {
    var date = cell.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    if (!cell.entry.total) return 'No submissions on ' + date;
    return cell.entry.total + (cell.entry.total === 1 ? ' submission' : ' submissions') +
      ' (' + cell.entry.ok + ' accepted) on ' + date;
  }

  function renderBars(containerId, rows, options) {
    options = options || {};
    var root = clear(byId(containerId));
    if (!rows.length) {
      root.appendChild(el('div', 'cf-empty', options.empty || 'No data yet.'));
      return;
    }
    var max = Math.max.apply(null, rows.map(function (r) { return r.value; }));
    var limit = options.limit && !state.tagsExpanded ? options.limit : rows.length;
    rows.slice(0, limit).forEach(function (r) {
      var row = el('div', 'cf-bar-row');
      var label = el('span', 'cf-bar-label', r.label);
      label.title = r.label;
      var track = el('span', 'cf-bar-track');
      var fill = el('span', 'cf-bar-fill');
      fill.style.width = Math.max(3, (r.value / max) * 100) + '%';
      if (r.color) fill.style.background = r.color;
      track.appendChild(fill);
      row.appendChild(label);
      row.appendChild(track);
      row.appendChild(el('span', 'cf-bar-value', fmt(r.value)));
      row.setAttribute('aria-label', r.label + ': ' + r.value);
      root.appendChild(row);
    });
    if (options.limit && rows.length > options.limit) {
      var toggle = el('button', 'cf-bars-toggle', state.tagsExpanded ? 'Show fewer' : 'Show all ' + rows.length);
      toggle.type = 'button';
      toggle.addEventListener('click', function () {
        state.tagsExpanded = !state.tagsExpanded;
        renderBars(containerId, rows, options);
      });
      root.appendChild(toggle);
    }
  }

  function toRows(map) {
    return Object.keys(map).map(function (k) { return { label: k, value: map[k] }; })
      .sort(function (a, b) { return b.value - a.value || a.label.localeCompare(b.label); });
  }

  function renderBreakdowns(d) {
    renderBars('cf-lang-bars', toRows(d.languages), { empty: 'No submissions yet.' });

    var diffRows = Object.keys(d.difficulty).map(function (k) {
      var rating = k === 'Unrated' ? null : +k;
      return { label: k, value: d.difficulty[k], sort: rating || 99999, color: rating ? rankVar(rating) : null };
    }).sort(function (a, b) { return a.sort - b.sort; });
    renderBars('cf-difficulty-bars', diffRows, { empty: 'No problems solved yet.' });

    renderBars('cf-tag-bars', toRows(d.tags), { limit: TAG_PREVIEW, empty: 'No tagged problems solved yet.' });
  }

  /* ------------------------------ Solved list ------------------------------ */

  function populateTagFilter(d) {
    var select = byId('cf-solved-tag');
    var current = select.value;
    while (select.options.length > 1) select.remove(1);
    Object.keys(d.tags).sort().forEach(function (tag) {
      var opt = el('option', null, tag + ' (' + d.tags[tag] + ')');
      opt.value = tag;
      select.appendChild(opt);
    });
    select.value = d.tags[current] ? current : 'all';
  }

  function renderSolved() {
    if (!state.data) return;
    var d = state.derived;
    var query = byId('cf-solved-search').value.trim().toLowerCase();
    var tag = byId('cf-solved-tag').value;
    var sort = byId('cf-solved-sort').value;

    var items = d.solved.filter(function (item) {
      if (tag !== 'all' && (item.problem.tags || []).indexOf(tag) === -1) return false;
      if (!query) return true;
      return item.problem.name.toLowerCase().indexOf(query) !== -1 ||
        problemId(item.problem).toLowerCase().indexOf(query) !== -1;
    });

    var sorters = {
      newest: function (a, b) { return b.solvedAt - a.solvedAt; },
      oldest: function (a, b) { return a.solvedAt - b.solvedAt; },
      hardest: function (a, b) { return (b.problem.rating || 0) - (a.problem.rating || 0) || b.solvedAt - a.solvedAt; },
      easiest: function (a, b) { return (a.problem.rating || 99999) - (b.problem.rating || 99999) || b.solvedAt - a.solvedAt; },
      az: function (a, b) { return a.problem.name.localeCompare(b.problem.name); }
    };
    items.sort(sorters[sort] || sorters.newest);

    byId('cf-solved-count').textContent = items.length === d.solved.length
      ? fmt(d.solved.length) + ' solved'
      : fmt(items.length) + ' of ' + fmt(d.solved.length) + ' solved';

    var pages = Math.max(1, Math.ceil(items.length / SOLVED_PAGE_SIZE));
    state.solvedPage = Math.min(state.solvedPage, pages);
    var list = clear(byId('cf-solved-list'));

    if (!items.length) {
      list.appendChild(el('div', 'cf-empty', d.solved.length ? 'No problems match your filters.' : 'No problems solved yet.'));
    }

    items.slice((state.solvedPage - 1) * SOLVED_PAGE_SIZE, state.solvedPage * SOLVED_PAGE_SIZE).forEach(function (item) {
      var p = item.problem;
      var row = el('div', 'cf-list-item');
      var main = el('div');
      main.appendChild(el('span', 'cf-list-id', problemId(p)));
      main.appendChild(link(problemUrl(p), p.name, 'cf-list-title'));
      if (p.tags && p.tags.length) {
        var tags = el('div', 'cf-tags');
        p.tags.forEach(function (t) { tags.appendChild(el('span', 'cf-tag', t)); });
        main.appendChild(tags);
      }
      var side = el('div', 'cf-list-side');
      side.appendChild(el('span', null, item.language));
      side.appendChild(el('span', null, fmtDate(item.solvedAt)));
      side.appendChild(el('span', 'cf-difficulty ' + rankClass(p.rating), p.rating || '?'));
      row.appendChild(main);
      row.appendChild(side);
      list.appendChild(row);
    });

    updatePagination('cf-solved', state.solvedPage, pages);
  }

  /* ------------------------------ Submissions ------------------------------ */

  function populateVerdictFilter(d) {
    var select = byId('cf-sub-verdict');
    var current = select.value;
    while (select.options.length > 1) select.remove(1);
    toRows(d.verdicts).forEach(function (r) {
      var opt = el('option', null, verdictLabel(r.label === 'TESTING' ? null : r.label) + ' (' + r.value + ')');
      opt.value = r.label;
      select.appendChild(opt);
    });
    select.value = d.verdicts[current] ? current : 'all';
  }

  function renderSubmissions() {
    if (!state.data) return;
    var d = state.derived;
    var verdict = byId('cf-sub-verdict').value;
    var items = d.subs.filter(function (s) { return verdict === 'all' || (s.verdict || 'TESTING') === verdict; });
    var pages = Math.max(1, Math.ceil(items.length / SUB_PAGE_SIZE));
    state.subPage = Math.min(state.subPage, pages);

    var root = clear(byId('cf-sub-table'));
    if (!items.length) {
      root.appendChild(el('div', 'cf-empty', 'No submissions yet.'));
      updatePagination('cf-sub', 1, 1);
      return;
    }

    var table = el('table', 'cf-table');
    var thead = el('thead');
    var hr = el('tr');
    [['ID'], ['When'], ['Problem'], ['Type'], ['Language'], ['Verdict'], ['Time', 'cf-num'], ['Memory', 'cf-num']]
      .forEach(function (c) { var th = el('th', c[1], c[0]); th.scope = 'col'; hr.appendChild(th); });
    thead.appendChild(hr);
    table.appendChild(thead);

    var tbody = el('tbody');
    items.slice((state.subPage - 1) * SUB_PAGE_SIZE, state.subPage * SUB_PAGE_SIZE).forEach(function (s) {
      var tr = el('tr');
      var idCell = el('td');
      idCell.appendChild(link(submissionUrl(s), s.id));
      tr.appendChild(idCell);
      tr.appendChild(el('td', null, fmtDate(s.creationTimeSeconds, true)));
      var prob = el('td', 'cf-wrap');
      prob.appendChild(link(problemUrl(s.problem), problemId(s.problem) + ' - ' + s.problem.name));
      tr.appendChild(prob);
      tr.appendChild(el('td', null, PARTICIPANT_LABELS[s.participantType] || s.participantType || '-'));
      tr.appendChild(el('td', null, s.programmingLanguage));

      var text = verdictLabel(s.verdict);
      if (s.verdict && s.verdict !== 'OK' && s.verdict !== 'COMPILATION_ERROR' && BAD_VERDICTS[s.verdict] && s.verdict !== 'CHALLENGED') {
        text += ' on test ' + ((s.passedTestCount || 0) + 1);
      }
      tr.appendChild(el('td', 'cf-verdict-' + verdictKind(s.verdict), text));
      tr.appendChild(el('td', 'cf-num', fmt(s.timeConsumedMillis) + ' ms'));
      tr.appendChild(el('td', 'cf-num', fmt(Math.round((s.memoryConsumedBytes || 0) / 1024)) + ' KB'));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    root.appendChild(table);
    updatePagination('cf-sub', state.subPage, pages);
  }

  function updatePagination(prefix, page, pages) {
    byId(prefix + '-pagination').hidden = pages <= 1;
    byId(prefix + '-page-info').textContent = 'Page ' + page + ' of ' + pages;
    byId(prefix + '-prev').disabled = page <= 1;
    byId(prefix + '-next').disabled = page >= pages;
  }

  function renderBlogs(blogs) {
    var panel = byId('cf-blog-panel');
    var list = clear(byId('cf-blog-list'));
    panel.hidden = !blogs.length;
    blogs.forEach(function (b) {
      var li = el('li');
      // Blog titles are HTML on Codeforces; strip tags and keep plain text.
      var title = new DOMParser().parseFromString(b.title, 'text/html').body.textContent || 'Untitled';
      li.appendChild(link(CF_BASE + '/blog/entry/' + b.id, title));
      li.appendChild(document.createTextNode(' · ' + fmtDate(b.creationTimeSeconds) + ' · rating ' + (b.rating > 0 ? '+' : '') + b.rating));
      list.appendChild(li);
    });
  }

  function renderAll(data) {
    state.data = data;
    state.derived = derive(data);
    var d = state.derived;
    renderProfile(data.info);
    renderMetrics(data, d);
    renderRatingChart(data.rating);
    renderContestTable(data.rating, d.contestSolved);
    renderHeatmap(data, d);
    renderBreakdowns(d);
    populateTagFilter(d);
    renderSolved();
    populateVerdictFilter(d);
    renderSubmissions();
    renderBlogs(data.blogs || []);
  }

  /* ------------------------------ Status & loading ------------------------------ */

  function setStatus(kind, text) {
    var pill = byId('cf-status-pill');
    pill.classList.toggle('is-loading', kind === 'loading');
    pill.classList.toggle('is-error', kind === 'error');
    byId('cf-status-text').textContent = text;
  }

  function load(force) {
    if (state.loading) return;
    var cached = state.data || readCache();
    if (cached && !state.data) renderAll(cached);
    if (cached && !force && Date.now() - cached.time < CACHE_FRESH_MS) {
      setStatus('ok', 'Updated ' + relativeTime(cached.time / 1000));
      return;
    }

    state.loading = true;
    var btn = byId('cf-refresh-btn');
    btn.disabled = true;
    btn.classList.add('is-refreshing');
    setStatus('loading', cached ? 'Updating from Codeforces...' : 'Loading stats...');

    fetchAll()
      .then(function (data) {
        writeCache(data);
        renderAll(data);
        setStatus('ok', 'Live · updated just now');
      })
      .catch(function (error) {
        if (cached) {
          setStatus('error', 'Codeforces unavailable, showing data from ' + relativeTime(cached.time / 1000));
        } else {
          setStatus('error', 'Could not load Codeforces data: ' + error.message);
          ['cf-rating-chart', 'cf-contest-table', 'cf-solved-list', 'cf-sub-table'].forEach(function (id) {
            clear(byId(id)).appendChild(el('div', 'cf-empty', 'Data unavailable. Try Refresh in a moment.'));
          });
        }
      })
      .then(function () {
        state.loading = false;
        btn.disabled = false;
        btn.classList.remove('is-refreshing');
      });
  }

  /* ------------------------------ Events ------------------------------ */

  function init() {
    byId('cf-refresh-btn').addEventListener('click', function () { load(true); });

    function setRange(range) {
      state.heatmapRange = range;
      ['12m', 'all'].forEach(function (r) {
        var b = byId('cf-hm-' + r);
        b.classList.toggle('is-active', r === range);
        b.setAttribute('aria-pressed', String(r === range));
      });
      if (state.data) renderHeatmap(state.data, state.derived);
    }
    byId('cf-hm-12m').addEventListener('click', function () { setRange('12m'); });
    byId('cf-hm-all').addEventListener('click', function () { setRange('all'); });

    var searchTimer = null;
    byId('cf-solved-search').addEventListener('input', function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () { state.solvedPage = 1; renderSolved(); }, 150);
    });
    ['cf-solved-tag', 'cf-solved-sort'].forEach(function (id) {
      byId(id).addEventListener('change', function () { state.solvedPage = 1; renderSolved(); });
    });
    byId('cf-solved-prev').addEventListener('click', function () { state.solvedPage--; renderSolved(); });
    byId('cf-solved-next').addEventListener('click', function () { state.solvedPage++; renderSolved(); });

    byId('cf-sub-verdict').addEventListener('change', function () { state.subPage = 1; renderSubmissions(); });
    byId('cf-sub-prev').addEventListener('click', function () { state.subPage--; renderSubmissions(); });
    byId('cf-sub-next').addEventListener('click', function () { state.subPage++; renderSubmissions(); });

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var root = byId('cf-rating-chart');
        if (state.ratingHistory && state.ratingHistory.length && Math.round(root.clientWidth) !== state.chartWidth) {
          renderRatingChart(state.ratingHistory);
        }
      }, 150);
    });

    load(false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
