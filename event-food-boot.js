(function () {
  function detectBase() {
    if (window.PROTOTYPE_BASE !== undefined) return window.PROTOTYPE_BASE;
    var path = location.pathname || '/';
    var eventIdx = path.indexOf('/event/');
    if (eventIdx !== -1) return path.slice(0, eventIdx);
    return '';
  }

  function protoUrl(file) {
    if (window.prototypeUrl) return window.prototypeUrl(file);
    var base = detectBase();
    return location.protocol + '//' + location.host + base + '/' + String(file).replace(/^\//, '');
  }

  function load(file) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = protoUrl(file);
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  load('prototype-urls.js')
    .catch(function () {})
    .then(function () {
      return load('food-events-data.js');
    })
    .then(function () {
      return load('food-infer.js');
    })
    .then(function () {
      return load('prototype-events.js');
    })
    .then(function () {
      return load('prototype-nav.js');
    })
    .then(function () {
      return load('event-detail-food.js');
    })
    .catch(function (e) {
      console.warn('event-food-boot failed', e);
    });
})();
