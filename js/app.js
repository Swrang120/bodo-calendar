/* =========================================================
   BODO CALENDAR — MAIN APPLICATION
   Version: 6.1 (Enhanced & Fixed Date Calculation)

   Connects:
   - calendar-data.js
   - events.js
   - notes.js
   - vip.js
   ========================================================= */

(function () {
  "use strict";

  /* =======================================================
     CONFIG
     ======================================================= */

  const APP_VERSION = "6.1";

  const NOTIFICATION_URL = "./notifications.json?v=" + Date.now();

  const WELCOME_STORAGE_KEY = "bodo_calendar_welcome_closed_v1";

  const NOTIFICATION_STORAGE_KEY = "bodo_calendar_notification_closed_v1";

  /* =======================================================
     APP STATE
     ======================================================= */

  const state = {
    selectedMonthId: null,
    selectedDate: null,
    today: null,
    tomorrow: null,
    dayAfterTomorrow: null,
    notifications: [],
    deferredInstallPrompt: null,
    initialized: false
  };

  /* =======================================================
     DOM HELPER
     ======================================================= */

  function $(id) {
    return document.getElementById(id);
  }

  function safeText(value) {
    if (value === null || value === undefined) {
      return "";
    }
    return String(value);
  }

  function escapeHTML(value) {
    return safeText(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* =======================================================
     DATE HELPERS
     ======================================================= */

  function normalizeDate(date) {
    if (
      window.BodoCalendarData &&
      typeof window.BodoCalendarData.normalizeDate === "function"
    ) {
      const norm = window.BodoCalendarData.normalizeDate(date);
      if (norm && !isNaN(norm.getTime())) {
        const dNorm = new Date(norm.getTime());
        dNorm.setHours(0, 0, 0, 0);
        return dNorm;
      }
    }

    if (!date) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    }

    if (date instanceof Date) {
      const d = new Date(date.getTime());
      d.setHours(0, 0, 0, 0);
      return d;
    }

    // String handling to prevent UTC offset shifts (e.g., "YYYY-MM-DD")
    if (typeof date === "string") {
      const match = date.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (match) {
        return new Date(
          parseInt(match[1], 10),
          parseInt(match[2], 10) - 1,
          parseInt(match[3], 10),
          0,
          0,
          0,
          0
        );
      }
    }

    const d = new Date(date);
    if (isNaN(d.getTime())) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return now;
    }

    d.setHours(0, 0, 0, 0);
    return d;
  }

  function createDateKey(date) {
    const d = normalizeDate(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function addDays(date, amount) {
    const d = normalizeDate(date);
    d.setDate(d.getDate() + amount);
    return d;
  }

  function getToday() {
    return normalizeDate(new Date());
  }

  /* =======================================================
     DATA ACCESS & FALLBACKS
     ======================================================= */

  function getMonths() {
    if (
      window.BodoCalendarData &&
      Array.isArray(window.BodoCalendarData.bodoMonthsData) &&
      window.BodoCalendarData.bodoMonthsData.length > 0
    ) {
      return window.BodoCalendarData.bodoMonthsData;
    }

    if (Array.isArray(window.bodoMonthsData) && window.bodoMonthsData.length > 0) {
      return window.bodoMonthsData;
    }

    return [];
  }

  function getWeekdays() {
    if (
      window.BodoCalendarData &&
      Array.isArray(window.BodoCalendarData.bodoWeekdays) &&
      window.BodoCalendarData.bodoWeekdays.length > 0
    ) {
      return window.BodoCalendarData.bodoWeekdays;
    }

    if (Array.isArray(window.bodoWeekdays) && window.bodoWeekdays.length > 0) {
      return window.bodoWeekdays;
    }

    return [];
  }

  function getMonthStartDateHelper(month) {
    if (!month) return null;

    if (
      window.BodoCalendarData &&
      typeof window.BodoCalendarData.getBodoMonthStartDate === "function"
    ) {
      const d = window.BodoCalendarData.getBodoMonthStartDate(month);
      if (d && !isNaN(new Date(d).getTime())) return normalizeDate(d);
    }

    const possible = month.startDate || month.start || month.fromDate || month.gregorianStart;
    if (possible) {
      return normalizeDate(possible);
    }

    return null;
  }

  function getMonthForDate(date) {
    if (
      window.BodoCalendarData &&
      typeof window.BodoCalendarData.getBodoMonthForDate === "function"
    ) {
      const m = window.BodoCalendarData.getBodoMonthForDate(date);
      if (m) return m;
    }

    const target = normalizeDate(date);
    const months = getMonths();

    for (const month of months) {
      const start = getMonthStartDateHelper(month);
      let days = typeof month.days === "number" ? month.days : 30;
      if (start) {
        const end = addDays(start, days - 1);
        if (target >= start && target <= end) {
          return month;
        }
      }
    }

    return months.length ? months[0] : null;
  }

  function getBodoDateInfo(date) {
    if (
      window.BodoCalendarData &&
      typeof window.BodoCalendarData.getBodoDateInfo === "function"
    ) {
      const info = window.BodoCalendarData.getBodoDateInfo(date);
      if (info) return info;
    }

    const normDate = normalizeDate(date);
    const month = getMonthForDate(normDate);

    if (month) {
      const start = getMonthStartDateHelper(month);
      if (start) {
        const diffTime = normDate.getTime() - start.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        if (diffDays > 0) {
          return {
            bodoDate: diffDays,
            month: month
          };
        }
      }
    }

    return null;
  }

  function getMonthById(id) {
    const months = getMonths();
    if (!months.length) return null;

    return (
      months.find(
        (month) =>
          String(month.id).toLowerCase() === String(id).toLowerCase() ||
          String(month.name).toLowerCase() === String(id).toLowerCase()
      ) || months[0]
    );
  }

  /* =======================================================
     EVENT DATA ACCESS
     ======================================================= */

  function getEventsForDate(date) {
    const events = window.BodoCalendarEvents;

    if (events && typeof events.getEventsForDate === "function") {
      return events.getEventsForDate(date) || [];
    }

    if (events && typeof events.getEventsByDate === "function") {
      return events.getEventsByDate(date) || [];
    }

    return [];
  }

  function getEventsForMonth(monthId) {
    const events = window.BodoCalendarEvents;

    if (events && typeof events.getEventsForMonth === "function") {
      return events.getEventsForMonth(monthId) || [];
    }

    if (events && typeof events.getMonthEvents === "function") {
      return events.getMonthEvents(monthId) || [];
    }

    return [];
  }

  /* =======================================================
     NOTES DATA ACCESS
     ======================================================= */

  function getNotesForDate(date) {
    const notes = window.BodoCalendarNotes;

    if (notes && typeof notes.getNotesForDate === "function") {
      return notes.getNotesForDate(createDateKey(date)) || [];
    }

    return [];
  }

  function getAllNotes() {
    const notes = window.BodoCalendarNotes;

    if (notes && typeof notes.getAllNotes === "function") {
      return notes.getAllNotes() || [];
    }

    return [];
  }

  /* =======================================================
     FORMATTERS
     ======================================================= */

  function formatEnglishDate(date, options) {
    const d = normalizeDate(date);
    return d.toLocaleDateString(
      "en-IN",
      options || {
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    );
  }

  function formatShortEnglishDate(date) {
    return formatEnglishDate(date, {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  function getBodoDateNumberFromInfo(info) {
    if (!info) return null;
    return (
      info.bodoDate ??
      info.dateNumber ??
      info.day ??
      info.dayNumber ??
      null
    );
  }

  function getBodoMonthName(month) {
    if (!month) return "Bodo Month";
    return month.name || month.englishName || month.title || "Bodo Month";
  }

  function getBodoNativeName(month) {
    if (!month) return "";
    return (
      month.nativeName ||
      month.bodoName ||
      month.native ||
      month.devanagari ||
      ""
    );
  }

  /* =======================================================
     INITIAL MONTH
     ======================================================= */

  function detectCurrentMonth() {
    const today = state.today;
    const month = getMonthForDate(today);

    if (month) {
      state.selectedMonthId = month.id;
      return month;
    }

    const months = getMonths();
    if (months.length) {
      state.selectedMonthId = months[0].id;
      return months[0];
    }

    return null;
  }

  /* =======================================================
     MONTH SELECTOR
     ======================================================= */

  function renderMonthSelector() {
    const select = $("monthSelect");
    if (!select) return;

    const months = getMonths();
    select.innerHTML = "";

    months.forEach((month) => {
      const option = document.createElement("option");
      option.value = String(month.id);

      const name = getBodoMonthName(month);
      const native = getBodoNativeName(month);

      option.textContent = native ? `${name} — ${native}` : name;

      if (String(month.id) === String(state.selectedMonthId)) {
        option.selected = true;
      }

      select.appendChild(option);
    });
  }

  /* =======================================================
     WEEKDAY HEADER
     ======================================================= */

  function renderWeekdayHeader() {
    const container = $("weekdayHeader");
    if (!container) return;

    const weekdays = getWeekdays();
    container.innerHTML = "";

    const defaultWeekdays = [
      { bodo: "रबिबार", english: "Sunday" },
      { bodo: "समबार", english: "Monday" },
      { bodo: "मंगलबार", english: "Tuesday" },
      { bodo: "बुदबार", english: "Wednesday" },
      { bodo: "बिसथिबार", english: "Thursday" },
      { bodo: "सुखुरबार", english: "Friday" },
      { bodo: "सुनिबार", english: "Saturday" }
    ];

    const listToRender = weekdays.length ? weekdays : defaultWeekdays;

    listToRender.forEach((weekday) => {
      const item = document.createElement("div");
      item.className = "weekday-item";

      if (typeof weekday === "string") {
        item.textContent = weekday;
      } else {
        const english = weekday.english || weekday.name || weekday.label || "";
        const bodo = weekday.bodo || weekday.nativeName || weekday.native || "";

        item.innerHTML =
          `<span>${escapeHTML(bodo || english)}</span>` +
          (bodo && english
            ? `<small>${escapeHTML(english)}</small>`
            : "");
      }

      container.appendChild(item);
    });
  }

  /* =======================================================
     MONTH BANNER
     ======================================================= */

  function renderMonthBanner() {
    const month = getMonthById(state.selectedMonthId);
    if (!month) return;

    const name = getBodoMonthName(month);
    const native = getBodoNativeName(month);

    if ($("currentMonthName")) {
      $("currentMonthName").textContent = name;
    }

    if ($("currentMonthNativeName")) {
      $("currentMonthNativeName").textContent = native;
    }

    let startDate = getMonthStartDateHelper(month);
    let endDate = null;

    if (
      window.BodoCalendarData &&
      typeof window.BodoCalendarData.getBodoMonthEndDate === "function"
    ) {
      endDate = window.BodoCalendarData.getBodoMonthEndDate(month);
    }

    if (!endDate && startDate) {
      const days = typeof month.days === "number" ? month.days : 30;
      endDate = addDays(startDate, days - 1);
    }

    if ($("currentMonthDateRange")) {
      if (startDate && endDate) {
        $("currentMonthDateRange").textContent = `${formatShortEnglishDate(
          startDate
        )} — ${formatShortEnglishDate(endDate)}`;
      } else if (month.dateRange || month.gregorianRange) {
        $("currentMonthDateRange").textContent =
          month.dateRange || month.gregorianRange;
      } else {
        $("currentMonthDateRange").textContent = "Bodo Solar Calendar Month";
      }
    }

    if ($("monthSeasonLabel")) {
      const season = month.season || month.seasonName || "BODO SOLAR MONTH";
      $("monthSeasonLabel").textContent = season;
    }

    updateSeason(month);
  }

  /* =======================================================
     CALENDAR GRID
     ======================================================= */

  function renderCalendar() {
    const grid = $("calendarGrid");
    if (!grid) return;

    const month = getMonthById(state.selectedMonthId);

    if (!month) {
      grid.innerHTML = createEmptyState("Calendar month unavailable.");
      return;
    }

    let dates = [];

    if (
      window.BodoCalendarData &&
      typeof window.BodoCalendarData.generateMonthDates === "function"
    ) {
      dates = window.BodoCalendarData.generateMonthDates(month.id) || [];
    } else if (
      window.BodoCalendarData &&
      typeof window.BodoCalendarData.generateCalendarDates === "function"
    ) {
      dates = window.BodoCalendarData.generateCalendarDates(month.id) || [];
    }

    /* Robust Fallback Generation */
    if (!dates.length) {
      let startDate = getMonthStartDateHelper(month);
      let days = typeof month.days === "number" ? month.days : 30;

      if (!startDate) {
        startDate = new Date();
        startDate.setDate(1);
      }

      for (let i = 0; i < days; i++) {
        dates.push({
          date: addDays(startDate, i),
          bodoDate: i + 1,
          monthId: month.id
        });
      }
    }

    grid.innerHTML = "";

    if (!dates.length) {
      grid.innerHTML = createEmptyState("No calendar dates available.");
      return;
    }

    /* Add empty weekday spaces before month start */
    const firstDate = extractGregorianDate(dates[0]);

    if (firstDate) {
      const dayOfWeek = firstDate.getDay();
      for (let i = 0; i < dayOfWeek; i++) {
        const blank = document.createElement("div");
        blank.className = "calendar-date blank-date";
        blank.setAttribute("aria-hidden", "true");
        grid.appendChild(blank);
      }
    }

    dates.forEach((entry) => {
      const date = extractGregorianDate(entry);
      if (!date) return;

      const card = createDateCard(date, entry, month);
      grid.appendChild(card);
    });
  }

  /* =======================================================
     EXTRACT DATE FROM CALENDAR ENTRY
     ======================================================= */

  function extractGregorianDate(entry) {
    if (!entry) return null;

    if (entry instanceof Date) {
      return normalizeDate(entry);
    }

    const possible =
      entry.date ||
      entry.gregorianDate ||
      entry.fullDate ||
      entry.calendarDate;

    if (possible) {
      return normalizeDate(possible);
    }

    return null;
  }

  /* =======================================================
     CREATE DATE CARD
     ======================================================= */

  function createDateCard(date, entry, month) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "calendar-date";

    const dateKey = createDateKey(date);
    const isToday = dateKey === createDateKey(state.today);
    const isSelected =
      state.selectedDate && dateKey === createDateKey(state.selectedDate);

    const events = getEventsForDate(date);
    const notes = getNotesForDate(date);

    if (isToday) {
      card.classList.add("today", "is-today");
    }

    if (isSelected) {
      card.classList.add("selected");
    }

    if (events.length) {
      card.classList.add("has-event", "event-date");
    }

    if (notes.length) {
      card.classList.add("has-note", "note-date");
    }

    const info = getBodoDateInfo(date);
    let bodoNumber = getBodoDateNumberFromInfo(info);

    if (bodoNumber === null || bodoNumber === undefined) {
      bodoNumber = entry.bodoDate ?? entry.day ?? entry.dayNumber ?? "";
    }

    const englishDay = date.getDate();
    const weekday = date.toLocaleDateString("en-IN", { weekday: "short" });

    card.innerHTML = `
      <span class="date-weekday">${escapeHTML(weekday)}</span>
      <strong class="bodo-date-number">${escapeHTML(bodoNumber)}</strong>
      <span class="gregorian-date">${escapeHTML(englishDay)}</span>
      ${events.length ? `<span class="date-event-dot" aria-label="Event"></span>` : ""}
      ${notes.length ? `<span class="date-note-dot" aria-label="Personal note"></span>` : ""}
    `;

    card.setAttribute(
      "aria-label",
      `${getBodoMonthName(month)} ${bodoNumber}, ${formatEnglishDate(date)}`
    );

    card.addEventListener("click", function () {
      selectDate(date);
    });

    return card;
  }

  /* =======================================================
     EMPTY STATE
     ======================================================= */

  function createEmptyState(message) {
    return `
      <div class="empty-state">
        <span>📅</span>
        <p>${escapeHTML(message)}</p>
      </div>
    `;
  }

  /* =======================================================
     SELECT DATE
     ======================================================= */

  function selectDate(date, openModal = true) {
    state.selectedDate = normalizeDate(date);

    renderCalendar();
    renderSelectedDate();

    if (openModal) {
      openDateModal(state.selectedDate);
    }
  }

  /* =======================================================
     SELECTED DATE SIDEBAR
     ======================================================= */

  function renderSelectedDate() {
    const date = state.selectedDate || state.today;
    if (!date) return;

    const info = getBodoDateInfo(date);
    const month = getMonthForDate(date);
    const bodoNumber = getBodoDateNumberFromInfo(info);

    if ($("selectedDateTitle")) {
      $("selectedDateTitle").textContent = month
        ? `${getBodoMonthName(month)} ${bodoNumber || ""}`
        : formatShortEnglishDate(date);
    }

    const details = $("selectedDateDetails");
    if (!details) return;

    const events = getEventsForDate(date);
    const notes = getNotesForDate(date);

    let html = `
      <div class="selected-date-main">
        <strong>${escapeHTML(formatEnglishDate(date))}</strong>
      </div>
    `;

    if (month) {
      html += `
        <div class="selected-date-bodo">
          Bodo Date:
          <strong>${escapeHTML(getBodoMonthName(month))} ${escapeHTML(bodoNumber || "")}</strong>
        </div>
      `;
    }

    if (events.length) {
      html += `
        <div class="selected-date-events">
          <strong>🎉 Events</strong>
          <ul>
      `;
      events.forEach((event) => {
        html += `<li>${escapeHTML(event.title || event.name || "Event")}</li>`;
      });
      html += `</ul></div>`;
    }

    if (notes.length) {
      html += `
        <div class="selected-date-notes">
          <strong>📝 My Notes</strong>
          <ul>
      `;
      notes.forEach((note) => {
        html += `<li>${escapeHTML(note.title || "Personal note")}</li>`;
      });
      html += `</ul></div>`;
    }

    if (!events.length && !notes.length) {
      html += `<p class="selected-date-empty">No event or personal note for this date.</p>`;
    }

    details.innerHTML = html;
  }

  /* =======================================================
     DATE MODAL
     ======================================================= */

  function openDateModal(date) {
    const modal = $("dateModal");
    if (!modal) return;

    const info = getBodoDateInfo(date);
    const month = getMonthForDate(date);
    const bodoNumber = getBodoDateNumberFromInfo(info);

    if ($("dateModalTitle")) {
      $("dateModalTitle").textContent = month
        ? `${getBodoMonthName(month)} ${bodoNumber || ""}`
        : formatShortEnglishDate(date);
    }

    const body = $("dateModalBody");
    if (!body) return;

    const events = getEventsForDate(date);
    const notes = getNotesForDate(date);

    let html = `
      <div class="date-detail-block">
        <span class="detail-label">GREGORIAN DATE</span>
        <strong>${escapeHTML(formatEnglishDate(date))}</strong>
      </div>
    `;

    if (month) {
      html += `
        <div class="date-detail-block">
          <span class="detail-label">BODO DATE</span>
          <strong>${escapeHTML(getBodoMonthName(month))} ${escapeHTML(bodoNumber || "")}</strong>
          ${getBodoNativeName(month) ? `<small>${escapeHTML(getBodoNativeName(month))}</small>` : ""}
        </div>
      `;
    }

    html += `
      <div class="date-detail-block">
        <span class="detail-label">WEEKDAY</span>
        <strong>${escapeHTML(date.toLocaleDateString("en-IN", { weekday: "long" }))}</strong>
      </div>
    `;

    if (events.length) {
      html += `<div class="date-detail-events"><h3>🎉 Events</h3>`;
      events.forEach((event) => {
        const type = event.type || event.category || "Cultural Event";
        const description = event.description || event.details || "";
        html += `
          <article class="date-event-item">
            <strong>${escapeHTML(event.title || event.name || "Event")}</strong>
            <span>${escapeHTML(type)}</span>
            ${description ? `<p>${escapeHTML(description)}</p>` : ""}
          </article>
        `;
      });
      html += `</div>`;
    }

    if (notes.length) {
      html += `<div class="date-detail-notes"><h3>📝 My Notes</h3>`;
      notes.forEach((note) => {
        html += `
          <article class="date-note-item">
            <strong>${escapeHTML(note.title || "Personal Note")}</strong>
            ${note.category ? `<span>${escapeHTML(note.category)}</span>` : ""}
            ${note.description ? `<p>${escapeHTML(note.description)}</p>` : ""}
          </article>
        `;
      });
      html += `</div>`;
    }

    if (!events.length && !notes.length) {
      html += `
        <div class="empty-state">
          <span>🌿</span>
          <p>No event or personal note for this date.</p>
        </div>
      `;
    }

    body.innerHTML = html;

    const noteDate = $("noteDate");
    if (noteDate) {
      noteDate.value = createDateKey(date);
    }

    modal.classList.remove("hidden");
    document.body.classList.add("modal-open");
  }

  function closeDateModal() {
    const modal = $("dateModal");
    if (modal) {
      modal.classList.add("hidden");
    }
    document.body.classList.remove("modal-open");
  }

  /* =======================================================
     EVENTS SIDEBAR
     ======================================================= */

  function renderEvents() {
    const container = $("eventsList");
    if (!container) return;

    const events = getEventsForMonth(state.selectedMonthId);
    container.innerHTML = "";

    if (!events.length) {
      container.innerHTML = createEmptyState("No events listed for this month.");
      return;
    }

    events.forEach((event) => {
      const item = document.createElement("article");
      item.className = "event-list-item";

      const eventDate = event.date || event.gregorianDate || null;
      const dateText = eventDate
        ? formatShortEnglishDate(normalizeDate(eventDate))
        : event.bodoDate
        ? `Bodo Date ${event.bodoDate}`
        : "";

      item.innerHTML = `
        <div class="event-list-icon">${escapeHTML(event.icon || "🎉")}</div>
        <div class="event-list-content">
          <strong>${escapeHTML(event.title || event.name || "Event")}</strong>
          ${dateText ? `<small>${escapeHTML(dateText)}</small>` : ""}
          ${
            event.description || event.details
              ? `<p>${escapeHTML(event.description || event.details)}</p>`
              : ""
          }
        </div>
      `;

      container.appendChild(item);
    });
  }

  /* =======================================================
     HISTORY / TODAY EVENTS
     ======================================================= */

  function renderHistory() {
    const container = $("historyList");
    if (!container) return;

    const events = getEventsForDate(state.today);
    const historical = events.filter((event) => {
      const type = String(event.type || event.category || "").toLowerCase();
      return (
        type.includes("history") ||
        type.includes("birth") ||
        type.includes("death") ||
        type.includes("anniversary") ||
        type.includes("remembrance")
      );
    });

    container.innerHTML = "";

    if (!historical.length) {
      container.innerHTML = createEmptyState("No historical entry for today.");
      return;
    }

    historical.forEach((event) => {
      const item = document.createElement("article");
      item.className = "history-list-item";

      item.innerHTML = `
        <div class="history-icon">📜</div>
        <div>
          <strong>${escapeHTML(event.title || event.name || "Historical Event")}</strong>
          ${
            event.description || event.details
              ? `<p>${escapeHTML(event.description || event.details)}</p>`
              : ""
          }
        </div>
      `;

      container.appendChild(item);
    });
  }

  /* =======================================================
     SEASON
     ======================================================= */

  function updateSeason(month) {
    if (!month) return;

    const title = $("seasonTitle");
    const description = $("seasonDescription");

    const season = month.season || month.seasonName || "Bodo Seasonal Cycle";
    const seasonDescription =
      month.seasonDescription ||
      month.description ||
      "This month is part of the traditional Bodo solar calendar cycle.";

    if (title) title.textContent = season;
    if (description) description.textContent = seasonDescription;
  }

  /* =======================================================
     LIVE TODAY / TOMORROW / DAY AFTER TOMORROW
     ======================================================= */

  function renderLiveStatus() {
    const dates = [
      { date: state.today, target: "todayAlertText", card: "todayStatusCard" },
      { date: state.tomorrow, target: "tomorrowAlertText", card: "tomorrowStatusCard" },
      { date: state.dayAfterTomorrow, target: "dayAfterTomorrowAlertText", card: "dayAfterTomorrowStatusCard" }
    ];

    dates.forEach((item) => {
      const target = $(item.target);
      const card = $(item.card);
      if (!target) return;

      const info = getBodoDateInfo(item.date);
      const month = getMonthForDate(item.date);
      const bodoNumber = getBodoDateNumberFromInfo(info);
      const events = getEventsForDate(item.date);
      const notes = getNotesForDate(item.date);

      let html = "";
      if (month) {
        html += `<div class="live-bodo-date">${escapeHTML(getBodoMonthName(month))} ${escapeHTML(bodoNumber || "")}</div>`;
      }

      html += `<div class="live-gregorian-date">${escapeHTML(formatShortEnglishDate(item.date))}</div>`;

      if (events.length) {
        html += `
          <div class="live-event-summary">
            🎉 ${events.length === 1 ? escapeHTML(events[0].title || events[0].name || "Event") : `${events.length} events`}
          </div>
        `;
      } else {
        html += `<div class="live-no-event">No major event listed</div>`;
      }

      if (notes.length) {
        html += `<div class="live-note-summary">📝 ${notes.length} personal note${notes.length > 1 ? "s" : ""}</div>`;
      }

      target.innerHTML = html;

      if (card) {
        card.classList.toggle("has-event", events.length > 0);
        card.classList.toggle("has-note", notes.length > 0);
      }
    });

    if ($("liveStatusUpdated")) {
      $("liveStatusUpdated").textContent = `Updated ${formatEnglishDate(new Date(), {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      })}`;
    }

    renderCalendarSystemStatus();
  }

  function renderCalendarSystemStatus() {
    if ($("englishTodayStatus")) {
      $("englishTodayStatus").textContent = formatEnglishDate(state.today);
    }

    const info = getBodoDateInfo(state.today);
    const month = getMonthForDate(state.today);
    const bodoNumber = getBodoDateNumberFromInfo(info);

    if ($("bodoTodayStatus")) {
      $("bodoTodayStatus").textContent = month
        ? `${getBodoMonthName(month)} ${bodoNumber || ""}`
        : "Bodo date available";
    }

    if ($("assameseTodayStatus")) {
      $("assameseTodayStatus").textContent = getAssameseReferenceText(state.today);
    }
  }

  function getAssameseReferenceText(date) {
    if (
      window.BodoCalendarAssamese &&
      typeof window.BodoCalendarAssamese.getTodayReference === "function"
    ) {
      return (
        window.BodoCalendarAssamese.getTodayReference(date) ||
        "Reference available"
      );
    }
    return "Reference layer";
  }

  /* =======================================================
     MONTH REFERENCE TABLE
     ======================================================= */

  function renderMonthReference() {
    const tbody = $("monthReferenceBody");
    if (!tbody) return;

    const months = getMonths();
    tbody.innerHTML = "";
    if (!months.length) return;

    months.forEach((month, index) => {
      const row = document.createElement("tr");
      let range = month.dateRange || month.gregorianRange || "";

      if (!range) {
        let start = getMonthStartDateHelper(month);
        if (start) {
          let end = addDays(start, (month.days || 30) - 1);
          range = `${formatShortEnglishDate(start)} — ${formatShortEnglishDate(end)}`;
        }
      }

      row.innerHTML = `
        <td>${index + 1}</td>
        <td><strong>${escapeHTML(getBodoMonthName(month))}</strong></td>
        <td>${escapeHTML(getBodoNativeName(month))}</td>
        <td>${escapeHTML(range || "Approximate reference")}</td>
      `;

      tbody.appendChild(row);
    });
  }

  /* =======================================================
     NAVIGATE MONTH
     ======================================================= */

  function changeMonth(direction) {
    const months = getMonths();
    if (!months.length) return;

    let currentIndex = months.findIndex(
      (month) => String(month.id) === String(state.selectedMonthId)
    );

    if (currentIndex < 0) currentIndex = 0;

    currentIndex += direction;
    if (currentIndex < 0) currentIndex = months.length - 1;
    if (currentIndex >= months.length) currentIndex = 0;

    state.selectedMonthId = months[currentIndex].id;
    state.selectedDate = null;

    updateCalendarView();
  }

  function goToToday() {
    state.today = getToday();
    state.tomorrow = addDays(state.today, 1);
    state.dayAfterTomorrow = addDays(state.today, 2);

    const month = getMonthForDate(state.today);
    if (month) {
      state.selectedMonthId = month.id;
    }

    state.selectedDate = state.today;

    updateCalendarView();
    renderSelectedDate();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateCalendarView() {
    renderMonthSelector();
    renderMonthBanner();
    renderWeekdayHeader();
    renderCalendar();
    renderEvents();
    renderHistory();
    renderMonthReference();
    renderSelectedDate();
  }

  /* =======================================================
     WELCOME & NOTIFICATIONS & INSTALL PROMPT
     ======================================================= */

  function setupWelcomeCard() {
    const card = $("welcomeCard");
    const close = $("closeWelcomeBtn");
    if (!card) return;

    try {
      if (localStorage.getItem(WELCOME_STORAGE_KEY) === "true") {
        card.classList.add("hidden");
      }
    } catch (e) {}

    if (close) {
      close.addEventListener("click", function () {
        card.classList.add("hidden");
        try {
          localStorage.setItem(WELCOME_STORAGE_KEY, "true");
        } catch (e) {}
      });
    }
  }

  async function loadNotifications() {
    const panel = $("notificationPanel");
    if (!panel) return;

    try {
      const response = await fetch(NOTIFICATION_URL, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const notifications = Array.isArray(data)
        ? data
        : data.notifications || [data.notification || {}];

      state.notifications = notifications;

      const active = notifications.find((n) => n.enabled !== false && n.active !== false);
      if (active) {
        if ($("notificationTitle")) $("notificationTitle").textContent = active.title || "Update";
        if ($("notificationBadge")) $("notificationBadge").textContent = active.badge || "UPDATE";
        if ($("notificationMessage")) $("notificationMessage").textContent = active.message || "";
        panel.classList.remove("hidden");
      } else {
        panel.classList.add("hidden");
      }
    } catch (error) {
      panel.classList.add("hidden");
    }
  }

  function setupNotificationClose() {
    const button = $("closeNotificationBtn");
    const panel = $("notificationPanel");
    if (button && panel) {
      button.addEventListener("click", () => panel.classList.add("hidden"));
    }
  }

  /* =======================================================
     NOTES UI & FORMS
     ======================================================= */

  function openNoteModal(date = null) {
    const modal = $("noteModal");
    if (!modal) return;

    const selected = date || state.selectedDate || state.today;
    if ($("noteDate")) $("noteDate").value = createDateKey(selected);
    if ($("noteForm")) {
      $("noteForm").reset();
      if ($("noteDate")) $("noteDate").value = createDateKey(selected);
    }

    modal.classList.remove("hidden");
    document.body.classList.add("modal-open");
  }

  function closeNoteModal() {
    const modal = $("noteModal");
    if (modal) modal.classList.add("hidden");
    document.body.classList.remove("modal-open");
  }

  function openNotesList() {
    const modal = $("notesListModal");
    if (!modal) return;

    const container = $("notesListContainer");
    if (container) {
      const notes = getAllNotes();
      container.innerHTML = "";

      if (!notes.length) {
        container.innerHTML = createEmptyState("You have no personal notes yet.");
      } else {
        notes.forEach((note) => {
          const item = document.createElement("article");
          item.className = "note-list-item";
          item.innerHTML = `
            <div class="note-list-icon">📝</div>
            <div class="note-list-content">
              <strong>${escapeHTML(note.title || "Personal Note")}</strong>
              <small>${escapeHTML(note.date || "")}</small>
              ${note.description ? `<p>${escapeHTML(note.description)}</p>` : ""}
            </div>
          `;
          container.appendChild(item);
        });
      }
    }

    modal.classList.remove("hidden");
    document.body.classList.add("modal-open");
  }

  function closeNotesList() {
    const modal = $("notesListModal");
    if (modal) modal.classList.add("hidden");
    document.body.classList.remove("modal-open");
  }

  function setupNoteForm() {
    const form = $("noteForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!window.BodoCalendarNotes || typeof window.BodoCalendarNotes.saveNote !== "function") {
        showToast("Notes system is not available.", "error");
        return;
      }

      const date = $("noteDate") ? $("noteDate").value : createDateKey(state.today);
      const category = $("noteCategory") ? $("noteCategory").value : "Other";
      const title = $("noteTitle") ? $("noteTitle").value.trim() : "";
      const description = $("noteDescription") ? $("noteDescription").value.trim() : "";

      if (!title) {
        showToast("Please enter a note title.", "error");
        return;
      }

      window.BodoCalendarNotes.saveNote({
        id: "note-" + Date.now(),
        date,
        category,
        title,
        description,
        createdAt: new Date().toISOString()
      });

      closeNoteModal();
      updateCalendarView();
      renderLiveStatus();
      showToast("Personal note saved successfully.", "success");
    });
  }

  /* =======================================================
     MODAL BUTTONS & NAVIGATION SETUP
     ======================================================= */

  function setupModalButtons() {
    if ($("closeDateModalBtn")) $("closeDateModalBtn").addEventListener("click", closeDateModal);
    if ($("closeDateModalBottomBtn")) $("closeDateModalBottomBtn").addEventListener("click", closeDateModal);
    if ($("closeNoteModalBtn")) $("closeNoteModalBtn").addEventListener("click", closeNoteModal);
    if ($("cancelNoteBtn")) $("cancelNoteBtn").addEventListener("click", closeNoteModal);
    if ($("closeNotesListBtn")) $("closeNotesListBtn").addEventListener("click", closeNotesList);

    if ($("addNoteFromDateBtn")) {
      $("addNoteFromDateBtn").addEventListener("click", function () {
        closeDateModal();
        openNoteModal(state.selectedDate || state.today);
      });
    }

    /* Modal Backdrop / Overlay Clicks */
    ["dateModal", "noteModal", "notesListModal"].forEach((modalId) => {
      const modal = $(modalId);
      if (modal) {
        modal.addEventListener("click", function (e) {
          if (e.target === modal) {
            closeDateModal();
            closeNoteModal();
            closeNotesList();
          }
        });
      }
    });

    /* Keyboard Navigation & Escape Key */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeDateModal();
        closeNoteModal();
        closeNotesList();
      }

      // Arrow Key Month Navigation when no modal is active
      if (!document.body.classList.contains("modal-open")) {
        if (e.key === "ArrowLeft") {
          changeMonth(-1);
        } else if (e.key === "ArrowRight") {
          changeMonth(1);
        }
      }
    });
  }

  function setupNavigation() {
    if ($("prevMonthBtn")) $("prevMonthBtn").addEventListener("click", () => changeMonth(-1));
    if ($("nextMonthBtn")) $("nextMonthBtn").addEventListener("click", () => changeMonth(1));
    if ($("todayBtn")) $("todayBtn").addEventListener("click", goToToday);

    const select = $("monthSelect");
    if (select) {
      select.addEventListener("change", function () {
        state.selectedMonthId = select.value;
        state.selectedDate = null;
        updateCalendarView();
      });
    }
  }

  function setupFooterButtons() {
    if ($("footerNotesBtn")) $("footerNotesBtn").addEventListener("click", openNotesList);
    if ($("openNotesBtn")) $("openNotesBtn").addEventListener("click", openNotesList);
  }

  function setupInstallPrompt() {
    const installButton = $("installAppBtn");

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      state.deferredInstallPrompt = e;
      if (installButton) installButton.classList.remove("hidden");
    });

    if (installButton) {
      installButton.addEventListener("click", async () => {
        if (!state.deferredInstallPrompt) return;
        state.deferredInstallPrompt.prompt();
        const { outcome } = await state.deferredInstallPrompt.userChoice;
        if (outcome === "accepted") {
          showToast("Thank you for installing Bodo Calendar!", "success");
        }
        state.deferredInstallPrompt = null;
        installButton.classList.add("hidden");
      });
    }
  }

  function showToast(message, type = "info") {
    const container = $("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  window.showToast = showToast;

  function hideLoadingScreen() {
    const screen = $("loadingScreen");
    if (screen) {
      screen.classList.add("hidden");
      setTimeout(() => {
        if (screen.parentNode) screen.style.display = "none";
      }, 500);
    }
  }

  /* =======================================================
     INITIALIZE APP
     ======================================================= */

  async function initApp() {
    if (state.initialized) return;
    state.initialized = true;

    try {
      state.today = getToday();
      state.tomorrow = addDays(state.today, 1);
      state.dayAfterTomorrow = addDays(state.today, 2);

      detectCurrentMonth();

      renderMonthSelector();
      renderWeekdayHeader();
      renderMonthBanner();
      renderCalendar();
      renderSelectedDate();
      renderEvents();
      renderHistory();
      renderMonthReference();
      renderLiveStatus();

      setupNavigation();
      setupWelcomeCard();
      setupNotificationClose();
      setupModalButtons();
      setupNoteForm();
      setupFooterButtons();
      setupInstallPrompt();

      if (window.BodoCalendarVIP && typeof window.BodoCalendarVIP.initVIP === "function") {
        window.BodoCalendarVIP.initVIP();
      }

      loadNotifications();

      if ($("copyrightYear")) {
        $("copyrightYear").textContent = new Date().getFullYear();
      }

      setTimeout(hideLoadingScreen, 150);
    } catch (error) {
      console.error("Initialization error:", error);
      hideLoadingScreen();
    }
  }

  window.BodoCalendarApp = {
    state,
    init: initApp,
    goToToday,
    changeMonth,
    selectDate,
    updateCalendarView
  };

  window.BODO_APP_READY = true;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp, { once: true });
  } else {
    initApp();
  }
})();
