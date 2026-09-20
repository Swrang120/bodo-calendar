/* =========================================================
   BODO CALENDAR — EVENTS ENGINE
   Version: 6.0

   Handles:
   - Bodo cultural events
   - Festivals
   - Puja
   - Birth anniversaries
   - Death anniversaries
   - Historical events
   - Seasonal/cultural events
   - Date-based event lookup
   ========================================================= */


/* =========================================================
   1. CULTURAL EVENTS DATABASE
   ========================================================= */

const bodoCulturalEvents = {

  /* =======================================================
     MAGH — Month Index 0
     ======================================================= */

  "0-1": [
    {
      title: "🪔 Magw Bwisagu / Magh Bihu",
      desc: "Harvest festival & traditional Bodo feast",
      type: "Festival"
    }
  ],

  "0-15": [
    {
      title: "👑 Bodo National Day",
      desc: "Commemoration of Bodo identity & history",
      type: "History"
    }
  ],


  /* =======================================================
     FAGUN — Month Index 1
     ======================================================= */

  "1-15": [
    {
      title: "🎂 Gurudev Kalicharan Brahma Jayanti",
      desc: "Birth Anniversary of Bodo social reformer Gurudev Kalicharan Brahma",
      type: "Birth"
    }
  ],


  /* =======================================================
     CHAITRA — Month Index 2
     ======================================================= */

  "2-16": [
    {
      title: "🪔 Kherai Puja / Bathou Puja",
      desc: "Sacred Bodo Bathou worship & Kherai dance ceremony",
      type: "Puja"
    }
  ],


  /* =======================================================
     BWISAG — Month Index 3
     ======================================================= */

  "3-1": [
    {
      title: "🌸 Bwisagu / Garja Puja",
      desc: "Bodo New Year celebration & village cleansing worship",
      type: "Festival"
    }
  ],

  "3-2": [
    {
      title: "🌺 Mansini Bwisagu",
      desc: "Second day of Bwisagu festival for villagers",
      type: "Festival"
    }
  ],

  "3-25": [
    {
      title: "🕊️ Bodofa Upendranath Brahma Death Anniversary",
      desc: "Swargwas diwas of Bodofa Upendranath Brahma (Father of the Bodos)",
      type: "Death"
    }
  ],


  /* =======================================================
     JETH — Month Index 4
     ======================================================= */

  "4-1": [
    {
      title: "🌱 Haba / Rice Planting Ritual",
      desc: "Traditional agricultural season commencement",
      type: "Culture"
    }
  ],


  /* =======================================================
     AASAR — Month Index 5
     ======================================================= */

  "5-15": [
    {
      title: "🕊️ Jwhwlao Nileswar Brahma Remembrance",
      desc: "Tribute to brave Bodo historical martyr Jwhwlao Nileswar Brahma",
      type: "Death"
    }
  ],


  /* =======================================================
     SAWAN — Month Index 6
     ======================================================= */

  "6-15": [
    {
      title: "🎂 Satish Chandra Basumatary Birth Anniversary",
      desc: "Birth anniversary of eminent Bodo literary figure",
      type: "Birth"
    }
  ],


  /* =======================================================
     BHADRA — Month Index 7
     ======================================================= */

  "7-10": [
    {
      title: "👑 Bodo Kingdom Historical Remembrance",
      desc: "Commemoration of ancient Bodo Rajas & Dimasa/Kachari heritage",
      type: "History"
    }
  ],


  /* =======================================================
     AASIN — Month Index 8
     ======================================================= */

  "8-2": [
    {
      title: "✨ Normal Day / Seasonal Work",
      desc: "Regular autumn seasonal workday",
      type: "Normal"
    }
  ],

  "8-12": [
    {
      title: "🪔 Durga Puja / Bathou Seasonal Worship",
      desc: "Traditional autumn festive prayers & pujas",
      type: "Puja"
    }
  ],

  "8-20": [
    {
      title: "🪔 Kati Gasa / Light Worship",
      desc: "Lighting lamps in paddy fields for prosperity",
      type: "Puja"
    }
  ],


  /* =======================================================
     KATI — Month Index 9
     ======================================================= */

  "9-1": [
    {
      title: "🌾 Kati Bwisagu / Kati Bihu",
      desc: "Paddy field lamp festival & Bathou light worship",
      type: "Festival"
    }
  ],

  "9-15": [
    {
      title: "👑 Bodo Sahitya Sabha Foundation Day Preparation",
      desc: "Literary preparation & awareness diwas",
      type: "History"
    }
  ],


  /* =======================================================
     AGHON — Month Index 10
     ======================================================= */

  "10-2": [
    {
      title: "🎂 Bodofa Upendranath Brahma Birth Anniversary",
      desc: "Birth Anniversary of Bodofa Upendranath Brahma (31st March / Agron)",
      type: "Birth"
    }
  ],

  "10-28": [
    {
      title: "📜 Bodo Sahitya Sabha Day",
      desc: "Foundation day of Bodo Sahitya Sabha (16 Nov)",
      type: "History"
    }
  ],


  /* =======================================================
     PUSH — Month Index 11
     ======================================================= */

  "11-22": [
    {
      title: "📜 Bodo Language Day (Boro Rao San)",
      desc: "Recognition of Bodo language inclusion in 8th Schedule",
      type: "History"
    }
  ]
};


