(function() {
  'use strict';

  var REFRESH_MS = 60000;
  var TIMEOUT_MS = 20000;
  var WITHDRAWN_CODES = ['STANDINGS_HIDDEN', 'UPSTREAM_ACCESS_DENIED', 'CONTEST_NOT_FOUND', 'STANDINGS_UNAVAILABLE', 'NOT_CONFIGURED'];

  function isText(value) {
    return value === null || typeof value === 'string';
  }

  function validPlaces(value) {
    return Array.isArray(value) && value.every(function(place) {
      return Number.isSafeInteger(place) && place >= 0;
    });
  }

  function validate(data, contestId) {
    if (!data || data.schemaVersion !== 1 || !data.contest || data.contest.id !== contestId
        || !Number.isFinite(Date.parse(data.fetchedAt)) || !Array.isArray(data.titles)
        || !Array.isArray(data.rows) || !Number.isSafeInteger(data.totalParticipants)
        || data.totalParticipants !== data.rows.length || !isText(data.contest.scoringSystem)) {
      throw new Error('Invalid leaderboard response');
    }
    data.titles.forEach(function(title) {
      if (!title || typeof title.title !== 'string' || !isText(title.name)) {
        throw new Error('Invalid column');
      }
    });
    data.rows.forEach(function(row) {
      if (!row || typeof row.name !== 'string' || typeof row.score !== 'string'
          || !validPlaces(row.placeFrom) || !validPlaces(row.placeTo)
          || row.placeFrom.length !== row.placeTo.length || !Array.isArray(row.problemResults)
          || row.problemResults.length !== data.titles.length) {
        throw new Error('Invalid standings row');
      }
      row.problemResults.forEach(function(result) {
        if (!result || !isText(result.score) || !isText(result.status) || !isText(result.submissionCount)
            || (result.submitDelay !== null && !Number.isSafeInteger(result.submitDelay))) {
          throw new Error('Invalid problem result');
        }
      });
    });
    return data;
  }

  function rankLabel(row) {
    return row.placeFrom.map(function(from, index) {
      var to = row.placeTo[index];
      return from === to ? String(from) : from + '\u2013' + to;
    }).join(' / ') || '\u2014';
  }

  function scoreLabel(score) {
    return score === null || score.trim() === '' ? '\u2014' : score;
  }

  function node(doc, tag, className, value) {
    var element = doc.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined) element.textContent = value;
    return element;
  }

  function renderBoard(board, data) {
    var doc = board.ownerDocument;
    if (!data.rows.length) {
      board.replaceChildren(node(doc, 'p', 'codewars-empty', 'No participants in the standings yet.'));
      return;
    }

    var table = node(doc, 'table', 'codewars-clan-table yandex-contest-table');
    table.appendChild(node(doc, 'caption', 'visually-hidden', 'Fall 2026 Programming Challenge standings'));
    var head = node(doc, 'thead');
    var heading = node(doc, 'tr');
    function addHeading(label, className, title) {
      var cell = node(doc, 'th', className, label);
      cell.setAttribute('scope', 'col');
      if (title) cell.title = title;
      heading.appendChild(cell);
    }
    addHeading('#', 'codewars-clan-pos', 'Position, including tied positions');
    addHeading('Participant');
    data.titles.forEach(function(problem) {
      addHeading(problem.title, 'yandex-contest-number', problem.name || problem.title);
    });
    // The Worker preserves Yandex's total as text; do not invent a penalty value.
    addHeading(data.contest.scoringSystem === 'acm' ? 'Score / penalty' : 'Total', 'yandex-contest-number yandex-contest-total');
    head.appendChild(heading);
    table.appendChild(head);

    var body = node(doc, 'tbody');
    data.rows.forEach(function(participant) {
      var row = node(doc, 'tr');
      row.appendChild(node(doc, 'td', 'codewars-clan-pos', rankLabel(participant)));
      var nameCell = node(doc, 'th', 'yandex-contest-name', participant.name);
      nameCell.setAttribute('scope', 'row');
      row.appendChild(nameCell);
      participant.problemResults.forEach(function(result) {
        var score = scoreLabel(result.score);
        var cell = node(doc, 'td', 'yandex-contest-number' + (score === '\u2014' ? ' yandex-contest-missing' : ''), score);
        var details = [];
        if (result.status) details.push('Status: ' + result.status);
        if (result.submissionCount !== null && result.submissionCount !== '') details.push('Submissions: ' + result.submissionCount);
        if (details.length) cell.title = details.join(' · ');
        row.appendChild(cell);
      });
      row.appendChild(node(doc, 'td', 'yandex-contest-number yandex-contest-total', scoreLabel(participant.score)));
      body.appendChild(row);
    });
    table.appendChild(body);
    // Preserve a mobile reader's horizontal position during automatic updates.
    var scrollLeft = board.scrollLeft;
    board.replaceChildren(table);
    board.scrollLeft = scrollLeft;
  }

  function createController(root, runtime) {
    var doc = root.ownerDocument;
    var board = root.querySelector('[data-yandex-board]');
    var status = root.querySelector('[data-yandex-status]');
    var updated = root.querySelector('[data-yandex-updated]');
    var refresh = root.querySelector('[data-yandex-refresh]');
    var contestId = root.getAttribute('data-contest-id');
    var endpoint = root.getAttribute('data-leaderboard-url');
    var timer = null;
    var pending = null;
    var snapshot = null;
    var lastAttempt = null;
    var stopped = false;
    var aborter = null;

    function setStatus(message, type) {
      status.textContent = message;
      status.setAttribute('data-type', type || '');
    }

    function schedule() {
      runtime.clearTimeout(timer);
      if (!stopped && !doc.hidden) {
        var delay = lastAttempt === null ? 0 : Math.max(0, REFRESH_MS - (runtime.now() - lastAttempt));
        timer = runtime.setTimeout(load, delay);
      }
    }

    function setBusy(busy) {
      refresh.disabled = busy;
      refresh.classList.toggle('is-refreshing', busy);
      board.setAttribute('aria-busy', String(busy));
    }

    function showTimestamp(data) {
      var time = node(doc, 'time');
      time.dateTime = data.fetchedAt;
      time.title = new Date(data.fetchedAt).toLocaleString();
      time.textContent = new Intl.DateTimeFormat(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
      }).format(new Date(data.fetchedAt));
      updated.replaceChildren(doc.createTextNode('Last updated '), time);
    }

    async function load() {
      if (stopped || pending) return pending;
      runtime.clearTimeout(timer);
      setBusy(true);
      setStatus(snapshot ? 'Refreshing standings...' : 'Loading contest leaderboard...');
      aborter = new runtime.AbortController();
      var timeout = runtime.setTimeout(function() { aborter.abort(); }, TIMEOUT_MS);
      pending = (async function() {
        try {
          var response = await runtime.fetch(endpoint, {
            headers: { Accept: 'application/json' },
            credentials: 'omit', cache: 'no-store', signal: aborter.signal
          });
          var data;
          try { data = await response.json(); } catch (error) { throw new Error('Invalid response'); }
          if (!response.ok) {
            var failure = new Error('Leaderboard unavailable');
            failure.withdrawn = data && WITHDRAWN_CODES.indexOf(data.error) !== -1;
            throw failure;
          }
          validate(data, contestId);
          if (stopped) return;
          renderBoard(board, data);
          snapshot = data;
          showTimestamp(data);
          setStatus(data.totalParticipants + (data.totalParticipants === 1 ? ' participant' : ' participants'));
        } catch (error) {
          if (stopped) return;
          if (error.withdrawn) {
            snapshot = null;
            board.replaceChildren();
            updated.textContent = 'Not available';
          }
          setStatus(snapshot
            ? 'Refresh failed. Showing previously loaded standings; they may be out of date.'
            : 'Leaderboard unavailable. Try refreshing or view the standings on Yandex.', snapshot ? 'warning' : 'error');
        } finally {
          runtime.clearTimeout(timeout);
          lastAttempt = runtime.now();
          pending = null;
          if (!stopped) {
            setBusy(false);
            schedule();
          }
        }
      })();
      return pending;
    }

    function visibilityChanged() {
      runtime.clearTimeout(timer);
      if (!doc.hidden && !pending) schedule();
    }

    refresh.addEventListener('click', load);
    doc.addEventListener('visibilitychange', visibilityChanged);
    if (!doc.hidden) load();
    else refresh.disabled = false;
    return {
      refresh: load,
      stop: function() {
        stopped = true;
        runtime.clearTimeout(timer);
        if (aborter) aborter.abort();
        refresh.removeEventListener('click', load);
        doc.removeEventListener('visibilitychange', visibilityChanged);
      }
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { validate: validate, rankLabel: rankLabel, renderBoard: renderBoard, createController: createController };
  } else {
    function init() {
      var root = document.querySelector('[data-yandex-leaderboard]');
      if (root) createController(root, {
        fetch: window.fetch.bind(window), setTimeout: window.setTimeout.bind(window),
        clearTimeout: window.clearTimeout.bind(window), now: Date.now, AbortController: window.AbortController
      });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})();
