/* =========================================================
   BODO CALENDAR — MAIN APPLICATION
   Version 6.2
   ========================================================= */

(function(){

"use strict";


/* =========================================================
   CONFIG
   ========================================================= */

const APP_VERSION = "6.2";

const NOTIFICATION_URL =
  "./notifications.json?v=" + Date.now();

const WELCOME_STORAGE_KEY =
  "bodo_calendar_welcome_closed_v1";


/* =========================================================
   STATE
   ========================================================= */

const state = {

  selectedMonthId:null,

  selectedDate:null,

  today:null,

  tomorrow:null,

  dayAfterTomorrow:null,

  notifications:[],

  deferredInstallPrompt:null,

  initialized:false

};


/* =========================================================
   DOM
   ========================================================= */

function $(id){

  return document.getElementById(id);

}


function safeText(value){

  if(
    value === null ||
    value === undefined
  ){

    return "";

  }

  return String(value);

}


function escapeHTML(value){

  return safeText(value)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}


/* =========================================================
   DATE
   ========================================================= */

function normalizeDate(date){

  if(
    window.BodoCalendarData &&
    typeof window.BodoCalendarData.normalizeDate === "function"
  ){

    const result =
      window.BodoCalendarData.normalizeDate(date);

    if(
      result &&
      !Number.isNaN(result.getTime())
    ){

      return result;

    }

  }

  const d =
    date instanceof Date
      ? new Date(date)
      : new Date(date);

  if(Number.isNaN(d.getTime())){

    const now = new Date();

    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      12
    );

  }

  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    12
  );

}


function createDateKey(date){

  if(
    window.BodoCalendarData &&
    typeof window.BodoCalendarData.getDateKey === "function"
  ){

    return window.BodoCalendarData.getDateKey(date);

  }

  const d =
    normalizeDate(date);

  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth()+1).padStart(2,"0") +
    "-" +
    String(d.getDate()).padStart(2,"0")
  );

}


function addDays(date,amount){

  const d =
    normalizeDate(date);

  d.setDate(
    d.getDate()+amount
  );

  return d;

}


function getToday(){

  return normalizeDate(
    new Date()
  );

}


/* =========================================================
   DATA
   ========================================================= */

function getMonths(){

  if(
    window.BodoCalendarData &&
    Array.isArray(
      window.BodoCalendarData.months
    )
  ){

    return window.BodoCalendarData.months;

  }

  if(
    window.BodoCalendarData &&
    Array.isArray(
      window.BodoCalendarData.bodoMonthsData
    )
  ){

    return window.BodoCalendarData.bodoMonthsData;

  }

  if(
    Array.isArray(
      window.bodoMonthsData
    )
  ){

    return window.bodoMonthsData;

  }

  return [];

}


function getWeekdays(){

  if(
    window.BodoCalendarData &&
    Array.isArray(
      window.BodoCalendarData.weekdays
    )
  ){

    return window.BodoCalendarData.weekdays;

  }

  if(
    Array.isArray(
      window.bodoWeekdays
    )
  ){

    return window.bodoWeekdays;

  }

  return [];

}


/* =========================================================
   MONTH YEAR
   ========================================================= */

function getSelectedBodoYear(month){

  const today =
    state.today ||
    getToday();

  /*
   * Push has a special Gregorian year.
   *
   * Jan 1–14:
   * Push belongs to previous year.
   *
   * Dec 19 onward:
   * Push belongs to current year.
   */

  if(
    month &&
    Number(month.id) === 11
  ){

    if(
      today.getMonth() === 0 &&
      today.getDate() <= 14
    ){

      return today.getFullYear() - 1;

    }

    return today.getFullYear();

  }

  return today.getFullYear();

}


/* =========================================================
   MONTH START
   ========================================================= */

function getMonthStartDateHelper(month){

  if(!month){
    return null;
  }

  const year =
    getSelectedBodoYear(month);

  if(
    window.BodoCalendarData &&
    typeof window.BodoCalendarData.getBodoMonthStartDate === "function"
  ){

    const date =
      window.BodoCalendarData.getBodoMonthStartDate(
        month.id,
        year
      );

    if(
      date &&
      !Number.isNaN(
        new Date(date).getTime()
      )
    ){

      return normalizeDate(date);

    }

  }

  return null;

}


/* =========================================================
   MONTH FOR DATE
   ========================================================= */

