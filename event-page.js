(function () {
  function getSlug() {
    return new URLSearchParams(location.search).get('e');
  }

  function homeUrl() {
    return window.getPrototypeHomeUrl
      ? window.getPrototypeHomeUrl()
      : window.prototypeUrl
        ? window.prototypeUrl('index.html')
        : '/index.html';
  }

  function formatWhen(ev) {
    if (!ev.start) return '';
    var d = new Date(ev.start);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  function humanizeSlug(slug) {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, function (c) {
      return c.toUpperCase();
    });
  }

  function foodSectionHtml(ev) {
    if (window.renderFoodDetailSection) return window.renderFoodDetailSection(ev);
    if (!ev || !ev.food) return '';
    var f = ev.food;
    return (
      '<div class="em-food-provided-banner" role="status">' +
      '<i class="fas fa-utensils" aria-hidden="true"></i> Food provided</div>' +
      '<section class="em-food-info" aria-labelledby="food-info-heading">' +
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

  function render() {
    var slug = getSlug();
    var root = document.getElementById('event-page-root');
    if (!root) return;

    var ev = window.getPrototypeEvent ? window.getPrototypeEvent(slug) : null;

    if (!slug) {
      root.innerHTML =
        '<p>No event selected. <a href="' + homeUrl() + '">Return to events</a>.</p>';
      document.title = 'Event - UC San Diego Events Calendar';
      return;
    }

    if (!ev) {
      document.title = humanizeSlug(slug) + ' - UC San Diego Events Calendar';
      root.innerHTML =
        '<h1 class="em-content_label">' +
        humanizeSlug(slug) +
        '</h1>' +
        '<p>This event is part of the Student Life prototype. Full details are not cached yet.</p>' +
        '<p><a href="' +
        homeUrl() +
        '">&larr; Back to Student Life events</a></p>';
      return;
    }

    document.title = ev.title + ' - UC San Diego Events Calendar';

    var imageHtml = ev.image
      ? '<div><img src="' + ev.image + '" alt=""></div>'
      : '<div class="em-proto-event-hero__placeholder" aria-hidden="true"></div>';

    var loc = ev.virtual
      ? '<p class="em-card_event-text"><i class="fas fa-tv"></i> Virtual Event</p>'
      : ev.location
        ? '<p class="em-card_event-text"><i class="fas fa-map-marker-alt"></i> ' + ev.location + '</p>'
        : '';

    var when = formatWhen(ev);
    var timeHtml = ev.start
      ? '<p><em-local-time format="compact" start="' +
        ev.start +
        '">' +
        when +
        '</em-local-time></p>'
      : '';

    var desc = ev.description
      ? '<div class="em-about_description"><p>' + ev.description.replace(/\n/g, '<br>') + '</p></div>'
      : '';

    var foodHtml = ev.hasFood || ev.food ? foodSectionHtml(ev) : '';

    root.innerHTML =
      '<div class="em-proto-event-hero">' +
      imageHtml +
      '<div>' +
      '<h1 class="em-content_label">' +
      ev.title +
      '</h1>' +
      timeHtml +
      loc +
      desc +
      '</div></div>' +
      foodHtml;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
