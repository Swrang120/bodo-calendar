/* =========================================================
   BODO CALENDAR — CALENDAR DATA
   Version: 6.0
   =========================================================

   PURPOSE:
   - Bodo month definitions
   - Gregorian ↔ Bodo date conversion
   - Weekday data
   - Month/date helper functions
   - Leap-year handling
   - Calendar grid support

   IMPORTANT:
   This file contains calendar calculation/data only.
   UI rendering is handled by app.js.
   ========================================================= */


/* =========================================================
   1. BODO MONTH DATA
   ========================================================= */

const bodoMonthsData = [
  {
    id: 0,
    name: "Magh / Maghw (माघ)",
    englishName: "Magh",
    dateRange: "15 Jan – 14 Feb",
    season: "Gozon / Winter",
    startGregMonth: 0,
    startGregDay: 15,
    daysCount: 31
  },

  {
    id: 1,
    name: "Fagun (फागुन)",
    englishName: "Fagun",
    dateRange: "15 Feb – 14 Mar",
    season: "Gozon / Late Winter",
    startGregMonth: 1,
    startGregDay: 15,
    daysCount: 28
  },

  {
    id: 2,
    name: "Chaitra (चैत्र)",
    englishName: "Chaitra",
    dateRange: "15 Mar – 13 Apr",
    season: "Bwisagu / Early Spring",
    startGregMonth: 2,
    startGregDay: 15,
    daysCount: 30
  },

  {
    id: 3,
    name: "Bwisag (बैसागो / बैसाग)",
    englishName: "Bwisag",
    dateRange: "14 Apr – 14 May",
    season: "Bwisag Ritu (Spring Season)",
    startGregMonth: 3,
    startGregDay: 14,
    daysCount: 31
  },

  {
    id: 4,
    name: "Jeth (जेथो)",
    englishName: "Jeth",
    dateRange: "15 May – 14 Jun",
    season: "Dungfu / Early Summer",
    startGregMonth: 4,
    startGregDay: 15,
    daysCount: 31
  },

  {
    id: 5,
    name: "Aasar (आसार)",
    englishName: "Aasar",
    dateRange: "15 Jun – 15 Jul",
    season: "Akhra / Monsoon",
    startGregMonth: 5,
    startGregDay: 15,
    daysCount: 31
  },

  {
    id: 6,
    name: "Sawan (सावन)",
    englishName: "Sawan",
    dateRange: "16 Jul – 16 Aug",
    season: "Akhra / Rainy Season",
    startGregMonth: 6,
    startGregDay: 16,
    daysCount: 32
  },

  {
    id: 7,
    name: "Bhadra (भाद्र)",
    englishName: "Bhadra",
    dateRange: "17 Aug – 18 Sep",
    season: "Late Monsoon",
    startGregMonth: 7,
    startGregDay: 17,
    daysCount: 33
  },

  {
    id: 8,
    name: "Aasin (आसिन)",
    englishName: "Aasin",
    dateRange: "19 Sep – 18 Oct",
    season: "Sirri / Autumn",
    startGregMonth: 8,
    startGregDay: 19,
    daysCount: 30
  },

  {
    id: 9,
    name: "Kati (खाथि)",
    englishName: "Kati",
    dateRange: "19 Oct – 18 Nov",
    season: "Sirri / Late Autumn",
    startGregMonth: 9,
    startGregDay: 19,
    daysCount: 31
  },

  {
    id: 10,
    name: "Aghon (आघन)",
    englishName: "Aghon",
    dateRange: "19 Nov – 18 Dec",
    season: "Gozon / Pre-Winter",
    startGregMonth: 10,
    startGregDay: 19,
    daysCount: 30
  },

  {
    id: 11,
    name: "Push (फुष)",
    englishName: "Push",
    dateRange: "19 Dec – 14 Jan",
    season: "Gozon / Peak Winter",
    startGregMonth: 11,
    startGregDay: 19,
    daysCount: 27
  }
];


/* =========================================================
   2. BODO WEEKDAYS
   ========================================================= */

const bodoWeekdays = [
  {
    en: "Sunday",
    bodo: "Rabibar (रबिबार)"
  },

  {
    en: "Monday",
    bodo: "Sombar (समबार)"
  },

  {
    en: "Tuesday",
    bodo: "Mongolbar (मंगलबार)"
  },

  {
    en: "Wednesday",
    bodo: "Budhbar (बुधबार)"
  },

  {
    en: "Thursday",
    bodo: "Brihospatibar (बृहस्पतीबार)"
  },

  {
    en: "Friday",
    bodo: "Sakrubar (शक्रुबार)"
  },

  {
    en: "Saturday",
    bodo: "Shanibar (शनिबार)"
  }
];


