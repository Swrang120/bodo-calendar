/* =========================================================
   BODO CALENDAR — CALENDAR DATA
   Version 6.2
   ========================================================= */

"use strict";


/* =========================================================
   BODO MONTH DATA
   ========================================================= */

const bodoMonthsData = [

  {
    id:0,
    englishName:"Magh",
    nativeName:"माघ",
    name:"Magh / Maghw (माघ)",
    dateRange:"15 Jan – 14 Feb",
    season:"Gozon / Winter",
    startGregMonth:0,
    startGregDay:15,
    daysCount:31
  },

  {
    id:1,
    englishName:"Fagun",
    nativeName:"फागुन",
    name:"Fagun (फागुन)",
    dateRange:"15 Feb – 14 Mar",
    season:"Gozon / Late Winter",
    startGregMonth:1,
    startGregDay:15,
    daysCount:28
  },

  {
    id:2,
    englishName:"Chaitra",
    nativeName:"चैत्र",
    name:"Chaitra (चैत्र)",
    dateRange:"15 Mar – 13 Apr",
    season:"Bwisagu / Early Spring",
    startGregMonth:2,
    startGregDay:15,
    daysCount:30
  },

  {
    id:3,
    englishName:"Bwisag",
    nativeName:"बैसाग",
    name:"Bwisag (बैसागो / बैसाग)",
    dateRange:"14 Apr – 14 May",
    season:"Bwisag Ritu / Spring",
    startGregMonth:3,
    startGregDay:14,
    daysCount:31
  },

  {
    id:4,
    englishName:"Jeth",
    nativeName:"जेथो",
    name:"Jeth (जेथो)",
    dateRange:"15 May – 14 Jun",
    season:"Dungfu / Early Summer",
    startGregMonth:4,
    startGregDay:15,
    daysCount:31
  },

  {
    id:5,
    englishName:"Aasar",
    nativeName:"आसार",
    name:"Aasar (आसार)",
    dateRange:"15 Jun – 15 Jul",
    season:"Akhra / Monsoon",
    startGregMonth:5,
    startGregDay:15,
    daysCount:31
  },

  {
    id:6,
    englishName:"Sawan",
    nativeName:"सावन",
    name:"Sawan (सावन)",
    dateRange:"16 Jul – 16 Aug",
    season:"Akhra / Rainy Season",
    startGregMonth:6,
    startGregDay:16,
    daysCount:32
  },

  {
    id:7,
    englishName:"Bhadra",
    nativeName:"भाद्र",
    name:"Bhadra (भाद्र)",
    dateRange:"17 Aug – 18 Sep",
    season:"Late Monsoon",
    startGregMonth:7,
    startGregDay:17,
    daysCount:33
  },

  {
    id:8,
    englishName:"Aasin",
    nativeName:"आसिन",
    name:"Aasin (आसिन)",
    dateRange:"19 Sep – 18 Oct",
    season:"Sirri / Autumn",
    startGregMonth:8,
    startGregDay:19,
    daysCount:30
  },

  {
    id:9,
    englishName:"Kati",
    nativeName:"खाथि",
    name:"Kati (खाथि)",
    dateRange:"19 Oct – 18 Nov",
    season:"Sirri / Late Autumn",
    startGregMonth:9,
    startGregDay:19,
    daysCount:31
  },

  {
    id:10,
    englishName:"Aghon",
    nativeName:"आघन",
    name:"Aghon (आघन)",
    dateRange:"19 Nov – 18 Dec",
    season:"Gozon / Pre-Winter",
    startGregMonth:10,
    startGregDay:19,
    daysCount:30
  },

  {
    id:11,
    englishName:"Push",
    nativeName:"फुष",
    name:"Push (फुष)",
    dateRange:"19 Dec – 14 Jan",
    season:"Gozon / Peak Winter",
    startGregMonth:11,
    startGregDay:19,
    daysCount:27
  }

];


/* =========================================================
   WEEKDAYS
   ========================================================= */

