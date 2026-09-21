/* =========================================================
   BODO CALENDAR — MAIN APPLICATION
   VERSION 7.0

   RESPONSIBILITIES:

   - Today / Tomorrow / Day After
   - Gregorian → Bodo conversion
   - Month navigation
   - Month dropdown
   - Calendar grid
   - Selected date
   - Events
   - History
   - Season
   - Notes compatibility
   - Cultural UI
   ========================================================= */

"use strict";

(function () {


  /* =======================================================
     GLOBAL STATE
     ======================================================= */

  let currentMonthId = 0;

  let currentMonthYear = 0;

  let selectedDate = new Date();

  let deferredInstallPrompt = null;


  /* =======================================================
     DOM
     ======================================================= */

  const $ = id =>
    document.getElementById(id);


  /* =======================================================
     DATE HELPERS
     ======================================================= */

  function cleanDate(date) {

    const d = new Date(date);

    return new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate()
    );

  }


  function dateKey(date) {

    const d = cleanDate(date);

    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0")
    ].join("-");

  }


  function sameDate(a, b) {

    return (
      dateKey(a) === dateKey(b)
    );

  }


  function addDays(date, amount) {

    const d =
      cleanDate(date);

    d.setDate(
      d.getDate() + amount
    );

    return d;

  }


  /* =======================================================
     CALENDAR DATA
     ======================================================= */

  function data() {

    return (
      window.BodoCalendarData ||
      {}
    );

  }


  function months() {

    return (
      data().months ||
      window.bodoMonthsData ||
      []
    );

  }


  function getBodoInfo(date) {

    if (
      typeof data().getBodoDateInfo ===
      "function"
    ) {

      return data().getBodoDateInfo(date);

    }

    return null;

  }


  /* =======================================================
     FORMAT DATE
     ======================================================= */

  function formatDate(date) {

    return new Intl.DateTimeFormat(
      "en-GB",
      {
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    ).format(date);

  }


  function formatShort(date) {

    return new Intl.DateTimeFormat(
      "en-GB",
      {
        day: "numeric",
        month: "short",
        year: "numeric"
      }
    ).format(date);

  }


  function weekday(date) {

    return new Intl.DateTimeFormat(
      "en-GB",
      {
        weekday: "short"
      }
    ).format(date);

  }


  /* =======================================================
     SAFE TEXT
     ======================================================= */

  function setText(id, value) {

    const el = $(id);

    if (el) {
      el.textContent =
        value == null
          ? ""
          : String(value);
    }

  }


  /* =======================================================
     ESCAPE HTML
     ======================================================= */

  function escapeHTML(value) {

    return String(
      value == null
        ? ""
        : value
    )
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }


  /* =======================================================
     MONTH YEAR
     ======================================================= */

  function getInitialMonthState() {

    const today =
      cleanDate(new Date());

    const info =
      getBodoInfo(today);

    if (info) {

      currentMonthId =
        info.monthId;

      currentMonthYear =
        info.year;

      return;

    }

    currentMonthId = 0;

    currentMonthYear =
      today.getFullYear();

  }


  /* =======================================================
     MONTH NAVIGATION
     ======================================================= */

  function moveMonth(direction) {

    if (direction > 0) {

      if (currentMonthId === 11) {

        currentMonthId = 0;

        currentMonthYear++;

      } else {

        currentMonthId++;

      }

    } else {

      if (currentMonthId === 0) {

        currentMonthId = 11;

        currentMonthYear--;

      } else {

        currentMonthId--;

      }

    }

    const month =
      months()[currentMonthId];

    if (month) {

      const dates =
        data().getBodoMonthDates
          ? data().getBodoMonthDates(
              currentMonthId,
              currentMonthYear
            )
          : [];

      if (
        dates.length &&
        !dates.some(
          d => sameDate(d, selectedDate)
        )
      ) {

        selectedDate =
          dates[0];

      }

    }

    renderAll();

  }


  /* =======================================================
     GO TODAY
     ======================================================= */

  function goToday() {

    const today =
      cleanDate(new Date());

    selectedDate = today;

    const info =
      getBodoInfo(today);

    if (info) {

      currentMonthId =
        info.monthId;

      currentMonthYear =
        info.year;

    }

    renderAll();

  }


  /* =======================================================
     MONTH SELECT
     ======================================================= */

  function buildMonthSelector() {

    const select =
      $("monthSelect");

    if (!select) {
      return;
    }

    select.innerHTML = "";

    months().forEach(
      month => {

        const option =
          document.createElement("option");

        option.value =
          String(month.id);

        option.textContent =
          `${month.name} — ${month.nativeName}`;

        select.appendChild(option);

      }
    );

    select.value =
      String(currentMonthId);

  }


  /* =======================================================
     MONTH REFERENCE TABLE
     ======================================================= */

  function renderReferenceTable() {

    const body =
      $("monthReferenceBody");

    if (!body) {
      return;
    }

    body.innerHTML = "";

    months().forEach(
      month => {

        const row =
          document.createElement("tr");

        let range = "";

        if (
          typeof data().getMonthRange ===
          "function"
        ) {

          range =
            data().getMonthRange(
              month.id,
              currentMonthYear
            );

        }

        row.innerHTML = `
          <td>${month.id + 1}</td>

          <td>
            <strong>
              ${escapeHTML(month.name)}
            </strong>
          </td>

          <td>
            ${escapeHTML(
              month.nativeName || ""
            )}
          </td>

          <td>
            ${escapeHTML(range)}
          </td>
        `;

        body.appendChild(row);

      }
    );

  }


  /* =======================================================
     MONTH BANNER
     ======================================================= */

  function renderMonthBanner() {

    const month =
      months()[currentMonthId];

    if (!month) {
      return;
    }

    setText(
      "currentMonthName",
      month.name
    );

    setText(
      "currentMonthNativeName",
      month.nativeName
    );

    setText(
      "monthSeasonLabel",
      month.season ||
      "BODO SOLAR MONTH"
    );

    let range = "";

    if (
      typeof data().getMonthRange ===
      "function"
    ) {

      range =
        data().getMonthRange(
          currentMonthId,
          currentMonthYear
        );

    }

    setText(
      "currentMonthDateRange",
      range
    );

  }


  /* =======================================================
     WEEKDAYS
     ======================================================= */

  function renderWeekdays() {

    const header =
      $("weekdayHeader");

    if (!header) {
      return;
    }

    const names = [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ];

    header.innerHTML = "";

    names.forEach(
      name => {

        const div =
          document.createElement("div");

        div.textContent = name;

        header.appendChild(div);

      }
    );

  }


  /* =======================================================
     EVENTS COMPATIBILITY
     ======================================================= */

  function normalizeEvents(value) {

    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (
      typeof value === "string"
    ) {

      return [
        {
          title: value,
          description: ""
        }
      ];

    }

    if (
      typeof value === "object"
    ) {

      if (
        Array.isArray(value.events)
      ) {

        return value.events;

      }

      return [value];

    }

    return [];

  }


  function getEventsForDate(date) {

    const info =
      getBodoInfo(date);

    const candidates = [];

    try {

      if (
        typeof window.getEventsForDate ===
        "function"
      ) {

        candidates.push(
          window.getEventsForDate(
            cleanDate(date)
          )
        );

      }

    } catch (_) {}


    try {

      if (
        typeof window.getBodoEventsForDate ===
        "function"
      ) {

        candidates.push(
          window.getBodoEventsForDate(
            cleanDate(date)
          )
        );

      }

    } catch (_) {}


    try {

      if (
        info &&
        typeof window.getEventsForBodoDate ===
        "function"
      ) {

        candidates.push(
          window.getEventsForBodoDate(
            info.monthId,
            info.day
          )
        );

      }

    } catch (_) {}


    try {

      if (
        info &&
        typeof window.getEventsForMonthDate ===
        "function"
      ) {

        candidates.push(
          window.getEventsForMonthDate(
            info.monthId,
            info.day
          )
        );

      }

    } catch (_) {}


    for (
      const candidate of candidates
    ) {

      const result =
        normalizeEvents(candidate);

      if (result.length) {
        return result;
      }

    }


    /*
      Fallback to common global
      event data formats.
    */

    const globals = [
      window.BodoEvents,
      window.bodoEvents,
      window.eventsData
    ];

    for (
      const source of globals
    ) {

      if (!source) {
        continue;
      }

      const result =
        findEventsInsideSource(
          source,
          date,
          info
        );

      if (result.length) {
        return result;
      }

    }

    return [];

  }


  function findEventsInsideSource(
    source,
    date,
    info
  ) {

    const result = [];

    const key =
      dateKey(date);

    if (Array.isArray(source)) {

      source.forEach(
        event => {

          if (!event) {
            return;
          }

          const eventDate =
            event.date ||
            event.gregorianDate ||
            event.isoDate;

          if (
            eventDate &&
            String(eventDate)
              .slice(0,10) === key
          ) {

            result.push(event);

            return;

          }

          if (
            info &&
            Number(event.monthId) ===
              Number(info.monthId) &&
            Number(event.day) ===
              Number(info.day)
          ) {

            result.push(event);

          }

        }
      );

      return result;

    }


    if (
      typeof source === "object"
    ) {

      const direct =
        source[key];

      if (direct) {

        return normalizeEvents(
          direct
        );

      }

      if (
        info &&
        source[info.monthId]
      ) {

        const monthSource =
          source[info.monthId];

        if (
          monthSource &&
          monthSource[info.day]
        ) {

          return normalizeEvents(
            monthSource[info.day]
          );

        }

      }

    }

    return result;

  }


  /* =======================================================
     EVENT TITLE
     ======================================================= */

  function eventTitle(event) {

    return (
      event.title ||
      event.name ||
      event.event ||
      event.label ||
      "Cultural Event"
    );

  }


  function eventDescription(event) {

    return (
      event.description ||
      event.desc ||
      event.details ||
      event.note ||
      ""
    );

  }


  /* =======================================================
     MONTHLY EVENTS
     ======================================================= */

  function renderMonthlyEvents() {

    const container =
      $("eventsList");

    if (!container) {
      return;
    }

    container.innerHTML = "";

    const dates =
      data().getBodoMonthDates
        ? data().getBodoMonthDates(
            currentMonthId,
            currentMonthYear
          )
        : [];

    const collected = [];

    dates.forEach(
      date => {

        const events =
          getEventsForDate(date);

        events.forEach(
          event => {

            const unique =
              JSON.stringify({
                d: dateKey(date),
                t: eventTitle(event)
              });

            if (
              !collected.some(
                x => x.unique === unique
              )
            ) {

              collected.push({
                unique,
                date,
                event
              });

            }

          }
        );

      }
    );


    if (!collected.length) {

      const empty =
        document.createElement("div");

      empty.className =
        "event-item";

      empty.innerHTML = `
        <strong>
          No major event listed
        </strong>

        <span>
          No additional event is listed
          for this Bodo month.
        </span>
      `;

      container.appendChild(empty);

      return;

    }


    collected
      .sort(
        (a,b) =>
          a.date.getTime() -
          b.date.getTime()
      )
      .forEach(
        item => {

          const info =
            getBodoInfo(item.date);

          const div =
            document.createElement("div");

          div.className =
            "event-item";

          div.innerHTML = `
            <strong>
              🎉 ${escapeHTML(
                eventTitle(item.event)
              )}
            </strong>

            <span>
              Bodo ${escapeHTML(
                info
                  ? info.day
                  : ""
              )}
              •
              ${escapeHTML(
                formatShort(item.date)
              )}
            </span>

            ${
              eventDescription(item.event)
                ? `
                  <span>
                    ${escapeHTML(
                      eventDescription(
                        item.event
                      )
                    )}
                  </span>
                `
                : ""
            }
          `;

          container.appendChild(div);

        }
      );

  }


  /* =======================================================
     NOTES COMPATIBILITY
     ======================================================= */

  function getNotesForDate(date) {

    const key =
      dateKey(date);

    const functionsToTry = [

      window.getNotesForDate,

      window.getNotesByDate,

      window.getBodoNotesForDate

    ];

    for (
      const fn of functionsToTry
    ) {

      if (
        typeof fn !== "function"
      ) {
        continue;
      }

      try {

        const result =
          fn(cleanDate(date));

        if (Array.isArray(result)) {

          return result;

        }

        if (result) {

          return [result];

        }

      } catch (_) {}

    }


    /*
      Local fallback.
    */

    try {

      const raw =
        localStorage.getItem(
          "bodoCalendarNotes"
        );

      if (raw) {

        const parsed =
          JSON.parse(raw);

        if (Array.isArray(parsed)) {

          return parsed.filter(
            note =>
              String(
                note.date || ""
              ).slice(0,10) === key
          );

        }

      }

    } catch (_) {}


    return [];

  }


  /* =======================================================
     CALENDAR GRID
     ======================================================= */

  function renderCalendarGrid() {

    const grid =
      $("calendarGrid");

    if (!grid) {
      return;
    }

    grid.innerHTML = "";

    const dates =
      data().getBodoMonthDates
        ? data().getBodoMonthDates(
            currentMonthId,
            currentMonthYear
          )
        : [];

    if (!dates.length) {

      grid.innerHTML = `
        <div style="
          grid-column:1/-1;
          padding:30px;
          text-align:center;
          color:#64746f;
        ">
          Calendar dates could not be loaded.
        </div>
      `;

      return;

    }


    /*
      Empty cells before first day.
    */

    const firstDate =
      dates[0];

    const firstWeekday =
      firstDate.getDay();

    for (
      let i = 0;
      i < firstWeekday;
      i++
    ) {

      const empty =
        document.createElement("div");

      empty.className =
        "calendar-day is-other-month";

      empty.style.visibility =
        "hidden";

      grid.appendChild(empty);

    }


    /*
      Actual dates.
    */

    dates.forEach(
      date => {

        const info =
          getBodoInfo(date);

        const button =
          document.createElement("button");

        button.type =
          "button";

        button.className =
          "calendar-day";

        if (
          sameDate(
            date,
            new Date()
          )
        ) {

          button.classList.add(
            "today"
          );

        }

        if (
          sameDate(
            date,
            selectedDate
          )
        ) {

          button.classList.add(
            "selected"
          );

        }


        const events =
          getEventsForDate(date);

        const notes =
          getNotesForDate(date);

        if (events.length) {

          button.classList.add(
            "has-event"
          );

        }

        if (notes.length) {

          button.classList.add(
            "has-note"
          );

        }


        const monthShort =
          new Intl.DateTimeFormat(
            "en-GB",
            {
              month: "short"
            }
          ).format(date);


        button.innerHTML = `

          <div class="cell-top">

            <span class="weekday">
              ${escapeHTML(
                weekday(date)
              )}
            </span>

            ${
              sameDate(
                date,
                new Date()
              )
                ? `
                  <span
                    aria-label="Today"
                    title="Today"
                  >
                    📍
                  </span>
                `
                : ""
            }

          </div>


          <div class="gregorian">
            ${date.getDate()}
          </div>


          <div class="gregorian-month">
            ${monthShort}
          </div>


          <div class="bodo-date">

            ${
              info
                ? `Bodo ${escapeHTML(
                    info.day
                  )}`
                : ""
            }

          </div>

        `;


        button.setAttribute(
          "aria-label",
          info
            ? `${formatDate(date)}, Bodo ${info.month.name} ${info.day}`
            : formatDate(date)
        );


        button.addEventListener(
          "click",
          () => {

            selectDate(date);

          }
        );


        grid.appendChild(button);

      }
    );

  }


  /* =======================================================
     SELECT DATE
     ======================================================= */

  function selectDate(date) {

    selectedDate =
      cleanDate(date);

    const info =
      getBodoInfo(
        selectedDate
      );

    if (info) {

      currentMonthId =
        info.monthId;

      currentMonthYear =
        info.year;

    }

    renderAll();

    /*
      On mobile, selected date
      card is brought into view.
    */

    if (
      window.innerWidth <= 650
    ) {

      const panel =
        $("selectedDatePanel");

      if (panel) {

        setTimeout(
          () => {

            panel.scrollIntoView({
              behavior: "smooth",
              block: "nearest"
            });

          },
          50
        );

      }

    }

  }


  /* =======================================================
     SELECTED DATE PANEL
     ======================================================= */

  function renderSelectedDate() {

    const info =
      getBodoInfo(
        selectedDate
      );

    if (!info) {
      return;
    }

    setText(
      "selectedDateTitle",
      `${info.month.name} ${info.day}`
    );


    const details =
      $("selectedDateDetails");

    if (!details) {
      return;
    }

    const events =
      getEventsForDate(
        selectedDate
      );

    const notes =
      getNotesForDate(
        selectedDate
      );

    details.innerHTML = `

      <div>
        <strong>
          ${escapeHTML(
            formatDate(selectedDate)
          )}
        </strong>
      </div>

      <div>
        Bodo Date:
        <strong>
          ${escapeHTML(
            info.month.name
          )}
          ${info.day}
        </strong>
      </div>

      <div>
        Native:
        <strong>
          ${escapeHTML(
            info.month.nativeName
          )}
        </strong>
      </div>

      ${
        events.length
          ? `
            <div>
              🎉
              <strong>
                ${events.length}
                event${events.length > 1 ? "s" : ""}
              </strong>
            </div>
          `
          : ""
      }

      ${
        notes.length
          ? `
            <div>
              📝
              <strong>
                ${notes.length}
                personal note${notes.length > 1 ? "s" : ""}
              </strong>
            </div>
          `
          : ""
      }

      ${
        !events.length &&
        !notes.length
          ? `
            <div>
              No event or personal note for this date.
            </div>
          `
          : ""
      }

    `;

  }


  /* =======================================================
     TODAY / TOMORROW / DAY AFTER
     ======================================================= */

  function renderUpcoming() {

    const today =
      cleanDate(new Date());

    const tomorrow =
      addDays(today, 1);

    const dayAfter =
      addDays(today, 2);


    renderUpcomingCard(
      "todayAlertText",
      today
    );

    renderUpcomingCard(
      "tomorrowAlertText",
      tomorrow
    );

    renderUpcomingCard(
      "dayAfterTomorrowAlertText",
      dayAfter
    );


    setText(
      "englishTodayStatus",
      formatShort(today)
    );


    const info =
      getBodoInfo(today);

    if (info) {

      setText(
        "bodoTodayStatus",
        `${info.month.name} ${info.day}`
      );

    }


    setText(
      "assameseTodayStatus",
      "Reference layer"
    );


    const now =
      new Date();

    setText(
      "liveStatusUpdated",
      `Updated ${formatDateTime(now)}`
    );

  }


  function formatDateTime(date) {

    return new Intl.DateTimeFormat(
      "en-GB",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }
    ).format(date);

  }


  function renderUpcomingCard(
    elementId,
    date
  ) {

    const element =
      $(elementId);

    if (!element) {
      return;
    }

    const info =
      getBodoInfo(date);

    if (!info) {

      element.textContent =
        formatShort(date);

      return;

    }

    const events =
      getEventsForDate(date);

    element.innerHTML = `

      <div>
        ${escapeHTML(
          info.month.name
        )}
        ${escapeHTML(
          info.day
        )}
      </div>

      <div>
        ${escapeHTML(
          formatShort(date)
        )}
      </div>

      <div style="
        color:#64746f;
        font-size:9px;
        margin-top:3px;
      ">
        ${
          events.length
            ? `${events.length} event${events.length > 1 ? "s" : ""}`
            : "No major event listed"
        }
      </div>

    `;

  }


  /* =======================================================
     SEASON
     ======================================================= */

  function renderSeason() {

    const month =
      months()[currentMonthId];

    if (!month) {
      return;
    }

    setText(
      "seasonTitle",
      month.season ||
      "Bodo Season"
    );

    setText(
      "seasonDescription",
      `${month.name} is part of the traditional Bodo solar calendar cycle.`
    );

  }


  /* =======================================================
     HISTORY
     ======================================================= */

  function renderHistory() {

    const container =
      $("historyList");

    if (!container) {
      return;
    }

    container.innerHTML = "";

    const today =
      cleanDate(new Date());

    const info =
      getBodoInfo(today);


    let history = null;


    try {

      if (
        typeof window.getHistoryForDate ===
        "function"
      ) {

        history =
          window.getHistoryForDate(
            today
          );

      }

    } catch (_) {}


    if (!history) {

      try {

        if (
          typeof window.getBodoHistoryForDate ===
          "function"
        ) {

          history =
            window.getBodoHistoryForDate(
              today
            );

          }

      } catch (_) {}

    }


    const list =
      Array.isArray(history)
        ? history
        : history
          ? [history]
          : [];


    if (!list.length) {

      container.innerHTML = `

        <div class="history-item">

          <strong>
            📜
            ${info
              ? `${info.month.name} ${info.day}`
              : formatShort(today)}
          </strong>

          <div style="
            margin-top:4px;
            color:#64746f;
          ">
            No historical entry for today.
          </div>

        </div>

      `;

      return;

    }


    list.forEach(
      item => {

        const div =
          document.createElement("div");

        div.className =
          "history-item";

        div.innerHTML = `

          <strong>
            📜
            ${escapeHTML(
              item.title ||
              item.name ||
              "Historical Event"
            )}
          </strong>

          <div style="
            margin-top:4px;
            color:#64746f;
          ">
            ${escapeHTML(
              item.description ||
              item.details ||
              ""
            )}
          </div>

        `;

        container.appendChild(div);

      }
    );

  }


  /* =======================================================
     NOTE INDICATORS
     ======================================================= */

  function refreshNotesIfAvailable() {

    try {

      if (
        typeof window.renderNotes ===
        "function"
      ) {

        window.renderNotes();

      }

    } catch (_) {}

  }


  /* =======================================================
     CONTROLS
     ======================================================= */

  function bindControls() {

    const prev =
      $("prevMonthBtn");

    if (prev) {

      prev.addEventListener(
        "click",
        () => moveMonth(-1)
      );

    }


    const next =
      $("nextMonthBtn");

    if (next) {

      next.addEventListener(
        "click",
        () => moveMonth(1)
      );

    }


    const today =
      $("todayBtn");

    if (today) {

      today.addEventListener(
        "click",
        goToday
      );

    }


    const select =
      $("monthSelect");

    if (select) {

      select.addEventListener(
        "change",
        event => {

          const newId =
            Number(
              event.target.value
            );

          if (
            Number.isNaN(newId)
          ) {
            return;
          }

          /*
            Preserve the current cycle year.
          */

          if (
            newId < currentMonthId
          ) {

            if (
              currentMonthId === 11 &&
              newId === 0
            ) {

              currentMonthYear++;

            }

          } else if (
            newId > currentMonthId
          ) {

            if (
              currentMonthId === 0 &&
              newId === 11
            ) {

              currentMonthYear--;

            }

          }


          currentMonthId =
            newId;

          const dates =
            data().getBodoMonthDates
              ? data().getBodoMonthDates(
                  currentMonthId,
                  currentMonthYear
                )
              : [];

          if (dates.length) {

            selectedDate =
              dates[0];

          }

          renderAll();

        }
      );

    }


    /* =====================================================
       WELCOME CLOSE
       ===================================================== */

    const closeWelcome =
      $("closeWelcomeBtn");

    if (closeWelcome) {

      closeWelcome.addEventListener(
        "click",
        () => {

          const card =
            $("welcomeCard");

          if (card) {

            card.classList.add(
              "hidden"
            );

          }

          try {

            localStorage.setItem(
              "bodoCalendarWelcomeClosed",
              "1"
            );

          } catch (_) {}

        }
      );

    }


    try {

      if (
        localStorage.getItem(
          "bodoCalendarWelcomeClosed"
        ) === "1"
      ) {

        const card =
          $("welcomeCard");

        if (card) {

          card.classList.add(
            "hidden"
          );

        }

      }

    } catch (_) {}


    /* =====================================================
       DATE MODAL
       ===================================================== */

    bindDateModal();


    /* =====================================================
       NOTES BUTTON
       ===================================================== */

    const openNotes =
      $("openNotesBtn");

    if (openNotes) {

      openNotes.addEventListener(
        "click",
        () => {

          if (
            typeof window.openNotesList ===
            "function"
          ) {

            window.openNotesList();

            return;

          }

          const modal =
            $("notesListModal");

          if (modal) {

            modal.classList.remove(
              "hidden"
            );

          }

        }
      );

    }


    const footerNotes =
      $("footerNotesBtn");

    if (footerNotes) {

      footerNotes.addEventListener(
        "click",
        () => {

          if (
            typeof window.openNotesList ===
            "function"
          ) {

            window.openNotesList();

          }

        }
      );

    }


    /* =====================================================
       FOOTER ABOUT
       ===================================================== */

    const footerAbout =
      $("footerAboutBtn");

    if (footerAbout) {

      footerAbout.addEventListener(
        "click",
        () => {

          const about =
            document.querySelector(
              ".about-calendar-card"
            );

          if (about) {

            about.scrollIntoView({
              behavior: "smooth"
            });

          }

        }
      );

    }


    /* =====================================================
       INSTALL APP
       ===================================================== */

    window.addEventListener(
      "beforeinstallprompt",
      event => {

        event.preventDefault();

        deferredInstallPrompt =
          event;

        const btn =
          $("installAppBtn");

        if (btn) {

          btn.classList.remove(
            "hidden"
          );

        }

      }
    );


    const install =
      $("installAppBtn");

    if (install) {

      install.addEventListener(
        "click",
        async () => {

          if (
            !deferredInstallPrompt
          ) {
            return;
          }

          deferredInstallPrompt.prompt();

          try {

            await deferredInstallPrompt.userChoice;

          } catch (_) {}

          deferredInstallPrompt = null;

          install.classList.add(
            "hidden"
          );

        }
      );

    }

  }


  /* =======================================================
     DATE MODAL
     ======================================================= */

  function bindDateModal() {

    const modal =
      $("dateModal");

    const closeTop =
      $("closeDateModalBtn");

    const closeBottom =
      $("closeDateModalBottomBtn");

    const addNote =
      $("addNoteFromDateBtn");


    function closeModal() {

      if (modal) {

        modal.classList.add(
          "hidden"
        );

      }

    }


    if (closeTop) {

      closeTop.addEventListener(
        "click",
        closeModal
      );

    }

    if (closeBottom) {

      closeBottom.addEventListener(
        "click",
        closeModal
      );

    }


    if (modal) {

      modal.addEventListener(
        "click",
        event => {

          if (
            event.target === modal
          ) {

            closeModal();

          }

        }
      );

    }


    if (addNote) {

      addNote.addEventListener(
        "click",
        () => {

          closeModal();

          openNoteForDate(
            selectedDate
          );

        }
      );

    }

  }


  function openNoteForDate(date) {

    const modal =
      $("noteModal");

    if (!modal) {

      if (
        typeof window.openNoteModal ===
        "function"
      ) {

        window.openNoteModal(
          cleanDate(date)
        );

      }

      return;

    }


    setText(
      "noteDate",
      dateKey(date)
    );


    const input =
      $("noteDate");

    if (input) {

      input.value =
        dateKey(date);

    }


    modal.classList.remove(
      "hidden"
    );

  }


  /* =======================================================
     CLICK CALENDAR DATE → MODAL
     ======================================================= */

  function openDateModal() {

    const modal =
      $("dateModal");

    const body =
      $("dateModalBody");

    const title =
      $("dateModalTitle");

    const info =
      getBodoInfo(
        selectedDate
      );

    if (
      !modal ||
      !body ||
      !info
    ) {
      return;
    }


    if (title) {

      title.textContent =
        `${info.month.name} ${info.day}`;

    }


    const events =
      getEventsForDate(
        selectedDate
      );

    const notes =
      getNotesForDate(
        selectedDate
      );


    body.innerHTML = `

      <div style="
        display:grid;
        gap:10px;
      ">

        <div>
          <strong>
            Gregorian Date
          </strong>

          <div style="
            color:#64746f;
            margin-top:3px;
          ">
            ${escapeHTML(
              formatDate(selectedDate)
            )}
          </div>
        </div>


        <div>
          <strong>
            Bodo Date
          </strong>

          <div style="
            color:#08745d;
            margin-top:3px;
          ">
            ${escapeHTML(
              info.month.name
            )}
            ${escapeHTML(
              info.day
            )}
            —
            ${escapeHTML(
              info.month.nativeName
            )}
          </div>
        </div>


        <div>
          <strong>
            Month Period
          </strong>

          <div style="
            color:#64746f;
            margin-top:3px;
          ">
            ${escapeHTML(
              info.range
            )}
          </div>
        </div>


        ${
          events.length
            ? `
              <div>
                <strong>
                  🎉 Events
                </strong>

                ${events.map(
                  event => `
                    <div style="
                      margin-top:6px;
                      padding:9px;
                      border-radius:9px;
                      background:#f2fbf8;
                    ">
                      <strong>
                        ${escapeHTML(
                          eventTitle(event)
                        )}
                      </strong>

                      <div style="
                        margin-top:3px;
                        color:#64746f;
                        font-size:11px;
                      ">
                        ${escapeHTML(
                          eventDescription(
                            event
                          )
                        )}
                      </div>
                    </div>
                  `
                ).join("")}

              </div>
            `
            : ""
        }


        ${
          notes.length
            ? `
              <div>
                <strong>
                  📝 Personal Notes
                </strong>

                ${notes.map(
                  note => `
                    <div style="
                      margin-top:6px;
                      padding:9px;
                      border-radius:9px;
                      background:#fff7df;
                    ">
                      ${escapeHTML(
                        note.title ||
                        note.name ||
                        "Personal Note"
                      )}
                    </div>
                  `
                ).join("")}

              </div>
            `
            : ""
        }

      </div>

    `;


    modal.classList.remove(
      "hidden"
    );

  }


  /* =======================================================
     OPEN DATE MODAL ON SELECTED CARD
     ======================================================= */

  function bindSelectedCard() {

    const panel =
      $("selectedDatePanel");

    if (!panel) {
      return;
    }

    panel.addEventListener(
      "click",
      event => {

        if (
          event.target.closest(
            "button"
          )
        ) {
          return;
        }

        openDateModal();

      }
    );

  }


  /* =======================================================
     VIP
     ======================================================= */

  function bindVIP() {

    const buttons = [
      $("vipButton"),
      $("footerVipBtn")
    ].filter(Boolean);


    buttons.forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            if (
              typeof window.openVipModal ===
              "function"
            ) {

              window.openVipModal();

              return;

            }

            const modal =
              $("vipModal");

            if (modal) {

              modal.classList.remove(
                "hidden"
              );

            }

          }
        );

      }
    );

  }


  /* =======================================================
     LOADING
     ======================================================= */

  function hideLoading() {

    const loading =
      $("loadingScreen");

    if (!loading) {
      return;
    }

    setTimeout(
      () => {

        loading.classList.add(
          "loaded"
        );

      },
      250
    );

  }


  /* =======================================================
     COPYRIGHT
     ======================================================= */

  function setCopyright() {

    setText(
      "copyrightYear",
      new Date().getFullYear()
    );

  }


  /* =======================================================
     RENDER ALL
     ======================================================= */

  function renderAll() {

    buildMonthSelector();

    renderMonthBanner();

    renderWeekdays();

    renderCalendarGrid();

    renderUpcoming();

    renderSelectedDate();

    renderMonthlyEvents();

    renderHistory();

    renderSeason();

    renderReferenceTable();

    refreshNotesIfAvailable();

    const select =
      $("monthSelect");

    if (select) {

      select.value =
        String(currentMonthId);

    }

  }


  /* =======================================================
     INITIALIZE
     ======================================================= */

  function init() {

    getInitialMonthState();

    selectedDate =
      cleanDate(new Date());

    bindControls();

    bindSelectedCard();

    bindVIP();

    setCopyright();

    renderAll();

    hideLoading();

    console.log(
      "Bodo Calendar v7.0 initialized",
      {
        month:
          months()[currentMonthId],
        year:
          currentMonthYear,
        selectedDate:
          selectedDate
      }
    );

  }


  /* =======================================================
     GLOBAL APP API
     ======================================================= */

  window.BodoCalendarApp = {

    renderAll,

    selectDate,

    goToday,

    moveMonth,

    getSelectedDate: () =>
      cleanDate(selectedDate),

    getCurrentMonth: () =>
      months()[currentMonthId]

  };


  /* =======================================================
     DOM READY
     ======================================================= */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  } else {

    init();

  }

})();