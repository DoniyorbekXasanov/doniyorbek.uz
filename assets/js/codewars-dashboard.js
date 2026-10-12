window.CodewarsCommon = (function() {
  var API_BASE = 'https://www.codewars.com/api/v1';

  var language_names = {
    c: 'C',
    cpp: 'C++',
    csharp: 'C#',
    java: 'Java',
    javascript: 'JavaScript',
    python: 'Python',
    ruby: 'Ruby',
    shell: 'Shell',
    sql: 'SQL',
    typescript: 'TypeScript'
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function formatNumber(value) {
    var number = Number(value);
    if (!Number.isFinite(number)) {
      return '-';
    }
    return number.toLocaleString();
  }

  function prettyLanguage(language) {
    if (!language) {
      return 'Unknown';
    }
    return language_names[language] || language.charAt(0).toUpperCase() + language.slice(1);
  }

  function clearElement(element) {
    while (element && element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  function createTextElement(tag, class_name, text) {
    var element = document.createElement(tag);
    if (class_name) {
      element.className = class_name;
    }
    if (text !== undefined && text !== null) {
      element.textContent = text;
    }
    return element;
  }

  function renderBarRow(container, label_text, value_text, percent, fill_class) {
    var row = document.createElement('div');
    var label = createTextElement('span', 'codewars-bar-label', label_text);
    var track = document.createElement('span');
    var fill = document.createElement('span');
    var value = createTextElement('span', 'codewars-bar-value', value_text);

    row.className = 'codewars-bar-row';
    track.className = 'codewars-bar-track';
    fill.className = 'codewars-bar-fill' + (fill_class ? ' ' + fill_class : '');
    fill.style.width = Math.max(4, Math.min(100, percent)) + '%';

    track.appendChild(fill);
    row.appendChild(label);
    row.appendChild(track);
    row.appendChild(value);
    container.appendChild(row);
  }

  function fetchJson(path) {
    return fetch(API_BASE + path, {
      headers: { Accept: 'application/json' }
    }).then(function(response) {
      if (!response.ok) {
        throw new Error('Codewars API returned ' + response.status);
      }
      return response.json();
    });
  }

  function delay(ms) {
    return new Promise(function(resolve) {
      window.setTimeout(resolve, ms);
    });
  }

  return {
    byId: byId,
    formatNumber: formatNumber,
    prettyLanguage: prettyLanguage,
    clearElement: clearElement,
    createTextElement: createTextElement,
    renderBarRow: renderBarRow,
    fetchJson: fetchJson,
    delay: delay
  };
})();

// On-demand kata detail cards. Each button fetches /code-challenges/{id}
// only when clicked, so browsing the feeds stays cheap.
window.CodewarsKataInfo = (function() {
  var createTextElement = window.CodewarsCommon.createTextElement;
  var formatNumber = window.CodewarsCommon.formatNumber;
  var fetchJson = window.CodewarsCommon.fetchJson;

  var KATA_KEY = 'codewars-kata-meta:v1';
  var SVG_NS = 'http://www.w3.org/2000/svg';

  var category_names = {
    algorithms: 'Algorithms',
    bug_fixes: 'Bug fixes',
    refactoring: 'Refactoring',
    reference: 'Fundamentals',
    games: 'Puzzles'
  };

  var details_cache = {};

  function compactNumber(value) {
    var number = Number(value);
    if (!Number.isFinite(number)) {
      return '-';
    }
    return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(number);
  }

  function prettyCategory(category) {
    if (!category) {
      return null;
    }
    return category_names[category] || category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ');
  }

  function storeRank(id, rank_name) {
    try {
      var stored = JSON.parse(localStorage.getItem(KATA_KEY)) || {};
      if (!stored[id]) {
        stored[id] = { rank: rank_name || null };
        localStorage.setItem(KATA_KEY, JSON.stringify(stored));
      }
    } catch (error) {}
  }

  function loadKata(id) {
    if (details_cache[id]) {
      return Promise.resolve(details_cache[id]);
    }
    return fetchJson('/code-challenges/' + encodeURIComponent(id)).then(function(kata) {
      details_cache[id] = kata || {};
      storeRank(id, kata && kata.rank && kata.rank.name);
      return details_cache[id];
    });
  }

  function infoIcon() {
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '12');
    svg.setAttribute('height', '12');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('aria-hidden', 'true');

    [['circle', { cx: '12', cy: '12', r: '10' }],
     ['line', { x1: '12', y1: '16', x2: '12', y2: '11' }],
     ['line', { x1: '12', y1: '7.5', x2: '12.01', y2: '7.5' }]].forEach(function(part) {
      var el = document.createElementNS(SVG_NS, part[0]);
      Object.keys(part[1]).forEach(function(name) {
        el.setAttribute(name, part[1][name]);
      });
      svg.appendChild(el);
    });
    return svg;
  }

  function fact(text) {
    return createTextElement('span', 'codewars-kata-info-fact', text);
  }

  function buildPanel(kata) {
    var panel = createTextElement('div', 'codewars-kata-info');
    var facts = createTextElement('div', 'codewars-kata-info-facts');

    facts.appendChild(createTextElement('span', 'codewars-kata-info-rank', (kata.rank && kata.rank.name) || 'beta'));

    var category = prettyCategory(kata.category);
    if (category) {
      facts.appendChild(fact(category));
    }
    if (Number.isFinite(Number(kata.totalCompleted)) && kata.totalCompleted !== null) {
      facts.appendChild(fact(compactNumber(kata.totalCompleted) + ' completed'));
    }
    if (kata.totalAttempts > 0 && kata.totalCompleted !== null) {
      facts.appendChild(fact(Math.round((kata.totalCompleted / kata.totalAttempts) * 100) + '% success'));
    }
    if (kata.totalStars > 0) {
      facts.appendChild(fact('★ ' + compactNumber(kata.totalStars)));
    }
    if (kata.createdBy && kata.createdBy.username) {
      var author = createTextElement('span', 'codewars-kata-info-fact', 'by ');
      var author_link = createTextElement('a', 'codewars-kata-info-author', kata.createdBy.username);
      author_link.href = kata.createdBy.url || 'https://www.codewars.com/users/' + encodeURIComponent(kata.createdBy.username);
      author_link.target = '_blank';
      author_link.rel = 'noopener';
      author.appendChild(author_link);
      facts.appendChild(author);
    }
    panel.appendChild(facts);

    var tags = (kata.tags || []).slice(0, 8);
    if (tags.length) {
      var tag_list = createTextElement('div', 'codewars-kata-info-tags');
      tags.forEach(function(tag) {
        tag_list.appendChild(createTextElement('span', 'codewars-kata-info-tag', tag));
      });
      panel.appendChild(tag_list);
    }

    return panel;
  }

  function buildErrorPanel() {
    var panel = createTextElement('div', 'codewars-kata-info');
    panel.appendChild(createTextElement('span', 'codewars-kata-info-fact', 'Kata details could not be loaded right now.'));
    return panel;
  }

  function createButton(kata_id, row) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'codewars-kata-info-button';
    button.title = 'Kata details';
    button.setAttribute('aria-label', 'Show kata details');
    button.setAttribute('aria-expanded', 'false');
    button.appendChild(infoIcon());

    var panel = null;

    button.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();

      if (panel) {
        panel.remove();
        panel = null;
        button.setAttribute('aria-expanded', 'false');
        return;
      }
      if (button.disabled) {
        return;
      }

      button.disabled = true;
      button.classList.add('is-loading');

      loadKata(kata_id).then(buildPanel, buildErrorPanel).then(function(built) {
        button.disabled = false;
        button.classList.remove('is-loading');
        if (row.isConnected) {
          panel = built;
          row.insertAdjacentElement('afterend', panel);
          button.setAttribute('aria-expanded', 'true');
        }
      });
    });

    return button;
  }

  return {
    createButton: createButton
  };
})();