/* =========================================================
   3. MONTH NAME HELPERS
   ========================================================= */

function getBodoMonthById(id) {
  return bodoMonthsData.find(month => month.id === Number(id)) || null;
}


function getBodoMonthByEnglishName(name) {
  if (!name) return null;

  const searchName = String(name).trim().toLowerCase();

  return (
    bodoMonthsData.find(
      month => month.englishName.toLowerCase() === searchName
    ) || null
  );
}


/* =========================================================
   4. GREGORIAN DATE HELPERS
   ========================================================= */

/*
   Create a date safely using local calendar values.

   IMPORTANT:
   We intentionally use local Date objects instead of UTC
   so the calendar does not accidentally shift by one day
   because of timezone conversion.
*/

function createLocalDate(year, monthIndex, day) {
  return new Date(
    Number(year),
    Number(monthIndex),
    Number(day),
    12,
    0,
    0,
    0
  );
}


function normalizeDate(date) {
  if (date instanceof Date) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      12,
      0,
      0,
      0
    );
  }

  if (typeof date === "string") {
    const parts = date.split("-");

    if (parts.length === 3) {
      const year = Number(parts[0]);
      const month = Number(parts[1]) - 1;
      const day = Number(parts[2]);

      if (
        Number.isFinite(year) &&
        Number.isFinite(month) &&
        Number.isFinite(day)
      ) {
        return createLocalDate(year, month, day);
      }
    }
  }

  return new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
    12,
    0,
    0,
    0
  );
}


/* =========================================================
   5. LEAP YEAR
   ========================================================= */

function isGregorianLeapYear(year) {
  year = Number(year);

  return (
    year % 400 === 0 ||
    (year % 100 !== 0 && year % 4 === 0)
  );
}


/* =========================================================
   6. MONTH DAY COUNT
   ========================================================= */

function getBodoMonthDays(monthId, gregorianYear) {
  const month = getBodoMonthById(monthId);

  if (!month) {
    return 0;
  }

  /*
     Fagun receives one extra day during Gregorian leap years.
  */

  if (
    month.id === 1 &&
    isGregorianLeapYear(gregorianYear)
  ) {
    return 29;
  }

  return month.daysCount;
}


/* =========================================================
   7. BODO MONTH START DATE
   ========================================================= */

function getBodoMonthStartDate(monthId, gregorianYear) {
  const month = getBodoMonthById(monthId);

  if (!month) {
    return null;
  }

  /*
     Push starts in December of the previous Gregorian year
     and continues until 14 January.

     All other months begin in their corresponding
     Gregorian year.
  */

  let year = Number(gregorianYear);

  if (month.id === 11) {
    return createLocalDate(
      year,
      month.startGregMonth,
      month.startGregDay
    );
  }

  return createLocalDate(
    year,
    month.startGregMonth,
    month.startGregDay
  );
}


/* =========================================================
   8. BODO MONTH END DATE
   ========================================================= */

function getBodoMonthEndDate(monthId, gregorianYear) {
  const month = getBodoMonthById(monthId);

  if (!month) {
    return null;
  }

  /*
     The supplied Bodo month system uses fixed Gregorian
     transition dates.

     Therefore the safest calculation is:
     start date + month days - 1.
  */

  const startDate = getBodoMonthStartDate(
    monthId,
    gregorianYear
  );

  if (!startDate) {
    return null;
  }

  const days = getBodoMonthDays(
    monthId,
    gregorianYear
  );

  const endDate = new Date(startDate);

  endDate.setDate(
    endDate.getDate() + days - 1
  );

  return endDate;
}


/* =========================================================
   9. DATE COMPARISON
   ========================================================= */

function isSameCalendarDate(dateA, dateB) {
  const a = normalizeDate(dateA);
  const b = normalizeDate(dateB);

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}


/* =========================================================
   10. FIND BODO MONTH FOR A GREGORIAN DATE
   ========================================================= */

