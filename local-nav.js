/**
 * With <base href="https://calendar.ucsd.edu/">, relative links like upcoming.html
 * resolve to the live site. On localhost, rewrite them to this server.
 */
(function () {
  var isLocal = /^(localhost|127\.0\.0\.1)$/i.test(location.hostname);
  if (!isLocal) return;

  var localPages = {
    'upcoming.html': '/upcoming.html',
    'index.html': '/index.html',
  };

  function toLocalUrl(path) {
    return location.protocol + '//' + location.host + path;
  }

  function fixLinks() {
    Object.keys(localPages).forEach(function (rel) {
      var path = localPages[rel];
      var full = toLocalUrl(path);
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
})();