/**
 * Codewars Dynamic Dashboard
 * Doniyorbek Xasanov - doniyorbek.uz/coding/
 */
(function () {
  'use strict';

  var USERNAME = 'DoniyorbekXasanov';
  var API_BASE = 'https://www.codewars.com/api/v1';
  var CACHE_KEY = 'cw-dashboard-cache:v1:' + USERNAME.toLowerCase();
  var SNAPSHOT_KEY = 'cw-snapshots:v1:' + USERNAME.toLowerCase();
  var CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes cache
  var REQUEST_DELAY_MS = 150; // polite pacing between paginated calls

  // Language display colors
  var LANG_COLORS = {
    python: '#3572A5',
    cpp: '#f34b7d',
    javascript: '#f1e05a',
    typescript: '#3178c6',
    c: '#555555',
    java: '#b07219',
    rust: '#dea584',
    go: '#00ADD8',
    ruby: '#701516',
    shell: '#89e051',
    sql: '#e38c00'
  };

  // Rank metadata
  var RANK_COLORS = {
    white: 'cw-rank-white',
    yellow: 'cw-rank-yellow',
    blue: 'cw-rank-blue',
    purple: 'cw-rank-purple',
    black: 'cw-rank-black'
  };

  // State
  var state = {
    loading: true,
    error: null,
    profile: null,
    allKatas: [],
    fetchedAt: null,
    heatmapRange: '12m', // '12m' or 'all'
    kataSearch: '',
    kataLang: 'all',
    kataSort: 'newest',
    kataPage: 1,
    kataPageSize: 20,
    historyMetric: 'honor', // 'honor', 'score', 'leaderboard'
    historySnapshots: [],
    clanData: null,
    clanLoading: false,
    selectedClan: null,
    customClanName: ''
  };

  // DOM Elements
  var els = {};

  function initElements() {
    els.statusBar = document.getElementById('cw-status-bar');
    els.statusPill = document.getElementById('cw-status-pill');
    els.statusText = document.getElementById('cw-status-text');
    els.lastUpdated = document.getElementById('cw-last-updated');
    els.refreshBtn = document.getElementById('cw-refresh-btn');

    // Metrics
    els.metricRank = document.getElementById('cw-metric-rank');
    els.metricRankSub = document.getElementById('cw-metric-rank-sub');
    els.metricHonor = document.getElementById('cw-metric-honor');
    els.metricHonorSub = document.getElementById('cw-metric-honor-sub');
    els.metricKatas = document.getElementById('cw-metric-katas');
    els.metricKatasSub = document.getElementById('cw-metric-katas-sub');
    els.metricLeaderboard = document.getElementById('cw-metric-leaderboard');
    els.metricLeaderboardSub = document.getElementById('cw-metric-leaderboard-sub');
    els.metricActiveDays = document.getElementById('cw-metric-active-days');
    els.metricActiveDaysSub = document.getElementById('cw-metric-active-days-sub');
    els.metricAuthored = document.getElementById('cw-metric-authored');
    els.metricAuthoredSub = document.getElementById('cw-metric-authored-sub');

    // Heatmap
    els.heatmapSummary = document.getElementById('cw-heatmap-summary');
    els.heatmapGridArea = document.getElementById('cw-heatmap-grid-area');
    els.heatmapScrollWrap = document.getElementById('cw-heatmap-scroll-wrap');
    els.heatmapRange12m = document.getElementById('cw-hm-range-12m');
    els.heatmapRangeAll = document.getElementById('cw-hm-range-all');

    // Languages
    els.langProgressBar = document.getElementById('cw-lang-progress-bar');
    els.langCards = document.getElementById('cw-lang-cards');

    // Historical Chart
    els.historyChart = document.getElementById('cw-history-chart');
    els.historyHonorBtn = document.getElementById('cw-hist-honor-btn');
    els.historyScoreBtn = document.getElementById('cw-hist-score-btn');
    els.historyLbBtn = document.getElementById('cw-hist-lb-btn');
    els.exportSnapshotsBtn = document.getElementById('cw-export-snapshots-btn');

    // Kata Explorer
    els.kataSearchInput = document.getElementById('cw-kata-search');
    els.kataLangSelect = document.getElementById('cw-kata-lang-select');
    els.kataSortSelect = document.getElementById('cw-kata-sort-select');
    els.kataCount = document.getElementById('cw-kata-count');
    els.kataList = document.getElementById('cw-kata-list');
    els.kataPagination = document.getElementById('cw-kata-pagination');
    els.kataPagePrev = document.getElementById('cw-kata-page-prev');
    els.kataPageNext = document.getElementById('cw-kata-page-next');
    els.kataPageInfo = document.getElementById('cw-kata-page-info');

    // Clan
    els.clanNameHeading = document.getElementById('cw-clan-name-heading');
    els.clanBadge = document.getElementById('cw-clan-badge');
    els.clanStatus = document.getElementById('cw-clan-status');
    els.clanBoard = document.getElementById('cw-clan-board');
    els.clanPresetCodewars = document.getElementById('cw-clan-preset-codewars');
    els.clanPresetAkhu = document.getElementById('cw-clan-preset-akhu');
    els.clanSwitchInput = document.getElementById('cw-clan-switch-input');
    els.clanSwitchBtn = document.getElementById('cw-clan-switch-btn');

    // Tooltip
    createGlobalTooltip();
  }

  var tooltipEl = null;
  function createGlobalTooltip() {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'cw-tooltip';
    tooltipEl.setAttribute('role', 'tooltip');
    tooltipEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(tooltipEl);
  }

  function showTooltip(e, text) {
    if (!tooltipEl || !text) return;
    tooltipEl.textContent = text;
    tooltipEl.classList.add('is-visible');
    positionTooltip(e);
  }

  function positionTooltip(e) {
    if (!tooltipEl) return;
    var x = e.clientX;
    var y = e.clientY;
    tooltipEl.style.left = x + 'px';
    tooltipEl.style.top = y + 'px';
  }

  function hideTooltip() {
    if (!tooltipEl) return;
    tooltipEl.classList.remove('is-visible');
  }

  // Utilities
  function delay(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function formatNum(val) {
    var n = Number(val);
    if (!Number.isFinite(n)) return '—';
    return n.toLocaleString();
  }

  function formatDate(isoStr) {
    if (!isoStr) return '—';
    var d = new Date(isoStr);
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(d);
  }

  function formatDateTime(isoStr) {
    if (!isoStr) return '—';
    var d = new Date(isoStr);
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(d);
  }

  function toLocalDayString(dateInput) {
    var d = new Date(dateInput);
    var year = d.getFullYear();
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  function fetchJson(url) {
    return fetch(url, { headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) {
          throw new Error('Codewars API HTTP ' + res.status + ' for ' + url);
        }
        return res.json();
      });
  }

  // --- API & Data Orchestration ---
  function loadDashboardData(forceRefresh) {
    setLoadingState(true);

    if (!forceRefresh) {
      try {
        var cached = JSON.parse(localStorage.getItem(CACHE_KEY));
        if (cached && cached.profile && cached.allKatas && cached.fetchedAt) {
          var age = Date.now() - new Date(cached.fetchedAt).getTime();
          if (age < CACHE_TTL_MS) {
            state.profile = cached.profile;
            state.allKatas = cached.allKatas;
            state.fetchedAt = cached.fetchedAt;
            state.selectedClan = state.selectedClan || cached.profile.clan || 'Codewars';
            onDataLoaded(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Cache read error', err);
      }
    }

    // Live Fetch Profile
    var profileUrl = API_BASE + '/users/' + encodeURIComponent(USERNAME);
    setStatus('Connecting to Codewars API...', 'loading');

    fetchJson(profileUrl)
      .then(function (profile) {
        state.profile = profile;
        state.selectedClan = state.selectedClan || profile.clan || 'Codewars';
        setStatus('Fetching completed kata history...', 'loading');
        return fetchAllCompletedKatas();
      })
      .then(function (katas) {
        state.allKatas = katas;
        state.fetchedAt = new Date().toISOString();

        // Save Cache
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            profile: state.profile,
            allKatas: state.allKatas,
            fetchedAt: state.fetchedAt
          }));
        } catch (e) { }

        onDataLoaded(true);
      })
      .catch(function (err) {
        console.error('Failed to load Codewars data', err);
        setLoadingState(false);
        setStatus('Error loading live data: ' + err.message, 'error');
        renderErrorState(err.message);
      });
  }

  function fetchAllCompletedKatas() {
    var firstPageUrl = API_BASE + '/users/' + encodeURIComponent(USERNAME) + '/code-challenges/completed?page=0';
    return fetchJson(firstPageUrl).then(function (firstRes) {
      var allData = firstRes.data || [];
      var totalPages = Number(firstRes.totalPages) || 1;

      if (totalPages <= 1) {
        return allData;
      }

      var pages = [];
      for (var p = 1; p < totalPages; p++) {
        pages.push(p);
      }

      var chain = Promise.resolve(allData);
      pages.forEach(function (pageIndex) {
        chain = chain.then(function (accumulated) {
          setStatus('Fetching completed katas (page ' + (pageIndex + 1) + ' of ' + totalPages + ')...', 'loading');
          return delay(REQUEST_DELAY_MS).then(function () {
            var pageUrl = API_BASE + '/users/' + encodeURIComponent(USERNAME) + '/code-challenges/completed?page=' + pageIndex;
            return fetchJson(pageUrl).then(function (nextRes) {
              return accumulated.concat(nextRes.data || []);
            });
          });
        });
      });

      return chain;
    });
  }

  function onDataLoaded(isLive) {
    setLoadingState(false);
    setStatus(isLive ? 'Live API Connected' : 'Cached Data (Refreshed recently)', 'connected');

    if (els.lastUpdated && state.fetchedAt) {
      els.lastUpdated.textContent = 'Updated ' + formatDateTime(state.fetchedAt);
    }

    // Process & Record Historical Snapshot
    handleHistoricalSnapshots();

    // Render Components
    renderProfileHeader();
    renderHeatmap();
    renderLanguageStats();
    renderHistoricalChart();
    populateKataLanguageFilter();
    renderKataList();

    // Load Clan
    loadClanLeaderboard(state.selectedClan);
  }

  function setStatus(msg, type) {
    if (els.statusText) els.statusText.textContent = msg;
    if (els.statusPill) {
      els.statusPill.className = 'cw-status-pill';
      if (type === 'loading') els.statusPill.classList.add('is-loading');
      if (type === 'error') els.statusPill.classList.add('is-error');
    }
  }

  function setLoadingState(isLoading) {
    state.loading = isLoading;
    if (els.refreshBtn) {
      els.refreshBtn.disabled = isLoading;
      els.refreshBtn.classList.toggle('is-refreshing', isLoading);
    }
  }

  function renderErrorState(msg) {
    if (els.kataList) {
      els.kataList.innerHTML = '<div class="cw-empty-state"><p><strong>Unable to fetch Codewars data</strong></p><p>' + msg + '</p><button class="cw-btn cw-btn-primary" id="cw-retry-btn">Retry</button></div>';
      var retryBtn = document.getElementById('cw-retry-btn');
      if (retryBtn) retryBtn.addEventListener('click', function () { loadDashboardData(true); });
    }
  }

  // --- Historical Snapshot System ---
  function handleHistoricalSnapshots() {
    var stored = [];
    try {
      stored = JSON.parse(localStorage.getItem(SNAPSHOT_KEY)) || [];
    } catch (e) { stored = []; }

    // Also fetch seed history from static data file if local is empty
    if (!stored.length) {
      fetch('/assets/data/codewars-history.json')
        .then(function (res) { return res.ok ? res.json() : []; })
        .then(function (seed) {
          syncSnapshotWithData(seed);
        })
        .catch(function () {
          syncSnapshotWithData([]);
        });
    } else {
      syncSnapshotWithData(stored);
    }
  }

  function syncSnapshotWithData(existingSnapshots) {
    if (!state.profile) return;

    var todayStr = toLocalDayString(new Date());
    var byDate = {};

    (existingSnapshots || []).forEach(function (s) {
      if (s && s.date) byDate[s.date] = s;
    });

    // Record today's verified snapshot if not already present
    var currentOverall = (state.profile.ranks && state.profile.ranks.overall) || {};
    var todaySnapshot = {
      date: todayStr,
      timestamp: Date.now(),
      honor: Number(state.profile.honor) || 0,
      score: Number(currentOverall.score) || 0,
      rank: Number(currentOverall.rank) || 0,
      rankName: currentOverall.name || 'Unknown',
      leaderboardPosition: Number(state.profile.leaderboardPosition) || null,
      totalCompleted: Number((state.profile.codeChallenges && state.profile.codeChallenges.totalCompleted)) || state.allKatas.length,
      totalAuthored: Number((state.profile.codeChallenges && state.profile.codeChallenges.totalAuthored)) || 0
    };

    byDate[todayStr] = todaySnapshot;

    // Convert back to sorted list
    var list = Object.keys(byDate).sort().map(function (k) { return byDate[k]; });
    state.historySnapshots = list;

    try {
      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(list));
    } catch (e) { }

    renderHistoricalChart();
  }

  // --- Profile Overview Header ---
  function renderProfileHeader() {
    var p = state.profile;
    if (!p) return;

    var overall = (p.ranks && p.ranks.overall) || {};
    var rankColorClass = RANK_COLORS[overall.color] || 'cw-rank-white';

    // Rank
    if (els.metricRank) {
      els.metricRank.innerHTML = '<span class="cw-rank-badge ' + rankColorClass + '">' + (overall.name || 'Beta') + '</span>';
    }
    if (els.metricRankSub) {
      els.metricRankSub.textContent = formatNum(overall.score) + ' rank score';
    }

    // Honor
    if (els.metricHonor) {
      els.metricHonor.textContent = formatNum(p.honor);
    }
    if (els.metricHonorSub) {
      els.metricHonorSub.textContent = 'Community honor points';
    }

    // Katas
    var totalCompleted = (p.codeChallenges && p.codeChallenges.totalCompleted) || state.allKatas.length;
    if (els.metricKatas) {
      els.metricKatas.textContent = formatNum(totalCompleted);
    }
    if (els.metricKatasSub) {
      els.metricKatasSub.textContent = state.allKatas.length + ' fetched in full history';
    }

    // Leaderboard
    if (els.metricLeaderboard) {
      els.metricLeaderboard.textContent = p.leaderboardPosition ? '#' + formatNum(p.leaderboardPosition) : '—';
    }
    if (els.metricLeaderboardSub) {
      els.metricLeaderboardSub.textContent = 'Global rank position';
    }

    // Active Days
    var dayMap = {};
    state.allKatas.forEach(function (k) {
      if (k.completedAt) dayMap[toLocalDayString(k.completedAt)] = true;
    });
    var activeDaysCount = Object.keys(dayMap).length;

    if (els.metricActiveDays) {
      els.metricActiveDays.textContent = formatNum(activeDaysCount);
    }
    if (els.metricActiveDaysSub) {
      els.metricActiveDaysSub.textContent = 'Unique solving calendar days';
    }

    // Authored
    var totalAuthored = (p.codeChallenges && p.codeChallenges.totalAuthored) || 0;
    if (els.metricAuthored) {
      els.metricAuthored.textContent = formatNum(totalAuthored);
    }
    if (els.metricAuthoredSub) {
      els.metricAuthoredSub.textContent = 'Authored kata challenges';
    }
  }

  // --- GitHub-Style Activity Heatmap ---
  function renderHeatmap() {
    if (!els.heatmapGridArea) return;

    var dayCounts = {};
    state.allKatas.forEach(function (k) {
      if (!k.completedAt) return;
      var dayKey = toLocalDayString(k.completedAt);
      dayCounts[dayKey] = (dayCounts[dayKey] || 0) + 1;
    });

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    // Compute start date based on range
    var startDate = new Date(today);
    if (state.heatmapRange === '12m') {
      startDate.setDate(startDate.getDate() - 364);
    } else {
      // All time
      var sortedDays = Object.keys(dayCounts).sort();
      if (sortedDays.length > 0) {
        var earliest = new Date(sortedDays[0]);
        startDate = new Date(earliest);
      } else {
        startDate.setDate(startDate.getDate() - 364);
      }
    }

    // Align startDate backwards to Sunday (or start of week)
    var dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    // Generate days grid
    var weeks = [];
    var currentWeek = [];
    var iter = new Date(startDate);

    var totalKatasInRange = 0;
    var activeDaysInRange = 0;
    var maxDaily = 0;
    var maxDailyDate = '';

    while (iter <= today || currentWeek.length > 0) {
      var dKey = toLocalDayString(iter);
      var count = dayCounts[dKey] || 0;
      var isInFuture = iter > today;

      if (!isInFuture) {
        totalKatasInRange += count;
        if (count > 0) activeDaysInRange++;
        if (count > maxDaily) {
          maxDaily = count;
          maxDailyDate = dKey;
        }
      }

      currentWeek.push({
        date: new Date(iter),
        dateStr: dKey,
        count: count,
        future: isInFuture
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      iter.setDate(iter.getDate() + 1);
    }

    // Compute Streaks
    var allSortedDays = Object.keys(dayCounts).sort();
    var streaks = calculateStreaks(dayCounts, today);

    // Render Stats Bar
    if (els.heatmapSummary) {
      els.heatmapSummary.innerHTML =
        '<div class="cw-heatmap-stat-item"><span>Completed:</span> <strong>' + formatNum(totalKatasInRange) + ' katas</strong></div>' +
        '<div class="cw-heatmap-stat-item"><span>Active Days:</span> <strong>' + formatNum(activeDaysInRange) + ' days</strong></div>' +
        '<div class="cw-heatmap-stat-item"><span>Current Streak:</span> <strong>' + streaks.current + ' days</strong></div>' +
        '<div class="cw-heatmap-stat-item"><span>Longest Streak:</span> <strong>' + streaks.longest + ' days</strong></div>' +
        '<div class="cw-heatmap-stat-item"><span>Max in 1 Day:</span> <strong>' + maxDaily + ' katas</strong></div>';
    }

    // Build DOM for Grid Area
    var monthsContainer = document.createElement('div');
    monthsContainer.className = 'cw-heatmap-months';

    var grid = document.createElement('div');
    grid.className = 'cw-heatmap-grid';

    var prevMonth = -1;
    var colWidth = 15; // 12px cell + 3px gap

    weeks.forEach(function (week, colIdx) {
      var firstDayOfWeek = week[0].date;
      var monthIdx = firstDayOfWeek.getMonth();

      // Place month label
      if (monthIdx !== prevMonth && colIdx < weeks.length - 2) {
        var label = document.createElement('span');
        label.className = 'cw-heatmap-month-label';
        label.style.left = (colIdx * colWidth) + 'px';
        label.textContent = new Intl.DateTimeFormat(undefined, { month: 'short' }).format(firstDayOfWeek);
        monthsContainer.appendChild(label);
        prevMonth = monthIdx;
      }

      week.forEach(function (day) {
        var cell = document.createElement('div');
        cell.className = 'cw-heatmap-cell';
        cell.tabIndex = 0;

        if (day.future) {
          cell.style.visibility = 'hidden';
        } else {
          var level = getHeatmapLevel(day.count);
          cell.setAttribute('data-level', level);
          cell.setAttribute('data-date', day.dateStr);
          cell.setAttribute('data-count', day.count);

          var tooltipMsg = formatDate(day.dateStr) + ': ' + day.count + (day.count === 1 ? ' kata' : ' katas') + ' completed';
          cell.setAttribute('aria-label', tooltipMsg);

          cell.addEventListener('mouseenter', function (e) { showTooltip(e, tooltipMsg); });
          cell.addEventListener('mousemove', function (e) { positionTooltip(e); });
          cell.addEventListener('mouseleave', hideTooltip);
          cell.addEventListener('focus', function (e) {
            var rect = cell.getBoundingClientRect();
            showTooltip({ clientX: rect.left + rect.width / 2, clientY: rect.top }, tooltipMsg);
          });
          cell.addEventListener('blur', hideTooltip);
        }

        grid.appendChild(cell);
      });
    });

    els.heatmapGridArea.innerHTML = '';
    els.heatmapGridArea.appendChild(monthsContainer);
    els.heatmapGridArea.appendChild(grid);

    // Scroll to right edge to reveal latest activity
    if (els.heatmapScrollWrap) {
      setTimeout(function () {
        els.heatmapScrollWrap.scrollLeft = els.heatmapScrollWrap.scrollWidth;
      }, 50);
    }
  }

  function getHeatmapLevel(count) {
    if (count <= 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 6) return 3;
    return 4;
  }

  function calculateStreaks(dayCounts, today) {
    var oneDay = 24 * 60 * 60 * 1000;
    var days = Object.keys(dayCounts).sort();
    if (!days.length) return { current: 0, longest: 0 };

    var longest = 0;
    var currentSeq = 0;
    var prevTime = null;

    for (var i = 0; i < days.length; i++) {
      var d = new Date(days[i] + 'T00:00:00');
      var t = d.getTime();

      if (prevTime === null) {
        currentSeq = 1;
      } else {
        var diff = Math.round((t - prevTime) / oneDay);
        if (diff === 1) {
          currentSeq++;
        } else if (diff > 1) {
          currentSeq = 1;
        }
      }
      if (currentSeq > longest) longest = currentSeq;
      prevTime = t;
    }

    // Current streak (must include today or yesterday)
    var todayStr = toLocalDayString(today);
    var yest = new Date(today);
    yest.setDate(yest.getDate() - 1);
    var yestStr = toLocalDayString(yest);

    var currentStreak = 0;
    var checkDate = new Date(today);
    if (!dayCounts[todayStr] && dayCounts[yestStr]) {
      checkDate = yest;
    }

    while (dayCounts[toLocalDayString(checkDate)]) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return { current: currentStreak, longest: longest };
  }

  // --- Programming Language Statistics ---
  function renderLanguageStats() {
    if (!els.langProgressBar || !els.langCards) return;

    var langCounts = {};
    var totalAssociations = 0;

    state.allKatas.forEach(function (k) {
      var langs = k.completedLanguages || [];
      langs.forEach(function (lang) {
        var key = lang.toLowerCase();
        langCounts[key] = (langCounts[key] || 0) + 1;
        totalAssociations++;
      });
    });

    if (totalAssociations === 0) {
      els.langProgressBar.innerHTML = '';
      els.langCards.innerHTML = '<p class="cw-text-muted">No language completions recorded.</p>';
      return;
    }

    var sortedLangs = Object.keys(langCounts).sort(function (a, b) {
      return langCounts[b] - langCounts[a];
    });

    // Progress Bar
    els.langProgressBar.innerHTML = '';
    sortedLangs.forEach(function (lang) {
      var count = langCounts[lang];
      var pct = ((count / totalAssociations) * 100).toFixed(1);
      var seg = document.createElement('div');
      seg.className = 'cw-lang-segment';
      seg.style.width = pct + '%';
      seg.style.backgroundColor = LANG_COLORS[lang] || '#888888';
      seg.title = prettyLanguage(lang) + ': ' + count + ' katas (' + pct + '%)';
      els.langProgressBar.appendChild(seg);
    });

    // Language Cards
    els.langCards.innerHTML = '';
    var profileLangRanks = (state.profile && state.profile.ranks && state.profile.ranks.languages) || {};

    sortedLangs.forEach(function (lang) {
      var count = langCounts[lang];
      var pct = ((count / totalAssociations) * 100).toFixed(1);
      var color = LANG_COLORS[lang] || '#888888';
      var rankInfo = profileLangRanks[lang];

      var card = document.createElement('div');
      card.className = 'cw-lang-card';

      var rankHtml = '—';
      if (rankInfo) {
        rankHtml = '<span class="cw-rank-badge ' + (RANK_COLORS[rankInfo.color] || 'cw-rank-blue') + '">' +
          (rankInfo.name || 'Ranked') + '</span> <span style="font-size: 0.78rem; color: var(--cw-text-muted);">(' + formatNum(rankInfo.score) + ' pts)</span>';
      }

      card.innerHTML =
        '<div class="cw-lang-card-header">' +
          '<div class="cw-lang-card-title">' +
            '<span class="cw-lang-dot" style="background-color: ' + color + '"></span>' +
            '<span>' + prettyLanguage(lang) + '</span>' +
          '</div>' +
          '<span class="cw-lang-count">' + formatNum(count) + '</span>' +
        '</div>' +
        '<div class="cw-lang-meta">' +
          '<span>' + pct + '% of all solves</span>' +
          '<div>' + rankHtml + '</div>' +
        '</div>';

      els.langCards.appendChild(card);
    });
  }

  function prettyLanguage(lang) {
    if (window.CodewarsCommon && window.CodewarsCommon.prettyLanguage) {
      return window.CodewarsCommon.prettyLanguage(lang);
    }
    if (!lang) return 'Unknown';
    if (lang === 'cpp') return 'C++';
    if (lang === 'csharp') return 'C#';
    return lang.charAt(0).toUpperCase() + lang.slice(1);
  }

  // --- Historical Rank and Honor Charts ---
  function renderHistoricalChart() {
    if (!els.historyChart) return;

    var snapshots = state.historySnapshots || [];
    if (!snapshots.length) {
      els.historyChart.innerHTML = '<p class="cw-text-muted">No historical snapshots recorded yet.</p>';
      return;
    }

    var metric = state.historyMetric;
    var dataPoints = snapshots.map(function (s) {
      var val = s[metric];
      if (metric === 'leaderboard') val = s.leaderboardPosition;
      return {
        date: s.date,
        val: Number(val) || 0,
        raw: s
      };
    }).filter(function (d) { return d.val > 0; });

    // Handle single snapshot case
    if (dataPoints.length <= 1) {
      var single = dataPoints[0] || { val: state.profile.honor, date: toLocalDayString(new Date()) };
      var metricLabel = metric === 'honor' ? 'Honor Points' : (metric === 'score' ? 'Rank Score' : 'Leaderboard');

      els.historyChart.innerHTML =
        '<div class="cw-chart-single-note">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>' +
          '<div>' +
            '<strong>Historical Snapshot Tracking Active:</strong> Recorded baseline on <strong>' + formatDate(single.date) + '</strong> (' + metricLabel + ': <strong>' + formatNum(single.val) + '</strong>).<br>' +
            'Because the official Codewars API does not expose historical rank/honor timeseries, our system preserves durable snapshots on every visit without fabricating synthetic past history. As more snapshots accumulate, an interactive multi-point trajectory curve will dynamically chart your progression.' +
          '</div>' +
        '</div>';
      return;
    }

    // Render SVG Line Chart for 2+ points
    var width = 600;
    var height = 200;
    var padLeft = 45;
    var padRight = 20;
    var padTop = 20;
    var padBottom = 30;

    var minVal = Math.min.apply(null, dataPoints.map(function (d) { return d.val; }));
    var maxVal = Math.max.apply(null, dataPoints.map(function (d) { return d.val; }));
    if (minVal === maxVal) { minVal = Math.max(0, minVal - 10); maxVal += 10; }

    var plotW = width - padLeft - padRight;
    var plotH = height - padTop - padBottom;

    var coords = dataPoints.map(function (d, idx) {
      var x = padLeft + (idx / (dataPoints.length - 1)) * plotW;
      var y = padTop + plotH - ((d.val - minVal) / (maxVal - minVal)) * plotH;
      return { x: x, y: y, data: d };
    });

    var pathD = 'M ' + coords.map(function (c) { return c.x.toFixed(1) + ' ' + c.y.toFixed(1); }).join(' L ');
    var areaD = pathD + ' L ' + coords[coords.length - 1].x.toFixed(1) + ' ' + (padTop + plotH) + ' L ' + coords[0].x.toFixed(1) + ' ' + (padTop + plotH) + ' Z';

    var svgHtml =
      '<svg class="cw-chart-svg" viewBox="0 0 ' + width + ' ' + height + '" preserveAspectRatio="none">' +
        '<defs>' +
          '<linearGradient id="cw-chart-gradient" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="var(--cw-brand)" stop-opacity="0.3"/>' +
            '<stop offset="100%" stop-color="var(--cw-brand)" stop-opacity="0"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<line x1="' + padLeft + '" y1="' + (padTop + plotH) + '" x2="' + (width - padRight) + '" y2="' + (padTop + plotH) + '" stroke="var(--cw-card-border)" stroke-width="1"/>' +
        '<path d="' + areaD + '" class="cw-chart-area"/>' +
        '<path d="' + pathD + '" class="cw-chart-line"/>';

    coords.forEach(function (c) {
      var tooltipText = formatDate(c.data.date) + ': ' + formatNum(c.data.val);
      svgHtml += '<circle cx="' + c.x.toFixed(1) + '" cy="' + c.y.toFixed(1) + '" r="4.5" class="cw-chart-dot" data-tooltip="' + tooltipText + '"/>';
    });

    svgHtml += '</svg>';
    els.historyChart.innerHTML = svgHtml;

    // Attach tooltips to dots
    var dots = els.historyChart.querySelectorAll('.cw-chart-dot');
    dots.forEach(function (dot) {
      var msg = dot.getAttribute('data-tooltip');
      dot.addEventListener('mouseenter', function (e) { showTooltip(e, msg); });
      dot.addEventListener('mousemove', function (e) { positionTooltip(e); });
      dot.addEventListener('mouseleave', hideTooltip);
    });
  }

  // --- Complete Kata History Library ---
  function populateKataLanguageFilter() {
    if (!els.kataLangSelect) return;

    var langs = {};
    state.allKatas.forEach(function (k) {
      (k.completedLanguages || []).forEach(function (l) {
        langs[l] = (langs[l] || 0) + 1;
      });
    });

    var sorted = Object.keys(langs).sort();
    var current = state.kataLang;

    els.kataLangSelect.innerHTML = '<option value="all">All Languages (' + state.allKatas.length + ')</option>';
    sorted.forEach(function (l) {
      var opt = document.createElement('option');
      opt.value = l;
      opt.textContent = prettyLanguage(l) + ' (' + langs[l] + ')';
      if (l === current) opt.selected = true;
      els.kataLangSelect.appendChild(opt);
    });
  }

  function renderKataList() {
    if (!els.kataList) return;

    var filtered = state.allKatas.filter(function (k) {
      // Search text
      if (state.kataSearch) {
        var query = state.kataSearch.toLowerCase();
        var nameMatch = (k.name || '').toLowerCase().indexOf(query) !== -1;
        if (!nameMatch) return false;
      }
      // Language filter
      if (state.kataLang !== 'all') {
        var langs = (k.completedLanguages || []).map(function (l) { return l.toLowerCase(); });
        if (langs.indexOf(state.kataLang.toLowerCase()) === -1) return false;
      }
      return true;
    });

    // Sort
    filtered.sort(function (a, b) {
      if (state.kataSort === 'newest') {
        return new Date(b.completedAt) - new Date(a.completedAt);
      }
      if (state.kataSort === 'oldest') {
        return new Date(a.completedAt) - new Date(b.completedAt);
      }
      if (state.kataSort === 'az') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (state.kataSort === 'za') {
        return (b.name || '').localeCompare(a.name || '');
      }
      return 0;
    });

    // Update count display
    if (els.kataCount) {
      els.kataCount.textContent = 'Showing ' + filtered.length + ' of ' + state.allKatas.length + ' katas';
    }

    if (filtered.length === 0) {
      els.kataList.innerHTML = '<div class="cw-empty-state"><p>No completed kata found matching your filters.</p></div>';
      if (els.kataPagination) els.kataPagination.style.display = 'none';
      return;
    }

    // Pagination
    var totalPages = Math.ceil(filtered.length / state.kataPageSize);
    if (state.kataPage > totalPages) state.kataPage = 1;

    var startIdx = (state.kataPage - 1) * state.kataPageSize;
    var pageItems = filtered.slice(startIdx, startIdx + state.kataPageSize);

    els.kataList.innerHTML = '';
    pageItems.forEach(function (k) {
      var item = document.createElement('div');
      item.className = 'cw-kata-item';

      var kataUrl = 'https://www.codewars.com/kata/' + encodeURIComponent(k.slug || k.id);

      var mainDiv = document.createElement('div');
      mainDiv.className = 'cw-kata-item-main';

      var link = document.createElement('a');
      link.className = 'cw-kata-title';
      link.href = kataUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = k.name || 'Untitled challenge';
      mainDiv.appendChild(link);

      var sideDiv = document.createElement('div');
      sideDiv.className = 'cw-kata-item-side';

      // Languages chips
      (k.completedLanguages || []).forEach(function (l) {
        var chip = document.createElement('span');
        chip.className = 'codewars-language-chip';
        chip.textContent = prettyLanguage(l);
        sideDiv.appendChild(chip);
      });

      // Date
      var dateSpan = document.createElement('span');
      dateSpan.className = 'cw-kata-date';
      dateSpan.textContent = formatDate(k.completedAt);
      dateSpan.title = formatDateTime(k.completedAt);
      sideDiv.appendChild(dateSpan);

      // On-demand Kata Detail Expander
      if (window.CodewarsKataInfo && k.id) {
        var detailBtn = window.CodewarsKataInfo.createButton(k.id, item);
        sideDiv.appendChild(detailBtn);
      }

      item.appendChild(mainDiv);
      item.appendChild(sideDiv);
      els.kataList.appendChild(item);
    });

    // Pagination controls
    if (els.kataPagination) {
      els.kataPagination.style.display = totalPages > 1 ? 'flex' : 'none';
      if (els.kataPageInfo) {
        els.kataPageInfo.textContent = 'Page ' + state.kataPage + ' of ' + totalPages;
      }
      if (els.kataPagePrev) els.kataPagePrev.disabled = state.kataPage <= 1;
      if (els.kataPageNext) els.kataPageNext.disabled = state.kataPage >= totalPages;
    }
  }

  // --- Dynamic Clan Leaderboard ---
  function loadClanLeaderboard(clanName) {
    if (!clanName) clanName = (state.profile && state.profile.clan) || 'Codewars';
    state.selectedClan = clanName;

    if (els.clanNameHeading) els.clanNameHeading.textContent = clanName + ' clan';
    if (els.clanBadge) els.clanBadge.textContent = clanName;
    if (els.clanStatus) els.clanStatus.textContent = 'Loading ' + clanName + ' roster...';

    var clanUrl = API_BASE + '/clans/' + encodeURIComponent(clanName) + '/members?page=1';

    fetchJson(clanUrl)
      .then(function (res) {
        var members = res.data || [];
        var totalCount = res.totalCount || members.length;
        state.clanData = {
          name: clanName,
          members: members,
          totalCount: totalCount
        };

        if (els.clanStatus) {
          els.clanStatus.textContent = totalCount + ' members in clan';
        }

        renderClanBoard(members);
      })
      .catch(function (err) {
        console.warn('Clan load error', err);
        if (els.clanStatus) {
          els.clanStatus.textContent = 'Clan data unavailable (' + err.message + ')';
        }
        if (els.clanBoard) {
          els.clanBoard.innerHTML =
            '<div class="cw-empty-state">' +
              '<p><strong>Clan leaderboard for "' + clanName + '" could not be retrieved.</strong></p>' +
              '<p style="font-size: 0.8rem; max-width: 480px; margin-top: 4px;">Codewars public API returns clan member rosters for registered public clans. If this clan has no members or Codewars returns 404, you can switch back to "Codewars" or "akhu" above.</p>' +
            '</div>';
        }
      });
  }

  function renderClanBoard(members) {
    if (!els.clanBoard) return;
    if (!members || !members.length) {
      els.clanBoard.innerHTML = '<div class="cw-empty-state"><p>No members found in this clan.</p></div>';
      return;
    }

    // Sort by honor descending
    var sorted = members.slice().sort(function (a, b) {
      return (Number(b.honor) || 0) - (Number(a.honor) || 0);
    });

    var table = document.createElement('table');
    table.className = 'codewars-clan-table';

    var thead = document.createElement('thead');
    thead.innerHTML =
      '<tr>' +
        '<th style="width: 40px; text-align: center;">#</th>' +
        '<th>Member</th>' +
        '<th>Rank</th>' +
        '<th class="codewars-clan-num">Honor</th>' +
        '<th class="codewars-clan-num">Score</th>' +
      '</tr>';
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    sorted.forEach(function (m, idx) {
      var isMe = m.username && m.username.toLowerCase() === USERNAME.toLowerCase();
      var tr = document.createElement('tr');
      if (isMe) tr.style.backgroundColor = 'var(--cw-brand-light)';

      var rankLabel = formatRankNumber(m.rank);
      var memberLink = 'https://www.codewars.com/users/' + encodeURIComponent(m.username);

      tr.innerHTML =
        '<td class="codewars-clan-pos">' + (idx + 1) + '</td>' +
        '<td><a class="codewars-clan-member" href="' + memberLink + '" target="_blank" rel="noopener noreferrer">' +
          m.username + (isMe ? ' <span style="font-size: 0.76rem; font-weight: normal;">(You)</span>' : '') +
        '</a></td>' +
        '<td class="codewars-clan-rank">' + rankLabel + '</td>' +
        '<td class="codewars-clan-num">' + formatNum(m.honor) + '</td>' +
        '<td class="codewars-clan-num">' + formatNum(m.score) + '</td>';

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    els.clanBoard.innerHTML = '';
    els.clanBoard.appendChild(table);
  }

  function formatRankNumber(rank) {
    var n = Number(rank);
    if (!Number.isFinite(n) || n === 0) return '—';
    return n < 0 ? (-n) + ' kyu' : n + ' dan';
  }

  // --- Events & Listeners ---
  function setupEventListeners() {
    if (els.refreshBtn) {
      els.refreshBtn.addEventListener('click', function () {
        loadDashboardData(true);
      });
    }

    // Heatmap Range Toggles
    if (els.heatmapRange12m) {
      els.heatmapRange12m.addEventListener('click', function () {
        state.heatmapRange = '12m';
        els.heatmapRange12m.classList.add('is-active');
        if (els.heatmapRangeAll) els.heatmapRangeAll.classList.remove('is-active');
        renderHeatmap();
      });
    }

    if (els.heatmapRangeAll) {
      els.heatmapRangeAll.addEventListener('click', function () {
        state.heatmapRange = 'all';
        els.heatmapRangeAll.classList.add('is-active');
        if (els.heatmapRange12m) els.heatmapRange12m.classList.remove('is-active');
        renderHeatmap();
      });
    }

    // Historical Chart Metric Toggles
    if (els.historyHonorBtn) {
      els.historyHonorBtn.addEventListener('click', function () {
        state.historyMetric = 'honor';
        setActiveHistoryBtn(els.historyHonorBtn);
        renderHistoricalChart();
      });
    }
    if (els.historyScoreBtn) {
      els.historyScoreBtn.addEventListener('click', function () {
        state.historyMetric = 'score';
        setActiveHistoryBtn(els.historyScoreBtn);
        renderHistoricalChart();
      });
    }
    if (els.historyLbBtn) {
      els.historyLbBtn.addEventListener('click', function () {
        state.historyMetric = 'leaderboard';
        setActiveHistoryBtn(els.historyLbBtn);
        renderHistoricalChart();
      });
    }

    // Export snapshots
    if (els.exportSnapshotsBtn) {
      els.exportSnapshotsBtn.addEventListener('click', function () {
        var jsonStr = JSON.stringify(state.historySnapshots, null, 2);
        var blob = new Blob([jsonStr], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'codewars-snapshots-' + USERNAME + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }

    // Kata Filter & Search
    if (els.kataSearchInput) {
      els.kataSearchInput.addEventListener('input', function (e) {
        state.kataSearch = e.target.value.trim();
        state.kataPage = 1;
        renderKataList();
      });
    }

    if (els.kataLangSelect) {
      els.kataLangSelect.addEventListener('change', function (e) {
        state.kataLang = e.target.value;
        state.kataPage = 1;
        renderKataList();
      });
    }

    if (els.kataSortSelect) {
      els.kataSortSelect.addEventListener('change', function (e) {
        state.kataSort = e.target.value;
        renderKataList();
      });
    }

    if (els.kataPagePrev) {
      els.kataPagePrev.addEventListener('click', function () {
        if (state.kataPage > 1) {
          state.kataPage--;
          renderKataList();
        }
      });
    }

    if (els.kataPageNext) {
      els.kataPageNext.addEventListener('click', function () {
        state.kataPage++;
        renderKataList();
      });
    }

    // Clan Presets
    if (els.clanPresetCodewars) {
      els.clanPresetCodewars.addEventListener('click', function () {
        loadClanLeaderboard('Codewars');
      });
    }
    if (els.clanPresetAkhu) {
      els.clanPresetAkhu.addEventListener('click', function () {
        loadClanLeaderboard('akhu');
      });
    }
    if (els.clanSwitchBtn && els.clanSwitchInput) {
      els.clanSwitchBtn.addEventListener('click', function () {
        var val = els.clanSwitchInput.value.trim();
        if (val) loadClanLeaderboard(val);
      });
      els.clanSwitchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          var val = els.clanSwitchInput.value.trim();
          if (val) loadClanLeaderboard(val);
        }
      });
    }
  }

  function setActiveHistoryBtn(activeBtn) {
    [els.historyHonorBtn, els.historyScoreBtn, els.historyLbBtn].forEach(function (btn) {
      if (btn) btn.classList.remove('is-active');
    });
    if (activeBtn) activeBtn.classList.add('is-active');
  }

  // --- Bootloader ---
  function init() {
    initElements();
    setupEventListeners();
    loadDashboardData(false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
