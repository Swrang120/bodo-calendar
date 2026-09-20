let currentMonthIndex = 8; // Default: Aasin (September)
let todayBodoInfo = { monthIndex: 8, bodoDay: 5 };
let selectedDateKey = null;

document.addEventListener("DOMContentLoaded", () => {
  // 1. Calculate Real-time Date
  const now = new Date();
  todayBodoInfo = calculateBodoDateFromGregorian(now);
  currentMonthIndex = todayBodoInfo.monthIndex; // Auto open current month (Aasin)

  // 2. Render Components
  initMonthSelect();
  renderCalendar();
  loadAdminNotification();
  updateLiveDetectorBanner(now);
  updateVIPUI();
  setupEventListeners();
});

// Convert Gregorian (English) Date to Bodo/Assamese Solar Calendar Date
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
  return { monthIndex: 8, bodoDay: 5, dateObj: gregorianDate };
}

// Live Banner: Today, Tomorrow, and Day After Tomorrow Status
function updateLiveDetectorBanner(todayDate) {
  const todayBox = document.getElementById("todayAlertBox");
  const todayText = document.getElementById("todayAlertText");
  if (!todayBox || !todayText) return;

  // Today (+0)
  const tInfo = calculateBodoDateFromGregorian(todayDate);
  const tMonthName = bodoMonthsData[tInfo.monthIndex].englishName;
  const tEngStr = todayDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

  // Tomorrow (+1)
  const tomDate = new Date(todayDate);
  tomDate.setDate(todayDate.getDate() + 1);
  const tomInfo = calculateBodoDateFromGregorian(tomDate);
  const tomMonthName = bodoMonthsData[tomInfo.monthIndex].englishName;
  const tomEngStr = tomDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

  // Day After Tomorrow (+2)
  const datDate = new Date(todayDate);
  datDate.setDate(todayDate.getDate() + 2);
  const datInfo = calculateBodoDateFromGregorian(datDate);
  const datMonthName = bodoMonthsData[datInfo.monthIndex].englishName;
  const datEngStr = datDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

  // Event checks
  const tEvt = bodoCulturalEvents[`${tInfo.monthIndex}-${tInfo.bodoDay}`]?.[0]?.title || "Normal Day";
  const tomEvt = bodoCulturalEvents[`${tomInfo.monthIndex}-${tomInfo.bodoDay}`]?.[0]?.title || "Normal Day";
  const datEvt = bodoCulturalEvents[`${datInfo.monthIndex}-${datInfo.bodoDay}`]?.[0]?.title || "Normal Day";

  todayText.innerHTML = `
    <div class="space-y-1">
      <div><strong>📅 Today (${tEngStr}):</strong> ${tInfo.bodoDay} ${tMonthName} — <span class="text-emerald-700 font-semibold">${tEvt}</span></div>
      <div><strong>🔜 Tomorrow (${tomEngStr}):</strong> ${tomInfo.bodoDay} ${tomMonthName} — <span class="text-gray-600">${tomEvt}</span></div>
      <div><strong>🔮 Day After Tomorrow (${datEngStr}):</strong> ${datInfo.bodoDay} ${datMonthName} — <span class="text-gray-600">${datEvt}</span></div>
    </div>
  `;
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

  for (let day = 1; day <= monthData.daysCount; day++) {
    const dateKey = `${currentMonthIndex}-${day}`;
    
    // Accurate English Date
    const gregDateObj = new Date(currentYear, monthData.startGregMonth, monthData.startGregDay + (day - 1));
    const gregDateString = gregDateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

    const dayCard = document.createElement("div");
    dayCard.className = "day-card bg-white border border-gray-200 rounded-xl p-2 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition relative shadow-sm";

    // Highlight TODAY (5 Aasin)
    if (currentMonthIndex === todayBodoInfo.monthIndex && day === todayBodoInfo.bodoDay) {
      dayCard.classList.add("ring-2", "ring-emerald-600", "bg-emerald-100", "border-emerald-600");
    }

    const hasNotes = userNotes[dateKey] && userNotes[dateKey].length > 0;
    const noteBadge = hasNotes ? `<span class="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-600 rounded-full"></span>` : "";

    const events = bodoCulturalEvents[dateKey] || [];
    if (events.length > 0) {
      events.forEach(e => monthEventsMap.push({ day, gregDateString, ...e }));
    }

    dayCard.innerHTML = `
      ${noteBadge}
      <div class="text-lg font-bold text-emerald-950">${day}</div>
      <div class="text-[11px] text-gray-500 font-medium">${gregDateString}</div>
      ${events.length > 0 ? `<div class="text-[9px] text-emerald-700 font-semibold truncate mt-0.5">${events[0].title}</div>` : ""}
    `;

    dayCard.addEventListener("click", () => openNoteModal(dateKey, day, monthData.name, gregDateString));
    grid.appendChild(dayCard);
  }

  if (monthEventsMap.length === 0) {
    eventsListEl.innerHTML = `<p class="text-xs text-gray-500 italic">No special festival events listed for this month.</p>`;
  } else {
    monthEventsMap.forEach((evt) => {
      const item = document.createElement("div");
      item.className = "flex items-start space-x-2 p-2 rounded-lg hover:bg-emerald-50 transition";
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
