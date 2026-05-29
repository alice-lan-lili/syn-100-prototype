(function () {
  if (!window.FOOD_EVENTS) return;

  function getSlug() {
    var m = location.pathname.match(/\/event\/([^/]+)\//);
    if (m) return m[1];
    var params = new URLSearchParams(location.search);
    return params.get('e') || params.get('slug');
  }

  function foodSectionHtml(ev) {
    var f = ev.food;
    if (!f) return '';
    return (
      '<section class="em-food-info content-wrapper" aria-labelledby="food-info-heading">' +
      '<h2 id="food-info-heading" class="em-content_label">Food &amp; Allergen Information</h2>' +
      '<p><strong>What&rsquo;s served:</strong> ' +
      f.menu +
      '</p>' +
      '<p><strong>Quantity:</strong> ' +
      f.quantity +
      '</p>' +
      '<p><strong>Allergen info:</strong> ' +
      f.allergens +
      '</p>' +
      '</section>'
    );
  }

  function injectFoodSection() {
    var slug = getSlug();
    if (!slug || !window.FOOD_EVENTS[slug]) return;
    var ev = window.FOOD_EVENTS[slug];

    var existing = document.querySelector('.em-food-info');
    if (existing) existing.remove();

    var html = foodSectionHtml(ev);
    if (!html) return;

    var main = document.querySelector('main');
    if (!main) return;

    var anchor =
      document.querySelector('.em-event-meta-data-component') ||
      document.querySelector('.em-content_about') ||
      main.querySelector('.content-wrapper');

    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    var section = wrap.firstElementChild;

    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(section, anchor.nextSibling);
    } else {
      main.appendChild(section);
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