function getMonthForDate(date){

  if(
    window.BodoCalendarData &&
    typeof window.BodoCalendarData.getBodoMonthForDate === "function"
  ){

    const result =
      window.BodoCalendarData.getBodoMonthForDate(
        date
      );

    /*
     * IMPORTANT FIX:
     *
     * getBodoMonthForDate()
     * returns:
     *
     * {
     *   month: {...},
     *   bodoYear: ...
     * }
     *
     * NOT the month directly.
     */

    if(
      result &&
      result.month
    ){

      return result.month;

    }

  }

  return null;

}


/* =========================================================
   BODO DATE INFO
   ========================================================= */

function getBodoDateInfo(date){

  if(
    window.BodoCalendarData &&
    typeof window.BodoCalendarData.getBodoDateInfo === "function"
  ){

    return (
      window.BodoCalendarData.getBodoDateInfo(
        date
      ) || null
    );

  }

  return null;

}


/* =========================================================
   MONTH LOOKUP
   ========================================================= */

function getMonthById(id){

  const months =
    getMonths();

  return (
    months.find(
      month =>
        String(month.id) === String(id)
    ) || null
  );

}


/* =========================================================
   MONTH NAME
   ========================================================= */

function getBodoMonthName(month){

  if(!month){
    return "Bodo Month";
  }

  return (
    month.englishName ||
    month.name ||
    month.title ||
    "Bodo Month"
  );

}


function getBodoNativeName(month){

  if(!month){
    return "";
  }

  return (
    month.nativeName ||
    month.bodoName ||
    month.native ||
    ""
  );

}


/* =========================================================
   EVENTS
   ========================================================= */

function getEventsForDate(date){

  const api =
    window.BodoCalendarEvents;

  if(
    api &&
    typeof api.getEventsForDate === "function"
  ){

    return (
      api.getEventsForDate(date) || []
    );

  }

  if(
    api &&
    typeof api.getEventsByDate === "function"
  ){

    return (
      api.getEventsByDate(date) || []
    );

  }

  return [];

}


function getEventsForMonth(monthId){

  const api =
    window.BodoCalendarEvents;

  if(
    api &&
    typeof api.getEventsForMonth === "function"
  ){

    return (
      api.getEventsForMonth(monthId) || []
    );

  }

  if(
    api &&
    typeof api.getEventsForBodoMonth === "function"
  ){

    return (
      api.getEventsForBodoMonth(monthId) || []
    );

  }

  if(
    api &&
    typeof api.getEventsForBodoMonth === "function"
  ){

    return (
      api.getEventsForBodoMonth(monthId) || []
    );

  }

  if(
    typeof window.getEventsForBodoMonth === "function"
  ){

    return (
      window.getEventsForBodoMonth(monthId) || []
    );

  }

  return [];

}


/* =========================================================
   NOTES
   ========================================================= */

function getNotesForDate(date){

  const api =
    window.BodoCalendarNotes;

  if(
    api &&
    typeof api.getNotesForDate === "function"
  ){

    return (
      api.getNotesForDate(
        createDateKey(date)
      ) || []
    );

  }

  return [];

}


function getAllNotes(){

  const api =
    window.BodoCalendarNotes;

  if(
    api &&
    typeof api.getAllNotes === "function"
  ){

    return (
      api.getAllNotes() || []
    );

  }

  return [];

}


/* =========================================================
   FORMATTERS
   ========================================================= */

function formatEnglishDate(
  date,
  options
){

  return normalizeDate(date)
    .toLocaleDateString(
      "en-IN",
      options || {
        day:"numeric",
        month:"long",
        year:"numeric"
      }
    );

}


function formatShortEnglishDate(date){

  return formatEnglishDate(
    date,
    {
      day:"numeric",
      month:"short",
      year:"numeric"
    }
  );

}


function getBodoDateNumberFromInfo(info){

  if(!info){
    return null;
  }

  /*
   * PRIMARY FIX:
   * Current data stores the day at info.bodo.day.
   */

  if(
    info.bodo &&
    info.bodo.day !== undefined
  ){

    return info.bodo.day;

  }

  return (
    info.bodoDate ??
    info.dateNumber ??
    info.day ??
    info.dayNumber ??
    null
  );

}


/* =========================================================
   CURRENT MONTH
   ========================================================= */

function detectCurrentMonth(){

  const month =
    getMonthForDate(
      state.today
    );

  if(month){

    state.selectedMonthId =
      month.id;

    return month;

  }

  const months =
    getMonths();

  if(months.length){

    state.selectedMonthId =
      months[0].id;

    return months[0];

  }

  return null;

}