function getBodoMonthForDate(inputDate) {
  const date = normalizeDate(inputDate);

  const gregorianYear = date.getFullYear();

  /*
     January 1–14 belongs to Push of the Bodo year
     that started in December of the previous Gregorian year.
  */

  if (
    date.getMonth() === 0 &&
    date.getDate() <= 14
  ) {
    return {
      month: bodoMonthsData[11],
      bodoYear: gregorianYear - 1,
      gregorianYear: gregorianYear,
      isPreviousGregorianYearMonth: true
    };
  }

  /*
     Find the month by comparing its start and end dates.
  */

  for (const month of bodoMonthsData) {
    if (month.id === 11) {
      continue;
    }

    const startDate = getBodoMonthStartDate(
      month.id,
      gregorianYear
    );

    const endDate = getBodoMonthEndDate(
      month.id,
      gregorianYear
    );

    if (
      date >= startDate &&
      date <= endDate
    ) {
      return {
        month,
        bodoYear: gregorianYear,
        gregorianYear,
        isPreviousGregorianYearMonth: false
      };
    }
  }

  /*
     Safety fallback.
  */

  return {
    month: bodoMonthsData[11],
    bodoYear: gregorianYear - 1,
    gregorianYear,
    isPreviousGregorianYearMonth: true
  };
}


/* =========================================================
   11. GET BODO DATE NUMBER
   ========================================================= */

function getBodoDateNumber(inputDate) {
  const date = normalizeDate(inputDate);

  const info = getBodoMonthForDate(date);

  if (!info || !info.month) {
    return null;
  }

  const startDate = getBodoMonthStartDate(
    info.month.id,
    info.bodoYear
  );

  if (!startDate) {
    return null;
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  const difference =
    Math.round(
      (date.getTime() - startDate.getTime()) /
      millisecondsPerDay
    );

  return difference + 1;
}


/* =========================================================
   12. COMPLETE BODO DATE INFORMATION
   ========================================================= */

function getBodoDateInfo(inputDate) {
  const date = normalizeDate(inputDate);

  const info = getBodoMonthForDate(date);

  if (!info || !info.month) {
    return null;
  }

  const bodoDay = getBodoDateNumber(date);

  const weekdayIndex = date.getDay();

  const weekday =
    bodoWeekdays[weekdayIndex] || null;

  const month = info.month;

  const startDate = getBodoMonthStartDate(
    month.id,
    info.bodoYear
  );

  const endDate = getBodoMonthEndDate(
    month.id,
    info.bodoYear
  );

  return {
    date: date,

    gregorian: {
      year: date.getFullYear(),
      month: date.getMonth(),
      monthNumber: date.getMonth() + 1,
      day: date.getDate(),
      weekdayIndex,
      weekdayEnglish: weekday ? weekday.en : "",
      weekdayBodo: weekday ? weekday.bodo : ""
    },

    bodo: {
      year: info.bodoYear,
      monthId: month.id,
      monthName: month.name,
      englishMonthName: month.englishName,
      day: bodoDay,
      daysInMonth: getBodoMonthDays(
        month.id,
        info.bodoYear
      ),
      season: month.season,
      dateRange: month.dateRange,
      startDate,
      endDate
    },

    weekday: weekday,

    isToday: isSameCalendarDate(
      date,
      new Date()
    )
  };
}


/* =========================================================
   13. FORMATTERS
   ========================================================= */

function formatGregorianDate(inputDate) {
  const date = normalizeDate(inputDate);

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  );
}


function formatBodoDate(inputDate) {
  const info = getBodoDateInfo(inputDate);

  if (!info) {
    return "";
  }

  return `${info.bodo.day} ${info.bodo.englishMonthName}`;
}


function formatFullBodoDate(inputDate) {
  const info = getBodoDateInfo(inputDate);

  if (!info) {
    return "";
  }

  return `${info.bodo.day} ${info.bodo.englishMonthName} — ${formatGregorianDate(
    inputDate
  )}`;
}


/* =========================================================
   14. GENERATE DATES FOR A BODO MONTH
   ========================================================= */

function getBodoMonthDates(monthId, bodoYear) {
  const month = getBodoMonthById(monthId);

  if (!month) {
    return [];
  }

  /*
     Push belongs to December of the Bodo year.
  */

  const startYear =
    monthId === 11
      ? Number(bodoYear)
      : Number(bodoYear);

  const startDate = getBodoMonthStartDate(
    monthId,
    startYear
  );

  const totalDays = getBodoMonthDays(
    monthId,
    startYear
  );

  const dates = [];

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(startDate);

    date.setDate(
      startDate.getDate() + i
    );

    dates.push(
      getBodoDateInfo(date)
    );
  }

  return dates;
}