const bodoWeekdays = [

  {
    en:"Sunday",
    bodo:"Rabibar (रबिबार)"
  },

  {
    en:"Monday",
    bodo:"Sombar (समबार)"
  },

  {
    en:"Tuesday",
    bodo:"Mongolbar (मंगलबार)"
  },

  {
    en:"Wednesday",
    bodo:"Budhbar (बुधबार)"
  },

  {
    en:"Thursday",
    bodo:"Brihospatibar (बृहस्पतीबार)"
  },

  {
    en:"Friday",
    bodo:"Sakrubar (शक्रुबार)"
  },

  {
    en:"Saturday",
    bodo:"Shanibar (शनिबार)"
  }

];


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function getBodoMonthById(id){

  return (
    bodoMonthsData.find(
      month => Number(month.id) === Number(id)
    ) || null
  );

}


function getBodoMonthByEnglishName(name){

  if(!name){
    return null;
  }

  const value =
    String(name).trim().toLowerCase();

  return (
    bodoMonthsData.find(
      month =>
        month.englishName.toLowerCase() === value
    ) || null
  );

}


/* =========================================================
   DATE HELPERS
   ========================================================= */

function createLocalDate(year,monthIndex,day){

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


function normalizeDate(input){

  if(input instanceof Date){

    return createLocalDate(
      input.getFullYear(),
      input.getMonth(),
      input.getDate()
    );

  }

  if(typeof input === "string"){

    const parts =
      input.split("-");

    if(parts.length === 3){

      const year = Number(parts[0]);
      const month = Number(parts[1]) - 1;
      const day = Number(parts[2]);

      if(
        Number.isFinite(year) &&
        Number.isFinite(month) &&
        Number.isFinite(day)
      ){

        return createLocalDate(
          year,
          month,
          day
        );

      }

    }

    const parsed =
      new Date(input);

    if(!Number.isNaN(parsed.getTime())){

      return createLocalDate(
        parsed.getFullYear(),
        parsed.getMonth(),
        parsed.getDate()
      );

    }

  }

  const now = new Date();

  return createLocalDate(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

}


function isGregorianLeapYear(year){

  year = Number(year);

  return (
    year % 400 === 0 ||
    (
      year % 100 !== 0 &&
      year % 4 === 0
    )
  );

}


/* =========================================================
   MONTH DAYS
   ========================================================= */

function getBodoMonthDays(monthId,year){

  const month =
    getBodoMonthById(monthId);

  if(!month){
    return 0;
  }

  if(
    month.id === 1 &&
    isGregorianLeapYear(year)
  ){

    return 29;

  }

  return month.daysCount;

}


/* =========================================================
   MONTH START
   ========================================================= */

function getBodoMonthStartDate(
  monthId,
  gregorianYear
){

  /*
   * IMPORTANT:
   * The function accepts both:
   *
   * getBodoMonthStartDate(8,2026)
   *
   * and
   *
   * getBodoMonthStartDate(monthObject,2026)
   */

  if(
    monthId &&
    typeof monthId === "object"
  ){

    monthId = monthId.id;

  }

  const month =
    getBodoMonthById(monthId);

  if(!month){
    return null;
  }

  let year =
    Number(gregorianYear);

  if(!Number.isFinite(year)){

    year =
      new Date().getFullYear();

  }

  return createLocalDate(
    year,
    month.startGregMonth,
    month.startGregDay
  );

}


/* =========================================================
   MONTH END
   ========================================================= */

function getBodoMonthEndDate(
  monthId,
  gregorianYear
){

  if(
    monthId &&
    typeof monthId === "object"
  ){

    monthId = monthId.id;

  }

  const month =
    getBodoMonthById(monthId);

  if(!month){
    return null;
  }

  const start =
    getBodoMonthStartDate(
      monthId,
      gregorianYear
    );

  if(!start){
    return null;
  }

  const days =
    getBodoMonthDays(
      monthId,
      gregorianYear
    );

  const end =
    new Date(start);

  end.setDate(
    end.getDate() + days - 1
  );

  return end;

}


/* =========================================================
   SAME DATE
   ========================================================= */

function isSameCalendarDate(a,b){

  const dateA =
    normalizeDate(a);

  const dateB =
    normalizeDate(b);

  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );

}


/* =========================================================
   FIND BODO MONTH
   ========================================================= */

function getBodoMonthForDate(inputDate){

  const date =
    normalizeDate(inputDate);

  const year =
    date.getFullYear();

  /*
   * 1–14 January belongs to Push
   * from the previous Bodo year.
   */

  if(
    date.getMonth() === 0 &&
    date.getDate() <= 14
  ){

    return {

      month:bodoMonthsData[11],

      bodoYear:year - 1,

      gregorianYear:year,

      isPreviousGregorianYearMonth:true

    };

  }


  /*
   * Normal months.
   */

  for(
    const month of bodoMonthsData
  ){

    if(month.id === 11){
      continue;
    }

    const start =
      getBodoMonthStartDate(
        month.id,
        year
      );

    const end =
      getBodoMonthEndDate(
        month.id,
        year
      );

    if(
      date >= start &&
      date <= end
    ){

      return {

        month,

        bodoYear:year,

        gregorianYear:year,

        isPreviousGregorianYearMonth:false

      };

    }

  }


  /*
   * 19 December onwards belongs to Push.
   */

  const pushStart =
    getBodoMonthStartDate(
      11,
      year
    );

  if(date >= pushStart){

    return {

      month:bodoMonthsData[11],

      bodoYear:year,

      gregorianYear:year,

      isPreviousGregorianYearMonth:false

    };

  }


  return null;

}


/* =========================================================
   BODO DAY NUMBER
   ========================================================= */

function getBodoDateNumber(inputDate){

  const date =
    normalizeDate(inputDate);

  const info =
    getBodoMonthForDate(date);

  if(
    !info ||
    !info.month
  ){

    return null;

  }

  const start =
    getBodoMonthStartDate(
      info.month.id,
      info.bodoYear
    );

  if(!start){
    return null;
  }

  const difference =
    Math.round(
      (
        date.getTime() -
        start.getTime()
      ) /
      (24 * 60 * 60 * 1000)
    );

  return difference + 1;

}


/* =========================================================
   COMPLETE DATE INFO
   ========================================================= */

function getBodoDateInfo(inputDate){

  const date =
    normalizeDate(inputDate);

  const info =
    getBodoMonthForDate(date);

  if(
    !info ||
    !info.month
  ){

    return null;

  }

  const month =
    info.month;

  const bodoDay =
    getBodoDateNumber(date);

  const weekdayIndex =
    date.getDay();

  const weekday =
    bodoWeekdays[weekdayIndex] || null;

  const startDate =
    getBodoMonthStartDate(
      month.id,
      info.bodoYear
    );

  const endDate =
    getBodoMonthEndDate(
      month.id,
      info.bodoYear
    );

  return {

    date,

    gregorian:{
      year:date.getFullYear(),
      month:date.getMonth(),
      monthNumber:date.getMonth()+1,
      day:date.getDate(),
      weekdayIndex,
      weekdayEnglish:weekday ? weekday.en : "",
      weekdayBodo:weekday ? weekday.bodo : ""
    },

    bodo:{
      year:info.bodoYear,
      monthId:month.id,
      monthName:month.name,
      englishMonthName:month.englishName,
      nativeName:month.nativeName,
      day:bodoDay,
      daysInMonth:getBodoMonthDays(
        month.id,
        info.bodoYear
      ),
      season:month.season,
      dateRange:month.dateRange,
      startDate,
      endDate
    },

    weekday,

    isToday:isSameCalendarDate(
      date,
      new Date()
    )

  };

}


/* =========================================================
   FORMATTERS
   ========================================================= */

function formatGregorianDate(inputDate){

  const date =
    normalizeDate(inputDate);

  return date.toLocaleDateString(
    "en-IN",
    {
      day:"numeric",
      month:"long",
      year:"numeric"
    }
  );

}


function formatBodoDate(inputDate){

  const info =
    getBodoDateInfo(inputDate);

  if(!info){
    return "";
  }

  return (
    `${info.bodo.day} ${info.bodo.englishMonthName}`
  );

}


function formatFullBodoDate(inputDate){

  const info =
    getBodoDateInfo(inputDate);

  if(!info){
    return "";
  }

  return (
    `${info.bodo.day} ` +
    `${info.bodo.englishMonthName} — ` +
    `${formatGregorianDate(inputDate)}`
  );

}


/* =========================================================
   GET DATES OF BODO MONTH
   ========================================================= */

function getBodoMonthDates(
  monthId,
  bodoYear
){

  const month =
    getBodoMonthById(monthId);

  if(!month){
    return [];
  }

  const start =
    getBodoMonthStartDate(
      monthId,
      bodoYear
    );

  const days =
    getBodoMonthDays(
      monthId,
      bodoYear
    );

  const result = [];

  for(let i=0;i<days;i++){

    const date =
      new Date(start);

    date.setDate(
      start.getDate() + i
    );

    result.push(
      getBodoDateInfo(date)
    );

  }

  return result;

}


/* =========================================================
   TODAY HELPERS
   ========================================================= */

function getCurrentBodoDateInfo(){

  return getBodoDateInfo(
    new Date()
  );

}


function getTodayBodoDateInfo(){

  return getBodoDateInfo(
    new Date()
  );

}


function getTomorrowBodoDateInfo(){

  const date =
    normalizeDate(new Date());

  date.setDate(
    date.getDate() + 1
  );

  return getBodoDateInfo(date);

}


function getDayAfterTomorrowBodoDateInfo(){

  const date =
    normalizeDate(new Date());

  date.setDate(
    date.getDate() + 2
  );

  return getBodoDateInfo(date);

}


/* =========================================================
   WEEKDAY
   ========================================================= */

function getBodoWeekday(inputDate){

  const date =
    normalizeDate(inputDate);

  return (
    bodoWeekdays[date.getDay()] ||
    null
  );

}


/* =========================================================
   REFERENCE
   ========================================================= */

function getBodoMonthReference(){

  return bodoMonthsData.map(
    month => ({
      id:month.id,
      englishName:month.englishName,
      nativeName:month.nativeName,
      name:month.name,
      dateRange:month.dateRange,
      season:month.season,
      daysCount:month.daysCount
    })
  );

}


/* =========================================================
   DATE KEY
   ========================================================= */

function getDateKey(inputDate){

  const date =
    normalizeDate(inputDate);

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth()+1
    ).padStart(2,"0");

  const day =
    String(
      date.getDate()
    ).padStart(2,"0");

  return `${year}-${month}-${day}`;

}


