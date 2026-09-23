(function() {
  function initThemeToggle() {
    var toggle = document.getElementById('theme-toggle');
    var theme_manager = window.themeManager;
    var theme_order = ['light', 'dark', 'system'];
    var theme_labels = {
      light: 'light',
      dark: 'dark',
      system: 'system'
    };

    if (!toggle || !theme_manager) {
      return;
    }

    function getNextPreference(preference) {
      var current_index = theme_order.indexOf(preference);
      if (current_index === -1) {
        return theme_order[0];
      }
      return theme_order[(current_index + 1) % theme_order.length];
    }

    function renderThemeState() {
      var preference = theme_manager.getPreference();
      var next_preference = getNextPreference(preference);
      var button_text = 'Theme: ' + theme_labels[preference] + '. Click to switch to ' + theme_labels[next_preference] + '.';

      toggle.setAttribute('aria-label', button_text);
      toggle.setAttribute('title', button_text);
    }

    toggle.addEventListener('click', function() {
      var next_preference = getNextPreference(theme_manager.getPreference());
      theme_manager.setPreference(next_preference);
      renderThemeState();
    });

    window.addEventListener('themechange', renderThemeState);
    renderThemeState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
  } else {
    initThemeToggle();
  }
})();
