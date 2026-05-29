(function () {
  function detectPrototypeBase() {
    var path = location.pathname || '/';
    var files = ['index.html', 'upcoming.html', 'event.html'];
    var i;
    for (i = 0; i < files.length; i++) {
      var marker = '/' + files[i];
      var idx = path.indexOf(marker);
      if (idx !== -1) return path.slice(0, idx);
    }
    var eventIdx = path.indexOf('/event/');
    if (eventIdx !== -1) return path.slice(0, eventIdx);
    if (path.endsWith('/')) return path.slice(0, -1) || '';
    return '';
  }

  window.PROTOTYPE_BASE = detectPrototypeBase();

  window.prototypeUrl = function (relativePath) {
    var rel = String(relativePath || '').replace(/^\//, '');
    return location.origin + window.PROTOTYPE_BASE + '/' + rel;
  };

  window.isPrototypeHost = function () {
    return location.hostname !== 'calendar.ucsd.edu';
  };
})();
