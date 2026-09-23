(function() {
  var byId = window.CodewarsCommon.byId;
  var formatNumber = window.CodewarsCommon.formatNumber;
  var prettyLanguage = window.CodewarsCommon.prettyLanguage;
  var clearElement = window.CodewarsCommon.clearElement;
  var createTextElement = window.CodewarsCommon.createTextElement;
  var fetchJson = window.CodewarsCommon.fetchJson;
  var delay = window.CodewarsCommon.delay;

  var CACHE_TTL = 24 * 60 * 60 * 1000;
  var REQUEST_DELAY = 300;
  var ACTIVITY_DAYS = 7;
  var ACTIVITY_PAGE_SIZE = 20;
  // A kata's rank never changes, so its level is cached permanently and shared
  // across clans/members — each unique kata is fetched at most once, ever.
  var KATA_KEY = 'codewars-kata-meta:v1';

  var root;
  var clan_name;
  var cache_key;
  var honor_snapshot_url;
  var honor_snapshot = null;
  var excluded = {};
  var kata_meta = {};
  var kata_meta_pending = {};
  var elements = {};
  var clan_pending = null;
  var activity_member_data = [];
  var activity_visible_count = ACTIVITY_PAGE_SIZE;

  function setStatus(message) {
    if (elements.status) {
      elements.status.textContent = message;
    }
  }

  // Codewars ranks: -8..-1 map to 8 kyu..1 kyu, 1..8 map to 1 dan..8 dan.
  function rankLabel(rank) {
    var n = Number(rank);
    if (!Number.isFinite(n) || n === 0) {
      return '-';
    }
    return n < 0 ? (-n) + ' kyu' : n + ' dan';
  }

  function readCache() {
    try {
      var cached = JSON.parse(localStorage.getItem(cache_key));
      if (!cached || !Array.isArray(cached.members) || !cached.fetchedAt) {
        return null;
      }
      cached.members = cached.members.map(function(raw) {
        var member = toMember(raw);
        member.completedPage = raw.completedPage || null;
        member.activityFetchedAt = raw.activityFetchedAt || null;
        member.refreshRequired = !!raw.refreshRequired;
        return member;
      });
      return cached;
    } catch (error) {
      return null;
    }
  }

  function writeCache(member_data, fetched_at) {
    try {
      localStorage.setItem(cache_key, JSON.stringify({
        members: member_data.map(function(member) {
          return {
            username: member.username,
            honor: member.honor,
            rank: member.rank,
            completedPage: member.completedPage,
            activityFetchedAt: member.activityFetchedAt,
            // Preserve successful data after a failure, but retry on the next load.
            refreshRequired: member.refreshRequired
          };
        }),
        fetchedAt: fetched_at
      }));
    } catch (error) {}
  }

  function startOfLocalDay(date) {
    var day = new Date(date);
    day.setHours(0, 0, 0, 0);
    return day;
  }

  function samarkandDay(timestamp) {
    var five_hours = 5 * 60 * 60 * 1000;
    return new Date(timestamp + five_hours).toISOString().slice(0, 10);
  }

  function loadHonorSnapshot() {
    honor_snapshot = null;
    if (!honor_snapshot_url) {
      return Promise.resolve(null);
    }

    return fetch(honor_snapshot_url, {
      cache: 'no-store',
      headers: { Accept: 'application/json' }
    }).then(function(response) {
      if (!response.ok) {
        throw new Error('Honor snapshot returned ' + response.status);
      }
      return response.json();
    }).then(function(snapshot) {
      if (!snapshot || snapshot.day !== samarkandDay(Date.now()) || !snapshot.honors) {
        return null;
      }
      honor_snapshot = snapshot;
      return snapshot;
    }).catch(function() {
      return null;
    });
  }

  function applyHonorGains(member_data) {
    var has_snapshot = honor_snapshot && honor_snapshot.honors;

    member_data.forEach(function(member) {
      member.honorGain = null;
      if (!has_snapshot) {
        return;
      }

      var key = String(member.username).toLowerCase();
      var baseline = Number(honor_snapshot.honors[key]);
      if (!Object.prototype.hasOwnProperty.call(honor_snapshot.honors, key) || !Number.isFinite(baseline)) {
        member.honorGain = 0;
        return;
      }

      member.honorGain = Math.max(0, member.honor - baseline);
    });
  }

  function dayKey(iso) {
    return startOfLocalDay(new Date(iso)).getTime();
  }

  function formatDayHeading(day_key) {
    var today = startOfLocalDay(new Date()).getTime();
    var one_day = 24 * 60 * 60 * 1000;

    if (day_key === today) {
      return 'Today';
    }
    if (day_key === today - one_day) {
      return 'Yesterday';
    }
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(new Date(day_key));
  }

  function formatTime(iso) {
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(iso));
  }

  function formatDateTime(iso) {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(iso));
  }

  // "Today" / "Yesterday" / "3 days ago" / a date for older completions.
  function formatRelativeDay(iso) {
    var today = startOfLocalDay(new Date()).getTime();
    var one_day = 24 * 60 * 60 * 1000;
    var key = startOfLocalDay(new Date(iso)).getTime();
    var diff_days = Math.round((today - key) / one_day);

    if (diff_days <= 0) {
      return 'Today';
    }
    if (diff_days === 1) {
      return 'Yesterday';
    }
    if (diff_days < 7) {
      return diff_days + ' days ago';
    }
    if (diff_days < 30) {
      var weeks = Math.round(diff_days / 7);
      return weeks + (weeks === 1 ? ' week ago' : ' weeks ago');
    }
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(key));
  }

  // Fetch every page of the clan roster (honor + rank come straight from here).
  function fetchRoster() {
    function grabPage(page, acc) {
      return fetchJson('/clans/' + encodeURIComponent(clan_name) + '/members?page=' + page).then(function(res) {
        var combined = acc.concat(res.data || []);
        var total_pages = Number(res.totalPages) || 1;
        if (page < total_pages) {
          return grabPage(page + 1, combined);
        }
        return combined;
      });
    }
    return grabPage(1, []);
  }

  function toMember(raw) {
    return {
      username: raw.username,
      displayName: raw.username,
      honor: Number(raw.honor) || 0,
      honorGain: null,
      rank: Number(raw.rank),
      totalSolved: null,
      weekCount: null,
      monthCount: null,
      lastActive: null,
      isNew: false,
      recent: [],
      completedPage: null,
      activityFetchedAt: null,
      refreshRequired: false,
      loaded: false,
      failed: false
    };
  }

  // Pull one member's first page of completed katas to fill counts + activity.
  function enrichMember(member) {
    return fetchJson('/users/' + encodeURIComponent(member.username) + '/code-challenges/completed?page=0').then(function(page) {
      if (!page || !Array.isArray(page.data)) {
        throw new Error('Invalid completed kata response');
      }
      member.completedPage = page;
      member.activityFetchedAt = new Date().toISOString();
      member.refreshRequired = false;
      member.failed = false;
    }).catch(function() {
      member.refreshRequired = true;
      member.failed = true;
    });
  }

  function applyCompleted(member, page) {
    var completed = (page && page.data) || [];
    var one_day = 24 * 60 * 60 * 1000;
    var today = startOfLocalDay(new Date()).getTime();
    var week_cutoff = today - 6 * one_day;
    var month_cutoff = today - 29 * one_day;
    var recent_cutoff = today - (ACTIVITY_DAYS - 1) * one_day;
    var week_count = 0;
    var month_count = 0;
    var last_active = null;
    var recent = [];

    member.totalSolved = typeof page.totalItems === 'number' ? page.totalItems : completed.length;
    member.isNew = member.totalSolved === 0;

    completed.forEach(function(challenge) {
      if (!challenge || !challenge.completedAt) {
        return;
      }
      var completed_at = new Date(challenge.completedAt).getTime();
      var key = startOfLocalDay(new Date(challenge.completedAt)).getTime();

      if (last_active === null || completed_at > last_active) {
        last_active = completed_at;
      }
      if (key >= week_cutoff) {
        week_count += 1;
      }
      if (key >= month_cutoff) {
        month_count += 1;
      }
      if (completed_at >= recent_cutoff) {
        recent.push({
          username: member.username,
          displayName: member.displayName,
          id: challenge.id,
          name: challenge.name || 'Untitled kata',
          slug: challenge.slug || challenge.id,
          languages: challenge.completedLanguages || [],
          completedAt: challenge.completedAt
        });
      }
    });

    member.weekCount = week_count;
    member.monthCount = month_count;
    member.lastActive = last_active ? new Date(last_active).toISOString() : null;
    member.recent = recent;
  }

  function isExcluded(username) {
    return !!excluded[String(username).toLowerCase()];
  }

  function boardCount(member_data) {
    return member_data.filter(function(member) {
      return !isExcluded(member.username);
    }).length;
  }

  // The leaderboard is for students, so excluded members (e.g. the owner) are
  // dropped from the ranking but still tracked for the daily activity feed.
  function updateActivity(member_data) {
    member_data.forEach(function(member) {
      member.loaded = !!member.completedPage;
      if (member.loaded) {
        applyCompleted(member, member.completedPage);
      }
    });
  }

  function renderBoard(member_data) {
    updateActivity(member_data);
    var ranked = member_data.filter(function(member) {
      return !isExcluded(member.username);
    }).sort(function(a, b) {
      return b.honor - a.honor;
    });

    clearElement(elements.board);

    var table = document.createElement('table');
    table.className = 'codewars-clan-table';

    var columns = ['#', 'Member', 'Rank', 'Honor', 'Today', 'Katas', 'Week', 'Month', 'Last active'];
    var head = document.createElement('thead');
    var head_row = document.createElement('tr');
    columns.forEach(function(label, index) {
      var cell = createTextElement('th', null, label);
      if (index >= 3 && index <= 7) {
        cell.className = 'codewars-clan-num';
      }
      if (label === 'Today') {
        cell.title = 'Honor gained since midnight in Samarkand';
      }
      head_row.appendChild(cell);
    });
    head.appendChild(head_row);
    table.appendChild(head);

    var body = document.createElement('tbody');
    ranked.forEach(function(member, index) {
      var row = document.createElement('tr');
      if (member.failed) {
        row.className = 'codewars-clan-row-failed';
      } else if (member.loaded && member.isNew) {
        row.className = 'codewars-clan-row-new';
      }

      row.appendChild(createTextElement('td', 'codewars-clan-pos', String(index + 1)));

      var name_cell = document.createElement('td');
      var link = document.createElement('a');
      link.className = 'codewars-clan-member';
      link.href = '/codewars/member/?user=' + encodeURIComponent(member.username);
      link.textContent = member.displayName;
      name_cell.appendChild(link);
      row.appendChild(name_cell);

      row.appendChild(createTextElement('td', 'codewars-clan-rank', rankLabel(member.rank)));

      // A member with no solves reads as "not started" instead of a wall of zeros.
      var is_new = member.loaded && member.isNew;
      var loading = !member.loaded;

      row.appendChild(numCell(is_new ? '—' : formatNumber(member.honor)));
      row.appendChild(honorGainCell(member, is_new));

      if (member.failed && !member.loaded) {
        row.appendChild(numCell('—'));
        row.appendChild(numCell('—'));
        row.appendChild(numCell('—'));
        row.appendChild(createTextElement('td', 'codewars-clan-active', 'Unavailable'));
      } else if (loading) {
        row.appendChild(numCell('·'));
        row.appendChild(numCell('·'));
        row.appendChild(numCell('·'));
        row.appendChild(createTextElement('td', 'codewars-clan-active', '·'));
      } else if (is_new) {
        row.appendChild(numCell('—'));
        row.appendChild(numCell('—'));
        row.appendChild(numCell('—'));
        row.appendChild(createTextElement('td', 'codewars-clan-active codewars-clan-muted', 'Not started'));
      } else {
        row.appendChild(numCell(formatNumber(member.totalSolved)));
        row.appendChild(numCell(String(member.weekCount)));
        row.appendChild(numCell(String(member.monthCount)));
        row.appendChild(createTextElement('td', 'codewars-clan-active', member.lastActive ? formatRelativeDay(member.lastActive) : '—'));
      }

      body.appendChild(row);
    });
    table.appendChild(body);

    elements.board.appendChild(table);
  }

  function numCell(text) {
    return createTextElement('td', 'codewars-clan-num', text);
  }

  function honorGainCell(member, is_new) {
    var gain = Number(member.honorGain);
    var available = member.honorGain !== null && Number.isFinite(gain);
    var text = '—';

    if (!is_new && available) {
      text = gain > 0 ? '+' + formatNumber(gain) : '0';
    }

    var cell = createTextElement('td', 'codewars-clan-num codewars-clan-honor-gain', text);
    cell.title = available ? 'Honor gained today' : 'Today’s honor snapshot is unavailable';
    if (gain > 0) {
      cell.classList.add('is-positive');
    }
    return cell;
  }

  function mergeRoster(cached_members, raw_members) {
    var existing = {};
    cached_members.forEach(function(member) {
      existing[String(member.username).toLowerCase()] = member;
    });

    return raw_members.filter(function(raw) {
      return raw && raw.username;
    }).map(function(raw) {
      var key = String(raw.username).toLowerCase();
      var member = existing[key];
      if (!member) {
        return toMember(raw);
      }

      member.username = raw.username;
      member.displayName = raw.username;
      member.honor = Number(raw.honor) || 0;
      member.rank = Number(raw.rank);
      member.honorGain = null;
      return member;
    });
  }

  function enrichPendingMembers(member_data, force) {
    var pending = member_data.filter(function(member) {
      return force || member.refreshRequired || !member.completedPage ||
        !(Date.now() - new Date(member.activityFetchedAt).getTime() < CACHE_TTL);
    });
    var chain = Promise.resolve();

    pending.forEach(function(member, index) {
      chain = chain.then(function() {
        setStatus('Loading activity ' + (index + 1) + ' / ' + pending.length + '...');
        return enrichMember(member).then(function() {
          renderBoard(member_data);
          renderActivity(member_data, index < pending.length - 1);
          return delay(REQUEST_DELAY);
        });
      });
    });

    return chain;
  }

  function collectEvents(member_data) {
    updateActivity(member_data);
    var events = [];
    member_data.forEach(function(member) {
      events = events.concat(member.recent);
    });

    events.sort(function(a, b) {
      return new Date(b.completedAt) - new Date(a.completedAt);
    });

    return events;
  }

  function renderActivity(member_data, still_loading) {
    var events = collectEvents(member_data);
    var visible_events = events.slice(0, activity_visible_count);
    var remaining_count = events.length - visible_events.length;

    activity_member_data = member_data;

    clearElement(elements.activity);

    if (elements.activityFooter) {
      elements.activityFooter.hidden = still_loading || !events.length;
    }
    if (elements.activityProgress) {
      elements.activityProgress.textContent = remaining_count
        ? 'Showing ' + visible_events.length + ' of ' + events.length
        : 'Showing all ' + events.length + ' activities';
    }
    if (elements.loadMore) {
      elements.loadMore.hidden = still_loading || remaining_count === 0;
    }

    if (!events.length) {
      var empty_text = still_loading ? 'Loading recent activity...' : 'No clan kata completions in the last ' + ACTIVITY_DAYS + ' days.';
      elements.activity.appendChild(createTextElement('p', 'codewars-empty', empty_text));
      return;
    }

    var current_day = null;
    visible_events.forEach(function(event) {
      var key = dayKey(event.completedAt);
      if (key !== current_day) {
        current_day = key;
        elements.activity.appendChild(createTextElement('h5', 'codewars-month-heading', formatDayHeading(key)));
      }

      var item = document.createElement('div');
      item.className = 'codewars-kata-row codewars-clan-kata-row';

      var who = createTextElement('span', 'codewars-clan-event-who', event.displayName);

      var kata = createTextElement('a', 'codewars-kata-name', event.name);
      kata.href = 'https://www.codewars.com/kata/' + encodeURIComponent(event.slug);
      kata.target = '_blank';
      kata.rel = 'noopener';

      var meta = document.createElement('span');
      meta.className = 'codewars-kata-meta';

      var level = kata_meta[event.id];
      if (level && level.rank) {
        meta.appendChild(createTextElement('span', 'codewars-clan-event-level', level.rank));
      }
      (event.languages || []).forEach(function(language) {
        meta.appendChild(createTextElement('span', 'codewars-language-chip', prettyLanguage(language)));
      });
      meta.appendChild(createTextElement('span', 'codewars-kata-date', formatTime(event.completedAt)));
      if (window.CodewarsKataInfo && event.id) {
        meta.appendChild(window.CodewarsKataInfo.createButton(event.id, item));
      }

      item.appendChild(who);
      item.appendChild(kata);
      item.appendChild(meta);
      elements.activity.appendChild(item);
    });
  }

  function readKataMeta() {
    try {
      kata_meta = JSON.parse(localStorage.getItem(KATA_KEY)) || {};
    } catch (error) {
      kata_meta = {};
    }
  }

  function writeKataMeta() {
    try {
      localStorage.setItem(KATA_KEY, JSON.stringify(kata_meta));
    } catch (error) {}
  }

  function fetchKataLevel(id) {
    return fetchJson('/code-challenges/' + encodeURIComponent(id)).then(function(kata) {
      if (kata && kata.rank && kata.rank.name) {
        kata_meta[id] = { rank: kata.rank.name };
      }
    }).catch(function() {
      // Leave uncached on failure so it retries on the next load.
    });
  }

  // Fetch levels only for katas in the feed we've never seen, then re-render.
  function hydrateKataLevels(member_data) {
    var seen = {};
    var missing = collectEvents(member_data).slice(0, activity_visible_count).filter(function(event) {
      if (!event.id || kata_meta[event.id] || kata_meta_pending[event.id] || seen[event.id]) {
        return false;
      }
      seen[event.id] = true;
      return true;
    });

    if (!missing.length) {
      return Promise.resolve();
    }

    missing.forEach(function(event) {
      kata_meta_pending[event.id] = true;
    });

    var chain = Promise.resolve();
    missing.forEach(function(event) {
      chain = chain.then(function() {
        return fetchKataLevel(event.id).then(function() {
          delete kata_meta_pending[event.id];
          return delay(REQUEST_DELAY);
        });
      });
    });

    return chain.then(function() {
      writeKataMeta();
      renderActivity(member_data, false);
    });
  }

  function loadClan(force) {
    if (clan_pending) {
      return clan_pending;
    }
    setRefreshing(true);
    clan_pending = Promise.resolve().then(function() {
      activity_visible_count = ACTIVITY_PAGE_SIZE;
      var cached = readCache();
      if (cached) {
        renderBoard(cached.members);
        renderActivity(cached.members, false);
        setStatus('Showing cached clan data. Refreshing...');
      } else {
        setStatus('Loading clan...');
      }

      return Promise.all([fetchRoster(), loadHonorSnapshot()]).then(function(results) {
        var members = mergeRoster(cached ? cached.members : [], results[0]);
        applyHonorGains(members);
        renderBoard(members);
        renderActivity(members, true);

        return enrichPendingMembers(members, force).then(function() {
          var fetched_at = new Date().toISOString();
          writeCache(members, fetched_at);
          var failed_count = members.filter(function(member) { return member.failed; }).length;
          setStatus(boardCount(members) + ' members' + (failed_count
            ? ' · Activity unavailable for ' + failed_count + ' members; refresh to retry.'
            : ' · Activity checked ' + formatDateTime(fetched_at)));
          renderActivity(members, false);
          if (!members.length) {
            clearElement(elements.board);
            elements.board.appendChild(createTextElement('p', 'codewars-empty', 'No members found for this clan.'));
            setStatus('No members found.');
          }
          return hydrateKataLevels(members);
        });
      }).catch(function() {
        if (!cached) {
          clearElement(elements.board);
          elements.board.appendChild(createTextElement('p', 'codewars-empty', 'Clan data could not be loaded right now.'));
          setStatus('Failed to load clan data.');
        } else {
          honor_snapshot = null;
          applyHonorGains(cached.members);
          renderBoard(cached.members);
          renderActivity(cached.members, false);
          setStatus('Showing cached clan data. Refresh failed.');
        }
      });
    }).then(function() {
      clan_pending = null;
      setRefreshing(false);
    }, function(error) {
      clan_pending = null;
      setRefreshing(false);
      throw error;
    });
    return clan_pending;
  }

  function init() {
    root = document.querySelector('[data-codewars-clan]');
    if (!root) {
      return;
    }

    clan_name = root.getAttribute('data-clan-name') || 'clan';
    cache_key = 'codewars-clan:v4:' + clan_name;
    honor_snapshot_url = root.getAttribute('data-honor-snapshot-url') || '';
    readKataMeta();

    excluded = {};
    (root.getAttribute('data-exclude-members') || '').split(',').forEach(function(name) {
      var trimmed = name.trim().toLowerCase();
      if (trimmed) {
        excluded[trimmed] = true;
      }
    });
    elements = {
      status: byId('codewars-clan-status'),
      refresh: byId('codewars-clan-refresh'),
      board: byId('codewars-clan-board'),
      activity: byId('codewars-clan-activity'),
      activityFooter: byId('codewars-clan-activity-footer'),
      activityProgress: byId('codewars-clan-activity-progress'),
      loadMore: byId('codewars-clan-load-more')
    };

    if (elements.refresh) {
      elements.refresh.addEventListener('click', function() {
        loadClan(true);
      });
    }

    if (elements.loadMore) {
      elements.loadMore.addEventListener('click', function() {
        activity_visible_count += ACTIVITY_PAGE_SIZE;
        renderActivity(activity_member_data, false);
        hydrateKataLevels(activity_member_data);
      });
    }

    loadClan();
  }

  function setRefreshing(is_refreshing) {
    if (!elements.refresh) {
      return;
    }
    elements.refresh.disabled = is_refreshing;
    elements.refresh.classList.toggle('is-refreshing', is_refreshing);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
