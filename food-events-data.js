/** Demo food event registry — slug keys match calendar.ucsd.edu/event/{slug} */
window.FOOD_EVENTS = {
  'nice-people-and-free-pizza': {
    title: 'Nice People and Free Pizza with Agape San Diego',
    start: '2026-05-26T12:00:00-07:00',
    end: '2026-05-26T14:00:00-07:00',
    location: 'Price Center, 2nd floor, 2.425',
    locationUrl: 'https://calendar.ucsd.edu/price-center',
    image: 'https://localist-images.azureedge.net/photos/52244209462323/huge/f5becc7ff684db57f112754eef412e3fc029b6a5.jpg',
    description:
      'Join friends every Tuesday from noon to 2pm. Free pizza provided with vegetarian and gluten-free options.',
    tags: ['pizza', 'vegetarian', 'gluten_free', 'lunch_dinner'],
    food: {
      menu: 'Cheese and pepperoni pizza; vegetarian pizzas on request.',
      quantity: 'About 80–100 slices total (first-come, first-served).',
      allergens: 'Wheat/gluten, dairy; may contain soy. Vegetarian and gluten-free crust available in limited quantities.',
    },
  },
  'lets-talk-9958': {
    title: "Let's Talk",
    start: '2026-05-26T12:00:00-07:00',
    end: '2026-05-26T13:00:00-07:00',
    location: 'Virtual Event',
    virtual: true,
    image: 'https://localist-images.azureedge.net/photos/52453586349236/huge/8a584537ef4919af933caf5b418b09c615c08741.jpg',
    description: 'Informal CAPS consultations with coffee, tea, and light snacks.',
    tags: ['coffee_tea', 'snacks', 'vegan', 'dairy_free'],
    food: {
      menu: 'Brewed coffee, hot tea, and light snacks.',
      quantity: 'Unlimited beverages; snacks for ~40 attendees per session.',
      allergens: 'May contain dairy and gluten; vegan milk and dairy-free options available.',
    },
  },
  recess: {
    title: 'Recess',
    start: '2026-05-28T13:00:00-07:00',
    end: '2026-05-28T16:00:00-07:00',
    location: 'Warren Mall',
    image: 'https://localist-images.azureedge.net/photos/52957614916204/huge/36e4ed27a1ba2710584f645e9e9ae27f1105ddad.jpg',
    description: 'Games, nostalgia, and free ice cream and dessert treats.',
    tags: ['dessert', 'snacks', 'vegan', 'dairy_free'],
    food: {
      menu: 'Ice cream bars/cups and assorted packaged dessert treats.',
      quantity: 'About 200 individual treats while supplies last.',
      allergens: 'Milk/dairy, soy; vegan/dairy-free options in limited quantities. May be processed in facilities with tree nuts.',
    },
  },
  'global-coffee-hour-3887': {
    title: 'Global Coffee Hour',
    start: '2026-06-10T08:00:00-07:00',
    end: '2026-06-10T09:30:00-07:00',
    location: 'Student Center B',
    locationUrl: 'https://calendar.ucsd.edu/student-center-b',
    image: 'https://localist-images.azureedge.net/photos/52392111584249/huge/3d842966602430b65c6ad88c2b0621873e9d9611.jpg',
    description: 'Coffee, tea, and pastries for international and domestic students.',
    tags: ['coffee_tea', 'snacks', 'vegetarian', 'nut_free'],
    food: {
      menu: 'Coffee, tea, and assorted breakfast pastries.',
      quantity: 'Pastries for ~75 people; coffee/tea while supplies last.',
      allergens: 'Wheat/gluten, dairy, eggs; nut-free pastries available. Some items may contain soy.',
    },
  },
  'taco-tuesday-student-life': {
    title: 'Taco Tuesday on the Plaza',
    start: '2026-05-27T11:30:00-07:00',
    end: '2026-05-27T13:30:00-07:00',
    location: 'Library Walk',
    image: 'https://localist-images.azureedge.net/photos/52244209462323/huge/f5becc7ff684db57f112754eef412e3fc029b6a5.jpg',
    description: 'Free tacos and agua fresca on the plaza.',
    tags: ['mexican', 'lunch_dinner', 'halal'],
    food: {
      menu: 'Chicken and bean tacos with salsa, cilantro, and lime; horchata.',
      quantity: 'About 150 tacos while supplies last.',
      allergens: 'Wheat (corn tortillas), may contain dairy. Halal chicken option available.',
    },
  },
  'asian-night-market-bites': {
    title: 'Asian Night Market Bites',
    start: '2026-05-29T17:00:00-07:00',
    end: '2026-05-29T19:00:00-07:00',
    location: 'Price Center Plaza',
    image: 'https://localist-images.azureedge.net/photos/52383581873213/huge/2946cc14611a7a020eb4480d317cba99b1284839.jpg',
    description: 'Sample dumplings, boba tea, and ramen cups.',
    tags: ['asian', 'snacks', 'coffee_tea'],
    food: {
      menu: 'Steamed dumplings, instant ramen cups, and boba tea.',
      quantity: 'One tasting portion per person (~120 servings).',
      allergens: 'Wheat/gluten, soy, sesame; contains shellfish in some dumplings. Ask staff for allergen cards.',
    },
  },
  'italian-pasta-social': {
    title: 'Italian Pasta Social',
    start: '2026-06-03T12:00:00-07:00',
    end: '2026-06-03T14:00:00-07:00',
    location: 'Great Hall',
    image: 'https://localist-images.azureedge.net/photos/52500651401002/huge/ec6048dad3c7fe3f281a1f5ba97550c9504029bf.jpg',
    description: 'Free pasta lunch with marinara and pesto.',
    tags: ['italian', 'lunch_dinner', 'vegetarian'],
    food: {
      menu: 'Penne with marinara and pesto; garlic bread.',
      quantity: 'About 90 boxed lunches.',
      allergens: 'Wheat/gluten, dairy, eggs (pesto). Vegetarian; no meat in standard portions.',
    },
  },
  'mediterranean-meze-hour': {
    title: 'Mediterranean Meze Hour',
    start: '2026-06-04T16:00:00-07:00',
    end: '2026-06-04T18:00:00-07:00',
    location: 'RIMAC Green',
    image: 'https://localist-images.azureedge.net/photos/52878790532983/huge/d0e52871bc3515c936bf4d0790315f64733faa7a.jpg',
    description: 'Hummus, falafel, and fresh pita.',
    tags: ['mediterranean', 'snacks', 'vegan', 'vegetarian'],
    food: {
      menu: 'Hummus, falafel bites, cucumber salad, and pita.',
      quantity: 'Meze boxes for ~60 attendees.',
      allergens: 'Wheat/gluten, sesame (tahini). Vegan and vegetarian.',
    },
  },
  'american-bbq-bash': {
    title: 'American BBQ Bash',
    start: '2026-06-05T12:00:00-07:00',
    end: '2026-06-05T15:00:00-07:00',
    location: 'Warren Mall',
    image: 'https://localist-images.azureedge.net/photos/52957614916204/huge/36e4ed27a1ba2710584f645e9e9ae27f1105ddad.jpg',
    description: 'Burgers, hot dogs, and sides on the lawn.',
    tags: ['american', 'lunch_dinner'],
    food: {
      menu: 'Beef burgers, turkey hot dogs, chips, and lemonade.',
      quantity: 'About 100 meal tickets (one plate per person).',
      allergens: 'Wheat/gluten, dairy optional, soy (buns). Veggie burger available on request (limited).',
    },
  },
  'halal-lunch-mubarak': {
    title: 'Halal Lunch Meetup',
    start: '2026-06-06T12:00:00-07:00',
    end: '2026-06-06T13:30:00-07:00',
    location: 'Cross-Cultural Center',
    image: 'https://localist-images.azureedge.net/photos/52244209462323/huge/f5becc7ff684db57f112754eef412e3fc029b6a5.jpg',
    description: 'Halal chicken over rice with salad.',
    tags: ['halal', 'lunch_dinner', 'mediterranean'],
    food: {
      menu: 'Halal chicken, rice, salad, and pita.',
      quantity: 'About 75 plates.',
      allergens: 'May contain wheat/gluten and dairy in sauces. Prepared halal; nut-free.',
    },
  },
  'kosher-shabbat-dinner': {
    title: 'Kosher Shabbat Dinner',
    start: '2026-06-06T18:00:00-07:00',
    end: '2026-06-06T20:00:00-07:00',
    location: 'Price Center East',
    image: 'https://localist-images.azureedge.net/photos/52392111584249/huge/3d842966602430b65c6ad88c2b0621873e9d9611.jpg',
    description: 'Community dinner with kosher catering.',
    tags: ['kosher', 'lunch_dinner'],
    food: {
      menu: 'Kosher chicken, roasted vegetables, challah, and salad.',
      quantity: 'Seated dinner for 50 (RSVP required).',
      allergens: 'Wheat/gluten, eggs (challah). Kosher supervised; dairy-free main available on request.',
    },
  },
  'all-college-grad-fest': {
    title: 'All-College GRAD FESTIVAL',
    start: '2026-06-04T12:00:00-07:00',
    end: '2026-06-04T15:00:00-07:00',
    location: 'Recreation Gym',
    image: 'https://localist-images.azureedge.net/photos/50402633962624/huge/34744ac160408edbf4bf5f648bcd371936453985.jpg',
    description: 'Grad celebration with lunch buffet.',
    tags: ['lunch_dinner', 'american', 'dessert', 'vegetarian'],
    food: {
      menu: 'Buffet lunch: sandwiches, fruit, cookies, and beverages.',
      quantity: 'Buffet for ~200 guests.',
      allergens: 'Wheat/gluten, dairy, eggs, tree nuts possible in desserts.',
    },
  },
  'undergraduate-engineering-research-symposium': {
    title: 'Undergraduate Engineering Research Symposium',
    start: '2026-06-05T10:00:00-07:00',
    end: '2026-06-05T14:00:00-07:00',
    location: 'Price Center Ballroom',
    image: 'https://localist-images.azureedge.net/photos/52895945886342/huge/22cf2ad5c1c04f36d1e066cd3601c523368ff8ee.jpg',
    description: 'Poster session with coffee and refreshments.',
    tags: ['coffee_tea', 'snacks', 'dessert'],
    food: {
      menu: 'Coffee, tea, fruit, and cookies.',
      quantity: 'Refreshments for ~150 attendees.',
      allergens: 'Wheat/gluten, dairy, eggs; may contain nuts in cookies.',
    },
  },
};

