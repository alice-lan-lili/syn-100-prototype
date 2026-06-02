(function () {
  function getSlug() {
    var m = location.pathname.match(/\/event\/([^/]+)\//);
    if (m) return m[1];
    var params = new URLSearchParams(location.search);
    return params.get('e') || params.get('slug');
  }

  function injectFoodSection() {
    var slug = getSlug();
    if (!slug) return;

    var ev = window.getPrototypeEvent ? window.getPrototypeEvent(slug) : null;
    if (!ev && window.FOOD_EVENTS && window.FOOD_EVENTS[slug]) {
      ev = window.FOOD_EVENTS[slug];
      if (window.ensureEventHasFood) ev = window.ensureEventHasFood(ev);
    }
    if (!ev || (!ev.hasFood && !ev.food)) return;

    document.querySelectorAll('.em-food-info, .em-food-provided-banner').forEach(function (el) {
      el.remove();
    });

    var html = window.renderFoodDetailSection
      ? window.renderFoodDetailSection(ev)
      : '';
    if (!html) return;

    var main = document.querySelector('main');
    if (!main) return;

    var anchor =
      document.querySelector('.em-event-meta-data-component') ||
      document.querySelector('.em-content_about') ||
      main.querySelector('.content-wrapper');

    var wrap = document.createElement('div');
    wrap.innerHTML = html;

    if (anchor && anchor.parentNode) {
      while (wrap.firstChild) {
        anchor.parentNode.insertBefore(wrap.firstChild, anchor.nextSibling);
      }
    } else {
      while (wrap.firstChild) {
        main.appendChild(wrap.firstChild);
      }
    }
  }

  function run() {
    injectFoodSection();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
