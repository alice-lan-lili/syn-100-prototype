(function () {
  if (!window.FOOD_EVENTS) return;

  var SEED_SLUGS = [
    'taco-tuesday-student-life',
    'asian-night-market-bites',
    'italian-pasta-social',
    'mediterranean-meze-hour',
    'american-bbq-bash',
    'halal-lunch-mubarak',
    'kosher-shabbat-dinner',
  ];

  function slugFromCard(card) {
    var a = card.querySelector('.em-card_title a');
    if (!a) return null;
    var href = a.getAttribute('href') || '';
    var m = href.match(/\/event\/([^/?#]+)/);
    return m ? m[1] : null;
  }

  function enhanceExistingCards() {
    document.querySelectorAll('.em-card').forEach(function (card) {
      var slug = slugFromCard(card);
      if (!slug || !window.FOOD_EVENTS[slug]) return;
      var ev = window.FOOD_EVENTS[slug];
      card.setAttribute('data-food-provided', '1');
      card.setAttribute('data-food-tags', ev.tags.join(' '));
      card.setAttribute('data-event-slug', slug);
      if (window.localEventPageForSlug) {
        var local = window.localEventPageForSlug(slug);
        card.querySelectorAll('.em-card_title a, .em-card_image a').forEach(function (a) {
          a.setAttribute('href', local);
        });
      }
    });
  }

  function buildJsonLd(ev, slug) {
    return JSON.stringify([
      {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: ev.title,
        description: ev.description,
        startDate: ev.start,
        endDate: ev.end || ev.start,
        eventStatus: 'EventScheduled',
        location: ev.virtual
          ? { '@type': 'VirtualLocation', url: window.eventUrlForSlug(slug) }
          : { '@type': 'Place', name: ev.location },
        url: window.eventUrlForSlug(slug),
        image: ev.image,
      },
    ]);
  }

  function buildCardHtml(ev, slug, ids) {
    var eventId = ids.eventId;
    var instanceId = ids.instanceId;
    var url = window.eventUrlForSlug(slug);
    var localUrl = window.localEventPageForSlug(slug);
    var timeAttrs = 'format="compact" start="' + ev.start + '"';
    if (ev.end) timeAttrs += ' end="' + ev.end + '" has-time="true"';
    var locHtml = ev.virtual
      ? '<p class="em-card_event-text"><i class="fas fa-tv"></i> Virtual Event</p>'
      : '<p class="em-card_event-text"><a href="' +
        (ev.locationUrl || '#') +
        '"><i class="fas fa-map-marker-alt"></i> ' +
        ev.location +
        '</a></p>';

    return (
      '<script type="application/ld+json">' +
      buildJsonLd(ev, slug) +
      '</script>' +
      '<div class="em-card em-event-' +
      eventId +
      ' em-event-instance-' +
      instanceId +
      '" data-event-slug="' +
      slug +
      '" data-food-provided="1" data-food-tags="' +
      ev.tags.join(' ') +
      '">' +
      '<div class="em-card_image" aria-hidden="true">' +
      '<a href="' +
      localUrl +
      '" tabindex="-1">' +
      '<img class="img_card" alt="" src="' +
      ev.image +
      '" height="310" width="478">' +
      '<div class="em-card_overlay"></div></a></div>' +
      '<div class="em-card_text">' +
      '<h3 class="em-card_title"><a href="' +
      localUrl +
      '">' +
      ev.title +
      '</a></h3>' +
      '<p class="em-card_event-text"><em-local-time ' +
      timeAttrs +
      '></em-local-time></p>' +
      locHtml +
      '<div class="em-card_share"></div></div></div>'
    );
  }

  var idCounter = 90000000000000;

  function seedCards() {
    var groups = document.querySelectorAll('.em-card-group');
    if (!groups.length) return;
    var group = groups[0];
    var html = '';
    SEED_SLUGS.forEach(function (slug) {
      if (group.querySelector('[data-event-slug="' + slug + '"]')) return;
      var ev = window.FOOD_EVENTS[slug];
      if (!ev) return;
      idCounter += 1;
      html += buildCardHtml(ev, slug, {
        eventId: idCounter,
        instanceId: idCounter + 1,
      });
    });
    if (html) group.insertAdjacentHTML('beforeend', html);
  }

  function rewriteSeededLinks() {
    if (!window.prototypeUrl || !window.FOOD_EVENTS) return;
    SEED_SLUGS.forEach(function (slug) {
      var local = window.localEventPageForSlug(slug);
      document.querySelectorAll('[data-event-slug="' + slug + '"] a').forEach(function (a) {
        a.setAttribute('href', local);
      });
    });
  }

  function run() {
    enhanceExistingCards();
    seedCards();
    rewriteSeededLinks();
  }

  window.runFoodSeed = run;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
