(function() {
  var storage_key = 'theme';
  var default_preference = 'system';
  var document_element = document.documentElement;
  var theme_color_meta = document.getElementById('theme-color-meta');
  var media_query = window.matchMedia('(prefers-color-scheme: dark)');
  var current_preference = default_preference;

  function normalizePreference(value) {
    if (value === 'light' || value === 'dark' || value === 'system') {
      return value;
    }
    return default_preference;
  }

  function readPreference() {
    try {
      return normalizePreference(localStorage.getItem(storage_key));
    } catch (error) {
      return default_preference;
    }
  }

  function getEffectiveTheme(preference) {
    if (preference === 'system') {
      return media_query.matches ? 'dark' : 'light';
    }
    return preference;
  }

  function updateThemeColor() {
    if (!theme_color_meta) {
      return;
    }
    var bg_color = getComputedStyle(document_element).getPropertyValue('--bg-color').trim();
    if (bg_color) {
      theme_color_meta.setAttribute('content', bg_color);
    }
  }

  function applyPreference(preference) {
    var normalized_preference = normalizePreference(preference);
    var effective_theme = getEffectiveTheme(normalized_preference);

    current_preference = normalized_preference;
    document_element.setAttribute('data-theme-preference', normalized_preference);
    document_element.setAttribute('data-theme', effective_theme);
    document_element.style.colorScheme = effective_theme;
    updateThemeColor();

    return {
      preference: normalized_preference,
      theme: effective_theme
    };
  }

  function persistPreference(preference) {
    try {
      if (preference === default_preference) {
        localStorage.removeItem(storage_key);
      } else {
        localStorage.setItem(storage_key, preference);
      }
    } catch (error) {}
  }

  function dispatchThemeChange(detail) {
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: detail
    }));
  }

  function setPreference(preference) {
    var normalized_preference = normalizePreference(preference);
    persistPreference(normalized_preference);
    var detail = applyPreference(normalized_preference);
    dispatchThemeChange(detail);
    return detail;
  }

  function handleSystemThemeChange() {
    if (current_preference !== 'system') {
      return;
    }
    dispatchThemeChange(applyPreference(current_preference));
  }

  if (typeof media_query.addEventListener === 'function') {
    media_query.addEventListener('change', handleSystemThemeChange);
  } else if (typeof media_query.addListener === 'function') {
    media_query.addListener(handleSystemThemeChange);
  }

  applyPreference(readPreference());

  window.themeManager = {
    getPreference: function() {
      return current_preference;
    },
    getEffectiveTheme: function() {
      return getEffectiveTheme(current_preference);
    },
    setPreference: setPreference,
    applyPreference: applyPreference
  };
})();
