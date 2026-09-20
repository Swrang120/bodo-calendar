let currentMonthIndex = 0;
let todayBodoInfo = { monthIndex: 0, bodoDay: 0 };
let selectedDateKey = null;

document.addEventListener("DOMContentLoaded", () => {
  // 1. Automatic Live System Date Calculation
  todayBodoInfo = calculateBodoDateFromGregorian(new Date());
  currentMonthIndex = todayBodoInfo.monthIndex; // Open current live month automatically

  // 2. Initialize UI
  initMonthSelect();
  renderCalendar();
  loadAdminNotification();
  updateTodayAlertBanner();
  updateVIPUI();
  setupEventListeners();
});

// Real-time conversion: Gregorian Date -> Bodo Month & Day
function calculateBodoDateFromGregorian(gregorianDate) {
  const gYear = gregorianDate.getFullYear();

  for (let i = 0; i < bodoMonthsData.length; i++) {
    const m = bodoMonthsData[i];
    let startDate = new Date(gYear, m.startGregMonth, m.startGregDay);
    let endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + m.daysCount - 1);

    if (gregorianDate >= startDate && gregorianDate <= endDate) {
      const timeDiff = gregorianDate.getTime() - startDate.getTime();
      const bodoDay = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;
      return { monthIndex: i, bodoDay: bodoDay, dateObj: gregorianDate };
    }
  }

  // Edge Case Fallback
  return { monthIndex: 8, bodoDay: 5, dateObj: gregorianDate };
}

function updateTodayAlertBanner() {
  const todayBox = document.getElementById("todayAlertBox");
  const todayText = document.getElementById("todayAlertText");
  if (!todayBox || !todayText) return;

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  const currentBodoMonthObj = bodoMonthsData[todayBodoInfo.monthIndex];

  todayText.innerHTML = `<strong>Today (${dateStr}):</strong> Bodo Date is <strong>${todayBodoInfo.bodoDay} ${currentBodoMonthObj.englishName}</strong>. Click any box to add Exam, Birthday, or Pension notes!`;
  todayBox.classList.remove("hidden");
}

function initMonthSelect() {
  const select = document.getElementById("monthSelect");
  if (!select) return;

  select.innerHTML = "";
  bodoMonthsData.forEach((m, idx) => {
    const opt = document.createElement("option");
    opt.value = idx;
    opt.textContent = m.name;
    select.appendChild(opt);
  });
  select.value = currentMonthIndex;
}

function renderCalendar() {
  const monthData = bodoMonthsData[currentMonthIndex];
  
  document.getElementById("currentMonthTitle").textContent = monthData.name;
  document.getElementById("currentMonthRange").textContent = monthData.dateRange;
  document.getElementById("seasonName").textContent = monthData.season;

  const grid = document.getElementById("daysGrid");
  const eventsListEl = document.getElementById("monthlyEventsList");
  grid.innerHTML = "";
  eventsListEl.innerHTML = "";

  const userNotes = getAllNotes();
  const monthEventsMap = [];
  const currentYear = new Date().getFullYear();

  // Generate 30/31 days grid with EXACT Gregorian Dates
  for (let day = 1; day <= monthData.daysCount; day++) {
    const dateKey = `${currentMonthIndex}-${day}`;
    
    // Calculate exact English date for this Bodo day box
    const gregDateObj = new Date(currentYear, monthData.startGregMonth, monthData.startGregDay + (day - 1));
    const gregDateString = gregDateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

    const dayCard = document.createElement("div");
    dayCard.className = "day-card bg-white border border-gray-200 rounded-xl p-2.5 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition relative shadow-sm";

    // Highlight TODAY automatically if current month & day match
    if (currentMonthIndex === todayBodoInfo.monthIndex && day === todayBodoInfo.bodoDay) {
      dayCard.classList.add("ring-2", "ring-emerald-600", "bg-emerald-100", "border-emerald-600");
    }

    // Notes Indicator Badge
    const hasNotes = userNotes[dateKey] && userNotes[dateKey].length > 0;
    const noteBadge = hasNotes ? `<span class="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-600 rounded-full"></span>` : "";

    // Events Indicator
    const events = bodoCulturalEvents[dateKey] || [];
    if (events.length > 0) {
      events.forEach(e => monthEventsMap.push({ day, gregDateString, ...e }));
    }

    dayCard.innerHTML = `
      ${noteBadge}
      <div class="text-xl font-bold text-emerald-950">${day}</div>
      <div class="text-[11px] text-gray-500 font-medium mt-0.5">${gregDateString}</div>
      ${events.length > 0 ? `<div class="text-[10px] text-emerald-700 font-semibold truncate mt-1">${events[0].title}</div>` : ""}
    `;

    dayCard.addEventListener("click", () => openNoteModal(dateKey, day, monthData.name, gregDateString));
    grid.appendChild(dayCard);
  }

  // Render Monthly Events Panel
  if (monthEventsMap.length === 0) {
    eventsListEl.innerHTML = `<p class="text-xs text-gray-500 italic">No official holidays listed for this month.</p>`;
  } else {
    monthEventsMap.forEach((evt) => {
      const item = document.createElement("div");
      item.className = "flex items-start space-x-2.5 p-2 rounded-lg hover:bg-emerald-50 transition";
      item.innerHTML = `
        <div class="bg-emerald-100 text-emerald-800 font-bold text-xs px-2 py-1 rounded whitespace-nowrap">${evt.gregDateString}</div>
        <div>
          <div class="text-xs font-bold text-gray-800">${evt.title}</div>
          <div class="text-[11px] text-gray-500">${evt.desc}</div>
        </div>
      `;
      eventsListEl.appendChild(item);
    });
  }
}

