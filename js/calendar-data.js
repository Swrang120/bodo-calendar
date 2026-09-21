/* =========================================================
   BODO CALENDAR — CALENDAR DATA
   VERSION 7.0
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
      englishName: "Magh",
      nativeName: "माघ",
      days: 31,
      startMonth: 0,
      startDay: 15,
      season: "Gozon"
    },

    {
      id: 1,
      name: "Fagun",
      englishName: "Fagun",
      nativeName: "फागुन",
      days: 28,
      leapDays: 29,
      startMonth: 1,
      startDay: 15,
      season: "Gozon"
    },

    {
      id: 2,
      name: "Chaitra",
      englishName: "Chaitra",
      nativeName: "चैत्र",
      days: 30,
      startMonth: 2,
      startDay: 15,
      season: "Gozon"
    },

    {
      id: 3,
      name: "Bwisag",
      englishName: "Bwisag",
      nativeName: "बिसाग",
      days: 31,
      startMonth: 3,
      startDay: 14,
      season: "Bwisag"
    },

    {
      id: 4,
      name: "Jeth",
      englishName: "Jeth",
      nativeName: "जेठ",
      days: 31,
      startMonth: 4,
      startDay: 15,
      season: "Garma"
    },

    {
      id: 5,
      name: "Aasar",
      englishName: "Aasar",
      nativeName: "आसार",
      days: 31,
      startMonth: 5,
      startDay: 15,
      season: "Garma"
    },

    {
      id: 6,
      name: "Sawan",
      englishName: "Sawan",
      nativeName: "सावन",
      days: 32,
      startMonth: 6,
      startDay: 16,
      season: "Barsa"
    },

    {
      id: 7,
      name: "Bhadra",
      englishName: "Bhadra",
      nativeName: "भाद्र",
      days: 33,
      startMonth: 7,
      startDay: 17,
      season: "Barsa"
    },

    {
      id: 8,
      name: "Aasin",
      englishName: "Aasin",
      nativeName: "आसिन",
      days: 30,
      startMonth: 8,
      startDay: 19,
      season: "Saram"
    },

    {
      id: 9,
      name: "Kati",
      englishName: "Kati",
      nativeName: "काति",
      days: 31,
      startMonth: 9,
      startDay: 19,
      season: "Saram"
    },

    {
      id: 10,
      name: "Aghon",
      englishName: "Aghon",
      nativeName: "आघोन",
      days: 30,
      startMonth: 10,
      startDay: 19,
      season: "Saram"
    },

    {
      id: 11,
      name: "Push",
      englishName: "Push",
      nativeName: "पुस",
      days: 27,
      startMonth: 11,
      startDay: 19,
      season: "Gozon"
    }

  ];


  /* =======================================================
     HELPERS
     ======================================================= */

  function cloneDate(date) {

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
      return month.leapDays;
    }

    return month.days;

  }


  /* =======================================================
     GET MONTH START
     ======================================================= */

  function getBodoMonthStartDate(
    monthId,
    year
  ) {

    const month = months[monthId];

    if (!month) {
      return null;
    }

    return new Date(
      year,
      month.startMonth,
      month.startDay
    );

  }


  /* =======================================================
     GET MONTH END
     ======================================================= */

  function getBodoMonthEndDate(
    monthId,
    year
  ) {

    const start =
      getBodoMonthStartDate(
        monthId,
        year
      );

    if (!start) {
      return null;
    }

    const days =
      getMonthLength(
        monthId,
        year
      );

    const end =
      new Date(start);

    end.setDate(
      end.getDate() + days - 1
    );

    return end;

  }


  /* =======================================================
     GET ALL DATES OF BODO MONTH
     ======================================================= */

  function getBodoMonthDates(
    monthId,
    year
  ) {

    const start =
      getBodoMonthStartDate(
        monthId,
        year
      );

    const length =
      getMonthLength(
        monthId,
        year
      );

    const result = [];

    if (!start) {
      return result;
    }

    for (
      let i = 0;
      i < length;
      i++
    ) {

      const date =
        new Date(start);

      date.setDate(
        date.getDate() + i
      );

      result.push(date);

    }

    return result;

  }


  /* =======================================================
     FIND BODO MONTH FOR GREGORIAN DATE
     ======================================================= */

  function getBodoMonthForDate(
    inputDate
  ) {

    const date =
      cloneDate(inputDate);

    const year =
      date.getFullYear();

    /*
      Check previous year's Push.
      This is important for:
      January 1 → January 14
    */

    const candidateYears = [
      year - 1,
      year
    ];

    for (
      const candidateYear
      of candidateYears
    ) {

      for (
        const month
        of months
      ) {

        const start =
          getBodoMonthStartDate(
            month.id,
            candidateYear
          );

        const end =
          getBodoMonthEndDate(
            month.id,
            candidateYear
          );

        if (
          date >= start &&
          date <= end
        ) {

          return {
            month: month,
            monthId: month.id,
            year: candidateYear,
            startDate: start,
            endDate: end
          };

        }

      }

    }

    return null;

  }


  /* =======================================================
     GET COMPLETE BODO DATE INFO
     ======================================================= */

  function getBodoDateInfo(
    inputDate
  ) {

    const date =
      cloneDate(inputDate);

    const result =
      getBodoMonthForDate(date);

    if (!result) {
      return null;
    }

    const difference =
      Math.floor(
        (
          date.getTime() -
          result.startDate.getTime()
        ) /
        86400000
      );

    return {

      date: date,

      month: result.month,

      monthId: result.monthId,

      year: result.year,

      day: difference + 1,

      monthLength:
        getMonthLength(
          result.monthId,
          result.year
        ),

      startDate:
        result.startDate,

      endDate:
        result.endDate

    };

  }


  /* =======================================================
     FORMAT DATE
     ======================================================= */

  function formatDate(
    date
  ) {

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric"
      }
    ).format(date);

  }


  function formatLongDate(
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


  /* =======================================================
     API
     ======================================================= */

  const api = {

    version: "7.0",

    months,

    isLeapYear,

    getMonthLength,

    getBodoMonthStartDate,

    getBodoMonthEndDate,

    getBodoMonthDates,

    getBodoMonthForDate,

    getBodoDateInfo,

    formatDate,

    formatLongDate

  };


  /* =======================================================
     GLOBAL COMPATIBILITY
     ======================================================= */

  window.BodoCalendarData = api;

  window.bodoMonthsData = months;

  /*
    Compatibility helpers for older code.
  */

  window.getBodoDateInfo =
    getBodoDateInfo;

  window.getBodoMonthForDate =
    getBodoMonthForDate;

  window.getBodoMonthStartDate =
    getBodoMonthStartDate;

  window.getBodoMonthDates =
    getBodoMonthDates;


})();