window.FOOD_EVENT_SLUGS = Object.keys(window.FOOD_EVENTS);

/** Full mirrored detail pages (others use event.html?e=slug). */
window.LOCAL_EVENT_HTML = {
  'nice-people-and-free-pizza': '/event/nice-people-and-free-pizza/index.html',
  'lets-talk-9958': '/event/lets-talk-9958/index.html',
  recess: '/event/recess/index.html',
  'global-coffee-hour-3887': '/event/global-coffee-hour-3887/index.html',
};

window.eventUrlForSlug = function (slug) {
  return 'https://calendar.ucsd.edu/event/' + slug;
};

window.localEventPageForSlug = function (slug) {
  var path;
  if (window.LOCAL_EVENT_HTML && window.LOCAL_EVENT_HTML[slug]) {
    path = window.LOCAL_EVENT_HTML[slug].replace(/^\//, '');
  } else {
    path = 'event.html?e=' + encodeURIComponent(slug);
  }
  if (typeof window.isPrototypeHost === 'function' && window.isPrototypeHost() && window.prototypeUrl) {
    return window.prototypeUrl(path);
  }
  if (location.hostname !== 'calendar.ucsd.edu' && window.prototypeUrl) {
    return window.prototypeUrl(path);
  }
  return '/' + path.replace(/^\//, '');
};
