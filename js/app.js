/* =========================================================
   BODO CALENDAR — MAIN APPLICATION
   Version: 6.0

   Connects:
   - calendar-data.js
   - events.js
   - notes.js
   - vip.js

   Main responsibilities:
   - Calendar rendering
   - Month navigation
   - Today / Tomorrow / Day-after-tomorrow
   - Events
   - History
   - Notes
   - Date modal
   - Notifications
   - Assamese reference display
   - PWA install button
   - Loading screen
   ========================================================= */

(function () {
  "use strict";

  /* =======================================================
     CONFIG
     ======================================================= */

  const APP_VERSION = "6.0";

  const NOTIFICATION_URL =
    "./notifications.json?v=" + Date.now();

  const WELCOME_STORAGE_KEY =
    "bodo_calendar_welcome_closed_v1";

  const NOTIFICATION_STORAGE_KEY =
    "bodo_calendar_notification_closed_v1";


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
    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    return String(value);
  }


  /* =======================================================
     DATE HELPERS
     ======================================================= */

  function normalizeDate(date) {

    if (
      window.BodoCalendarData &&
      typeof window.BodoCalendarData.normalizeDate ===
        "function"
    ) {
      return window.BodoCalendarData.normalizeDate(
        date
      );
    }

    const d =
      date instanceof Date
        ? new Date(date.getTime())
        : new Date(date);

    d.setHours(0, 0, 0, 0);

    return d;
  }


  function createDateKey(date) {

    const d =
      normalizeDate(date);

    const y =
      d.getFullYear();

    const m =
      String(d.getMonth() + 1).padStart(2, "0");

    const day =
      String(d.getDate()).padStart(2, "0");

    return `${y}-${m}-${day}`;
  }


  function addDays(date, amount) {

    const d =
      normalizeDate(date);

    d.setDate(
      d.getDate() + amount
    );

    return d;
  }


  function getToday() {
    return normalizeDate(
      new Date()
    );
  }


  /* =======================================================
     DATA ACCESS
     ======================================================= */

  function getMonths() {

    if (
      window.BodoCalendarData &&
      Array.isArray(
        window.BodoCalendarData.bodoMonthsData
      )
    ) {
      return window.BodoCalendarData.bodoMonthsData;
    }

    if (
      Array.isArray(
        window.bodoMonthsData
      )
    ) {
      return window.bodoMonthsData;
    }

    return [];
  }


  function getWeekdays() {

    if (
      window.BodoCalendarData &&
      Array.isArray(
        window.BodoCalendarData.bodoWeekdays
      )
    ) {
      return window.BodoCalendarData.bodoWeekdays;
    }

    if (
      Array.isArray(
        window.bodoWeekdays
      )
    ) {
      return window.bodoWeekdays;
    }

    return [];
  }


  function getMonthForDate(date) {

    if (
      window.BodoCalendarData &&
      typeof window.BodoCalendarData.getBodoMonthForDate ===
        "function"
    ) {
      return window.BodoCalendarData.getBodoMonthForDate(
        date
      );
    }

    return null;
  }


  function getBodoDateInfo(date) {

    if (
      window.BodoCalendarData &&
      typeof window.BodoCalendarData.getBodoDateInfo ===
        "function"
    ) {
      return window.BodoCalendarData.getBodoDateInfo(
        date
      );
    }

    return null;
  }


  function getMonthById(id) {

    const months =
      getMonths();

    return (
      months.find(
        month =>
          String(month.id) ===
          String(id)
      ) || null
    );
  }


  /* =======================================================
     EVENT DATA ACCESS
     ======================================================= */

  function getEventsForDate(date) {

    const events =
      window.BodoCalendarEvents;

    if (
      events &&
      typeof events.getEventsForDate ===
        "function"
    ) {
      return events.getEventsForDate(
        date
      ) || [];
    }

    if (
      window.BodoCalendarEvents &&
      typeof window.BodoCalendarEvents.getEventsByDate ===
        "function"
    ) {
      return window.BodoCalendarEvents.getEventsByDate(
        date
      ) || [];
    }

    return [];
  }


  function getEventsForMonth(monthId) {

    const events =
      window.BodoCalendarEvents;

    if (
      events &&
      typeof events.getEventsForMonth ===
        "function"
    ) {
      return events.getEventsForMonth(
        monthId
      ) || [];
    }

    if (
      events &&
      typeof events.getMonthEvents ===
        "function"
    ) {
      return events.getMonthEvents(
        monthId
      ) || [];
    }

    return [];
  }


  /* =======================================================
     NOTES DATA ACCESS
     ======================================================= */

  function getNotesForDate(date) {

    const notes =
      window.BodoCalendarNotes;

    if (
      notes &&
      typeof notes.getNotesForDate ===
        "function"
    ) {
      return notes.getNotesForDate(
        createDateKey(date)
      ) || [];
    }

    return [];
  }


  function getAllNotes() {

    const notes =
      window.BodoCalendarNotes;

    if (
      notes &&
      typeof notes.getAllNotes ===
        "function"
    ) {
      return notes.getAllNotes() || [];
    }

    return [];
  }


  /* =======================================================
     FORMATTERS
     ======================================================= */

  function formatEnglishDate(
    date,
    options
  ) {

    const d =
      normalizeDate(date);

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

    return formatEnglishDate(
      date,
      {
        day: "numeric",
        month: "short",
        year: "numeric"
      }
    );
  }


  function getBodoDateNumberFromInfo(info) {

    if (!info) {
      return null;
    }

    return (
      info.bodoDate ??
      info.dateNumber ??
      info.day ??
      info.dayNumber ??
      null
    );
  }


  function getBodoMonthName(month) {

    if (!month) {
      return "Bodo Month";
    }

    return (
      month.name ||
      month.englishName ||
      month.title ||
      "Bodo Month"
    );
  }


  function getBodoNativeName(month) {

    if (!month) {
      return "";
    }

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

    const today =
      state.today;

    const month =
      getMonthForDate(today);

    if (month) {

      state.selectedMonthId =
        month.id;

      return month;
    }

    const months =
      getMonths();

    if (months.length) {

      state.selectedMonthId =
        months[0].id;

      return months[0];
    }

    return null;
  }


  /* =======================================================
     MONTH SELECTOR
     ======================================================= */

  function renderMonthSelector() {

    const select =
      $("monthSelect");

    if (!select) {
      return;
    }

    const months =
      getMonths();

    select.innerHTML = "";

    months.forEach(
      (month, index) => {

        const option =
          document.createElement(
            "option"
          );

        option.value =
          String(month.id);

        const name =
          getBodoMonthName(month);

        const native =
          getBodoNativeName(month);

        option.textContent =
          native
            ? `${name} — ${native}`
            : name;

        if (
          String(month.id) ===
          String(state.selectedMonthId)
        ) {
          option.selected =
            true;
        }

        select.appendChild(
          option
        );
      }
    );
  }


  /* =======================================================
     WEEKDAY HEADER
     ======================================================= */

  function renderWeekdayHeader() {

    const container =
      $("weekdayHeader");

    if (!container) {
      return;
    }

    const weekdays =
      getWeekdays();

    container.innerHTML = "";

    if (!weekdays.length) {

      const fallback = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ];

      fallback.forEach(
        day => {

          const item =
            document.createElement(
              "div"
            );

          item.className =
            "weekday-item";

          item.textContent =
            day;

          container.appendChild(
            item
          );
        }
      );

      return;
    }


    weekdays.forEach(
      (weekday, index) => {

        const item =
          document.createElement(
            "div"
          );

        item.className =
          "weekday-item";


        if (
          typeof weekday ===
          "string"
        ) {

          item.textContent =
            weekday;

        } else {

          const english =
            weekday.english ||
            weekday.name ||
            weekday.label ||
            "";

          const bodo =
            weekday.bodo ||
            weekday.nativeName ||
            weekday.native ||
            "";

          item.innerHTML =
            `<span>${escapeHTML(
              bodo || english
            )}</span>` +
            (
              bodo && english
                ? `<small>${escapeHTML(
                    english
                  )}</small>`
                : ""
            );
        }

        container.appendChild(
          item
        );
      }
    );
  }


  /* =======================================================
     HTML ESCAPE
     ======================================================= */

  function escapeHTML(value) {

    return safeText(value)
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  }


  /* =======================================================
     MONTH BANNER
     ======================================================= */

  function renderMonthBanner() {

    const month =
      getMonthById(
        state.selectedMonthId
      );

    if (!month) {
      return;
    }


    const name =
      getBodoMonthName(month);

    const native =
      getBodoNativeName(month);


    if ($("currentMonthName")) {

      $("currentMonthName")
        .textContent =
        name;
    }


    if ($("currentMonthNativeName")) {

      $("currentMonthNativeName")
        .textContent =
        native;
    }


    let startDate =
      null;

    let endDate =
      null;


    if (
      window.BodoCalendarData &&
      typeof window.BodoCalendarData.getBodoMonthStartDate ===
        "function"
    ) {

      startDate =
        window.BodoCalendarData.getBodoMonthStartDate(
          month
        );
    }


    if (
      window.BodoCalendarData &&
      typeof window.BodoCalendarData.getBodoMonthEndDate ===
        "function"
    ) {

      endDate =
        window.BodoCalendarData.getBodoMonthEndDate(
          month
        );
    }


    if (
      startDate &&
      endDate
    ) {

      if ($("currentMonthDateRange")) {

        $("currentMonthDateRange")
          .textContent =
          `${formatShortEnglishDate(
            startDate
          )} — ${formatShortEnglishDate(
            endDate
          )}`;
      }

    } else if (
      month.dateRange
    ) {

      $("currentMonthDateRange")
        .textContent =
        month.dateRange;

    } else {

      $("currentMonthDateRange")
        .textContent =
        "Gregorian date range reference";
    }


    if ($("monthSeasonLabel")) {

      const season =
        month.season ||
        month.seasonName ||
        "BODO SOLAR MONTH";

      $("monthSeasonLabel")
        .textContent =
        season;
    }


    updateSeason(month);
  }


  /* =======================================================
     CALENDAR GRID
     ======================================================= */

  function renderCalendar() {

    const grid =
      $("calendarGrid");

    if (!grid) {
      return;
    }

    const month =
      getMonthById(
        state.selectedMonthId
      );

    if (!month) {

      grid.innerHTML =
        createEmptyState(
          "Calendar month unavailable."
        );

      return;
    }


    let dates = [];


    if (
      window.BodoCalendarData &&
      typeof window.BodoCalendarData.generateMonthDates ===
        "function"
    ) {

      dates =
        window.BodoCalendarData.generateMonthDates(
          month.id
        ) || [];

    } else if (
      window.BodoCalendarData &&
      typeof window.BodoCalendarData.generateCalendarDates ===
        "function"
    ) {

      dates =
        window.BodoCalendarData.generateCalendarDates(
          month.id
        ) || [];
    }


    /*
     * Fallback generation from month start date.
     */

    if (!dates.length) {

      let startDate = null;

      let days = 30;

      if (
        typeof month.days ===
        "number"
      ) {
        days =
          month.days;
      }

      if (
        window.BodoCalendarData &&
        typeof window.BodoCalendarData.getBodoMonthStartDate ===
          "function"
      ) {

        startDate =
          window.BodoCalendarData.getBodoMonthStartDate(
            month
          );
      }


      if (startDate) {

        for (
          let i = 0;
          i < days;
          i++
        ) {

          dates.push({
            date:
              addDays(
                startDate,
                i
              ),
            bodoDate:
              i + 1,
            monthId:
              month.id
          });
        }
      }
    }


    grid.innerHTML = "";


    if (!dates.length) {

      grid.innerHTML =
        createEmptyState(
          "No calendar dates available."
        );

      return;
    }


    /*
     * Add empty weekday spaces before month start.
     */

    const firstDate =
      extractGregorianDate(
        dates[0]
      );


    if (firstDate) {

      const dayOfWeek =
        firstDate.getDay();

      for (
        let i = 0;
        i < dayOfWeek;
        i++
      ) {

        const blank =
          document.createElement(
            "div"
          );

        blank.className =
          "calendar-date blank-date";

        blank.setAttribute(
          "aria-hidden",
          "true"
        );

        grid.appendChild(
          blank
        );
      }
    }


    dates.forEach(
      (entry, index) => {

        const date =
          extractGregorianDate(
            entry
          );

        if (!date) {
          return;
        }


        const card =
          createDateCard(
            date,
            entry,
            month
          );

        grid.appendChild(
          card
        );
      }
    );
  }


  /* =======================================================
     EXTRACT DATE FROM CALENDAR ENTRY
     ======================================================= */

  function extractGregorianDate(
    entry
  ) {

    if (!entry) {
      return null;
    }


    if (
      entry instanceof Date
    ) {
      return normalizeDate(
        entry
      );
    }


    const possible =
      entry.date ||
      entry.gregorianDate ||
      entry.fullDate ||
      entry.calendarDate;


    if (
      possible instanceof Date
    ) {
      return normalizeDate(
        possible
      );
    }


    if (
      possible
    ) {

      const parsed =
        new Date(
          possible
        );

      if (
        !Number.isNaN(
          parsed.getTime()
        )
      ) {
        return normalizeDate(
          parsed
        );
      }
    }


    return null;
  }


  /* =======================================================
     CREATE DATE CARD
     ======================================================= */

  function createDateCard(
    date,
    entry,
    month
  ) {

    const card =
      document.createElement(
        "button"
      );

    card.type =
      "button";

    card.className =
      "calendar-date";


    const dateKey =
      createDateKey(
        date
      );


    const isToday =
      dateKey ===
      createDateKey(
        state.today
      );


    const isSelected =
      state.selectedDate &&
      dateKey ===
      createDateKey(
        state.selectedDate
      );


    const events =
      getEventsForDate(
        date
      );


    const notes =
      getNotesForDate(
        date
      );


    if (isToday) {

      card.classList.add(
        "today"
      );

      card.classList.add(
        "is-today"
      );
    }


    if (isSelected) {

      card.classList.add(
        "selected"
      );
    }


    if (events.length) {

      card.classList.add(
        "has-event"
      );

      card.classList.add(
        "event-date"
      );
    }


    if (notes.length) {

      card.classList.add(
        "has-note"
      );

      card.classList.add(
        "note-date"
      );
    }


    const info =
      getBodoDateInfo(
        date
      );


    let bodoNumber =
      getBodoDateNumberFromInfo(
        info
      );


    if (
      bodoNumber === null ||
      bodoNumber === undefined
    ) {

      bodoNumber =
        entry.bodoDate ??
        entry.day ??
        entry.dayNumber ??
        "";
    }


    const englishDay =
      date.getDate();


    const weekday =
      date.toLocaleDateString(
        "en-IN",
        {
          weekday: "short"
        }
      );


    card.innerHTML = `

      <span class="date-weekday">
        ${escapeHTML(weekday)}
      </span>

      <strong class="bodo-date-number">
        ${escapeHTML(bodoNumber)}
      </strong>

      <span class="gregorian-date">
        ${escapeHTML(englishDay)}
      </span>

      ${
        events.length
          ? `<span class="date-event-dot"
                    aria-label="Event"></span>`
          : ""
      }

      ${
        notes.length
          ? `<span class="date-note-dot"
                    aria-label="Personal note"></span>`
          : ""
      }

    `;


    card.setAttribute(
      "aria-label",
      `${getBodoMonthName(
        month
      )} ${bodoNumber}, ${formatEnglishDate(
        date
      )}`
    );


    card.addEventListener(
      "click",
      function () {

        selectDate(
          date
        );

      }
    );


    return card;
  }


  /* =======================================================
     EMPTY STATE
     ======================================================= */

  function createEmptyState(
    message
  ) {

    return `
      <div class="empty-state">
        <span>📅</span>
        <p>${escapeHTML(
          message
        )}</p>
      </div>
    `;
  }


  /* =======================================================
     SELECT DATE
     ======================================================= */

  function selectDate(
    date,
    openModal = true
  ) {

    state.selectedDate =
      normalizeDate(
        date
      );


    renderCalendar();

    renderSelectedDate();


    if (openModal) {

      openDateModal(
        state.selectedDate
      );
    }
  }


  /* =======================================================
     SELECTED DATE SIDEBAR
     ======================================================= */

  function renderSelectedDate() {

    const date =
      state.selectedDate ||
      state.today;


    if (!date) {
      return;
    }


    const info =
      getBodoDateInfo(
        date
      );


    const month =
      getMonthForDate(
        date
      );


    const bodoNumber =
      getBodoDateNumberFromInfo(
        info
      );


    if ($("selectedDateTitle")) {

      $("selectedDateTitle")
        .textContent =
        month
          ? `${getBodoMonthName(
              month
            )} ${bodoNumber || ""}`
          : formatShortEnglishDate(
              date
            );
    }


    const details =
      $("selectedDateDetails");


    if (!details) {
      return;
    }


    const events =
      getEventsForDate(
        date
      );


    const notes =
      getNotesForDate(
        date
      );


    let html = `

      <div class="selected-date-main">
        <strong>
          ${escapeHTML(
            formatEnglishDate(
              date
            )
          )}
        </strong>
      </div>

    `;


    if (
      month
    ) {

      html += `

        <div class="selected-date-bodo">
          Bodo Date:
          <strong>
            ${escapeHTML(
              getBodoMonthName(
                month
              )
            )}
            ${escapeHTML(
              bodoNumber || ""
            )}
          </strong>
        </div>

      `;
    }


    if (events.length) {

      html += `
        <div class="selected-date-events">
          <strong>🎉 Events</strong>
          <ul>
      `;

      events.forEach(
        event => {

          html += `
            <li>
              ${escapeHTML(
                event.title ||
                event.name ||
                "Event"
              )}
            </li>
          `;
        }
      );

      html += `
          </ul>
        </div>
      `;
    }


    if (notes.length) {

      html += `
        <div class="selected-date-notes">
          <strong>📝 My Notes</strong>
          <ul>
      `;

      notes.forEach(
        note => {

          html += `
            <li>
              ${escapeHTML(
                note.title ||
                "Personal note"
              )}
            </li>
          `;
        }
      );

      html += `
          </ul>
        </div>
      `;
    }


    if (
      !events.length &&
      !notes.length
    ) {

      html += `
        <p class="selected-date-empty">
          No event or personal note for this date.
        </p>
      `;
    }


    details.innerHTML =
      html;
  }


  /* =======================================================
     DATE MODAL
     ======================================================= */

  function openDateModal(
    date
  ) {

    const modal =
      $("dateModal");

    if (!modal) {
      return;
    }


    const info =
      getBodoDateInfo(
        date
      );


    const month =
      getMonthForDate(
        date
      );


    const bodoNumber =
      getBodoDateNumberFromInfo(
        info
      );


    if ($("dateModalTitle")) {

      $("dateModalTitle")
        .textContent =
        month
          ? `${getBodoMonthName(
              month
            )} ${bodoNumber || ""}`
          : formatShortEnglishDate(
              date
            );
    }


    const body =
      $("dateModalBody");


    if (!body) {
      return;
    }


    const events =
      getEventsForDate(
        date
      );


    const notes =
      getNotesForDate(
        date
      );


    let html = `

      <div class="date-detail-block">

        <span class="detail-label">
          GREGORIAN DATE
        </span>

        <strong>
          ${escapeHTML(
            formatEnglishDate(
              date
            )
          )}
        </strong>

      </div>

    `;


    if (month) {

      html += `

        <div class="date-detail-block">

          <span class="detail-label">
            BODO DATE
          </span>

          <strong>
            ${escapeHTML(
              getBodoMonthName(
                month
              )
            )}
            ${escapeHTML(
              bodoNumber || ""
            )}
          </strong>

          ${
            getBodoNativeName(
              month
            )
              ? `
                <small>
                  ${escapeHTML(
                    getBodoNativeName(
                      month
                    )
                  )}
                </small>
              `
              : ""
          }

        </div>

      `;
    }


    html += `

      <div class="date-detail-block">

        <span class="detail-label">
          WEEKDAY
        </span>

        <strong>
          ${escapeHTML(
            date.toLocaleDateString(
              "en-IN",
              {
                weekday:
                  "long"
              }
            )
          )}
        </strong>

      </div>

    `;


    if (events.length) {

      html += `
        <div class="date-detail-events">
          <h3>🎉 Events</h3>
      `;

      events.forEach(
        event => {

          const type =
            event.type ||
            event.category ||
            "Cultural Event";

          const description =
            event.description ||
            event.details ||
            "";


          html += `

            <article
              class="date-event-item"
            >

              <strong>
                ${escapeHTML(
                  event.title ||
                  event.name ||
                  "Event"
                )}
              </strong>

              <span>
                ${escapeHTML(
                  type
                )}
              </span>

              ${
                description
                  ? `
                    <p>
                      ${escapeHTML(
                        description
                      )}
                    </p>
                  `
                  : ""
              }

            </article>

          `;
        }
      );

      html += `
        </div>
      `;
    }


    if (notes.length) {

      html += `
        <div class="date-detail-notes">
          <h3>📝 My Notes</h3>
      `;

      notes.forEach(
        note => {

          html += `

            <article
              class="date-note-item"
            >

              <strong>
                ${escapeHTML(
                  note.title ||
                  "Personal Note"
                )}
              </strong>

              ${
                note.category
                  ? `
                    <span>
                      ${escapeHTML(
                        note.category
                      )}
                    </span>
                  `
                  : ""
              }

              ${
                note.description
                  ? `
                    <p>
                      ${escapeHTML(
                        note.description
                      )}
                    </p>
                  `
                  : ""
              }

            </article>

          `;
        }
      );

      html += `
        </div>
      `;
    }


    if (
      !events.length &&
      !notes.length
    ) {

      html += `
        <div class="empty-state">
          <span>🌿</span>
          <p>
            No event or personal note for this date.
          </p>
        </div>
      `;
    }


    body.innerHTML =
      html;


    const noteDate =
      $("noteDate");

    if (noteDate) {

      noteDate.value =
        createDateKey(
          date
        );
    }


    modal.classList.remove(
      "hidden"
    );


    document.body.classList.add(
      "modal-open"
    );
  }


  /* =======================================================
     CLOSE DATE MODAL
     ======================================================= */

  function closeDateModal() {

    const modal =
      $("dateModal");

    if (modal) {

      modal.classList.add(
        "hidden"
      );
    }


    document.body.classList.remove(
      "modal-open"
    );
  }


  /* =======================================================
     EVENTS SIDEBAR
     ======================================================= */

  function renderEvents() {

    const container =
      $("eventsList");

    if (!container) {
      return;
    }


    const events =
      getEventsForMonth(
        state.selectedMonthId
      );


    container.innerHTML =
      "";


    if (!events.length) {

      container.innerHTML =
        createEmptyState(
          "No events listed for this month."
        );

      return;
    }


    events.forEach(
      event => {

        const item =
          document.createElement(
            "article"
          );

        item.className =
          "event-list-item";


        const eventDate =
          event.date ||
          event.gregorianDate ||
          null;


        const dateText =
          eventDate
            ? formatShortEnglishDate(
                new Date(
                  eventDate
                )
              )
            : (
                event.bodoDate
                  ? `Bodo Date ${event.bodoDate}`
                  : ""
              );


        item.innerHTML = `

          <div class="event-list-icon">
            ${escapeHTML(
              event.icon ||
              "🎉"
            )}
          </div>

          <div class="event-list-content">

            <strong>
              ${escapeHTML(
                event.title ||
                event.name ||
                "Event"
              )}
            </strong>

            ${
              dateText
                ? `
                  <small>
                    ${escapeHTML(
                      dateText
                    )}
                  </small>
                `
                : ""
            }

            ${
              event.description ||
              event.details
                ? `
                  <p>
                    ${escapeHTML(
                      event.description ||
                      event.details
                    )}
                  </p>
                `
                : ""
            }

          </div>

        `;


        container.appendChild(
          item
        );
      }
    );
  }


  /* =======================================================
     HISTORY / TODAY EVENTS
     ======================================================= */

  function renderHistory() {

    const container =
      $("historyList");

    if (!container) {
      return;
    }


    const events =
      getEventsForDate(
        state.today
      );


    const historical =
      events.filter(
        event => {

          const type =
            String(
              event.type ||
              event.category ||
              ""
            ).toLowerCase();

          return (
            type.includes(
              "history"
            ) ||
            type.includes(
              "birth"
            ) ||
            type.includes(
              "death"
            ) ||
            type.includes(
              "anniversary"
            ) ||
            type.includes(
              "remembrance"
            )
          );
        }
      );


    container.innerHTML =
      "";


    if (!historical.length) {

      container.innerHTML =
        createEmptyState(
          "No historical entry for today."
        );

      return;
    }


    historical.forEach(
      event => {

        const item =
          document.createElement(
            "article"
          );

        item.className =
          "history-list-item";


        item.innerHTML = `

          <div class="history-icon">
            📜
          </div>

          <div>

            <strong>
              ${escapeHTML(
                event.title ||
                event.name ||
                "Historical Event"
              )}
            </strong>

            ${
              event.description ||
              event.details
                ? `
                  <p>
                    ${escapeHTML(
                      event.description ||
                      event.details
                    )}
                  </p>
                `
                : ""
            }

          </div>

        `;


        container.appendChild(
          item
        );
      }
    );
  }


  /* =======================================================
     SEASON
     ======================================================= */

  function updateSeason(
    month
  ) {

    if (!month) {
      return;
    }


    const title =
      $("seasonTitle");

    const description =
      $("seasonDescription");


    const season =
      month.season ||
      month.seasonName ||
      "Bodo Seasonal Cycle";


    const seasonDescription =
      month.seasonDescription ||
      month.description ||
      "This month is part of the traditional Bodo solar calendar cycle.";


    if (title) {

      title.textContent =
        season;
    }


    if (description) {

      description.textContent =
        seasonDescription;
    }
  }


  /* =======================================================
     LIVE TODAY / TOMORROW / DAY AFTER TOMORROW
     ======================================================= */

  function renderLiveStatus() {

    const dates = [
      {
        date:
          state.today,

        target:
          "todayAlertText",

        card:
          "todayStatusCard",

        label:
          "Today"
      },

      {
        date:
          state.tomorrow,

        target:
          "tomorrowAlertText",

        card:
          "tomorrowStatusCard",

        label:
          "Tomorrow"
      },

      {
        date:
          state.dayAfterTomorrow,

        target:
          "dayAfterTomorrowAlertText",

        card:
          "dayAfterTomorrowStatusCard",

        label:
          "Day after tomorrow"
      }
    ];


    dates.forEach(
      item => {

        const target =
          $(item.target);

        const card =
          $(item.card);


        if (!target) {
          return;
        }


        const info =
          getBodoDateInfo(
            item.date
          );


        const month =
          getMonthForDate(
            item.date
          );


        const bodoNumber =
          getBodoDateNumberFromInfo(
            info
          );


        const events =
          getEventsForDate(
            item.date
          );


        const notes =
          getNotesForDate(
            item.date
          );


        let html = "";


        if (month) {

          html += `

            <div class="live-bodo-date">
              ${escapeHTML(
                getBodoMonthName(
                  month
                )
              )}
              ${escapeHTML(
                bodoNumber || ""
              )}
            </div>

          `;
        }


        html += `

          <div class="live-gregorian-date">
            ${escapeHTML(
              formatShortEnglishDate(
                item.date
              )
            )}
          </div>

        `;


        if (events.length) {

          html += `

            <div class="live-event-summary">
              🎉
              ${
                events.length === 1
                  ? escapeHTML(
                      events[0].title ||
                      events[0].name ||
                      "Event"
                    )
                  : `${events.length} events`
              }
            </div>

          `;
        } else {

          html += `
            <div class="live-no-event">
              No major event listed
            </div>
          `;
        }


        if (notes.length) {

          html += `

            <div class="live-note-summary">
              📝 ${notes.length}
              personal note${
                notes.length > 1
                  ? "s"
                  : ""
              }
            </div>

          `;
        }


        target.innerHTML =
          html;


        if (card) {

          card.classList.toggle(
            "has-event",
            events.length > 0
          );

          card.classList.toggle(
            "has-note",
            notes.length > 0
          );
        }
      }
    );


    if ($("liveStatusUpdated")) {

      $("liveStatusUpdated")
        .textContent =
        `Updated ${formatEnglishDate(
          new Date(),
          {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
          }
        )}`;
    }


    renderCalendarSystemStatus();
  }


  /* =======================================================
     CALENDAR SYSTEM STATUS
     ======================================================= */

  function renderCalendarSystemStatus() {

    if ($("englishTodayStatus")) {

      $("englishTodayStatus")
        .textContent =
        formatEnglishDate(
          state.today
        );
    }


    const info =
      getBodoDateInfo(
        state.today
      );


    const month =
      getMonthForDate(
        state.today
      );


    const bodoNumber =
      getBodoDateNumberFromInfo(
        info
      );


    if ($("bodoTodayStatus")) {

      if (month) {

        $("bodoTodayStatus")
          .textContent =
          `${getBodoMonthName(
            month
          )} ${bodoNumber || ""}`;

      } else {

        $("bodoTodayStatus")
          .textContent =
          "Bodo date available";
      }
    }


    /*
     * Assamese calendar is a reference layer.
     * No fabricated Assamese date is generated here.
     */

    if ($("assameseTodayStatus")) {

      const assameseText =
        getAssameseReferenceText(
          state.today
        );

      $("assameseTodayStatus")
        .textContent =
        assameseText;
    }
  }


  /* =======================================================
     ASSAMESE REFERENCE
     ======================================================= */

  function getAssameseReferenceText(
    date
  ) {

    /*
     * If a future Assamese reference module exists,
     * use it.
     */

    if (
      window.BodoCalendarAssamese &&
      typeof window.BodoCalendarAssamese.getTodayReference ===
        "function"
    ) {

      return (
        window.BodoCalendarAssamese.getTodayReference(
          date
        ) ||
        "Reference available"
      );
    }


    /*
     * Do not invent an Assamese date.
     */

    return "Reference layer";
  }


  /* =======================================================
     MONTH REFERENCE TABLE
     ======================================================= */

  function renderMonthReference() {

    const tbody =
      $("monthReferenceBody");

    if (!tbody) {
      return;
    }


    const months =
      getMonths();


    tbody.innerHTML =
      "";


    if (!months.length) {
      return;
    }


    months.forEach(
      (month, index) => {

        const row =
          document.createElement(
            "tr"
          );


        let range =
          month.dateRange ||
          month.gregorianRange ||
          "";


        if (!range) {

          let start = null;
          let end = null;


          if (
            window.BodoCalendarData &&
            typeof window.BodoCalendarData.getBodoMonthStartDate ===
              "function"
          ) {

            start =
              window.BodoCalendarData.getBodoMonthStartDate(
                month
              );
          }


          if (
            window.BodoCalendarData &&
            typeof window.BodoCalendarData.getBodoMonthEndDate ===
              "function"
          ) {

            end =
              window.BodoCalendarData.getBodoMonthEndDate(
                month
              );
          }


          if (
            start &&
            end
          ) {

            range =
              `${formatShortEnglishDate(
                start
              )} — ${formatShortEnglishDate(
                end
              )}`;
          }
        }


        row.innerHTML = `

          <td>
            ${index + 1}
          </td>

          <td>
            <strong>
              ${escapeHTML(
                getBodoMonthName(
                  month
                )
              )}
            </strong>
          </td>

          <td>
            ${escapeHTML(
              getBodoNativeName(
                month
              )
            )}
          </td>

          <td>
            ${escapeHTML(
              range ||
              "Approximate reference"
            )}
          </td>

        `;


        tbody.appendChild(
          row
        );
      }
    );
  }


  /* =======================================================
     NAVIGATE MONTH
     ======================================================= */

  function changeMonth(
    direction
  ) {

    const months =
      getMonths();


    if (!months.length) {
      return;
    }


    let currentIndex =
      months.findIndex(
        month =>
          String(month.id) ===
          String(
            state.selectedMonthId
          )
      );


    if (
      currentIndex < 0
    ) {
      currentIndex =
        0;
    }


    currentIndex +=
      direction;


    /*
     * Wrap around for lifetime calendar navigation.
     */

    if (
      currentIndex < 0
    ) {
      currentIndex =
        months.length - 1;
    }


    if (
      currentIndex >=
      months.length
    ) {
      currentIndex =
        0;
    }


    state.selectedMonthId =
      months[currentIndex].id;


    state.selectedDate =
      null;


    updateCalendarView();
  }


  /* =======================================================
     GO TO TODAY
     ======================================================= */

  function goToToday() {

    state.today =
      getToday();

    state.tomorrow =
      addDays(
        state.today,
        1
      );

    state.dayAfterTomorrow =
      addDays(
        state.today,
        2
      );


    const month =
      getMonthForDate(
        state.today
      );


    if (month) {

      state.selectedMonthId =
        month.id;
    }


    state.selectedDate =
      state.today;


    updateCalendarView();


    renderSelectedDate();


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }


  /* =======================================================
     UPDATE CALENDAR VIEW
     ======================================================= */

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
     WELCOME CARD
     ======================================================= */

  function setupWelcomeCard() {

    const card =
      $("welcomeCard");

    const close =
      $("closeWelcomeBtn");


    if (!card) {
      return;
    }


    try {

      if (
        localStorage.getItem(
          WELCOME_STORAGE_KEY
        ) === "true"
      ) {

        card.classList.add(
          "hidden"
        );
      }

    } catch (error) {
      /* Ignore storage errors */
    }


    if (close) {

      close.addEventListener(
        "click",
        function () {

          card.classList.add(
            "hidden"
          );

          try {

            localStorage.setItem(
              WELCOME_STORAGE_KEY,
              "true"
            );

          } catch (error) {
            /* Ignore */
          }
        }
      );
    }
  }


  /* =======================================================
     NOTIFICATIONS
     ======================================================= */

  async function loadNotifications() {

    const panel =
      $("notificationPanel");


    if (!panel) {
      return;
    }


    try {

      const response =
        await fetch(
          NOTIFICATION_URL,
          {
            cache: "no-store"
          }
        );


      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }


      const data =
        await response.json();


      const notifications =
        normalizeNotifications(
          data
        );


      state.notifications =
        notifications;


      const active =
        findActiveNotification(
          notifications
        );


      if (active) {

        renderNotification(
          active
        );

      } else {

        panel.classList.add(
          "hidden"
        );
      }

    } catch (error) {

      console.warn(
        "Bodo Calendar notification load failed:",
        error
      );

      panel.classList.add(
        "hidden"
      );
    }
  }


  function normalizeNotifications(
    data
  ) {

    if (
      Array.isArray(data)
    ) {
      return data;
    }


    if (
      data &&
      Array.isArray(
        data.notifications
      )
    ) {
      return data.notifications;
    }


    if (
      data &&
      data.notification
    ) {
      return [
        data.notification
      ];
    }


    return [];
  }


  function findActiveNotification(
    notifications
  ) {

    const todayKey =
      createDateKey(
        state.today
      );


    return notifications.find(
      notification => {

        if (
          notification.enabled ===
          false
        ) {
          return false;
        }


        if (
          notification.active ===
          false
        ) {
          return false;
        }


        if (
          notification.startDate &&
          todayKey <
          notification.startDate
        ) {
          return false;
        }


        if (
          notification.endDate &&
          todayKey >
          notification.endDate
        ) {
          return false;
        }


        return true;
      }
    ) || null;
  }


  function renderNotification(
    notification
  ) {

    const panel =
      $("notificationPanel");


    if (!panel) {
      return;
    }


    if ($("notificationTitle")) {

      $("notificationTitle")
        .textContent =
        notification.title ||
        "Latest Update";
    }


    if ($("notificationBadge")) {

      $("notificationBadge")
        .textContent =
        notification.badge ||
        notification.type ||
        "UPDATE";
    }


    if ($("notificationMessage")) {

      $("notificationMessage")
        .textContent =
        notification.message ||
        notification.description ||
        "";
    }


    if ($("notificationDate")) {

      $("notificationDate")
        .textContent =
        notification.date ||
        notification.updatedAt ||
        "";
    }


    panel.classList.remove(
      "hidden"
    );
  }


  function setupNotificationClose() {

    const button =
      $("closeNotificationBtn");

    const panel =
      $("notificationPanel");


    if (
      !button ||
      !panel
    ) {
      return;
    }


    button.addEventListener(
      "click",
      function () {

        panel.classList.add(
          "hidden"
        );
      }
    );
  }


  /* =======================================================
     NOTES UI
     ======================================================= */

  function openNoteModal(
    date = null
  ) {

    const modal =
      $("noteModal");

    if (!modal) {
      return;
    }


    const selected =
      date ||
      state.selectedDate ||
      state.today;


    if ($("noteDate")) {

      $("noteDate").value =
        createDateKey(
          selected
        );
    }


    if ($("noteForm")) {

      $("noteForm").reset();

      if ($("noteDate")) {

        $("noteDate").value =
          createDateKey(
            selected
          );
      }
    }


    modal.classList.remove(
      "hidden"
    );


    document.body.classList.add(
      "modal-open"
    );
  }


  function closeNoteModal() {

    const modal =
      $("noteModal");

    if (modal) {

      modal.classList.add(
        "hidden"
      );
    }


    document.body.classList.remove(
      "modal-open"
    );
  }


  function renderNotesList() {

    const container =
      $("notesListContainer");

    if (!container) {
      return;
    }


    const notes =
      getAllNotes();


    container.innerHTML =
      "";


    if (!notes.length) {

      container.innerHTML =
        createEmptyState(
          "You have no personal notes yet."
        );

      return;
    }


    notes
      .slice()
      .sort(
        (a, b) =>
          String(
            a.date ||
            ""
          ).localeCompare(
            String(
              b.date ||
              ""
            )
          )
      )
      .forEach(
        note => {

          const item =
            document.createElement(
              "article"
            );

          item.className =
            "note-list-item";


          item.innerHTML = `

            <div class="note-list-icon">
              📝
            </div>

            <div class="note-list-content">

              <strong>
                ${escapeHTML(
                  note.title ||
                  "Personal Note"
                )}
              </strong>

              <small>
                ${escapeHTML(
                  note.date ||
                  ""
                )}
                ${
                  note.category
                    ? ` • ${escapeHTML(
                        note.category
                      )}`
                    : ""
                }
              </small>

              ${
                note.description
                  ? `
                    <p>
                      ${escapeHTML(
                        note.description
                      )}
                    </p>
                  `
                  : ""
              }

            </div>

          `;


          container.appendChild(
            item
          );
        }
      );
  }


  function openNotesList() {

    const modal =
      $("notesListModal");

    if (!modal) {
      return;
    }


    renderNotesList();


    modal.classList.remove(
      "hidden"
    );


    document.body.classList.add(
      "modal-open"
    );
  }


  function closeNotesList() {

    const modal =
      $("notesListModal");

    if (modal) {

      modal.classList.add(
        "hidden"
      );
    }


    document.body.classList.remove(
      "modal-open"
    );
  }


  /* =======================================================
     NOTE FORM
     ======================================================= */

  function setupNoteForm() {

    const form =
      $("noteForm");


    if (!form) {
      return;
    }


    form.addEventListener(
      "submit",
      function (event) {

        event.preventDefault();


        if (
          !window.BodoCalendarNotes ||
          typeof window.BodoCalendarNotes.saveNote !==
            "function"
        ) {

          showToast(
            "Notes system is not available.",
            "error"
          );

          return;
        }


        const date =
          $("noteDate")
            ? $("noteDate").value
            : createDateKey(
                state.today
              );


        const category =
          $("noteCategory")
            ? $("noteCategory").value
            : "Other";


        const title =
          $("noteTitle")
            ? $("noteTitle").value.trim()
            : "";


        const description =
          $("noteDescription")
            ? $("noteDescription").value.trim()
            : "";


        const reminder =
          $("noteReminder")
            ? $("noteReminder").checked
            : false;


        if (!title) {

          showToast(
            "Please enter a note title.",
            "error"
          );

          return;
        }


        try {

          window.BodoCalendarNotes.saveNote({

            id:
              "note-" +
              Date.now() +
              "-" +
              Math.random()
                .toString(36)
                .slice(2, 8),

            date,

            category,

            title,

            description,

            reminder,

            createdAt:
              new Date().toISOString(),

            updatedAt:
              new Date().toISOString()

          });


          closeNoteModal();


          updateCalendarView();

          renderLiveStatus();


          showToast(
            "Personal note saved successfully.",
            "success"
          );


        } catch (error) {

          console.error(
            "Note save error:",
            error
          );


          showToast(
            "Unable to save your note.",
            "error"
          );
        }
      }
    );
  }


  /* =======================================================
     MODAL BUTTONS
     ======================================================= */

  function setupModalButtons() {

    const closeDate =
      $("closeDateModalBtn");

    const closeDateBottom =
      $("closeDateModalBottomBtn");

    const addNote =
      $("addNoteFromDateBtn");


    if (closeDate) {

      closeDate.addEventListener(
        "click",
        closeDateModal
      );
    }


    if (closeDateBottom) {

      closeDateBottom.addEventListener(
        "click",
        closeDateModal
      );
    }


    if (addNote) {

      addNote.addEventListener(
        "click",
        function () {

          closeDateModal();

          openNoteModal(
            state.selectedDate ||
            state.today
          );
        }
      );
    }


    const closeNote =
      $("closeNoteModalBtn");

    const cancelNote =
      $("cancelNoteBtn");


    if (closeNote) {

      closeNote.addEventListener(
        "click",
        closeNoteModal
      );
    }


    if (cancelNote) {

      cancelNote.addEventListener(
        "click",
        closeNoteModal
      );
    }


    const closeNotes =
      $("closeNotesListBtn");


    if (closeNotes) {

      closeNotes.addEventListener(
        "click",
        closeNotesList
      );
    }


    /*
     * Close modal by clicking overlay.
     */

    [
      "dateModal",
      "noteModal",
      "notesListModal"
    ].forEach(
      id => {

        const modal =
          $(id);

        if (!modal) {
          return;
        }


        modal.addEventListener(
          "click",
          function (event) {

            if (
              event.target ===
              modal
            ) {

              if (
                id ===
                "dateModal"
              ) {
                closeDateModal();
              }

              if (
                id ===
                "noteModal"
              ) {
                closeNoteModal();
              }

              if (
                id ===
                "notesListModal"
              ) {
                closeNotesList();
              }
            }
          }
        );
      }
    );


    /*
     * Escape closes all modals.
     */

    document.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key !==
          "Escape"
        ) {
          return;
        }


        closeDateModal();

        closeNoteModal();

        closeNotesList();


        if (
          typeof window.closeVipModal ===
          "function"
        ) {
          window.closeVipModal();
        }
      }
    );
  }


  /* =======================================================
     NAVIGATION BUTTONS
     ======================================================= */

  function setupNavigation() {

    const prev =
      $("prevMonthBtn");

    const next =
      $("nextMonthBtn");

    const today =
      $("todayBtn");

    const select =
      $("monthSelect");


    if (prev) {

      prev.addEventListener(
        "click",
        function () {

          changeMonth(
            -1
          );
        }
      );
    }


    if (next) {

      next.addEventListener(
        "click",
        function () {

          changeMonth(
            1
          );
        }
      );
    }


    if (today) {

      today.addEventListener(
        "click",
        goToToday
      );
    }


    if (select) {

      select.addEventListener(
        "change",
        function () {

          state.selectedMonthId =
            select.value;

          state.selectedDate =
            null;

          updateCalendarView();
        }
      );
    }
  }


  /* =======================================================
     FOOTER BUTTONS
     ======================================================= */

  function setupFooterButtons() {

    const notes =
      $("footerNotesBtn");

    const vip =
      $("footerVipBtn");

    const about =
      $("footerAboutBtn");


    if (notes) {

      notes.addEventListener(
        "click",
        openNotesList
      );
    }


    if (vip) {

      vip.addEventListener(
        "click",
        function () {

          if (
            typeof window.openVipModal ===
            "function"
          ) {

            window.openVipModal();
          }
        }
      );
    }


    if (about) {

      about.addEventListener(
        "click",
        function () {

          const aboutSection =
            document.querySelector(
              ".about-calendar-card"
            );

          if (aboutSection) {

            aboutSection.scrollIntoView({
              behavior:
                "smooth",
              block:
                "center"
            });
          }
        }
      );
    }
  }


  /* =======================================================
     NOTES QUICK BUTTON
     ======================================================= */

  function setupNotesButton() {

    const button =
      $("openNotesBtn");

    if (button) {

      button.addEventListener(
        "click",
        openNotesList
      );
    }
  }


  /* =======================================================
     WELCOME / APP INSTALL
     ======================================================= */

  function setupInstallPrompt() {

    const installButton =
      $("installAppBtn");


    window.addEventListener(
      "beforeinstallprompt",
      function (event) {

        event.preventDefault();

        state.deferredInstallPrompt =
          event;


        if (installButton) {

          installButton.classList.remove(
            "hidden"
          );
        }
      }
    );


    if (installButton) {

      installButton.addEventListener(
        "click",
        async function () {

          if (
            !state.deferredInstallPrompt
          ) {

            showToast(
              "Install option is not available right now.",
              "info"
            );

            return;
          }


          state.deferredInstallPrompt
            .prompt();


          const result =
            await state.deferredInstallPrompt
              .userChoice;


          if (
            result &&
            result.outcome ===
            "accepted"
          ) {

            installButton.classList.add(
              "hidden"
            );
          }


          state.deferredInstallPrompt =
            null;
        }
      );
    }
  }


  /* =======================================================
     TOAST
     ======================================================= */

  function showToast(
    message,
    type = "info"
  ) {

    const container =
      $("toastContainer");


    if (!container) {

      console.log(
        message
      );

      return;
    }


    const toast =
      document.createElement(
        "div"
      );


    toast.className =
      `toast toast-${type}`;


    toast.textContent =
      message;


    container.appendChild(
      toast
    );


    requestAnimationFrame(
      function () {

        toast.classList.add(
          "show"
        );
      }
    );


    setTimeout(
      function () {

        toast.classList.remove(
          "show"
        );


        setTimeout(
          function () {

            toast.remove();

          },
          300
        );

      },
      3500
    );
  }


  window.showToast =
    showToast;


  /* =======================================================
     MIDNIGHT AUTO UPDATE
     ======================================================= */

  function scheduleMidnightUpdate() {

    const now =
      new Date();


    const next =
      new Date(
        now
      );


    next.setHours(
      24,
      0,
      2,
      0
    );


    const delay =
      Math.max(
        1000,
        next.getTime() -
        now.getTime()
      );


    setTimeout(
      function () {

        refreshLiveDate();

        scheduleMidnightUpdate();

      },
      delay
    );
  }


  function refreshLiveDate() {

    state.today =
      getToday();

    state.tomorrow =
      addDays(
        state.today,
        1
      );

    state.dayAfterTomorrow =
      addDays(
        state.today,
        2
      );


    const currentMonth =
      getMonthForDate(
        state.today
      );


    if (currentMonth) {

      state.selectedMonthId =
        currentMonth.id;
    }


    updateCalendarView();

    renderLiveStatus();

    loadNotifications();
  }


  /* =======================================================
     VISIBILITY / BACKGROUND RETURN
     ======================================================= */

  function setupVisibilityRefresh() {

    document.addEventListener(
      "visibilitychange",
      function () {

        if (
          !document.hidden
        ) {

          const freshToday =
            getToday();


          if (
            createDateKey(
              freshToday
            ) !==
            createDateKey(
              state.today
            )
          ) {

            refreshLiveDate();
          }
        }
      }
    );
  }


  /* =======================================================
     LOADING SCREEN
     ======================================================= */

  function hideLoadingScreen() {

    const screen =
      $("loadingScreen");


    if (!screen) {
      return;
    }


    screen.classList.add(
      "hidden"
    );


    setTimeout(
      function () {

        if (
          screen &&
          screen.parentNode
        ) {

          screen.style.display =
            "none";
        }

      },
      500
    );
  }


  /* =======================================================
     INITIALIZE
     ======================================================= */

  async function initApp() {

    if (
      state.initialized
    ) {
      return;
    }


    state.initialized =
      true;


    try {

      /*
       * Establish current dates first.
       */

      state.today =
        getToday();

      state.tomorrow =
        addDays(
          state.today,
          1
        );

      state.dayAfterTomorrow =
        addDays(
          state.today,
          2
        );


      /*
       * Detect current Bodo month.
       */

      detectCurrentMonth();


      /*
       * Render basic calendar.
       */

      renderMonthSelector();

      renderWeekdayHeader();

      renderMonthBanner();

      renderCalendar();

      renderSelectedDate();

      renderEvents();

      renderHistory();

      renderMonthReference();

      renderLiveStatus();


      /*
       * UI event handlers.
       */

      setupNavigation();

      setupWelcomeCard();

      setupNotificationClose();

      setupModalButtons();

      setupNoteForm();

      setupNotesButton();

      setupFooterButtons();

      setupInstallPrompt();

      setupVisibilityRefresh();


      /*
       * VIP initialization.
       */

      if (
        window.BodoCalendarVIP &&
        typeof window.BodoCalendarVIP.initVIP ===
          "function"
      ) {

        window.BodoCalendarVIP.initVIP();

      } else if (
        typeof window.updateVIPUI ===
        "function"
      ) {

        window.updateVIPUI();
      }


      /*
       * Load notifications without blocking
       * the calendar.
       */

      loadNotifications();


      /*
       * Automatic midnight refresh.
       */

      scheduleMidnightUpdate();


      /*
       * Set copyright year.
       */

      if ($("copyrightYear")) {

        $("copyrightYear")
          .textContent =
          new Date()
            .getFullYear();
      }


      /*
       * Small delay allows browser to paint
       * calendar before removing loader.
       */

      setTimeout(
        hideLoadingScreen,
        150
      );


    } catch (error) {

      console.error(
        "Bodo Calendar initialization error:",
        error
      );


      showFatalCalendarError(
        error
      );


      hideLoadingScreen();
    }
  }


  /* =======================================================
     FATAL ERROR DISPLAY
     ======================================================= */

  function showFatalCalendarError(
    error
  ) {

    const grid =
      $("calendarGrid");


    if (grid) {

      grid.innerHTML = `

        <div class="empty-state calendar-error-state">

          <span>⚠️</span>

          <p>
            Calendar could not be loaded.
          </p>

          <small>
            Please refresh the page.
          </small>

        </div>

      `;
    }


    console.error(
      "Calendar error:",
      error
    );
  }


  /* =======================================================
     PUBLIC APP API
     ======================================================= */

  window.BodoCalendarApp = {

    state,

    init:
      initApp,

    refresh:
      refreshLiveDate,

    goToToday,

    changeMonth,

    selectDate,

    openDateModal,

    closeDateModal,

    openNoteModal,

    closeNoteModal,

    openNotesList,

    closeNotesList,

    renderCalendar,

    renderEvents,

    renderHistory,

    renderLiveStatus,

    updateCalendarView
  };


  /* =======================================================
     READY FLAG
     ======================================================= */

  window.BODO_APP_READY =
    true;


  /* =======================================================
     START APPLICATION
     ======================================================= */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initApp,
      {
        once: true
      }
    );

  } else {

    initApp();
  }


})();