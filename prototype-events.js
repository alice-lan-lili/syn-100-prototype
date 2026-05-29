(function () {
  window.PROTOTYPE_EVENTS = window.PROTOTYPE_EVENTS || {};

  function slugFromUrl(url) {
    if (!url) return null;
    var m = String(url).match(/\/event\/([^/?#]+)/);
    return m ? m[1] : null;
  }

  function normalizeJsonLdEvent(item) {
    if (!item || item['@type'] !== 'Event') return null;
    var slug = slugFromUrl(item.url);
    if (!slug) return null;

    var loc = item.location;
    var locationName = '';
    var virtual = false;
    if (loc) {
      if (loc['@type'] === 'VirtualLocation') {
        virtual = true;
        locationName = 'Virtual Event';
      } else if (loc.name) {
        locationName = loc.name;
        if (loc.address && typeof loc.address === 'string') {
          locationName += ', ' + loc.address;
        }
      }
    }

    return {
      slug: slug,
      title: item.name || slug,
      description: item.description || '',
      start: item.startDate || '',
      end: item.endDate || '',
      image: item.image || '',
      location: locationName,
      virtual: virtual,
    };
  }

  function mergeFoodEvents() {
    if (!window.FOOD_EVENTS) return;
    Object.keys(window.FOOD_EVENTS).forEach(function (slug) {
      var f = window.FOOD_EVENTS[slug];
      window.PROTOTYPE_EVENTS[slug] = Object.assign({}, window.PROTOTYPE_EVENTS[slug] || {}, {
        slug: slug,
        title: f.title,
        description: f.description,
        start: f.start,
        end: f.end,
        image: f.image,
        location: f.location,
        virtual: !!f.virtual,
        food: f.food,
        tags: f.tags,
      });
    });
  }

  function scanPageJsonLd() {
    document.querySelectorAll('script[type="application/ld+json"]').forEach(function (script) {
      var parsed;
      try {
        parsed = JSON.parse(script.textContent || '');
      } catch (e) {
        return;
      }
      var items = Array.isArray(parsed) ? parsed : [parsed];
      items.forEach(function (item) {
        var ev = normalizeJsonLdEvent(item);
        if (!ev) return;
        if (!window.PROTOTYPE_EVENTS[ev.slug]) {
          window.PROTOTYPE_EVENTS[ev.slug] = ev;
        }
      });
    });
  }

  function persistCache() {
    try {
      sessionStorage.setItem('prototype-events', JSON.stringify(window.PROTOTYPE_EVENTS));
    } catch (e) {
      /* quota */
    }
  }

  function loadCache() {
    try {
      var raw = sessionStorage.getItem('prototype-events');
      if (!raw) return;
      var cached = JSON.parse(raw);
      Object.keys(cached).forEach(function (slug) {
        if (!window.PROTOTYPE_EVENTS[slug]) {
          window.PROTOTYPE_EVENTS[slug] = cached[slug];
        }
      });
    } catch (e) {
      /* ignore */
    }
  }

  window.rememberPrototypeHome = function () {
    var path = location.pathname || '';
    var home = 'index.html';
    if (path.indexOf('upcoming.html') !== -1) home = 'upcoming.html';
    try {
      sessionStorage.setItem('prototype-home', home);
    } catch (e) {
      /* ignore */
    }
  };

  window.getPrototypeHomeUrl = function () {
    var home = 'index.html';
    try {
      home = sessionStorage.getItem('prototype-home') || home;
    } catch (e) {
      /* ignore */
    }
    return window.prototypeUrl ? window.prototypeUrl(home) : '/' + home;
  };

  window.getPrototypeEvent = function (slug) {
    if (!slug) return null;
    if (window.PROTOTYPE_EVENTS[slug]) return window.PROTOTYPE_EVENTS[slug];
    if (window.FOOD_EVENTS && window.FOOD_EVENTS[slug]) {
      mergeFoodEvents();
      return window.PROTOTYPE_EVENTS[slug];
    }
    loadCache();
    return window.PROTOTYPE_EVENTS[slug] || null;
  };

  window.scanPrototypeEventsFromPage = function () {
    loadCache();
    scanPageJsonLd();
    mergeFoodEvents();
    persistCache();
    return window.PROTOTYPE_EVENTS;
  };

  window.isPrototypeEventHref = function (href) {
    if (!href) return false;
    if (/event\.html\?/i.test(href)) return false;
    if (href.indexOf('calendar.ucsd.edu/event/') === -1) return false;
    if (/\/event\/[^/]+\/(confirm|export)/.test(href)) return false;
    if (/\.ics(\?|$)/.test(href)) return false;
    var slug = slugFromUrl(href);
    return !!slug && !/^\d+$/.test(slug);
  };

  loadCache();
  mergeFoodEvents();

  if (document.querySelector('.em-card, script[type="application/ld+json"]')) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        window.rememberPrototypeHome();
        window.scanPrototypeEventsFromPage();
      });
    } else {
      window.rememberPrototypeHome();
      window.scanPrototypeEventsFromPage();
    }
  }
})();
