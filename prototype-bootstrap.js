/**
 * Local prototype bootstrap: fix navigation and load custom scripts from this
 * server (relative script URLs would resolve to calendar.ucsd.edu via <base>).
 */
(function () {
  var origin = location.protocol + '//' + location.host;
  var isLocal = /^(localhost|127\.0\.0\.1)$/i.test(location.hostname);

  if (isLocal) {
    var localPages = {
      'upcoming.html': '/upcoming.html',
      'index.html': '/index.html',
    };

    function toLocalUrl(path) {
      return origin + path;
    }

    function fixLinks() {
      Object.keys(localPages).forEach(function (rel) {
        var full = toLocalUrl(localPages[rel]);
        document.querySelectorAll('a[href="' + rel + '"], a[href="./' + rel + '"]').forEach(function (a) {
          a.href = full;
        });
      });
    }

    document.addEventListener('DOMContentLoaded', fixLinks);
    if (document.readyState !== 'loading') fixLinks();

    document.addEventListener(
      'click',
      function (e) {
        var a = e.target.closest('a');
        if (!a) return;
        var raw = a.getAttribute('href');
        if (!raw) return;
        var key = raw.replace(/^\.\//, '');
        if (localPages[key]) {
          e.preventDefault();
          location.assign(toLocalUrl(localPages[key]));
        }
      },
      true
    );
  }

  function loadScript(file) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = origin + '/' + file;
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  function loadPrototypeScripts() {
    loadScript('food-filter.js').catch(function () {
      console.warn('food-filter.js failed to load');
    });
    loadScript('calendar-month.js').catch(function () {
      console.warn('calendar-month.js failed to load');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPrototypeScripts);
  } else {
    loadPrototypeScripts();
  }
})();
