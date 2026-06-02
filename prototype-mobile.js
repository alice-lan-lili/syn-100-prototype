(function () {
  if (location.hostname === 'calendar.ucsd.edu') return;

  var mobileMq = window.matchMedia ? window.matchMedia('(max-width: 768px)') : null;
  window.PROTOTYPE_MOBILE =
    (mobileMq && mobileMq.matches) ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);

  var savedScrollY = 0;

  function scheduleIdle(fn, timeout) {
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(fn, { timeout: timeout || 2000 });
    } else {
      setTimeout(fn, 16);
    }
  }

  window.schedulePrototypeWork = scheduleIdle;

  function ensureFilterBackdrop() {
    if (document.getElementById('proto-filter-backdrop')) return;
    var backdrop = document.createElement('div');
    backdrop.id = 'proto-filter-backdrop';
    backdrop.className = 'proto-filter-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.addEventListener('click', function () {
      window.closePrototypeFilter();
    });
    document.body.appendChild(backdrop);
  }

  function isFilterOpen() {
    var dropdown = document.getElementById('filter-dropdown');
    if (!dropdown) return false;
    if (dropdown.getAttribute('aria-hidden') === 'true') return false;
    var display = dropdown.style.display || window.getComputedStyle(dropdown).display;
    return display !== 'none';
  }

  function unlockPageScroll() {
    document.documentElement.classList.remove('proto-filter-open');
    document.body.classList.remove('proto-filter-open');
    document.documentElement.style.overflow = '';
    document.documentElement.style.position = '';
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    var backdrop = document.getElementById('proto-filter-backdrop');
    if (backdrop) {
      backdrop.style.display = 'none';
      backdrop.setAttribute('aria-hidden', 'true');
    }
    if (savedScrollY) {
      window.scrollTo(0, savedScrollY);
    }
  }

  function openFilterDropdown(e) {
    if (e) e.preventDefault();
    var dropdown = document.getElementById('filter-dropdown');
    var btn = document.getElementById('em-button-toggle-filter');
    if (!dropdown) return;
    savedScrollY = window.scrollY || window.pageYOffset || 0;
    dropdown.style.display = 'block';
    dropdown.style.visibility = 'visible';
    dropdown.style.pointerEvents = 'auto';
    dropdown.setAttribute('aria-hidden', 'false');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('proto-filter-open');
    document.body.classList.add('proto-filter-open');
    var backdrop = document.getElementById('proto-filter-backdrop');
    if (backdrop) {
      backdrop.style.display = 'block';
      backdrop.setAttribute('aria-hidden', 'false');
    }
  }

  function closeFilterDropdown(e) {
    if (e) e.preventDefault();
    var dropdown = document.getElementById('filter-dropdown');
    var btn = document.getElementById('em-button-toggle-filter');
    if (dropdown) {
      dropdown.style.display = 'none';
      dropdown.style.visibility = 'hidden';
      dropdown.style.pointerEvents = 'none';
      dropdown.setAttribute('aria-hidden', 'true');
    }
    if (btn) btn.setAttribute('aria-expanded', 'false');
    unlockPageScroll();
  }

  window.openPrototypeFilter = openFilterDropdown;
  window.closePrototypeFilter = closeFilterDropdown;

  function toggleFilterDropdown(e) {
    if (e) e.preventDefault();
    if (isFilterOpen()) closeFilterDropdown();
    else openFilterDropdown(e);
  }

  function initFilterMobile() {
    ensureFilterBackdrop();
    closeFilterDropdown();

    var toggle = document.getElementById('em-button-toggle-filter');
    var dropdown = document.getElementById('filter-dropdown');
    if (!dropdown) return;

    document.querySelectorAll('[data-action="toggle-filter-dropdown"]').forEach(function (btn) {
      btn.addEventListener('click', toggleFilterDropdown);
    });

    document.querySelectorAll('[data-action="close-filter-dropdown"]').forEach(function (btn) {
      btn.addEventListener('click', closeFilterDropdown);
    });

    if (toggle) {
      toggle.addEventListener('click', toggleFilterDropdown);
    }

    var form = document.querySelector('form[data-filter-menu]');
    if (form) {
      form.addEventListener(
        'submit',
        function () {
          closeFilterDropdown();
        },
        true
      );
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeFilterDropdown();
    });
  }

  function simplifySelects() {
    if (!window.PROTOTYPE_MOBILE) return;
    document.querySelectorAll('#filter-dropdown select').forEach(function (sel) {
      sel.classList.remove('em-chosen-select', 'chosen-select');
      sel.removeAttribute('data-placeholder');
      sel.style.display = '';
    });
    document.querySelectorAll('#filter-dropdown .chosen-container').forEach(function (el) {
      el.style.display = 'none';
    });
  }

  function initTabs() {
    document.querySelectorAll('[data-section-tabs="container"]').forEach(function (container) {
      var selector = container.getAttribute('data-section-tabs-selector');
      if (!selector) return;
      var panels = document.querySelectorAll(selector);
      if (!panels.length) return;

      function showPanel(id) {
        panels.forEach(function (panel) {
          var match = panel.id === id;
          panel.style.display = match ? '' : 'none';
          panel.setAttribute('aria-hidden', match ? 'false' : 'true');
        });
      }

      panels.forEach(function (panel, idx) {
        if (idx > 0) panel.style.display = 'none';
      });

      container.querySelectorAll('[role="tab"]').forEach(function (tab) {
        tab.addEventListener('click', function (e) {
          e.preventDefault();
          var target = tab.getAttribute('aria-controls') || (tab.getAttribute('href') || '').replace(/^#/, '');
          if (!target) return;
          container.querySelectorAll('[role="tab"]').forEach(function (t) {
            t.setAttribute('aria-selected', 'false');
            t.classList.remove('selected_tab_colorfive');
          });
          tab.setAttribute('aria-selected', 'true');
          tab.classList.add('selected_tab_colorfive');
          showPanel(target);
        });
      });
    });
  }

  function init() {
    initFilterMobile();
    initTabs();
    scheduleIdle(simplifySelects, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
