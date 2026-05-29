(function () {
  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function ymdFromDate(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return yyyy + '-' + mm + '-' + dd;
  }

  function ymdFromStart(start) {
    if (!start) return null;
    if (start.indexOf('T') >= 0) return start.slice(0, 10);
    const m = String(start).match(/(\d{4})-(\d{2})-(\d{2})/);
    return m ? (m[1] + '-' + m[2] + '-' + m[3]) : null;
  }

  function formatDayHeading(ymd) {
    const d = new Date(ymd + 'T12:00:00');
    return WEEKDAYS[d.getDay()] + ', ' + MONTH_NAMES[d.getMonth()] + ' ' + d.getDate();
  }

  function daysInRange(startYMD, endYMD) {
    if (!startYMD) return [];
    if (!endYMD || endYMD < startYMD) return [startYMD];
    const out = [];
    const cur = new Date(startYMD + 'T12:00:00');
    const end = new Date(endYMD + 'T12:00:00');
    while (cur <= end) {
      out.push(ymdFromDate(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }

  function ensureCalendarUI() {
    if (document.getElementById('em-calendar-view')) return;

    const filterWrapper = document.querySelector('.em-filter-wrapper');
    const anchor = filterWrapper ? filterWrapper : document.body;

    const toggle = document.createElement('div');
    toggle.id = 'em-view-toggle-wrapper';
    toggle.innerHTML =
      '<button type="button" class="em-button em-secondary em-view-toggle-btn selected" data-em-view="cards">Cards</button>' +
      '<button type="button" class="em-button em-secondary em-view-toggle-btn" data-em-view="calendar">Calendar</button>';

    const calendarView = document.createElement('div');
    calendarView.id = 'em-calendar-view';
    calendarView.style.display = 'none';
    calendarView.setAttribute('aria-live', 'polite');
    calendarView.innerHTML =
      '<div id="em-calendar-toolbar">' +
      '<button type="button" class="em-button em-secondary em-calendar-nav" data-em-month-nav="-1" aria-label="Previous month"><i class="fas fa-chevron-left" aria-hidden="true"></i></button>' +
      '<h2 id="em-calendar-month-label" class="em-calendar-month-label"></h2>' +
      '<button type="button" class="em-button em-secondary em-calendar-nav" data-em-month-nav="1" aria-label="Next month"><i class="fas fa-chevron-right" aria-hidden="true"></i></button>' +
      '</div>' +
      '<div class="em-calendar-weekdays">' + WEEKDAYS.map(function (w) { return '<div class="em-calendar-weekday">' + w + '</div>'; }).join('') + '</div>' +
      '<div id="em-calendar-days" class="em-calendar-days" role="grid"></div>' +
      '<div id="em-calendar-day-panel" class="em-calendar-day-panel">' +
      '<h3 id="em-calendar-selected-label" class="em-calendar-selected-label"></h3>' +
      '<div id="em-calendar-events"></div>' +
      '</div>';

    anchor.insertAdjacentElement('afterend', toggle);
    toggle.insertAdjacentElement('afterend', calendarView);

    return { toggle, calendarView };
  }

  function getCardStartYMD(card) {
    const timeEl = card.querySelector('em-local-time');
    if (!timeEl) return null;
    const start = timeEl.getAttribute('start') || '';
    return ymdFromStart(start);
  }

  function parseCardToCalendarEvent(card) {
    const titleLink = card.querySelector('.em-card_title a');
    const title = titleLink ? titleLink.textContent.trim() : (card.querySelector('.em-card_title') ? card.querySelector('.em-card_title').textContent.trim() : '');
    const href = titleLink ? titleLink.getAttribute('href') : '#';

    const timeEl = card.querySelector('em-local-time');
    const startAttr = timeEl ? (timeEl.getAttribute('start') || '') : '';
    const endAttr = timeEl ? (timeEl.getAttribute('end') || '') : '';
    const startYMD = ymdFromStart(startAttr) || getCardStartYMD(card);
    const endYMD = ymdFromStart(endAttr) || startYMD;
    const timeText = timeEl ? timeEl.textContent.trim() : '';

    let locationText = '';
    const marker = card.querySelector('.em-card_event-text i.fa-map-marker-alt');
    if (marker && marker.closest('a')) {
      locationText = marker.closest('a').textContent.trim();
    } else if (marker && marker.parentElement) {
      locationText = marker.parentElement.textContent.trim();
    } else {
      const tv = card.querySelector('.em-card_event-text i.fa-tv');
      if (tv && tv.parentElement) locationText = 'Virtual Event';
      else {
        const anchors = card.querySelectorAll('.em-card_event-text a');
        if (anchors.length) locationText = anchors[0].textContent.trim();
      }
    }

    return { card, title, href, startYMD, endYMD, startAttr, timeText, locationText };
  }

  function isCardAllowed(card) {
    if (card.style && card.style.display === 'none') return false;

    const panel = card.closest('.tabs-component-panel');
    if (panel && panel.style && panel.style.display === 'none') return false;

    return true;
  }

  function collectCalendarEvents() {
    const map = new Map();
    const cards = Array.from(document.querySelectorAll('.em-card'));
    const seen = new Set();

    for (const card of cards) {
      if (!(card instanceof HTMLElement)) continue;
      if (!isCardAllowed(card)) continue;

      const info = parseCardToCalendarEvent(card);
      if (!info.startYMD) continue;

      const days = daysInRange(info.startYMD, info.endYMD);
      for (let i = 0; i < days.length; i++) {
        const ymd = days[i];
        const key = ymd + '|' + info.href;
        if (seen.has(key)) continue;
        seen.add(key);
        if (!map.has(ymd)) map.set(ymd, []);
        map.get(ymd).push(info);
      }
    }

    for (const arr of map.values()) {
      arr.sort(function (a, b) {
        const da = a.startAttr ? new Date(a.startAttr).getTime() : 0;
        const db = b.startAttr ? new Date(b.startAttr).getTime() : 0;
        return da - db;
      });
    }

    return map;
  }

  function renderDayEvents(selectedYMD, eventsByYMD) {
    const label = document.getElementById('em-calendar-selected-label');
    const eventsRoot = document.getElementById('em-calendar-events');
    if (!label || !eventsRoot) return;

    label.textContent = selectedYMD ? formatDayHeading(selectedYMD) : 'Select a day';
    eventsRoot.innerHTML = '';

    if (!selectedYMD) return;
    const dayEvents = eventsByYMD.get(selectedYMD) || [];

    if (!dayEvents.length) {
      const empty = document.createElement('div');
      empty.className = 'em-calendar-empty';
      empty.textContent = 'No events for this day.';
      eventsRoot.appendChild(empty);
      return;
    }

    for (let i = 0; i < dayEvents.length; i++) {
      const ev = dayEvents[i];
      const item = document.createElement('div');
      item.className = 'em-calendar-event';
      const title = document.createElement('a');
      title.className = 'em-calendar-event-title';
      title.href = ev.href || '#';
      title.textContent = ev.title || 'Untitled event';
      const meta = document.createElement('div');
      meta.className = 'em-calendar-event-meta';
      meta.textContent = [ev.timeText, ev.locationText].filter(Boolean).join(' | ');
      item.appendChild(title);
      item.appendChild(meta);
      eventsRoot.appendChild(item);
    }
  }

  function renderMonthGrid(viewYear, viewMonth, eventsByYMD, selectedYMD) {
    const label = document.getElementById('em-calendar-month-label');
    const daysRoot = document.getElementById('em-calendar-days');
    if (!label || !daysRoot) return;

    label.textContent = MONTH_NAMES[viewMonth] + ' ' + viewYear;
    daysRoot.innerHTML = '';

    const first = new Date(viewYear, viewMonth, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const todayYMD = ymdFromDate(new Date());

    const totalCells = Math.ceil((startPad + daysInMonth) / 7) * 7;
    for (let cell = 0; cell < totalCells; cell++) {
      const dayNum = cell - startPad + 1;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'em-calendar-day';
      btn.setAttribute('role', 'gridcell');

      let ymd = null;
      const inMonth = dayNum >= 1 && dayNum <= daysInMonth;

      if (inMonth) {
        ymd = viewYear + '-' + String(viewMonth + 1).padStart(2, '0') + '-' + String(dayNum).padStart(2, '0');
        btn.setAttribute('data-ymd', ymd);
      } else {
        btn.classList.add('other-month');
        const d = new Date(viewYear, viewMonth, dayNum);
        ymd = ymdFromDate(d);
        btn.setAttribute('data-ymd', ymd);
      }

      const num = document.createElement('span');
      num.className = 'em-calendar-day-num';
      num.textContent = inMonth ? String(dayNum) : String(new Date(ymd + 'T12:00:00').getDate());
      btn.appendChild(num);

      const events = eventsByYMD.get(ymd) || [];
      if (events.length) {
        const dots = document.createElement('div');
        dots.className = 'em-calendar-day-dots';
        const show = Math.min(events.length, 3);
        for (let d = 0; d < show; d++) {
          const dot = document.createElement('span');
          dot.className = 'em-calendar-dot';
          dots.appendChild(dot);
        }
        btn.appendChild(dots);
        if (events.length > 3) {
          const cnt = document.createElement('span');
          cnt.className = 'em-calendar-day-count';
          cnt.textContent = '+' + (events.length - 3) + ' more';
          btn.appendChild(cnt);
        } else if (events.length > 1) {
          const cnt = document.createElement('span');
          cnt.className = 'em-calendar-day-count';
          cnt.textContent = events.length + ' events';
          btn.appendChild(cnt);
        }
      }

      if (ymd === todayYMD) btn.classList.add('today');
      if (ymd === selectedYMD) btn.classList.add('selected');

      daysRoot.appendChild(btn);
    }
  }

  function init() {
    const ui = ensureCalendarUI();
    if (!ui) return;

    let mode = 'cards';
    const now = new Date();
    let viewYear = now.getFullYear();
    let viewMonth = now.getMonth();
    let selectedYMD = ymdFromDate(now);

    const toggle = document.getElementById('em-view-toggle-wrapper');
    const calendarView = document.getElementById('em-calendar-view');

    function hideCardViews() {
      document.querySelectorAll('.event_group.event_list_component').forEach(function (el) {
        if (el instanceof HTMLElement) el.style.display = 'none';
      });
      const eventResults = document.getElementById('event_results');
      if (eventResults) eventResults.style.display = 'none';
    }

    function showCardViews() {
      document.querySelectorAll('.event_group.event_list_component').forEach(function (el) {
        if (el instanceof HTMLElement) el.style.display = '';
      });
      const eventResults = document.getElementById('event_results');
      if (eventResults) eventResults.style.display = '';
    }

    function refreshCalendar() {
      const eventsByYMD = collectCalendarEvents();
      renderMonthGrid(viewYear, viewMonth, eventsByYMD, selectedYMD);
      renderDayEvents(selectedYMD, eventsByYMD);
    }

    function setMode(nextMode) {
      mode = nextMode;
      const btnCards = toggle.querySelector('[data-em-view="cards"]');
      const btnCalendar = toggle.querySelector('[data-em-view="calendar"]');
      if (btnCards) btnCards.classList.toggle('selected', mode === 'cards');
      if (btnCalendar) btnCalendar.classList.toggle('selected', mode === 'calendar');

      if (mode === 'calendar') {
        calendarView.style.display = 'block';
        hideCardViews();
        if (!selectedYMD) selectedYMD = ymdFromDate(new Date());
        refreshCalendar();
      } else {
        calendarView.style.display = 'none';
        showCardViews();
      }
    }

    function rerenderIfCalendar() {
      if (mode !== 'calendar') return;
      refreshCalendar();
    }

    toggle.addEventListener('click', function (e) {
      const btn = e.target.closest('.em-view-toggle-btn');
      if (!btn) return;
      const v = btn.getAttribute('data-em-view');
      if (v) setMode(v);
    });

    calendarView.addEventListener('click', function (e) {
      const monthNav = e.target.closest('[data-em-month-nav]');
      if (monthNav) {
        const delta = parseInt(monthNav.getAttribute('data-em-month-nav'), 10) || 0;
        viewMonth += delta;
        if (viewMonth < 0) { viewMonth = 11; viewYear -= 1; }
        if (viewMonth > 11) { viewMonth = 0; viewYear += 1; }
        refreshCalendar();
        return;
      }
      const dayBtn = e.target.closest('.em-calendar-day');
      if (dayBtn) {
        selectedYMD = dayBtn.getAttribute('data-ymd');
        refreshCalendar();
      }
    });

    document.querySelectorAll('form[data-filter-menu]').forEach(function (form) {
      form.addEventListener('submit', function () {
        setTimeout(rerenderIfCalendar, 0);
      });
    });

    document.addEventListener('em-prototype-links-updated', function () {
      setTimeout(rerenderIfCalendar, 0);
    });

    document.addEventListener('click', function (e) {
      const tab = e.target.closest('a[role="tab"]');
      if (!tab) return;
      setTimeout(rerenderIfCalendar, 50);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
