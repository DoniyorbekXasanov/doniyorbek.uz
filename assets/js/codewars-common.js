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
