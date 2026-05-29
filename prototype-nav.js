(function () {
  if (typeof window.isPrototypeHost === 'function' && !window.isPrototypeHost()) return;
  if (location.hostname === 'calendar.ucsd.edu') return;

  if (!document.getElementById('proto-back-nav-styles')) {
    var style = document.createElement('style');
    style.id = 'proto-back-nav-styles';
    style.textContent =
      '.proto-back-nav{max-width:960px;margin:0 auto;padding:1rem 1.5rem 0;position:relative;z-index:5;}' +
      '.proto-back-nav__link{display:inline-block;font-weight:600;}';
    document.head.appendChild(style);
  }

  function homeUrl() {
    return window.getPrototypeHomeUrl
      ? window.getPrototypeHomeUrl()
      : window.prototypeUrl
        ? window.prototypeUrl('index.html')
        : '/index.html';
  }

  function ensureBackNav() {
    if (document.getElementById('proto-back-nav')) return;

    var bar = document.createElement('div');
    bar.id = 'proto-back-nav';
    bar.className = 'proto-back-nav';
    bar.innerHTML =
      '<a class="em-link proto-back-nav__link" href="' +
      homeUrl() +
      '">&larr; Back to Student Life events</a>';

    var main = document.querySelector('main') || document.body;
    main.insertBefore(bar, main.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureBackNav);
  } else {
    ensureBackNav();
  }
})();