/* =========================================================
   2. ADDITIONAL EVENT DATABASE
   =========================================================

   Kept separate so future verified events can be added
   without modifying the main cultural database.
   ========================================================= */

const bodoAdditionalEvents = {};


/* =========================================================
   3. GET EVENTS BY BODO DATE
   ========================================================= */

function getBodoEventKey(monthId, bodoDay) {
  return `${Number(monthId)}-${Number(bodoDay)}`;
}


function getBodoEvents(monthId, bodoDay) {
  const key = getBodoEventKey(
    monthId,
    bodoDay
  );

  const cultural =
    Array.isArray(bodoCulturalEvents[key])
      ? bodoCulturalEvents[key]
      : [];

  const additional =
    Array.isArray(bodoAdditionalEvents[key])
      ? bodoAdditionalEvents[key]
      : [];

  return [
    ...cultural,
    ...additional
  ];
}


/* =========================================================
   4. GET EVENTS FROM DATE
   ========================================================= */

function getEventsForDate(inputDate) {

  if (
    typeof getBodoDateInfo !== "function"
  ) {
    return [];
  }

  const info =
    getBodoDateInfo(inputDate);

  if (!info || !info.bodo) {
    return [];
  }

  return getBodoEvents(
    info.bodo.monthId,
    info.bodo.day
  );
}


/* =========================================================
   5. EVENT TYPE HELPERS
   ========================================================= */

function getEventsByType(
  events,
  type
) {

  if (!Array.isArray(events)) {
    return [];
  }

  if (!type) {
    return events;
  }

  const searchType =
    String(type)
      .trim()
      .toLowerCase();

  return events.filter(event => {
    return (
      String(event.type || "")
        .trim()
        .toLowerCase() === searchType
    );
  });
}


function hasEventsForDate(inputDate) {
  return getEventsForDate(inputDate).length > 0;
}


/* =========================================================
   6. TODAY / TOMORROW / DAY AFTER TOMORROW
   ========================================================= */

function getTodayEvents() {
  return getEventsForDate(
    new Date()
  );
}


function getTomorrowEvents() {

  const date = new Date();

  date.setDate(
    date.getDate() + 1
  );

  return getEventsForDate(date);
}


function getDayAfterTomorrowEvents() {

  const date = new Date();

  date.setDate(
    date.getDate() + 2
  );

  return getEventsForDate(date);
}


/* =========================================================
   7. MONTH EVENTS
   ========================================================= */

function getEventsForBodoMonth(
  monthId
) {

  const month =
    Number(monthId);

  if (
    !Number.isFinite(month) ||
    month < 0 ||
    month > 11
  ) {
    return [];
  }

  const results = [];

  Object.keys(
    bodoCulturalEvents
  ).forEach(key => {

    const parts =
      key.split("-");

    if (Number(parts[0]) !== month) {
      return;
    }

    const day =
      Number(parts[1]);

    const events =
      getBodoEvents(
        month,
        day
      );

    events.forEach(event => {

      results.push({
        ...event,
        monthId: month,
        bodoDay: day,
        key
      });

    });

  });

  results.sort(
    (a, b) =>
      a.bodoDay - b.bodoDay
  );

  return results;
}


/* =========================================================
   8. GET ALL EVENT DAYS
   ========================================================= */

function getEventDaysForMonth(
  monthId
) {

  const events =
    getEventsForBodoMonth(
      monthId
    );

  return [
    ...new Set(
      events.map(
        event => event.bodoDay
      )
    )
  ].sort(
    (a, b) => a - b
  );
}


/* =========================================================
   9. SEARCH EVENTS
   ========================================================= */