/* =========================================================
   15. GET CURRENT BODO MONTH
   ========================================================= */

function getCurrentBodoDateInfo() {
  return getBodoDateInfo(new Date());
}


/* =========================================================
   16. GET TODAY / TOMORROW / DAY AFTER TOMORROW
   ========================================================= */

function getTodayBodoDateInfo() {
  return getBodoDateInfo(new Date());
}


function getTomorrowBodoDateInfo() {
  const date = new Date();

  date.setDate(
    date.getDate() + 1
  );

  return getBodoDateInfo(date);
}


function getDayAfterTomorrowBodoDateInfo() {
  const date = new Date();

  date.setDate(
    date.getDate() + 2
  );

  return getBodoDateInfo(date);
}


/* =========================================================
   17. GET WEEKDAY INFORMATION
   ========================================================= */

function getBodoWeekday(inputDate) {
  const date = normalizeDate(inputDate);

  return (
    bodoWeekdays[date.getDay()] || null
  );
}


/* =========================================================
   18. MONTH REFERENCE DATA
   ========================================================= */

function getBodoMonthReference() {
  return bodoMonthsData.map(month => ({
    id: month.id,
    englishName: month.englishName,
    name: month.name,
    dateRange: month.dateRange,
    season: month.season,
    daysCount: month.daysCount
  }));
}


/* =========================================================
   19. CALENDAR RANGE HELPER
   ========================================================= */

function getGregorianMonthRange(year, monthIndex) {
  const firstDay = createLocalDate(
    year,
    monthIndex,
    1
  );

  const lastDay = new Date(
    year,
    monthIndex + 1,
    0,
    12,
    0,
    0,
    0
  );

  return {
    start: firstDay,
    end: lastDay,
    days: lastDay.getDate()
  };
}


/* =========================================================
   20. GENERATE GREGORIAN MONTH DAYS
   ========================================================= */

function getGregorianMonthDates(
  year,
  monthIndex
) {
  const range = getGregorianMonthRange(
    year,
    monthIndex
  );

  const dates = [];

  for (
    let day = 1;
    day <= range.days;
    day++
  ) {
    const date = createLocalDate(
      year,
      monthIndex,
      day
    );

    dates.push(
      getBodoDateInfo(date)
    );
  }

  return dates;
}


/* =========================================================
   21. SAFE DATE KEY
   ========================================================= */

function getDateKey(inputDate) {
  const date = normalizeDate(inputDate);

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


/* =========================================================
   22. PARSE DATE KEY
   ========================================================= */

function parseDateKey(dateKey) {
  if (!dateKey) {
    return null;
  }

  const parts = String(
    dateKey
  ).split("-");

  if (parts.length !== 3) {
    return null;
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return null;
  }

  return createLocalDate(
    year,
    month - 1,
    day
  );
}


/* =========================================================
   23. EXPOSE DATA FOR OTHER FILES
   =========================================================

   This makes the data available through window as well,
   which is useful for app.js, events.js, debugging,
   and future modules.
   ========================================================= */

window.BodoCalendarData = {
  months: bodoMonthsData,
  weekdays: bodoWeekdays,

  getBodoMonthById,
  getBodoMonthByEnglishName,

  createLocalDate,
  normalizeDate,

  isGregorianLeapYear,

  getBodoMonthDays,
  getBodoMonthStartDate,
  getBodoMonthEndDate,

  getBodoMonthForDate,
  getBodoDateNumber,
  getBodoDateInfo,

  formatGregorianDate,
  formatBodoDate,
  formatFullBodoDate,

  getBodoMonthDates,

  getCurrentBodoDateInfo,
  getTodayBodoDateInfo,
  getTomorrowBodoDateInfo,
  getDayAfterTomorrowBodoDateInfo,

  getBodoWeekday,

  getBodoMonthReference,

  getGregorianMonthRange,
  getGregorianMonthDates,

  getDateKey,
  parseDateKey,

  isSameCalendarDate
};


/* =========================================================
   24. BACKWARD-COMPATIBILITY ALIASES
   ========================================================= */

window.bodoMonthsData = bodoMonthsData;
window.bodoWeekdays = bodoWeekdays;


/* =========================================================
   25. DATA READY FLAG
   ========================================================= */

window.BODO_CALENDAR_DATA_READY = true;


/* =========================================================
   END OF CALENDAR DATA
   ========================================================= */