/* =========================================================
   MONTH SELECT
   ========================================================= */

function renderMonthSelector(){

  const select =
    $("monthSelect");

  if(!select){
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

      const name =
        getBodoMonthName(month);

      const native =
        getBodoNativeName(month);

      option.textContent =
        native
          ? `${name} — ${native}`
          : name;

      if(
        String(month.id) ===
        String(state.selectedMonthId)
      ){

        option.selected = true;

      }

      select.appendChild(
        option
      );

    }
  );

}


/* =========================================================
   WEEKDAY HEADER
   ========================================================= */

function renderWeekdayHeader(){

  const container =
    $("weekdayHeader");

  if(!container){
    return;
  }

  const weekdays =
    getWeekdays();

  container.innerHTML = "";

  weekdays.forEach(
    weekday => {

      const item =
        document.createElement("div");

      item.className =
        "weekday-item";

      if(
        typeof weekday === "string"
      ){

        item.textContent =
          weekday;

      }else{

        const english =
          weekday.en ||
          weekday.english ||
          weekday.name ||
          "";

        const bodo =
          weekday.bodo ||
          weekday.nativeName ||
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


/* =========================================================
   MONTH BANNER
   ========================================================= */

function renderMonthBanner(){

  const month =
    getMonthById(
      state.selectedMonthId
    );

  if(!month){
    return;
  }

  const name =
    getBodoMonthName(month);

  const native =
    getBodoNativeName(month);

  if($("currentMonthName")){

    $("currentMonthName")
      .textContent = name;

  }

  if($("currentMonthNativeName")){

    $("currentMonthNativeName")
      .textContent = native;

  }

  const start =
    getMonthStartDateHelper(
      month
    );

  let end = null;

  const year =
    getSelectedBodoYear(month);

  if(
    window.BodoCalendarData &&
    typeof window.BodoCalendarData.getBodoMonthEndDate === "function"
  ){

    end =
      window.BodoCalendarData.getBodoMonthEndDate(
        month.id,
        year
      );

  }

  if($("currentMonthDateRange")){

    if(start && end){

      $("currentMonthDateRange")
        .textContent =
          `${formatShortEnglishDate(
            start
          )} — ${formatShortEnglishDate(
            end
          )}`;

    }else{

      $("currentMonthDateRange")
        .textContent =
          month.dateRange ||
          "Bodo Solar Calendar Month";

    }

  }

  if($("monthSeasonLabel")){

    $("monthSeasonLabel")
      .textContent =
        month.season ||
        "BODO SOLAR MONTH";

  }

  updateSeason(month);

}


/* =========================================================
   CALENDAR
   ========================================================= */

function renderCalendar(){

  const grid =
    $("calendarGrid");

  if(!grid){
    return;
  }

  const month =
    getMonthById(
      state.selectedMonthId
    );

  if(!month){

    grid.innerHTML =
      createEmptyState(
        "Calendar month unavailable."
      );

    return;

  }

  const year =
    getSelectedBodoYear(month);

  let dates = [];

  if(
    window.BodoCalendarData &&
    typeof window.BodoCalendarData.getBodoMonthDates === "function"
  ){

    dates =
      window.BodoCalendarData.getBodoMonthDates(
        month.id,
        year
      ) || [];

  }

  grid.innerHTML = "";

  if(!dates.length){

    grid.innerHTML =
      createEmptyState(
        "No calendar dates available."
      );

    return;

  }

  const firstDate =
    dates[0] &&
    dates[0].date
      ? normalizeDate(
          dates[0].date
        )
      : null;

  if(firstDate){

    const weekday =
      firstDate.getDay();

    for(
      let i=0;
      i<weekday;
      i++
    ){

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
    entry => {

      if(
        !entry ||
        !entry.date
      ){

        return;

      }

      const date =
        normalizeDate(
          entry.date
        );

      grid.appendChild(
        createDateCard(
          date,
          entry,
          month
        )
      );

    }
  );

}


/* =========================================================
   DATE CARD
   ========================================================= */

function createDateCard(
  date,
  entry,
  month
){

  const card =
    document.createElement(
      "button"
    );

  card.type =
    "button";

  card.className =
    "calendar-date";

  const dateKey =
    createDateKey(date);

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
    getEventsForDate(date);

  const notes =
    getNotesForDate(date);

  if(isToday){

    card.classList.add(
      "today",
      "is-today"
    );

  }

  if(isSelected){

    card.classList.add(
      "selected"
    );

  }

  if(events.length){

    card.classList.add(
      "has-event",
      "event-date"
    );

  }

  if(notes.length){

    card.classList.add(
      "has-note",
      "note-date"
    );

  }

  const info =
    getBodoDateInfo(date);

  const bodoNumber =
    getBodoDateNumberFromInfo(
      info
    );

  const weekday =
    date.toLocaleDateString(
      "en-IN",
      {
        weekday:"short"
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
      ${escapeHTML(date.getDate())}
    </span>

    ${
      events.length
        ? `<span class="date-event-dot"></span>`
        : ""
    }

    ${
      notes.length
        ? `<span class="date-note-dot"></span>`
        : ""
    }

  `;

  card.setAttribute(
    "aria-label",
    `${getBodoMonthName(month)} ` +
    `${bodoNumber}, ` +
    `${formatEnglishDate(date)}`
  );

  card.addEventListener(
    "click",
    function(){

      selectDate(
        date,
        true
      );

    }
  );

  return card;

}


/* =========================================================
   EMPTY
   ========================================================= */

function createEmptyState(message){

  return `
    <div class="empty-state">
      <span>📅</span>
      <p>${escapeHTML(message)}</p>
    </div>
  `;

}


/* =========================================================
   SELECT DATE
   ========================================================= */

function selectDate(
  date,
  openModal=true
){

  state.selectedDate =
    normalizeDate(date);

  /*
   * Make sure selected date's month
   * becomes active.
   */

  const month =
    getMonthForDate(
      state.selectedDate
    );

  if(month){

    state.selectedMonthId =
      month.id;

  }

  updateCalendarView();

  if(openModal){

    openDateModal(
      state.selectedDate
    );

  }

}


/* =========================================================
   SELECTED DATE
   ========================================================= */

function renderSelectedDate(){

  const date =
    state.selectedDate ||
    state.today;

  if(!date){
    return;
  }

  const info =
    getBodoDateInfo(date);

  const month =
    getMonthForDate(date);

  const bodoNumber =
    getBodoDateNumberFromInfo(
      info
    );

  if($("selectedDateTitle")){

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

  if(!details){
    return;
  }

  const events =
    getEventsForDate(date);

  const notes =
    getNotesForDate(date);

  let html = `

    <div class="selected-date-main">
      <strong>
        ${escapeHTML(
          formatEnglishDate(date)
        )}
      </strong>
    </div>

  `;

  if(month){

    html += `

      <div class="selected-date-bodo">
        Bodo Date:
        <strong>
          ${escapeHTML(
            getBodoMonthName(month)
          )}
          ${escapeHTML(
            bodoNumber || ""
          )}
        </strong>
      </div>

    `;

  }

  if(events.length){

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

  if(notes.length){

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
              "Personal Note"
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

  if(
    !events.length &&
    !notes.length
  ){

    html += `
      <p class="selected-date-empty">
        No event or personal note for this date.
      </p>
    `;

  }

  details.innerHTML =
    html;

}


/* =========================================================
   DATE MODAL
   ========================================================= */

function openDateModal(date){

  const modal =
    $("dateModal");

  if(!modal){
    return;
  }

  const info =
    getBodoDateInfo(date);

  const month =
    getMonthForDate(date);

  const bodoNumber =
    getBodoDateNumberFromInfo(
      info
    );

  if($("dateModalTitle")){

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

  if(!body){
    return;
  }

  const events =
    getEventsForDate(date);

  const notes =
    getNotesForDate(date);

  let html = `

    <div class="date-detail-block">
      <span class="detail-label">
        GREGORIAN DATE
      </span>

      <strong>
        ${escapeHTML(
          formatEnglishDate(date)
        )}
      </strong>
    </div>

  `;

  if(month){

    html += `

      <div class="date-detail-block">

        <span class="detail-label">
          BODO DATE
        </span>

        <strong>
          ${escapeHTML(
            getBodoMonthName(month)
          )}
          ${escapeHTML(
            bodoNumber || ""
          )}
        </strong>

        <small>
          ${escapeHTML(
            getBodoNativeName(month)
          )}
        </small>

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
              weekday:"long"
            }
          )
        )}
      </strong>

    </div>

  `;

  if(events.length){

    html += `
      <div class="date-detail-events">
        <h3>🎉 Events</h3>
    `;

    events.forEach(
      event => {

        html += `

          <article class="date-event-item">

            <strong>
              ${escapeHTML(
                event.title ||
                event.name ||
                "Event"
              )}
            </strong>

            <span>
              ${escapeHTML(
                event.type ||
                event.category ||
                "Cultural Event"
              )}
            </span>

            ${
              event.description ||
              event.desc ||
              event.details
                ? `
                  <p>
                    ${escapeHTML(
                      event.description ||
                      event.desc ||
                      event.details
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

  if(notes.length){

    html += `
      <div class="date-detail-notes">
        <h3>📝 My Notes</h3>
    `;

    notes.forEach(
      note => {

        html += `

          <article class="date-note-item">

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

  if(
    !events.length &&
    !notes.length
  ){

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

  if($("noteDate")){

    $("noteDate").value =
      createDateKey(date);

  }

  modal.classList.remove(
    "hidden"
  );

  document.body.classList.add(
    "modal-open"
  );

}


function closeDateModal(){

  const modal =
    $("dateModal");

  if(modal){

    modal.classList.add(
      "hidden"
    );

  }

  document.body.classList.remove(
    "modal-open"
  );

}


/* =========================================================
   EVENTS
   ========================================================= */

function renderEvents(){

  const container =
    $("eventsList");

  if(!container){
    return;
  }

  const events =
    getEventsForMonth(
      state.selectedMonthId
    );

  container.innerHTML = "";

  if(!events.length){

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

      const dateText =
        event.date
          ? formatShortEnglishDate(
              event.date
            )
          : event.bodoDay
            ? `Bodo Date ${event.bodoDay}`
            : "";

      item.innerHTML = `

        <div class="event-list-icon">
          ${escapeHTML(
            event.icon || "🎉"
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
                  ${escapeHTML(dateText)}
                </small>
              `
              : ""
          }

          ${
            event.description ||
            event.desc ||
            event.details
              ? `
                <p>
                  ${escapeHTML(
                    event.description ||
                    event.desc ||
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


/* =========================================================
   HISTORY
   ========================================================= */

function renderHistory(){

  const container =
    $("historyList");

  if(!container){
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
          type.includes("history") ||
          type.includes("birth") ||
          type.includes("death") ||
          type.includes("anniversary") ||
          type.includes("remembrance")
        );

      }
    );

  container.innerHTML = "";

  if(!historical.length){

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
            event.desc ||
            event.details
              ? `
                <p>
                  ${escapeHTML(
                    event.description ||
                    event.desc ||
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


/* =========================================================
   SEASON
   ========================================================= */

function updateSeason(month){

  if(!month){
    return;
  }

  const title =
    $("seasonTitle");

  const description =
    $("seasonDescription");

  if(title){

    title.textContent =
      month.season ||
      "Bodo Seasonal Cycle";

  }

  if(description){

    description.textContent =
      month.seasonDescription ||
      "This month is part of the traditional Bodo solar calendar cycle.";

  }

}


/* =========================================================
   LIVE STATUS
   ========================================================= */

function renderLiveStatus(){

  const items = [

    {
      date:state.today,
      target:"todayAlertText",
      card:"todayStatusCard"
    },

    {
      date:state.tomorrow,
      target:"tomorrowAlertText",
      card:"tomorrowStatusCard"
    },

    {
      date:state.dayAfterTomorrow,
      target:"dayAfterTomorrowAlertText",
      card:"dayAfterTomorrowStatusCard"
    }

  ];

  items.forEach(
    item => {

      const target =
        $(item.target);

      const card =
        $(item.card);

      if(!target){
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

      if(month){

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

      if(events.length){

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

      }else{

        html += `
          <div class="live-no-event">
            No major event listed
          </div>
        `;

      }

      if(notes.length){

        html += `

          <div class="live-note-summary">
            📝 ${notes.length}
            personal note${notes.length > 1 ? "s" : ""}
          </div>

        `;

      }

      target.innerHTML =
        html;

      if(card){

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

  if($("liveStatusUpdated")){

    $("liveStatusUpdated")
      .textContent =
        `Updated ${formatEnglishDate(
          new Date(),
          {
            day:"numeric",
            month:"short",
            year:"numeric",
            hour:"numeric",
            minute:"2-digit"
          }
        )}`;

  }

  renderCalendarSystemStatus();

}


/* =========================================================
   CALENDAR SYSTEM STATUS
   ========================================================= */

function renderCalendarSystemStatus(){

  if($("englishTodayStatus")){

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

  if($("bodoTodayStatus")){

    $("bodoTodayStatus")
      .textContent =
        month
          ? `${getBodoMonthName(
              month
            )} ${bodoNumber || ""}`
          : "Bodo date available";

  }

  if($("assameseTodayStatus")){

    $("assameseTodayStatus")
      .textContent =
        getAssameseReferenceText(
          state.today
        );

  }

}


function getAssameseReferenceText(date){

  if(
    window.BodoCalendarAssamese &&
    typeof window.BodoCalendarAssamese.getTodayReference === "function"
  ){

    return (
      window.BodoCalendarAssamese.getTodayReference(
        date
      ) ||
      "Reference available"
    );

  }

  return "Reference layer";

}


/* =========================================================
   MONTH REFERENCE
   ========================================================= */

function renderMonthReference(){

  const tbody =
    $("monthReferenceBody");

  if(!tbody){
    return;
  }

  const months =
    getMonths();

  tbody.innerHTML = "";

  months.forEach(
    (month,index) => {

      const row =
        document.createElement(
          "tr"
        );

      let range =
        month.dateRange ||
        "";

      const year =
        getSelectedBodoYear(
          month
        );

      const start =
        getMonthStartDateHelper(
          month
        );

      let end = null;

      if(
        window.BodoCalendarData &&
        typeof window.BodoCalendarData.getBodoMonthEndDate === "function"
      ){

        end =
          window.BodoCalendarData.getBodoMonthEndDate(
            month.id,
            year
          );

      }

      if(
        start &&
        end
      ){

        range =
          `${formatShortEnglishDate(
            start
          )} — ${formatShortEnglishDate(
            end
          )}`;

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
            range
          )}
        </td>

      `;

      tbody.appendChild(
        row
      );

    }
  );

}


/* =========================================================
   MONTH NAVIGATION
   ========================================================= */

function changeMonth(direction){

  const months =
    getMonths();

  if(!months.length){
    return;
  }

  let index =
    months.findIndex(
      month =>
        String(month.id) ===
        String(state.selectedMonthId)
    );

  if(index < 0){
    index = 0;
  }

  index += direction;

  if(index < 0){

    index =
      months.length - 1;

  }

  if(index >= months.length){

    index = 0;

  }

  state.selectedMonthId =
    months[index].id;

  state.selectedDate =
    null;

  updateCalendarView();

}


function goToToday(){

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

  if(month){

    state.selectedMonthId =
      month.id;

  }

  state.selectedDate =
    state.today;

  updateCalendarView();

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

}


/* =========================================================
   UPDATE VIEW
   ========================================================= */

function updateCalendarView(){

  renderMonthSelector();

  renderMonthBanner();

  renderWeekdayHeader();

  renderCalendar();

  renderEvents();

  renderHistory();

  renderMonthReference();

  renderSelectedDate();

}


/* =========================================================
   WELCOME
   ========================================================= */

function setupWelcomeCard(){

  const card =
    $("welcomeCard");

  const close =
    $("closeWelcomeBtn");

  if(!card){
    return;
  }

  try{

    if(
      localStorage.getItem(
        WELCOME_STORAGE_KEY
      ) === "true"
    ){

      card.classList.add(
        "hidden"
      );

    }

  }catch(error){}

  if(close){

    close.addEventListener(
      "click",
      function(){

        card.classList.add(
          "hidden"
        );

        try{

          localStorage.setItem(
            WELCOME_STORAGE_KEY,
            "true"
          );

        }catch(error){}

      }
    );

  }

}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

async function loadNotifications(){

  const panel =
    $("notificationPanel");

  if(!panel){
    return;
  }

  try{

    const response =
      await fetch(
        NOTIFICATION_URL,
        {
          cache:"no-store"
        }
      );

    if(!response.ok){

      throw new Error(
        `HTTP ${response.status}`
      );

    }

    const data =
      await response.json();

    const notifications =
      Array.isArray(data)
        ? data
        : (
            data.notifications ||
            [data.notification || {}]
          );

    state.notifications =
      notifications;

    const active =
      notifications.find(
        notification =>
          notification.enabled !== false &&
          notification.active !== false
      );

    if(active){

      if($("notificationTitle")){

        $("notificationTitle")
          .textContent =
            active.title ||
            "Update";

      }

      if($("notificationBadge")){

        $("notificationBadge")
          .textContent =
            active.badge ||
            "UPDATE";

      }

      if($("notificationMessage")){

        $("notificationMessage")
          .textContent =
            active.message ||
            "";

      }

      if($("notificationDate")){

        $("notificationDate")
          .textContent =
            active.date ||
            "";

      }

      panel.classList.remove(
        "hidden"
      );

    }else{

      panel.classList.add(
        "hidden"
      );

    }

  }catch(error){

    panel.classList.add(
      "hidden"
    );

  }

}


function setupNotificationClose(){

  const button =
    $("closeNotificationBtn");

  const panel =
    $("notificationPanel");

  if(
    button &&
    panel
  ){

    button.addEventListener(
      "click",
      () =>
        panel.classList.add(
          "hidden"
        )
    );

  }

}


/* =========================================================
   NOTE MODAL
   ========================================================= */

function openNoteModal(date=null){

  const modal =
    $("noteModal");

  if(!modal){
    return;
  }

  const selected =
    date ||
    state.selectedDate ||
    state.today;

  const form =
    $("noteForm");

  if(form){

    form.reset();

  }

  if($("noteDate")){

    $("noteDate").value =
      createDateKey(
        selected
      );

  }

  modal.classList.remove(
    "hidden"
  );

  document.body.classList.add(
    "modal-open"
  );

}


function closeNoteModal(){

  const modal =
    $("noteModal");

  if(modal){

    modal.classList.add(
      "hidden"
    );

  }

  document.body.classList.remove(
    "modal-open"
  );

}


function openNotesList(){

  const modal =
    $("notesListModal");

  if(!modal){
    return;
  }

  const container =
    $("notesListContainer");

  if(container){

    const notes =
      getAllNotes();

    container.innerHTML = "";

    if(!notes.length){

      container.innerHTML =
        createEmptyState(
          "You have no personal notes yet."
        );

    }else{

      notes.forEach(
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
                  note.date || ""
                )}
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

  }

  modal.classList.remove(
    "hidden"
  );

  document.body.classList.add(
    "modal-open"
  );

}


function closeNotesList(){

  const modal =
    $("notesListModal");

  if(modal){

    modal.classList.add(
      "hidden"
    );

  }

  document.body.classList.remove(
    "modal-open"
  );

}


/* =========================================================
   NOTE FORM
   ========================================================= */

function setupNoteForm(){

  const form =
    $("noteForm");

  if(!form){
    return;
  }

  form.addEventListener(
    "submit",
    function(event){

      event.preventDefault();

      if(
        !window.BodoCalendarNotes ||
        typeof window.BodoCalendarNotes.saveNote !== "function"
      ){

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

      if(!title){

        showToast(
          "Please enter a note title.",
          "error"
        );

        return;

      }

      window.BodoCalendarNotes.saveNote({

        id:
          "note-" +
          Date.now(),

        date,

        category,

        title,

        description,

        reminder,

        createdAt:
          new Date().toISOString()

      });

      closeNoteModal();

      updateCalendarView();

      renderLiveStatus();

      showToast(
        "Personal note saved successfully.",
        "success"
      );

    }
  );

}


/* =========================================================
   MODALS
   ========================================================= */

function setupModalButtons(){

  if($("closeDateModalBtn")){

    $("closeDateModalBtn")
      .addEventListener(
        "click",
        closeDateModal
      );

  }

  if($("closeDateModalBottomBtn")){

    $("closeDateModalBottomBtn")
      .addEventListener(
        "click",
        closeDateModal
      );

  }

  if($("closeNoteModalBtn")){

    $("closeNoteModalBtn")
      .addEventListener(
        "click",
        closeNoteModal
      );

  }

  if($("cancelNoteBtn")){

    $("cancelNoteBtn")
      .addEventListener(
        "click",
        closeNoteModal
      );

  }

  if($("closeNotesListBtn")){

    $("closeNotesListBtn")
      .addEventListener(
        "click",
        closeNotesList
      );

  }

  if($("addNoteFromDateBtn")){

    $("addNoteFromDateBtn")
      .addEventListener(
        "click",
        function(){

          closeDateModal();

          openNoteModal(
            state.selectedDate ||
            state.today
          );

        }
      );

  }

  document.addEventListener(
    "keydown",
    function(event){

      if(event.key === "Escape"){

        closeDateModal();

        closeNoteModal();

        closeNotesList();

      }

    }
  );

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation(){

  if($("prevMonthBtn")){

    $("prevMonthBtn")
      .addEventListener(
        "click",
        () => changeMonth(-1)
      );

  }

  if($("nextMonthBtn")){

    $("nextMonthBtn")
      .addEventListener(
        "click",
        () => changeMonth(1)
      );

  }

  if($("todayBtn")){

    $("todayBtn")
      .addEventListener(
        "click",
        goToToday
      );

  }

  const select =
    $("monthSelect");

  if(select){

    select.addEventListener(
      "change",
      function(){

        state.selectedMonthId =
          Number(select.value);

        state.selectedDate =
          null;

        updateCalendarView();

      }
    );

  }

}


/* =========================================================
   FOOTER
   ========================================================= */

function setupFooterButtons(){

  if($("footerNotesBtn")){

    $("footerNotesBtn")
      .addEventListener(
        "click",
        openNotesList
      );

  }

  if($("openNotesBtn")){

    $("openNotesBtn")
      .addEventListener(
        "click",
        openNotesList
      );

  }

  if($("footerAboutBtn")){

    $("footerAboutBtn")
      .addEventListener(
        "click",
        function(){

          const section =
            document.querySelector(
              ".about-calendar-card"
            );

          if(section){

            section.scrollIntoView({
              behavior:"smooth",
              block:"start"
            });

          }

        }
      );

  }

}


/* =========================================================
   INSTALL
   ========================================================= */

function setupInstallPrompt(){

  const button =
    $("installAppBtn");

  window.addEventListener(
    "beforeinstallprompt",
    function(event){

      event.preventDefault();

      state.deferredInstallPrompt =
        event;

      if(button){

        button.classList.remove(
          "hidden"
        );

      }

    }
  );

  if(button){

    button.addEventListener(
      "click",
      async function(){

        if(
          !state.deferredInstallPrompt
        ){

          return;

        }

        try{

          await state.deferredInstallPrompt.prompt();

          await state.deferredInstallPrompt.userChoice;

        }catch(error){}

        state.deferredInstallPrompt =
          null;

        button.classList.add(
          "hidden"
        );

      }
    );

  }

  window.addEventListener(
    "appinstalled",
    function(){

      state.deferredInstallPrompt =
        null;

      if(button){

        button.classList.add(
          "hidden"
        );

      }

    }
  );

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
  message,
  type="info"
){

  const container =
    $("toastContainer");

  if(!container){
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
    () => {
      toast.classList.add(
        "show"
      );
    }
  );

  setTimeout(
    function(){

      toast.classList.remove(
        "show"
      );

      setTimeout(
        () => toast.remove(),
        300
      );

    },
    3500
  );

}

window.showToast =
  showToast;


/* =========================================================
   LOADING
   ========================================================= */

function hideLoadingScreen(){

  const screen =
    $("loadingScreen");

  if(!screen){
    return;
  }

  screen.classList.add(
    "hidden"
  );

  setTimeout(
    function(){

      if(screen.parentNode){

        screen.style.display =
          "none";

      }

    },
    300
  );

}


/* =========================================================
   INITIALIZE
   ========================================================= */

async function initApp(){

  if(state.initialized){
    return;
  }

  state.initialized =
    true;

  try{

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

    /*
     * VIP module remains responsible for
     * its own buttons/modal/payment flow.
     */

    if(
      window.BodoCalendarVIP &&
      typeof window.BodoCalendarVIP.initVIP === "function"
    ){

      window.BodoCalendarVIP.initVIP();

    }

    loadNotifications();

    if($("copyrightYear")){

      $("copyrightYear")
        .textContent =
          String(
            new Date().getFullYear()
          );

    }

    setTimeout(
      hideLoadingScreen,
      120
    );

  }catch(error){

    console.error(
      "Bodo Calendar initialization error:",
      error
    );

    hideLoadingScreen();

  }

}


/* =========================================================
   PUBLIC API
   ========================================================= */

window.BodoCalendarApp = {

  state,

  init:initApp,

  goToToday,

  changeMonth,

  selectDate,

  updateCalendarView

};

window.BODO_APP_READY =
  true;


/* =========================================================
   START
   ========================================================= */

if(
  document.readyState === "loading"
){

  document.addEventListener(
    "DOMContentLoaded",
    initApp,
    {once:true}
  );

}else{

  initApp();

}

})();