function searchBodoEvents(
  searchText
) {

  if (!searchText) {
    return [];
  }

  const query =
    String(searchText)
      .trim()
      .toLowerCase();

  const results = [];

  Object.keys(
    bodoCulturalEvents
  ).forEach(key => {

    const events =
      bodoCulturalEvents[key];

    events.forEach(event => {

      const searchable =
        [
          event.title,
          event.desc,
          event.type
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

      if (
        searchable.includes(query)
      ) {

        const parts =
          key.split("-");

        results.push({
          ...event,
          monthId:
            Number(parts[0]),
          bodoDay:
            Number(parts[1]),
          key
        });

      }

    });

  });

  return results;
}


/* =========================================================
   10. EVENT SUMMARY
   ========================================================= */

function getEventSummary(
  inputDate
) {

  const events =
    getEventsForDate(
      inputDate
    );

  if (!events.length) {
    return {
      hasEvents: false,
      count: 0,
      primary: null,
      events: []
    };
  }

  return {
    hasEvents: true,
    count: events.length,
    primary: events[0],
    events
  };
}


/* =========================================================
   11. NORMALIZE EVENT
   ========================================================= */

function normalizeBodoEvent(
  event
) {

  if (!event) {
    return null;
  }

  return {
    title:
      String(
        event.title || "Event"
      ),

    desc:
      String(
        event.desc ||
        event.description ||
        ""
      ),

    description:
      String(
        event.desc ||
        event.description ||
        ""
      ),

    type:
      String(
        event.type ||
        "Culture"
      ),

    icon:
      event.icon ||
      "",

    source:
      event.source ||
      "",

    verified:
      event.verified === true
  };
}


/* =========================================================
   12. GET NORMALIZED EVENTS
   ========================================================= */

function getNormalizedEventsForDate(
  inputDate
) {

  return getEventsForDate(
    inputDate
  )
    .map(normalizeBodoEvent)
    .filter(Boolean);
}


/* =========================================================
   13. EVENT TYPE LIST
   ========================================================= */

function getAvailableEventTypes() {

  const types =
    new Set();

  Object.keys(
    bodoCulturalEvents
  ).forEach(key => {

    bodoCulturalEvents[key]
      .forEach(event => {

        if (event.type) {
          types.add(
            String(event.type)
          );
        }

      });

  });

  return Array.from(types)
    .sort();
}


/* =========================================================
   14. DATE STATUS
   ========================================================= */

function getEventDateStatus(
  inputDate
) {

  const events =
    getEventsForDate(
      inputDate
    );

  return {
    date:
      typeof getDateKey === "function"
        ? getDateKey(inputDate)
        : "",

    hasEvents:
      events.length > 0,

    count:
      events.length,

    events
  };
}


/* =========================================================
   15. LIVE EVENT CHECK
   ========================================================= */

function getLiveEventStatus() {

  const today =
    new Date();

  const tomorrow =
    new Date(today);

  tomorrow.setDate(
    tomorrow.getDate() + 1
  );

  const dayAfter =
    new Date(today);

  dayAfter.setDate(
    dayAfter.getDate() + 2
  );

  return {
    today:
      getEventDateStatus(today),

    tomorrow:
      getEventDateStatus(tomorrow),

    dayAfterTomorrow:
      getEventDateStatus(dayAfter)
  };
}


/* =========================================================
   16. RENDER-SAFE EVENT TEXT
   ========================================================= */

function getEventDisplayTitle(
  event
) {

  if (!event) {
    return "";
  }

  return String(
    event.title || ""
  );
}


function getEventDisplayDescription(
  event
) {

  if (!event) {
    return "";
  }

  return String(
    event.desc ||
    event.description ||
    ""
  );
}


/* =========================================================
   17. COMPATIBILITY ALIASES
   =========================================================

   These aliases make the event engine easier for app.js
   and future code to use.
   ========================================================= */

function getEventsByDate(
  inputDate
) {
  return getEventsForDate(
    inputDate
  );
}


function getDateEvents(
  inputDate
) {
  return getEventsForDate(
    inputDate
  );
}


function getMonthlyEvents(
  monthId
) {
  return getEventsForBodoMonth(
    monthId
  );
}


/* =========================================================
   18. GLOBAL EXPORT
   ========================================================= */

window.BodoCalendarEvents = {

  culturalEvents:
    bodoCulturalEvents,

  additionalEvents:
    bodoAdditionalEvents,

  getBodoEventKey,

  getBodoEvents,

  getEventsForDate,

  getEventsByDate,

  getDateEvents,

  getTodayEvents,

  getTomorrowEvents,

  getDayAfterTomorrowEvents,

  getEventsForBodoMonth,

  getMonthlyEvents,

  getEventDaysForMonth,

  getEventsByType,

  hasEventsForDate,

  searchBodoEvents,

  getEventSummary,

  normalizeBodoEvent,

  getNormalizedEventsForDate,

  getAvailableEventTypes,

  getEventDateStatus,

  getLiveEventStatus,

  getEventDisplayTitle,

  getEventDisplayDescription
};


/* =========================================================
   19. BACKWARD COMPATIBILITY
   ========================================================= */

window.bodoCulturalEvents =
  bodoCulturalEvents;

window.bodoAdditionalEvents =
  bodoAdditionalEvents;


/* =========================================================
   20. READY FLAG
   ========================================================= */

window.BODO_EVENTS_READY =
  true;


/* =========================================================
   END OF EVENTS ENGINE
   ========================================================= */