const NOTES_STORAGE_KEY = "bodo_calendar_user_notes_v1";

function getAllNotes() {
  const raw = localStorage.getItem(NOTES_STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveNote(dateKey, noteObj) {
  const notes = getAllNotes();
  if (!notes[dateKey]) {
    notes[dateKey] = [];
  }
  notes[dateKey].push({
    id: Date.now(),
    category: noteObj.category,
    title: noteObj.title,
    createdAt: new Date().toLocaleDateString()
  });
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
}

function deleteNote(dateKey, noteId) {
  const notes = getAllNotes();
  if (notes[dateKey]) {
    notes[dateKey] = notes[dateKey].filter((n) => n.id !== noteId);
    if (notes[dateKey].length === 0) {
      delete notes[dateKey];
    }
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  }
}

function getNotesForDate(dateKey) {
  const notes = getAllNotes();
  return notes[dateKey] || [];
}
