/* =========================================================
   BODO CALENDAR — CALENDAR DATA
   VERSION 7.0

   Traditional Bodo Solar Calendar
   Gregorian reference

   IMPORTANT:
   Push spans:
   19 December → 14 January

   Therefore January 1–14 belongs to
   Push of the previous Gregorian cycle.
   ========================================================= */

"use strict";

(function () {

  /* =======================================================
     MONTH DATA
     ======================================================= */

  const months = [

    {
      id: 0,
      name: "Magh",
      nativeName: "माघ",
      nativeNameAlt: "माघ",
      startMonth: 0,
      startDay: 15,
      days: 31,
      season: "Gozon / Winter"
    },

    {
      id: 1,
      name: "Fagun",
      nativeName: "फागुन",
      nativeNameAlt: "फागुन",
      startMonth: 1,
      startDay: 15,
      days: 28,
      leapDays: 29,
      season: "Spring"
    },

    {
      id: 2,
      name: "Chaitra",
      nativeName: "चैत्र",
      nativeNameAlt: "चैत्र",
      startMonth: 2,
      startDay: 15,
      days: 30,
      season: "Spring"
    },

    {
      id: 3,
      name: "Bwisag",
      nativeName: "बिसाग",
      nativeNameAlt: "बिसाग",
      startMonth: 3,
      startDay: 14,
      days: 31,
      season: "Garma / Summer"
    },

    {
      id: 4,
      name: "Jeth",
      nativeName: "जेठ",
      nativeNameAlt: "जेठ",
      startMonth: 4,
      startDay: 15,
      days: 31,
      season: "Summer"
    },

    {
      id: 5,
      name: "Aasar",
      nativeName: "आसार",
      nativeNameAlt: "आसार",
      startMonth: 5,
      startDay: 15,
      days: 31,
      season: "Rain"
    },

    {
      id: 6,
      name: "Sawan",
      nativeName: "सावन",
      nativeNameAlt: "सावन",
      startMonth: 6,
      startDay: 16,
      days: 32,
      season: "Rain"
    },

    {
      id: 7,
      name: "Bhadra",
      nativeName: "भाद्र",
      nativeNameAlt: "भाद्र",
      startMonth: 7,
      startDay: 17,
      days: 33,
      season: "Rain"
    },

    {
      id: 8,
      name: "Aasin",
      nativeName: "आसिन",
      nativeNameAlt: "आसिन",
      startMonth: 8,
      startDay: 19,
      days: 30,
      season: "Saram / Autumn"
    },

    {
      id: 9,
      name: "Kati",
      nativeName: "काति",
      nativeNameAlt: "काति",
      startMonth: 9,
      startDay: 19,
      days: 31,
      season: "Autumn"
    },

    {
      id: 10,
      name: "Aghon",
      nativeName: "आघोन",
      nativeNameAlt: "आघोन",
      startMonth: 10,
      startDay: 19,
      days: 30,
      season: "Harvest"
    },

    {
      id: 11,
      name: "Push",
      nativeName: "पुस",
      nativeNameAlt: "पुस",
      startMonth: 11,
      startDay: 19,
      days: 27,
      season: "Winter"
    }

  ];


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


  function isLeapYear(year) {

    return (
      year % 4 === 0 &&
      (
        year % 100 !== 0 ||
        year % 400 === 0
      )
    );

  }


  function getMonthLength(monthId, year) {

    const month = months[monthId];

    if (!month) {
      return 0;
    }

    if (
      monthId === 1 &&
      isLeapYear(year)
    ) {
      return month.leapDays || month.days;
    }

    return month.days;
  }


  /* =======================================================
     MONTH START
     ======================================================= */

  function getBodoMonthStartDate(
    monthId,
    gregorianYear
  ) {

    const month = months[monthId];

    if (!month) {
      return null;
    }

    return new Date(
      gregorianYear,
      month.startMonth,
      month.startDay
    );

  }


  /* =======================================================
     MONTH END
     ======================================================= */

  function getBodoMonthEndDate(
    monthId,
    gregorianYear
  ) {

    const start = getBodoMonthStartDate(
      monthId,
      gregorianYear
    );

    if (!start) {
      return null;
    }

    const length = getMonthLength(
      monthId,
      gregorianYear
    );

    const end = new Date(start);

    end.setDate(
      end.getDate() + length - 1
    );

    return end;

  }


  /* =======================================================
     GET MONTH DATES
     ======================================================= */

  function getBodoMonthDates(
    monthId,
    gregorianYear
  ) {

    const start =
      getBodoMonthStartDate(
        monthId,
        gregorianYear
      );

    if (!start) {
      return [];
    }

    const length =
      getMonthLength(
        monthId,
        gregorianYear
      );

    const dates = [];

    for (let i = 0; i < length; i++) {

      const d = new Date(start);

      d.setDate(
        start.getDate() + i
      );

      dates.push(d);

    }

    return dates;

  }


  /* =======================================================
     DATE RANGE
     ======================================================= */

  function formatShortDate(date) {

    return new Intl.DateTimeFormat(
      "en-GB",
      {
        day: "numeric",
        month: "short",
        year: "numeric"
      }
    ).format(date);

  }


  function formatLongDate(date) {

    return new Intl.DateTimeFormat(
      "en-GB",
      {
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    ).format(date);

  }


  function getMonthRange(
    monthId,
    year
  ) {

    const start =
      getBodoMonthStartDate(
        monthId,
        year
      );

    const end =
      getBodoMonthEndDate(
        monthId,
        year
      );

    if (!start || !end) {
      return "";
    }

    return (
      formatShortDate(start) +
      " – " +
      formatShortDate(end)
    );

  }


  /* =======================================================
     FIND BODO MONTH FOR GREGORIAN DATE
     ======================================================= */

  function getBodoMonthForDate(date) {

    const target = cleanDate(date);

    const year =
      target.getFullYear();

    /*
      Check both current and previous
      Bodo solar cycles.
    */

    const candidateYears = [
      year - 1,
      year
    ];

    for (
      let yIndex = 0;
      yIndex < candidateYears.length;
      yIndex++
    ) {

      const cycleYear =
        candidateYears[yIndex];

      for (
        let i = 0;
        i < months.length;
        i++
      ) {

        const start =
          getBodoMonthStartDate(
            i,
            cycleYear
          );

        const end =
          getBodoMonthEndDate(
            i,
            cycleYear
          );

        if (
          target >= start &&
          target <= end
        ) {

          return {
            month: months[i],
            monthId: i,
            year: cycleYear,
            startDate: start,
            endDate: end
          };

        }

      }

    }

    return null;

  }


  /* =======================================================
     COMPLETE BODO DATE INFO
     ======================================================= */

  function getBodoDateInfo(date) {

    const target =
      cleanDate(date);

    const result =
      getBodoMonthForDate(target);

    if (!result) {
      return null;
    }

    const difference =
      Math.floor(
        (
          target.getTime() -
          result.startDate.getTime()
        ) /
        86400000
      );

    return {

      date: target,

      month: result.month,

      monthId: result.monthId,

      year: result.year,

      day: difference + 1,

      monthLength:
        getMonthLength(
          result.monthId,
          result.year
        ),

      startDate: result.startDate,

      endDate: result.endDate,

      range:
        getMonthRange(
          result.monthId,
          result.year
        )

    };

  }


  /* =======================================================
     MONTH LOOKUP
     ======================================================= */

  function getMonthById(id) {

    return months.find(
      month => month.id === Number(id)
    ) || null;

  }


  /* =======================================================
     TODAY CYCLE YEAR
     ======================================================= */

  function getMonthYearForToday(
    monthId,
    referenceDate
  ) {

    const date =
      cleanDate(
        referenceDate || new Date()
      );

    const year =
      date.getFullYear();

    /*
      Push begins on 19 December.
      January 1–14 belongs to Push
      of previous Gregorian cycle.
    */

    if (
      Number(monthId) === 11 &&
      date.getMonth() === 0 &&
      date.getDate() <= 14
    ) {

      return year - 1;

    }

    return year;

  }


  /* =======================================================
     PUBLIC API
     ======================================================= */

  const api = {

    months,

    isLeapYear,

    getMonthLength,

    getBodoMonthStartDate,

    getBodoMonthEndDate,

    getBodoMonthDates,

    getBodoMonthForDate,

    getBodoDateInfo,

    getMonthById,

    getMonthRange,

    getMonthYearForToday,

    formatShortDate,

    formatLongDate

  };


  /* =======================================================
     GLOBAL EXPORTS
     ======================================================= */

  window.BodoCalendarData = api;

  window.bodoMonthsData = months;

})();