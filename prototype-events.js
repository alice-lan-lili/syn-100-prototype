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
    if (!slug || /^\d+$/.test(slug)) return null;

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
        hasFood: true,
      });
    });
  }

  function jsonLdFromCard(card) {
    var node = card.previousElementSibling;
    while (node) {
      if (node instanceof HTMLScriptElement && node.type === 'application/ld+json') {
        try {
          var parsed = JSON.parse(node.textContent || '');
          var items = Array.isArray(parsed) ? parsed : [parsed];
          for (var i = 0; i < items.length; i++) {
            var ev = normalizeJsonLdEvent(items[i]);
            if (ev) return ev;
          }
        } catch (e) {
          return null;
        }
      }
      if (node.classList && node.classList.contains('em-card')) break;
      node = node.previousElementSibling;
    }
    return null;
  }

  function scanCardsJsonLd() {
    var cards = document.querySelectorAll('.em-card');
    for (var i = 0; i < cards.length; i++) {
      var ev = jsonLdFromCard(cards[i]);
      if (!ev) continue;
      if (!window.PROTOTYPE_EVENTS[ev.slug]) {
        window.PROTOTYPE_EVENTS[ev.slug] = ev;
      }
      if (window.ensureEventHasFood) {
        window.PROTOTYPE_EVENTS[ev.slug] = window.ensureEventHasFood(window.PROTOTYPE_EVENTS[ev.slug]);
      }
    }
  }

  function persistCache() {
    try {
      var json = JSON.stringify(window.PROTOTYPE_EVENTS);
      if (json.length > 1500000) return;
      sessionStorage.setItem('prototype-events', json);
    } catch (e) {
      /* quota */
    }
  }

  window.persistPrototypeEventsCache = persistCache;

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
    var ev = null;
    if (window.PROTOTYPE_EVENTS[slug]) ev = window.PROTOTYPE_EVENTS[slug];
    if (!ev && window.FOOD_EVENTS && window.FOOD_EVENTS[slug]) {
      mergeFoodEvents();
      ev = window.PROTOTYPE_EVENTS[slug];
    }
    if (!ev) {
      loadCache();
      ev = window.PROTOTYPE_EVENTS[slug] || null;
    }
    if (ev && window.ensureEventHasFood) {
      ev = window.ensureEventHasFood(ev);
      window.PROTOTYPE_EVENTS[slug] = ev;
    }
    return ev;
  };

  window.scanPrototypeEventsFromPage = function () {
    loadCache();
    mergeFoodEvents();
    scanCardsJsonLd();
    mergeFoodEvents();
    if (window.enrichPrototypeEventsWithFood) window.enrichPrototypeEventsWithFood();
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
})();
