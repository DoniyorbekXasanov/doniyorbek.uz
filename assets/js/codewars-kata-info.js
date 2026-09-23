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
