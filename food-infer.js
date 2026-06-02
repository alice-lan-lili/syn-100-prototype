(function () {
  var FOOD_RE =
    /\b(food\s*provided|free\s*food|free\s+pizza|pizza|lunch|dinner|breakfast|brunch|snack(?:s)?|refreshments?|catering|bagels?|donuts?|tacos?|burritos?|cookies?|coffee|tea|pastry|pastries|ice\s*cream|dessert|treats|buffet|meal)\b/i;

  var TAG_MENU = {
    pizza: 'Pizza',
    snacks: 'Snacks and refreshments',
    coffee_tea: 'Coffee and tea',
    lunch_dinner: 'Lunch or dinner',
    dessert: 'Dessert',
    mexican: 'Mexican cuisine',
    asian: 'Asian cuisine',
    italian: 'Italian cuisine',
    mediterranean: 'Mediterranean cuisine',
    american: 'American / BBQ',
    vegetarian: 'Vegetarian options',
    vegan: 'Vegan options',
    gluten_free: 'Gluten-free options',
    dairy_free: 'Dairy-free options',
    nut_free: 'Nut-free options',
    halal: 'Halal options',
    kosher: 'Kosher options',
  };

  var TAG_ALLERGENS = {
    vegetarian: 'Vegetarian options may be available.',
    vegan: 'Vegan options may be available.',
    gluten_free: 'Gluten-free options may be available.',
    dairy_free: 'Dairy-free options may be available.',
    nut_free: 'Nut-free options may be available.',
    halal: 'Halal options may be available.',
    kosher: 'Kosher options may be available.',
  };

  function textHasFood(text) {
    return FOOD_RE.test(text || '');
  }

  function extractFoodSentences(text) {
    if (!text) return [];
    var sentences = text.split(/[.!?]+\s+|\n+/);
    var out = [];
    for (var i = 0; i < sentences.length; i++) {
      if (FOOD_RE.test(sentences[i])) out.push(sentences[i].trim());
    }
    return out;
  }

  function inferFoodFromText(text, tags) {
    tags = tags || [];
    var sentences = extractFoodSentences(text);
    var menuParts = [];
    var i;

    if (sentences.length) {
      menuParts.push(sentences.slice(0, 2).join(' '));
    }

    for (i = 0; i < tags.length; i++) {
      if (TAG_MENU[tags[i]] && menuParts.indexOf(TAG_MENU[tags[i]]) === -1) {
        menuParts.push(TAG_MENU[tags[i]]);
      }
    }

    if (!menuParts.length && textHasFood(text)) {
      menuParts.push('Food and refreshments (see event description for details).');
    }

    var menu = menuParts.join(' ');

    var quantity = 'Available while supplies last (first-come, first-served).';
    var qtyMatch = (text || '').match(
      /(?:~|about|approximately|up to)\s*(\d+[–-]?\d*)\s*(people|attendees|guests|servings|plates|tickets|slices|boxes|meals)?/i
    );
    if (qtyMatch) {
      quantity = 'About ' + qtyMatch[1] + (qtyMatch[2] ? ' ' + qtyMatch[2] : '') + ' while supplies last.';
    } else if (/\bunlimited\b/i.test(text) && /\b(coffee|tea|beverage)/i.test(text)) {
      quantity = 'Unlimited beverages; snacks while supplies last.';
    } else if (/\bbuffet\b/i.test(text)) {
      quantity = 'Buffet service while supplies last.';
    }

    var allergenParts = [];
    for (i = 0; i < tags.length; i++) {
      if (TAG_ALLERGENS[tags[i]]) allergenParts.push(TAG_ALLERGENS[tags[i]]);
    }
    if (/\b(allergen|allergy|dietary|gluten|vegan|vegetarian|nut[-\s]*free|dairy)\b/i.test(text)) {
      allergenParts.push('See the event description or ask staff on site for current allergen information.');
    }
    if (!allergenParts.length) {
      allergenParts.push(
        'Ingredients and allergens vary. Ask event staff before eating if you have food allergies or dietary restrictions.'
      );
    }

    return {
      menu: menu,
      quantity: quantity,
      allergens: allergenParts.join(' '),
    };
  }

  function ensureEventHasFood(ev) {
    if (!ev) return ev;
    var hay = [ev.title, ev.description].filter(Boolean).join(' ');
    var tags = ev.tags || [];
    var hasFood = ev.hasFood || !!ev.food || textHasFood(hay) || tags.length > 0;

    if (!hasFood) return ev;

    ev.hasFood = true;
    if (!ev.food) {
      ev.food = inferFoodFromText(hay, tags);
    }
    return ev;
  }

  window.inferFoodFromText = inferFoodFromText;
  window.ensureEventHasFood = ensureEventHasFood;
  window.textHasFood = textHasFood;

  window.renderFoodDetailSection = function (ev) {
    ev = ensureEventHasFood(ev ? Object.assign({}, ev) : null);
    if (!ev || !ev.food) return '';

    var f = ev.food;
    return (
      '<div class="em-food-provided-banner" role="status">' +
      '<i class="fas fa-utensils" aria-hidden="true"></i> Food provided' +
      '</div>' +
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
  };

  window.registerFoodEventForCard = function (slug, opts) {
    if (!slug) return;
    opts = opts || {};
    window.PROTOTYPE_EVENTS = window.PROTOTYPE_EVENTS || {};

    var registry = opts.registry;
    var jsonEvent = opts.jsonEvent;
    var haystack = opts.haystack || '';
    var tags = opts.tags || [];
    var title = opts.title || (jsonEvent && jsonEvent.name) || slug;

    var existing = window.PROTOTYPE_EVENTS[slug] || {};
    var merged = Object.assign({}, existing);

    if (jsonEvent) {
      if (jsonEvent.name) merged.title = jsonEvent.name;
      if (jsonEvent.description) merged.description = jsonEvent.description;
      if (jsonEvent.startDate) merged.start = jsonEvent.startDate;
      if (jsonEvent.endDate) merged.end = jsonEvent.endDate;
      if (jsonEvent.image) merged.image = jsonEvent.image;
    }

    merged.slug = slug;
    merged.title = merged.title || title;
    merged.hasFood = true;
    if (tags.length) merged.tags = tags;
    else if (!merged.tags) merged.tags = [];

    if (registry && registry.food) {
      merged.food = registry.food;
      merged.tags = registry.tags || merged.tags;
    } else if (!merged.food) {
      merged.food = inferFoodFromText(
        [merged.title, merged.description, haystack].filter(Boolean).join(' '),
        merged.tags
      );
    }

    ensureEventHasFood(merged);
    window.PROTOTYPE_EVENTS[slug] = merged;
  };

  window.enrichPrototypeEventsWithFood = function () {
    if (!window.PROTOTYPE_EVENTS) return;
    Object.keys(window.PROTOTYPE_EVENTS).forEach(function (slug) {
      window.PROTOTYPE_EVENTS[slug] = ensureEventHasFood(window.PROTOTYPE_EVENTS[slug]);
    });
  };
})();