function changeMonth(step) {
  currentMonthIndex = (currentMonthIndex + step + 12) % 12;
  document.getElementById("monthSelect").value = currentMonthIndex;
  renderCalendar();
}

function setupEventListeners() {
  document.getElementById("monthSelect").addEventListener("change", (e) => {
    currentMonthIndex = parseInt(e.target.value);
    renderCalendar();
  });

  document.getElementById("prevMonthBtn").addEventListener("click", () => changeMonth(-1));
  document.getElementById("nextMonthBtn").addEventListener("click", () => changeMonth(1));
  document.getElementById("todayBtn").addEventListener("click", () => {
    currentMonthIndex = todayBodoInfo.monthIndex;
    document.getElementById("monthSelect").value = currentMonthIndex;
    renderCalendar();
  });

  document.getElementById("saveNoteBtn").addEventListener("click", () => {
    const category = document.getElementById("noteCategory").value;
    const title = document.getElementById("noteTitleInput").value.trim();

    if (!title) {
      alert("Please enter note details!");
      return;
    }

    saveNote(selectedDateKey, { category, title });
    document.getElementById("noteTitleInput").value = "";
    renderSavedNotesList(selectedDateKey);
    renderCalendar();
  });
}

function openNoteModal(dateKey, dayNum, monthName, gregDateString) {
  selectedDateKey = dateKey;
  document.getElementById("noteModalTitle").textContent = `Notes for Day ${dayNum} (${monthName}) - ${gregDateString}`;
  renderSavedNotesList(dateKey);
  document.getElementById("noteModal").classList.remove("hidden");
}

function closeNoteModal() {
  document.getElementById("noteModal").classList.add("hidden");
}

function renderSavedNotesList(dateKey) {
  const container = document.getElementById("savedNotesList");
  container.innerHTML = "";
  const notes = getNotesForDate(dateKey);

  if (notes.length === 0) {
    container.innerHTML = `<p class="text-xs text-gray-400 italic">No notes added for this date yet.</p>`;
    return;
  }

  notes.forEach((n) => {
    const el = document.createElement("div");
    el.className = "flex items-center justify-between bg-gray-50 border p-2 rounded-lg text-xs";
    el.innerHTML = `
      <div>
        <span class="font-bold text-emerald-800 uppercase">[${n.category}]</span>
        <span class="text-gray-700 ml-1">${n.title}</span>
      </div>
      <button onclick="handleDeleteNote('${dateKey}', ${n.id})" class="text-red-500 font-bold hover:underline">Remove</button>
    `;
    container.appendChild(el);
  });
}

function handleDeleteNote(dateKey, noteId) {
  deleteNote(dateKey, noteId);
  renderSavedNotesList(dateKey);
  renderCalendar();
}
