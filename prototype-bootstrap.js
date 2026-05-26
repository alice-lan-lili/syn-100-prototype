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

    // Local copies of selected event detail pages with food.
    var localEventPages = {
      'https://calendar.ucsd.edu/event/nice-people-and-free-pizza': '/event/nice-people-and-free-pizza/index.html',
      'https://calendar.ucsd.edu/event/lets-talk-9958': '/event/lets-talk-9958/index.html',
      'https://calendar.ucsd.edu/event/recess': '/event/recess/index.html',
      'https://calendar.ucsd.edu/event/global-coffee-hour-3887': '/event/global-coffee-hour-3887/index.html',
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

      // Point card image/title links for selected events to local detail copies.
      Object.keys(localEventPages).forEach(function (remote) {
        var localPath = localEventPages[remote];
        document.querySelectorAll('a[href="' + remote + '"]').forEach(function (a) {
          a.href = toLocalUrl(localPath);
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
        var raw = a.getAttribute('href') || '';
        var key = raw.replace(/^\.\//, '');

        if (localPages[key]) {
          e.preventDefault();
          location.assign(toLocalUrl(localPages[key]));
          return;
        }

        // Intercept clicks on selected event links and route to local copies.
        if (localEventPages[raw]) {
          e.preventDefault();
          location.assign(toLocalUrl(localEventPages[raw]));
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