function parseDateKey(key){

  if(!key){
    return null;
  }

  const parts =
    String(key).split("-");

  if(parts.length !== 3){
    return null;
  }

  const year =
    Number(parts[0]);

  const month =
    Number(parts[1]);

  const day =
    Number(parts[2]);

  if(
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ){

    return null;

  }

  return createLocalDate(
    year,
    month-1,
    day
  );

}


/* =========================================================
   GREGORIAN MONTH HELPERS
   ========================================================= */

function getGregorianMonthRange(
  year,
  monthIndex
){

  const start =
    createLocalDate(
      year,
      monthIndex,
      1
    );

  const end =
    createLocalDate(
      year,
      monthIndex + 1,
      0
    );

  return {
    start,
    end,
    days:end.getDate()
  };

}


function getGregorianMonthDates(
  year,
  monthIndex
){

  const range =
    getGregorianMonthRange(
      year,
      monthIndex
    );

  const dates = [];

  for(
    let day=1;
    day<=range.days;
    day++
  ){

    dates.push(
      getBodoDateInfo(
        createLocalDate(
          year,
          monthIndex,
          day
        )
      )
    );

  }

  return dates;

}


/* =========================================================
   PUBLIC API
   ========================================================= */

window.BodoCalendarData = {

  months:bodoMonthsData,
  weekdays:bodoWeekdays,

  /*
   * Backward compatibility names.
   */
  bodoMonthsData,
  bodoWeekdays,

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

  /*
   * Backward-compatible aliases.
   */
  generateMonthDates:getBodoMonthDates,
  generateCalendarDates:getBodoMonthDates,

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


/*
 * Global compatibility.
 */

window.bodoMonthsData =
  bodoMonthsData;

window.bodoWeekdays =
  bodoWeekdays;

window.BODO_CALENDAR_DATA_READY =
  true;