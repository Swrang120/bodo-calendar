let currentMonthIndex = 3; // Default: Bwisag
let selectedDateKey = null;

document.addEventListener("DOMContentLoaded", () => {
  initMonthSelect();
  renderCalendar();
  loadAdminNotification();
  detectTodayStatus();
  updateVIPUI();
  setupEventListeners();
});

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
  
  // Update header titles & subtext
  document.getElementById("currentMonthTitle").textContent = monthData.name;
  document.getElementById("currentMonthRange").textContent = monthData.dateRange;
  document.getElementById("seasonName").textContent = monthData.season;

  const grid = document.getElementById("daysGrid");
  const eventsListEl = document.getElementById("monthlyEventsList");
  grid.innerHTML = "";
  eventsListEl.innerHTML = "";

  const userNotes = getAllNotes();
  const monthEventsMap = [];

  // Render 30/31 days grid
  for (let day = 1; day <= monthData.daysCount; day++) {
    const dateKey = `${currentMonthIndex}-${day}`;
    const dayCard = document.createElement("div");
    dayCard.className = "day-card bg-white border border-gray-200 rounded-xl p-3 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition relative shadow-sm";

    // Highlight today (e.g. Bwisag day 16)
    if (currentMonthIndex === 3 && day === 16) {
      dayCard.classList.add("ring-2", "ring-emerald-600", "bg-emerald-100");
    }

    // Gregorian date mapping math
    const gregDayNum = (monthData.startDate + day - 1) % 31 || 31;
    
    // Notes indicator
    const hasNotes = userNotes[dateKey] && userNotes[dateKey].length > 0;
    const noteBadge = hasNotes ? `<span class="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-600 rounded-full"></span>` : "";

    // Cultural events indicator
    const events = bodoCulturalEvents[dateKey] || [];
    if (events.length > 0) {
      events.forEach(e => monthEventsMap.push({ day, gregDayNum, ...e }));
    }

    dayCard.innerHTML = `
      ${noteBadge}
      <div class="text-xl font-bold text-emerald-950">${day}</div>
      <div class="text-xs text-gray-500 mt-1">${gregDayNum} Day</div>
      ${events.length > 0 ? `<div class="text-[10px] text-emerald-700 font-semibold truncate mt-1">${events[0].title}</div>` : ""}
    `;

    dayCard.addEventListener("click", () => openNoteModal(dateKey, day, monthData.name));
    grid.appendChild(dayCard);
  }

  // Populate Monthly Events List Panel
  if (monthEventsMap.length === 0) {
    eventsListEl.innerHTML = `<p class="text-sm text-gray-500 italic">No specific holidays listed for this month.</p>`;
  } else {
    monthEventsMap.forEach((evt) => {
      const item = document.createElement("div");
      item.className = "flex items-start space-x-3 p-2 rounded-lg hover:bg-emerald-50 transition";
      item.innerHTML = `
        <div class="bg-emerald-100 text-emerald-800 font-bold text-xs px-2 py-1 rounded">Day ${evt.day}</div>
        <div>
          <div class="text-sm font-bold text-gray-800">${evt.title}</div>
          <div class="text-xs text-gray-500">${evt.desc}</div>
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
    currentMonthIndex = 3;
    document.getElementById("monthSelect").value = 3;
    renderCalendar();
  });

  // Note Modal Save
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

function openNoteModal(dateKey, dayNum, monthName) {
  selectedDateKey = dateKey;
  document.getElementById("noteModalTitle").textContent = `Notes for Day ${dayNum} (${monthName})`;
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
