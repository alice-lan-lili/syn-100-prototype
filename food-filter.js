(function () {
  const FOOD_RE = /\b(food\s*provided|free\s*food|free\s+pizza|pizza|lunch|dinner|breakfast|brunch|snack(?:s)?|refreshments?|catering|bagels?|donuts?|tacos?|burritos?|cookies?|coffee|tea|pastry|pastries|ice\s*cream|dessert|treats)\b/i;
  const FOOD_TAGS = [
    ['pizza', /\bpizza\b/i],
    ['snacks', /\b(snack(?:s)?|refreshments?|light\s*bites|hors\s*d'oeuvres|pastry|pastries)\b/i],
    ['coffee_tea', /\b(coffee|tea|boba|matcha)\b/i],
    ['lunch_dinner', /\b(lunch|dinner|breakfast|brunch)\b/i],
    ['dessert', /\b(dessert|cookies?|brownies?|cake|ice\s*cream|donuts?)\b/i],
    ['mexican', /\b(tacos?|burritos?|quesadilla|nachos?|mexican)\b/i],
    ['asian', /\b(asian|ramen|sushi|dumplings?|pho|thai|korean|boba)\b/i],
    ['italian', /\b(italian|pasta|lasagna|risotto)\b/i],
    ['mediterranean', /\b(mediterranean|gyro|hummus|falafel|shawarma)\b/i],
    ['american', /\b(american|bbq|burger|hot\s*dog)\b/i],
    ['vegetarian', /\b(vegetarian|meatless)\b/i],
    ['vegan', /\bvegan\b/i],
    ['gluten_free', /\b(gluten[-\s]*free|gf\b)\b/i],
    ['dairy_free', /\b(dairy[-\s]*free|lactose[-\s]*free)\b/i],
    ['nut_free', /\b(nut[-\s]*free|peanut[-\s]*free|tree\s*nuts?)\b/i],
    ['halal', /\bhalal\b/i],
    ['kosher', /\bkosher\b/i],
  ];

  function coerceJsonLd(scriptText) {
    try {
      const parsed = JSON.parse(scriptText);
      return Array.isArray(parsed) ? parsed[0] : parsed;
    } catch {
      return null;
    }
  }

  function slugFromCard(card) {
    const slugAttr = card.getAttribute('data-event-slug');
    if (slugAttr) return slugAttr;
    const a = card.querySelector('.em-card_title a');
    if (!a) return null;
    const href = a.getAttribute('href') || '';
    const m = href.match(/\/event\/([^/?#]+)/);
    return m ? m[1] : null;
  }

  function getEventForCard(card) {
    let node = card.previousElementSibling;
    while (node) {
      if (node instanceof HTMLScriptElement && node.type === 'application/ld+json') {
        return coerceJsonLd(node.textContent || '');
      }
      if (node instanceof HTMLElement && node.classList.contains('em-card')) break;
      node = node.previousElementSibling;
    }
    return null;
  }

  function cardHaystack(event, card) {
    const titleEl = card.querySelector('.em-card_title');
    const title = titleEl ? titleEl.textContent.trim() : '';
    return [event && event.name, event && event.description, title].filter(Boolean).join(' ');
  }

  function insertFoodLine(card) {
    const text = card.querySelector('.em-card_text');
    if (!text) return;

    let line = text.querySelector('.em-food-provided-line');
    if (!line) {
      line = document.createElement('p');
      line.className = 'em-card_event-text em-food-provided-line';
      line.innerHTML = '<i class="fas fa-utensils" aria-hidden="true"></i>Food provided';

      const price = text.querySelector('.em-price-tag');
      const share = text.querySelector('.em-card_share');
      if (price) price.insertAdjacentElement('afterend', line);
      else if (share) share.insertAdjacentElement('beforebegin', line);
      else {
        const eventTexts = text.querySelectorAll('.em-card_event-text:not(.em-food-provided-line)');
        const anchor = eventTexts.length ? eventTexts[eventTexts.length - 1] : text;
        anchor.insertAdjacentElement('afterend', line);
      }
    }
    line.style.display = 'block';
  }

  function ensureFavoriteButtons() {
    const template = document.querySelector('a.em-interested-tag');
    if (!template) return;

    document.querySelectorAll('.em-card').forEach(function (card) {
      if (!(card instanceof HTMLElement)) return;
      if (card.querySelector('.em-interested-tag')) return;

      const share = card.querySelector('.em-card_share');
      if (!share) return;

      const titleLink = card.querySelector('.em-card_title a');
      const eventName = titleLink ? titleLink.textContent.trim() : 'this event';
      const instanceMatch = card.className.match(/em-event-instance-(\d+)/);
      const eventMatch = card.className.match(/em-event-(\d+)/);
      if (!instanceMatch || !eventMatch) return;

      const eventId = eventMatch[1];
      const instanceId = instanceMatch[1];
      const returnUrl = encodeURIComponent(location.href);

      const heart = template.cloneNode(true);
      heart.href =
        'https://calendar.ucsd.edu/event/' +
        eventId +
        '/confirm?instance_id=' +
        instanceId +
        '&return=' +
        returnUrl;
      heart.setAttribute('aria-label', "I'm Interested in " + eventName);
      heart.setAttribute('data-event-name', eventName);
      heart.setAttribute('data-event-id', eventId);
      heart.setAttribute('data-event-instance-id', instanceId);
      heart.setAttribute('data-ga-label', eventName);

      const label = heart.querySelector('.em-interested-text');
      if (label) label.textContent = "I'm Interested";

      const dropdown = share.querySelector('.em-share_dropdown');
      if (dropdown) share.insertBefore(heart, dropdown);
      else share.insertBefore(heart, share.firstChild);
    });
  }

  function markOneFoodCard(card) {
    if (!(card instanceof HTMLElement)) return;

    const slug = slugFromCard(card);
    const registry = slug && window.FOOD_EVENTS ? window.FOOD_EVENTS[slug] : null;

    let hasFood = false;
    let matched = [];

    if (registry) {
      hasFood = true;
      matched = registry.tags.slice();
      card.setAttribute('data-event-slug', slug);
    } else {
      const event = getEventForCard(card);
      const hay = cardHaystack(event, card);
      for (let i = 0; i < FOOD_TAGS.length; i++) {
        if (FOOD_TAGS[i][1].test(hay)) matched.push(FOOD_TAGS[i][0]);
      }
      hasFood = FOOD_RE.test(hay) || matched.length > 0;
    }

    if (hasFood) {
      card.setAttribute('data-food-provided', '1');
      insertFoodLine(card);
      if (slug) card.setAttribute('data-event-slug', slug);
      if (matched.length) card.setAttribute('data-food-tags', matched.join(' '));
      else card.removeAttribute('data-food-tags');

      if (slug && typeof window.registerFoodEventForCard === 'function') {
        const jsonEvent = getEventForCard(card);
        const hay = cardHaystack(jsonEvent, card);
        window.registerFoodEventForCard(slug, {
          registry: registry,
          jsonEvent: jsonEvent,
          haystack: hay,
          tags: matched,
          title: jsonEvent && jsonEvent.name,
        });
      }
    } else {
      card.removeAttribute('data-food-provided');
      card.removeAttribute('data-food-tags');
      const line = card.querySelector('.em-food-provided-line');
      if (line) line.remove();
    }
  }

  function markFoodCards(done) {
    const cards = Array.from(document.querySelectorAll('.em-card'));
    const batchSize = window.PROTOTYPE_MOBILE ? 15 : cards.length;
    let index = 0;

    function processBatch() {
      const end = Math.min(index + batchSize, cards.length);
      for (; index < end; index++) markOneFoodCard(cards[index]);
      if (index < cards.length) {
        if (window.schedulePrototypeWork) window.schedulePrototypeWork(processBatch, 800);
        else requestAnimationFrame(processBatch);
      } else {
        if (window.persistPrototypeEventsCache) window.persistPrototypeEventsCache();
        if (typeof done === 'function') done();
      }
    }

    if (!cards.length) {
      if (window.persistPrototypeEventsCache) window.persistPrototypeEventsCache();
      if (typeof done === 'function') done();
    } else {
      processBatch();
    }
  }

  function emptyMessageEl() {
    const el = document.createElement('p');
    el.className = 'em-calendar-empty em-filter-empty-msg';
    el.style.margin = '1rem 0';
    el.textContent =
      'No events match this food filter. Try “Food provided (any)” or a different option.';
    return el;
  }

  function updatePanelEmptyStates(filterValue, visibleCount) {
    const panels = document.querySelectorAll('.tabs-component-panel');
    if (panels.length) {
      panels.forEach(function (panel) {
        const group = panel.querySelector('.event_group');
        if (!group) return;

        let panelVisible = 0;
        group.querySelectorAll('.em-card').forEach(function (card) {
          if (card.style.display !== 'none') panelVisible += 1;
        });

        let msg = group.querySelector('.em-filter-empty-msg');
        if (!filterValue || panelVisible > 0) {
          if (msg) msg.remove();
          group.style.minHeight = '';
          return;
        }

        if (!msg) {
          msg = emptyMessageEl();
          group.insertBefore(msg, group.firstChild);
        }
        group.style.minHeight = '4rem';
      });
      return;
    }

    const root =
      document.getElementById('event_results') ||
      document.querySelector('.event_group.event_list_component');
    if (!root) return;

    let el = document.getElementById('em-filter-empty');
    if (!filterValue || visibleCount > 0) {
      if (el) el.remove();
      return;
    }
    if (!el) {
      el = emptyMessageEl();
      el.id = 'em-filter-empty';
      root.insertBefore(el, root.firstChild);
    }
  }

  function updateDateHeadings() {
    document.querySelectorAll('#event_results h2.em-content_label').forEach(function (h2) {
      let el = h2.nextElementSibling;
      let anyVisible = false;
      while (el && !(el.matches && el.matches('h2.em-content_label'))) {
        if (el.querySelectorAll) {
          el.querySelectorAll('.em-card').forEach(function (card) {
            if (card.style.display !== 'none') anyVisible = true;
          });
        }
        el = el.nextElementSibling;
      }
      h2.style.display = anyVisible ? '' : 'none';
    });
  }

  function filterOneCard(card, value) {
    const hasAnyFood = card.getAttribute('data-food-provided') === '1';
    const tags = (card.getAttribute('data-food-tags') || '').split(/\s+/).filter(Boolean);
    let visible = true;
    if (value === '') {
      visible = true;
    } else if (value === 'any_food') {
      visible = hasAnyFood;
    } else {
      visible = hasAnyFood && tags.includes(value);
    }
    card.style.display = visible ? '' : 'none';
    return visible ? 1 : 0;
  }

  function applyFoodFilterUI(done) {
    const sel = document.getElementById('food_provided');
    if (!sel) {
      if (done) done();
      return;
    }
    const value = String(sel.value || '');
    const cards = Array.from(document.querySelectorAll('.em-card'));
    let visibleCount = 0;
    let index = 0;
    const batchSize = window.PROTOTYPE_MOBILE ? 25 : cards.length;

    function finish() {
      updateDateHeadings();
      updatePanelEmptyStates(value, visibleCount);
      document.dispatchEvent(
        new CustomEvent('em-food-filter-applied', { detail: { filter: value, visibleCount: visibleCount } })
      );
      if (done) done();
    }

    function processBatch() {
      const end = Math.min(index + batchSize, cards.length);
      for (; index < end; index++) {
        if (cards[index] instanceof HTMLElement) {
          visibleCount += filterOneCard(cards[index], value);
        }
      }
      if (index < cards.length) {
        requestAnimationFrame(processBatch);
      } else {
        finish();
      }
    }

    if (!cards.length) {
      finish();
    } else {
      processBatch();
    }
  }

  function closeFilterDropdown() {
    if (typeof window.closePrototypeFilter === 'function') {
      window.closePrototypeFilter();
      return;
    }
    const dropdown = document.getElementById('filter-dropdown');
    const btn = document.getElementById('em-button-toggle-filter');
    if (!dropdown || !btn) return;
    dropdown.style.display = 'none';
    dropdown.style.pointerEvents = 'none';
    dropdown.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('proto-filter-open');
    document.documentElement.classList.remove('proto-filter-open');
  }

  function init() {
    if (typeof window.runFoodSeed === 'function') window.runFoodSeed();

    ensureFavoriteButtons();
    markFoodCards();

    const form = document.querySelector('form[data-filter-menu]');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        closeFilterDropdown();

        const runFilter = function () {
          const needsMarking = !document.querySelector('.em-card[data-food-provided]');
          if (needsMarking) {
            markFoodCards(function () {
              applyFoodFilterUI();
            });
          } else {
            applyFoodFilterUI();
          }
        };

        if (window.PROTOTYPE_MOBILE) {
          requestAnimationFrame(function () {
            setTimeout(runFilter, 0);
          });
        } else {
          ensureFavoriteButtons();
          if (typeof window.runFoodSeed === 'function') window.runFoodSeed();
          markFoodCards();
          applyFoodFilterUI();
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
