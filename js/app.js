/* =========================================================
   BODO CALENDAR — MAIN APPLICATION
   VERSION 7.0
   ========================================================= */

"use strict";

(function () {


  /* =======================================================
     STATE
     ======================================================= */

  let today =
    new Date();

  let selectedDate =
    new Date();

  let viewMonthId = null;

  let viewMonthYear = null;


  /* =======================================================
     DATA
     ======================================================= */

  function getCalendarData() {

    return (
      window.BodoCalendarData ||
      {}
    );

  }


  function getMonths() {

    const data =
      getCalendarData();

    return (
      data.months ||
      window.bodoMonthsData ||
      []
    );

  }


  function getMonthInfo(
    date
  ) {

    const data =
      getCalendarData();

    if (
      typeof data.getBodoDateInfo ===
      "function"
    ) {

      return data.getBodoDateInfo(
        date
      );

    }

    if (
      typeof window.getBodoDateInfo ===
      "function"
    ) {

      return window.getBodoDateInfo(
        date
      );

    }

    return null;

  }


  /* =======================================================
     DOM
     ======================================================= */

  function $(id) {

    return document.getElementById(id);

  }


  function setText(
    id,
    value
  ) {

    const el = $(id);

    if (el) {
      el.textContent =
        value == null
          ? ""
          : String(value);
    }

  }


  /* =======================================================
     DATE HELPERS
     ======================================================= */

  function normalizeDate(
    date
  ) {

    const d =
      new Date(date);

    return new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate()
    );

  }


  function dateKey(
    date
  ) {

    const d =
      normalizeDate(date);

    return [
      d.getFullYear(),
      String(
        d.getMonth() + 1
      ).padStart(2, "0"),
      String(
        d.getDate()
      ).padStart(2, "0")
    ].join("-");

  }


  function sameDate(
    a,
    b
  ) {

    return (
      dateKey(a) ===
      dateKey(b)
    );

  }


  function addDays(
    date,
    amount
  ) {

    const d =
      normalizeDate(date);

    d.setDate(
      d.getDate() + amount
    );

    return d;

  }


  /* =======================================================
     FORMATTERS
     ======================================================= */

  function formatEnglishDate(
    date
  ) {

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      }
    ).format(date);

  }


  function formatFullDate(
    date
  ) {

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    ).format(date);

  }


  function formatRange(
    start,
    end
  ) {

    const s =
      new Intl.DateTimeFormat(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric"
        }
      ).format(start);

    const e =
      new Intl.DateTimeFormat(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric"
        }
      ).format(end);

    return `${s} – ${e}`;

  }


  /* =======================================================
     BODO DATE TEXT
     ======================================================= */

  function bodoText(
    date
  ) {

    const info =
      getMonthInfo(date);

    if (!info) {
      return "Bodo date unavailable";
    }

    return (
      `${info.month.name} ${info.day}`
    );

  }


  function bodoFullText(
    date
  ) {

    const info =
      getMonthInfo(date);

    if (!info) {
      return "Bodo date unavailable";
    }

    return (
      `${info.month.name} ${info.day} ` +
      `(${info.month.nativeName})`
    );

  }


  /* =======================================================
     MONTH VIEW
     ======================================================= */

  function setInitialMonth() {

    const info =
      getMonthInfo(today);

    if (!info) {
      viewMonthId = 0;
      viewMonthYear =
        today.getFullYear();

      return;
    }

    viewMonthId =
      info.monthId;

    viewMonthYear =
      info.year;

  }


  function getCurrentViewDates() {

    const data =
      getCalendarData();

    if (
      typeof data.getBodoMonthDates ===
      "function"
    ) {

      return data.getBodoMonthDates(
        viewMonthId,
        viewMonthYear
      );

    }

    return [];

  }


  /* =======================================================
     MONTH SELECT
     ======================================================= */

  function renderMonthSelect() {

    const select =
      $("monthSelect");

    if (!select) {
      return;
    }

    const months =
      getMonths();

    select.innerHTML = "";

    months.forEach(
      month => {

        const option =
          document.createElement(
            "option"
          );

        option.value =
          String(month.id);

        option.textContent =
          `${month.name} (${month.nativeName})`;

        if (
          month.id ===
          viewMonthId
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
     MONTH BANNER
     ======================================================= */

  function renderMonthBanner() {

    const months =
      getMonths();

    const month =
      months[viewMonthId];

    if (!month) {
      return;
    }

    const data =
      getCalendarData();

    const start =
      typeof data.getBodoMonthStartDate ===
      "function"
        ? data.getBodoMonthStartDate(
            viewMonthId,
            viewMonthYear
          )
        : null;

    const end =
      typeof data.getBodoMonthEndDate ===
      "function"
        ? data.getBodoMonthEndDate(
            viewMonthId,
            viewMonthYear
          )
        : null;

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
      `${month.season || "BODO"} • BODO SOLAR MONTH`
    );

    if (start && end) {

      setText(
        "currentMonthDateRange",
        formatRange(
          start,
          end
        )
      );

    }

  }


  /* =======================================================
     WEEKDAY HEADER
     ======================================================= */

  function renderWeekdays() {

    const container =
      $("weekdayHeader");

    if (!container) {
      return;
    }

    const weekdays = [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ];

    container.innerHTML =
      weekdays
        .map(
          day =>
            `<div>${day}</div>`
        )
        .join("");

  }


  /* =======================================================
     EVENT HELPERS
     ======================================================= */

  function normalizeEvents(
    value
  ) {

    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (
      Array.isArray(
        value.events
      )
    ) {
      return value.events;
    }

    return [value];

  }


  function getEventsForDate(
    date
  ) {

    const info =
      getMonthInfo(date);

    const candidates = [];


    try {

      if (
        typeof window.getEventsForDate ===
        "function"
      ) {

        candidates.push(
          window.getEventsForDate(
            date
          )
        );

      }

    } catch (e) {}


    try {

      if (
        typeof window.getBodoEventsForDate ===
        "function"
      ) {

        candidates.push(
          window.getBodoEventsForDate(
            date
          )
        );

      }

    } catch (e) {}


    try {

      if (
        typeof window.getEventsForBodoDate ===
        "function" &&
        info
      ) {

        candidates.push(
          window.getEventsForBodoDate(
            info.monthId,
            info.day
          )
        );

      }

    } catch (e) {}


    try {

      if (
        typeof window.getEventsForBodoMonth ===
        "function" &&
        info
      ) {

        candidates.push(
          window.getEventsForBodoMonth(
            info.monthId
          )
        );

      }

    } catch (e) {}


    const result = [];

    candidates.forEach(
      candidate => {

        normalizeEvents(
          candidate
        ).forEach(
          event => {

            if (
              event &&
              !result.includes(event)
            ) {

              result.push(event);

            }

          }
        );

      }
    );

    return result;

  }


  function eventTitle(
    event
  ) {

    if (
      typeof event ===
      "string"
    ) {

      return event;

    }

    return (
      event.title ||
      event.name ||
      event.event ||
      event.label ||
      "Cultural Event"
    );

  }


  function eventDescription(
    event
  ) {

    if (
      typeof event ===
      "string"
    ) {

      return "";

    }

    return (
      event.description ||
      event.details ||
      event.note ||
      ""
    );

  }


  /* =======================================================
     NOTES HELPERS
     ======================================================= */

  function getNotes() {

    try {

      if (
        typeof window.getAllNotes ===
        "function"
      ) {

        return (
          window.getAllNotes() ||
          []
        );

      }

    } catch (e) {}


    try {

      if (
        Array.isArray(
          window.BodoNotes
        )
      ) {

        return window.BodoNotes;

      }

    } catch (e) {}


    try {

      const saved =
        localStorage.getItem(
          "bodoCalendarNotes"
        );

      if (saved) {

        const parsed =
          JSON.parse(saved);

        return Array.isArray(
          parsed
        )
          ? parsed
          : [];

      }

    } catch (e) {}

    return [];

  }


  function hasNoteForDate(
    date
  ) {

    const key =
      dateKey(date);

    return getNotes()
      .some(
        note =>
          dateKey(
            note.date ||
            note.dateKey ||
            note.day
          ) === key
      );

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

    const dates =
      getCurrentViewDates();

    grid.innerHTML = "";

    if (!dates.length) {

      grid.innerHTML =
        `<div class="empty-state">
          Calendar dates unavailable.
        </div>`;

      return;

    }


    /*
      Empty cells before first day.
    */

    const firstWeekday =
      dates[0].getDay();

    for (
      let i = 0;
      i < firstWeekday;
      i++
    ) {

      const empty =
        document.createElement(
          "div"
        );

      empty.className =
        "calendar-day empty";

      grid.appendChild(
        empty
      );

    }


    dates.forEach(
      date => {

        const info =
          getMonthInfo(date);

        const button =
          document.createElement(
            "button"
          );

        button.type =
          "button";

        button.className =
          "calendar-day";


        if (
          sameDate(
            date,
            today
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
          getEventsForDate(
            date
          );

        const hasNote =
          hasNoteForDate(
            date
          );


        if (events.length) {

          button.insertAdjacentHTML(
            "beforeend",
            `<span class="event-dot"></span>`
          );

        }


        if (hasNote) {

          button.insertAdjacentHTML(
            "beforeend",
            `<span class="note-dot"></span>`
          );

        }


        button.innerHTML += `

          <span class="day-week">
            ${new Intl.DateTimeFormat(
              "en-US",
              {
                weekday: "short"
              }
            ).format(date)}
          </span>

          <span class="day-gregorian">
            ${date.getDate()}
          </span>

          <span class="day-bodo">
            Bodo
            <strong>
              ${info ? info.day : ""}
            </strong>
          </span>

        `;


        button.setAttribute(
          "aria-label",
          `${formatFullDate(date)}, ${bodoFullText(date)}`
        );


        button.addEventListener(
          "click",
          () => {

            selectDate(
              date,
              true
            );

          }
        );


        grid.appendChild(
          button
        );

      }
    );

  }


  /* =======================================================
     SELECT DATE
     ======================================================= */

  function selectDate(
    date,
    openModal
  ) {

    selectedDate =
      normalizeDate(date);

    const info =
      getMonthInfo(
        selectedDate
      );

    if (info) {

      viewMonthId =
        info.monthId;

      viewMonthYear =
        info.year;

    }

    renderAll();

    if (openModal) {

      openDateModal();

    }

  }


  /* =======================================================
     TODAY + UPCOMING
     ======================================================= */

  function renderLiveDates() {

    const tomorrow =
      addDays(
        today,
        1
      );

    const dayAfter =
      addDays(
        today,
        2
      );


    setText(
      "todayAlertText",
      `${formatEnglishDate(today)} • ${bodoFullText(today)}`
    );

    setText(
      "tomorrowAlertText",
      `${formatEnglishDate(tomorrow)} • ${bodoFullText(tomorrow)}`
    );

    setText(
      "dayAfterTomorrowAlertText",
      `${formatEnglishDate(dayAfter)} • ${bodoFullText(dayAfter)}`
    );


    setText(
      "englishTodayStatus",
      formatEnglishDate(today)
    );

    setText(
      "bodoTodayStatus",
      bodoFullText(today)
    );


    const now =
      new Intl.DateTimeFormat(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit"
        }
      ).format(
        new Date()
      );


    setText(
      "liveStatusUpdated",
      `Updated ${now}`
    );

  }


  /* =======================================================
     SELECTED DATE
     ======================================================= */

  function renderSelectedDate() {

    const info =
      getMonthInfo(
        selectedDate
      );

    if (!info) {
      return;
    }

    setText(
      "selectedDateTitle",
      formatFullDate(
        selectedDate
      )
    );


    const events =
      getEventsForDate(
        selectedDate
      );


    let html = `

      <div class="selected-date-info">

        <strong>
          ${info.month.name} ${info.day}
        </strong>

        <span>
          ${info.month.nativeName}
        </span>

        <small>
          Bodo Day ${info.day}
          of ${info.monthLength}
        </small>

      </div>

    `;


    if (events.length) {

      html += `
        <div class="selected-events">
          <strong>🎉 Events</strong>
      `;

      events.forEach(
        event => {

          html += `
            <div class="event-item">
              <strong>
                ${escapeHTML(
                  eventTitle(event)
                )}
              </strong>

              <span>
                ${escapeHTML(
                  eventDescription(event)
                )}
              </span>
            </div>
          `;

        }
      );

      html += `</div>`;

    } else {

      html += `
        <div class="empty-state">
          No major event listed for this date.
        </div>
      `;

    }


    setHTML(
      "selectedDateDetails",
      html
    );

  }


  /* =======================================================
     MONTH EVENTS
     ======================================================= */

  function renderMonthlyEvents() {

    const container =
      $("eventsList");

    if (!container) {
      return;
    }

    const dates =
      getCurrentViewDates();

    const allEvents = [];

    dates.forEach(
      date => {

        const events =
          getEventsForDate(
            date
          );

        events.forEach(
          event => {

            allEvents.push({
              date,
              event
            });

          }
        );

      }
    );


    /*
      Remove duplicate object references.
    */

    const unique = [];

    const keys =
      new Set();

    allEvents.forEach(
      item => {

        const key =
          `${dateKey(item.date)}-${eventTitle(item.event)}`;

        if (!keys.has(key)) {

          keys.add(key);

          unique.push(
            item
          );

        }

      }
    );


    if (!unique.length) {

      container.innerHTML =
        `<div class="empty-state">
          No events listed for this month.
        </div>`;

      return;

    }


    container.innerHTML =
      unique
        .map(
          item => `

            <div class="event-item">

              <strong>
                ${escapeHTML(
                  eventTitle(
                    item.event
                  )
                )}
              </strong>

              <span>
                ${formatEnglishDate(
                  item.date
                )}
              </span>

              ${
                eventDescription(
                  item.event
                )
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

            </div>

          `
        )
        .join("");

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

    } catch (e) {}


    if (
      !history &&
      Array.isArray(
        window.BodoHistory
      )
    ) {

      history =
        window.BodoHistory;

    }


    if (
      !history &&
      Array.isArray(
        window.bodoHistory
      )
    ) {

      history =
        window.bodoHistory;

    }


    if (
      typeof history ===
      "object" &&
      history !== null &&
      !Array.isArray(history)
    ) {

      history =
        Object.values(
          history
        );

    }


    if (!Array.isArray(history)) {

      container.innerHTML =
        `<div class="empty-state">
          No historical entry available for today.
        </div>`;

      return;

    }


    if (!history.length) {

      container.innerHTML =
        `<div class="empty-state">
          No historical entry available for today.
        </div>`;

      return;

    }


    container.innerHTML =
      history
        .slice(0, 6)
        .map(
          item => {

            const title =
              typeof item ===
              "string"
                ? item
                : (
                  item.title ||
                  item.name ||
                  item.event ||
                  "Historical Event"
                );

            const description =
              typeof item ===
              "string"
                ? ""
                : (
                  item.description ||
                  item.details ||
                  ""
                );

            return `

              <div class="history-item">

                <strong>
                  ${escapeHTML(title)}
                </strong>

                ${
                  description
                    ? `
                      <span>
                        ${escapeHTML(
                          description
                        )}
                      </span>
                    `
                    : ""
                }

              </div>

            `;

          }
        )
        .join("");

  }


  /* =======================================================
     SEASON
     ======================================================= */

  function renderSeason() {

    const info =
      getMonthInfo(today);

    if (!info) {
      return;
    }

    const season =
      info.month.season ||
      "Bodo Seasonal Cycle";


    const descriptions = {

      Gozon:
        "Cool and pleasant seasonal period.",

      Bwisag:
        "Spring transition and the beginning of the new agricultural cycle.",

      Garma:
        "Warm summer period with increasing rainfall.",

      Barsa:
        "Rainy season and strong agricultural activity.",

      Saram:
        "Post-monsoon seasonal period.",

    };


    setText(
      "seasonTitle",
      season
    );

    setText(
      "seasonDescription",
      descriptions[season] ||
      "Traditional Bodo seasonal reference."
    );

  }


  /* =======================================================
     MONTH REFERENCE
     ======================================================= */

  function renderReference() {

    const body =
      $("monthReferenceBody");

    if (!body) {
      return;
    }

    const months =
      getMonths();

    const data =
      getCalendarData();

    body.innerHTML = "";


    months.forEach(
      month => {

        let start = null;
        let end = null;


        if (
          typeof data.getBodoMonthStartDate ===
          "function"
        ) {

          start =
            data.getBodoMonthStartDate(
              month.id,
              viewMonthYear
            );

        }


        if (
          typeof data.getBodoMonthEndDate ===
          "function"
        ) {

          end =
            data.getBodoMonthEndDate(
              month.id,
              viewMonthYear
            );

        }


        const row =
          document.createElement(
            "tr"
          );


        row.innerHTML = `

          <td>
            ${month.id + 1}
          </td>

          <td>
            <strong>
              ${escapeHTML(
                month.name
              )}
            </strong>
          </td>

          <td>
            ${escapeHTML(
              month.nativeName
            )}
          </td>

          <td>
            ${
              start && end
                ? formatRange(
                    start,
                    end
                  )
                : "—"
            }
          </td>

        `;


        body.appendChild(
          row
        );

      }
    );

  }


  /* =======================================================
     MODAL
     ======================================================= */

  function openDateModal() {

    const modal =
      $("dateModal");

    if (!modal) {
      return;
    }

    const info =
      getMonthInfo(
        selectedDate
      );

    if (!info) {
      return;
    }

    setText(
      "dateModalTitle",
      formatFullDate(
        selectedDate
      )
    );


    const events =
      getEventsForDate(
        selectedDate
      );


    let html = `

      <div class="selected-date-info">

        <strong>
          ${info.month.name}
          ${info.day}
        </strong>

        <span>
          ${info.month.nativeName}
        </span>

        <small>
          Gregorian:
          ${formatFullDate(
            selectedDate
          )}
        </small>

        <small>
          Bodo Day:
          ${info.day}
          / ${info.monthLength}
        </small>

      </div>

    `;


    if (events.length) {

      html += `
        <div style="margin-top:15px">
          <strong>🎉 Events</strong>
        </div>
      `;

      events.forEach(
        event => {

          html += `

            <div class="event-item">

              <strong>
                ${escapeHTML(
                  eventTitle(event)
                )}
              </strong>

              <span>
                ${escapeHTML(
                  eventDescription(event)
                )}
              </span>

            </div>

          `;

        }
      );

    } else {

      html += `

        <div class="empty-state"
             style="margin-top:15px">

          No major event listed for
          this date.

        </div>

      `;

    }


    setHTML(
      "dateModalBody",
      html
    );


    modal.classList.remove(
      "hidden"
    );

  }


  function closeModal(
    id
  ) {

    const modal =
      $(id);

    if (modal) {

      modal.classList.add(
        "hidden"
      );

    }

  }


  /* =======================================================
     NAVIGATION
     ======================================================= */

  function changeMonth(
    direction
  ) {

    if (direction > 0) {

      if (
        viewMonthId === 11
      ) {

        viewMonthId = 0;

        viewMonthYear++;

      } else {

        viewMonthId++;

      }

    } else {

      if (
        viewMonthId === 0
      ) {

        viewMonthId = 11;

        viewMonthYear--;

      } else {

        viewMonthId--;

      }

    }


    const dates =
      getCurrentViewDates();

    if (dates.length) {

      selectedDate =
        normalizeDate(
          dates[0]
        );

    }


    renderAll();

  }


  function goToday() {

    today =
      normalizeDate(
        new Date()
      );

    selectedDate =
      new Date(today);

    setInitialMonth();

    renderAll();

  }


  /* =======================================================
     CONTROLS
     ======================================================= */

  function bindControls() {

    const prev =
      $("prevMonthBtn");

    const next =
      $("nextMonthBtn");

    const todayBtn =
      $("todayBtn");

    const select =
      $("monthSelect");


    if (prev) {

      prev.addEventListener(
        "click",
        () => {
          changeMonth(-1);
        }
      );

    }


    if (next) {

      next.addEventListener(
        "click",
        () => {
          changeMonth(1);
        }
      );

    }


    if (todayBtn) {

      todayBtn.addEventListener(
        "click",
        goToday
      );

    }


    if (select) {

      select.addEventListener(
        "change",
        event => {

          const id =
            Number(
              event.target.value
            );

          if (
            Number.isNaN(id)
          ) {
            return;
          }

          viewMonthId =
            id;

          /*
            Month year remains tied
            to current visible cycle.
          */

          const dates =
            getCurrentViewDates();

          if (dates.length) {

            selectedDate =
              normalizeDate(
                dates[0]
              );

          }

          renderAll();

        }
      );

    }


    const closeDate =
      $("closeDateModalBtn");

    const closeDateBottom =
      $("closeDateModalBottomBtn");


    if (closeDate) {

      closeDate.addEventListener(
        "click",
        () => {
          closeModal(
            "dateModal"
          );
        }
      );

    }


    if (closeDateBottom) {

      closeDateBottom.addEventListener(
        "click",
        () => {
          closeModal(
            "dateModal"
          );
        }
      );

    }


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

        }
      );

    }


    const closeNotification =
      $("closeNotificationBtn");

    if (closeNotification) {

      closeNotification.addEventListener(
        "click",
        () => {

          const panel =
            $("notificationPanel");

          if (panel) {
            panel.classList.add(
              "hidden"
            );
          }

        }
      );

    }


    /*
      ESC closes modal.
    */

    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key ===
          "Escape"
        ) {

          [
            "dateModal",
            "noteModal",
            "notesListModal",
            "vipModal"
          ].forEach(
            closeModal
          );

        }

      }
    );


    /*
      Click outside modal.
    */

    document
      .querySelectorAll(
        ".modal-overlay"
      )
      .forEach(
        overlay => {

          overlay.addEventListener(
            "click",
            event => {

              if (
                event.target ===
                overlay
              ) {

                overlay.classList.add(
                  "hidden"
                );

              }

            }
          );

        }
      );


    /*
      Footer buttons.
    */

    const footerNotes =
      $("footerNotesBtn");

    if (footerNotes) {

      footerNotes.addEventListener(
        "click",
        () => {

          const btn =
            $("openNotesBtn");

          if (btn) {
            btn.click();
          }

        }
      );

    }


    const footerVip =
      $("footerVipBtn");

    if (footerVip) {

      footerVip.addEventListener(
        "click",
        () => {

          const btn =
            $("vipButton");

          if (btn) {
            btn.click();
          }

        }
      );

    }

  }


  /* =======================================================
     INSTALL PWA
     ======================================================= */

  let deferredInstallPrompt =
    null;


  function setupInstall() {

    window.addEventListener(
      "beforeinstallprompt",
      event => {

        event.preventDefault();

        deferredInstallPrompt =
          event;

        const button =
          $("installAppBtn");

        if (button) {

          button.classList.remove(
            "hidden"
          );

        }

      }
    );


    const button =
      $("installAppBtn");

    if (button) {

      button.addEventListener(
        "click",
        async () => {

          if (
            !deferredInstallPrompt
          ) {
            return;
          }

          deferredInstallPrompt
            .prompt();

          await deferredInstallPrompt
            .userChoice;

          deferredInstallPrompt =
            null;

          button.classList.add(
            "hidden"
          );

        }
      );

    }

  }


  /* =======================================================
     COPYRIGHT
     ======================================================= */

  function setCopyright() {

    setText(
      "copyrightYear",
      new Date()
        .getFullYear()
    );

  }


  /* =======================================================
     RENDER ALL
     ======================================================= */

  function renderAll() {

    renderMonthSelect();

    renderMonthBanner();

    renderWeekdays();

    renderCalendarGrid();

    renderLiveDates();

    renderSelectedDate();

    renderMonthlyEvents();

    renderHistory();

    renderSeason();

    renderReference();

  }


  /* =======================================================
     SAFE HTML
     ======================================================= */

  function escapeHTML(
    value
  ) {

    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    return String(value)
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


  function setHTML(
    id,
    html
  ) {

    const element =
      $(id);

    if (element) {
      element.innerHTML =
        html;
    }

  }


  /* =======================================================
     LOADING
     ======================================================= */

  function hideLoading() {

    const screen =
      $("loadingScreen");

    if (!screen) {
      return;
    }

    setTimeout(
      () => {

        screen.classList.add(
          "loaded"
        );

      },
      250
    );

  }


  /* =======================================================
     INIT
     ======================================================= */

  function init() {

    today =
      normalizeDate(
        new Date()
      );

    selectedDate =
      new Date(today);

    setInitialMonth();

    bindControls();

    setupInstall();

    setCopyright();

    renderAll();

    hideLoading();


    /*
      Make state available to
      events/notes/vip modules.
    */

    window.BodoCalendarApp = {

      getToday: () =>
        new Date(today),

      getSelectedDate: () =>
        new Date(selectedDate),

      selectDate,

      render: renderAll,

      openDateModal

    };

  }


  /* =======================================================
     START
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