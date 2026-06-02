/**
 * Local prototype bootstrap: fix navigation and load custom scripts from this
 * server (relative script URLs would resolve to calendar.ucsd.edu via <base>).
 */
(function () {
  var isPrototype = location.hostname !== 'calendar.ucsd.edu';

  var mirroredEventDirs = {
    'nice-people-and-free-pizza': 'event/nice-people-and-free-pizza/index.html',
    'lets-talk-9958': 'event/lets-talk-9958/index.html',
    recess: 'event/recess/index.html',
    'global-coffee-hour-3887': 'event/global-coffee-hour-3887/index.html',
  };

  function shouldRouteEventHref(href) {
    if (window.isPrototypeEventHref) return window.isPrototypeEventHref(href);
    if (!href || href.indexOf('/event/') === -1) return false;
    if (/\/event\/[^/]+\/(confirm|export)/.test(href)) return false;
    if (/\.ics(\?|$)/.test(href)) return false;
    return true;
  }

  function toLocalUrl(pathOrUrl) {
    if (!pathOrUrl) return pathOrUrl;
    if (/^https?:\/\//i.test(pathOrUrl)) {
      if (!isPrototype) return pathOrUrl;
      var slug = eventSlugFromHref(pathOrUrl);
      if (slug && shouldRouteEventHref(pathOrUrl)) {
        return localPathForSlug(slug);
      }
      return pathOrUrl;
    }
    if (window.prototypeUrl) return window.prototypeUrl(pathOrUrl.replace(/^\//, ''));
    return location.protocol + '//' + location.host + pathOrUrl;
  }

  function localPathForSlug(slug) {
    if (window.localEventPageForSlug) return window.localEventPageForSlug(slug);
    if (mirroredEventDirs[slug] && window.prototypeUrl) {
      return window.prototypeUrl(mirroredEventDirs[slug]);
    }
    if (mirroredEventDirs[slug]) return '/' + mirroredEventDirs[slug];
    if (window.prototypeUrl) return window.prototypeUrl('event.html?e=' + encodeURIComponent(slug));
    return '/event.html?e=' + encodeURIComponent(slug);
  }

  function remoteEventUrl(slug) {
    return 'https://calendar.ucsd.edu/event/' + slug;
  }

  function eventSlugFromHref(href) {
    if (!href) return null;
    var m = href.match(/\/event\/([^/?#]+)/);
    if (m) return m[1];
    try {
      var u = new URL(href, location.href);
      if (/event\.html$/i.test(u.pathname) || /\/event\.html$/i.test(u.pathname)) {
        return u.searchParams.get('e');
      }
    } catch (e) {
      /* ignore */
    }
    m = href.match(/[?&]e=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function rewriteCardLinks() {
    document.querySelectorAll('.em-card').forEach(function (card) {
      var titleLink = card.querySelector('.em-card_title a');
      if (!titleLink) return;
      var href = titleLink.getAttribute('href') || '';
      if (!shouldRouteEventHref(href)) return;
      var slug =
        card.getAttribute('data-event-slug') || eventSlugFromHref(href);
      if (!slug) return;
      var local = localPathForSlug(slug);
      card.querySelectorAll('.em-card_title a, .em-card_image a').forEach(function (a) {
        var linkHref = a.getAttribute('href') || '';
        if (shouldRouteEventHref(linkHref)) a.setAttribute('href', local);
      });
      card.querySelectorAll('.em-card_event-text a').forEach(function (a) {
        var linkHref = a.getAttribute('href') || '';
        if (shouldRouteEventHref(linkHref)) a.setAttribute('href', local);
      });
      card.setAttribute('data-event-slug', slug);
    });
  }

  function rewriteAllEventLinks() {
    if (window.PROTOTYPE_MOBILE) return;
    document.querySelectorAll('a[href*="calendar.ucsd.edu/event/"]').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (!shouldRouteEventHref(href)) return;
      if (a.closest('.em-card_share')) return;
      var slug = eventSlugFromHref(href);
      if (slug) a.setAttribute('href', localPathForSlug(slug));
    });
  }

  var localPages = {
    'upcoming.html': 'upcoming.html',
    'index.html': 'index.html',
  };

  function runFixLinks() {
    rewriteCardLinks();
    rewriteAllEventLinks();
    if (typeof window.scanPrototypeEventsFromPage === 'function') {
      window.scanPrototypeEventsFromPage();
    }
    Object.keys(localPages).forEach(function (rel) {
      var full = toLocalUrl(localPages[rel]);
      document.querySelectorAll('a[href="' + rel + '"], a[href="./' + rel + '"]').forEach(function (a) {
        a.href = full;
      });
    });
  }

  function scheduleFixLinks() {
    var run = function () {
      runFixLinks();
      document.dispatchEvent(new CustomEvent('em-prototype-links-updated'));
    };
    if (window.schedulePrototypeWork) {
      window.schedulePrototypeWork(run, 1500);
    } else {
      setTimeout(run, 50);
    }
  }

  var fixLinks = null;

  if (isPrototype) {
    fixLinks = runFixLinks;

    document.addEventListener(
      'click',
      function (e) {
        var a = e.target.closest('a');
        if (!a) return;
        var raw = a.getAttribute('href') || a.href || '';
        var key = raw.replace(/^\.\//, '');

        if (isPrototype && localPages[key]) {
          e.preventDefault();
          location.assign(toLocalUrl(localPages[key]));
          return;
        }

        var slug = eventSlugFromHref(raw);
        if (slug && shouldRouteEventHref(raw)) {
          e.preventDefault();
          location.assign(localPathForSlug(slug));
        }
      },
      true
    );
  }

  function loadScript(file) {
    var src = window.prototypeUrl ? window.prototypeUrl(file) : location.protocol + '//' + location.host + '/' + file;
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  function loadPrototypeScripts() {
    var chain = window.prototypeUrl
      ? Promise.resolve()
      : loadScript('prototype-urls.js').catch(function () {});
    chain = chain
      .then(function () {
        return loadScript('prototype-mobile.js');
      })
      .then(function () {
        return loadScript('food-events-data.js');
      })
      .then(function () {
        return loadScript('food-infer.js');
      })
      .then(function () {
        return loadScript('prototype-events.js');
      })
      .then(function () {
        if (typeof window.rememberPrototypeHome === 'function') window.rememberPrototypeHome();
      })
      .then(function () {
        return loadScript('food-seed.js');
      })
      .then(function () {
        return loadScript('food-filter.js');
      })
      .then(function () {
        return loadScript('calendar-month.js');
      });

    if (/\/event\//.test(location.pathname)) {
      chain = chain
        .then(function () {
          return loadScript('prototype-nav.js');
        })
        .then(function () {
          return loadScript('event-detail-food.js');
        });
    }

    chain
      .then(function () {
        if (typeof window.runFoodSeed === 'function') window.runFoodSeed();
        if (typeof window.enrichPrototypeEventsWithFood === 'function') {
          window.enrichPrototypeEventsWithFood();
        }
        if (isPrototype) {
          rewriteCardLinks();
          scheduleFixLinks();
        }
      })
      .catch(function (err) {
        console.warn('Prototype script load failed', err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPrototypeScripts);
  } else {
    loadPrototypeScripts();
  }
})();
