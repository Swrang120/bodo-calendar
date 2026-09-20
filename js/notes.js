/* =========================================================
   BODO CALENDAR — PERSONAL NOTES
   Version: 6.0

   - localStorage only
   - No login required
   - Date-wise notes
   - Add / edit / delete
   - Category
   - Description
   - Reminder
   - Backward compatible with old notes
   ========================================================= */

const NOTES_STORAGE_KEY = "bodo_calendar_user_notes_v1";


/* =========================================================
   1. SAFE LOCAL STORAGE
   ========================================================= */

function getAllNotes() {
  try {
    const raw = localStorage.getItem(
      NOTES_STORAGE_KEY
    );

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    return parsed;

  } catch (error) {
    console.warn(
      "Bodo Calendar: Unable to read notes.",
      error
    );

    return {};
  }
}


function saveAllNotes(notes) {
  try {
    localStorage.setItem(
      NOTES_STORAGE_KEY,
      JSON.stringify(notes)
    );

    return true;

  } catch (error) {
    console.error(
      "Bodo Calendar: Unable to save notes.",
      error
    );

    return false;
  }
}


/* =========================================================
   2. GENERATE NOTE ID
   ========================================================= */

function generateNoteId() {
  return (
    Date.now().toString() +
    "-" +
    Math.random()
      .toString(36)
      .slice(2, 8)
  );
}


/* =========================================================
   3. NORMALIZE DATE KEY
   ========================================================= */

function normalizeNoteDateKey(dateKey) {
  if (!dateKey) {
    return "";
  }

  return String(dateKey).trim();
}


/* =========================================================
   4. SAVE NOTE
   ========================================================= */

function saveNote(dateKey, noteObj = {}) {

  const key =
    normalizeNoteDateKey(dateKey);

  if (!key) {
    return null;
  }

  const notes =
    getAllNotes();

  if (!Array.isArray(notes[key])) {
    notes[key] = [];
  }

  const now =
    new Date();

  const note = {
    id:
      noteObj.id ||
      generateNoteId(),

    category:
      String(
        noteObj.category ||
        "Personal"
      ),

    title:
      String(
        noteObj.title ||
        "Untitled Note"
      ).trim(),

    description:
      String(
        noteObj.description ||
        ""
      ).trim(),

    reminder:
      String(
        noteObj.reminder ||
        ""
      ).trim(),

    createdAt:
      noteObj.createdAt ||
      now.toISOString(),

    updatedAt:
      now.toISOString()
  };

  notes[key].push(note);

  const saved =
    saveAllNotes(notes);

  return saved
    ? note
    : null;
}


/* =========================================================
   5. UPDATE NOTE
   ========================================================= */

function updateNote(
  dateKey,
  noteId,
  updatedData = {}
) {

  const key =
    normalizeNoteDateKey(dateKey);

  if (!key || !noteId) {
    return null;
  }

  const notes =
    getAllNotes();

  if (!Array.isArray(notes[key])) {
    return null;
  }

  const index =
    notes[key].findIndex(
      note =>
        String(note.id) ===
        String(noteId)
    );

  if (index === -1) {
    return null;
  }

  const oldNote =
    notes[key][index];

  const updatedNote = {
    ...oldNote,

    category:
      updatedData.category !== undefined
        ? String(
            updatedData.category
          )
        : oldNote.category,

    title:
      updatedData.title !== undefined
        ? String(
            updatedData.title
          ).trim()
        : oldNote.title,

    description:
      updatedData.description !== undefined
        ? String(
            updatedData.description
          ).trim()
        : oldNote.description,

    reminder:
      updatedData.reminder !== undefined
        ? String(
            updatedData.reminder
          ).trim()
        : oldNote.reminder,

    updatedAt:
      new Date().toISOString()
  };

  notes[key][index] =
    updatedNote;

  const saved =
    saveAllNotes(notes);

  return saved
    ? updatedNote
    : null;
}


/* =========================================================
   6. DELETE NOTE
   ========================================================= */

function deleteNote(
  dateKey,
  noteId
) {

  const key =
    normalizeNoteDateKey(dateKey);

  if (!key || !noteId) {
    return false;
  }

  const notes =
    getAllNotes();

  if (!Array.isArray(notes[key])) {
    return false;
  }

  const oldLength =
    notes[key].length;

  notes[key] =
    notes[key].filter(
      note =>
        String(note.id) !==
        String(noteId)
    );

  if (
    notes[key].length ===
    oldLength
  ) {
    return false;
  }

  if (
    notes[key].length === 0
  ) {
    delete notes[key];
  }

  return saveAllNotes(notes);
}


/* =========================================================
   7. GET NOTES FOR DATE
   ========================================================= */

function getNotesForDate(
  dateKey
) {

  const key =
    normalizeNoteDateKey(dateKey);

  if (!key) {
    return [];
  }

  const notes =
    getAllNotes();

  if (
    !Array.isArray(notes[key])
  ) {
    return [];
  }

  /*
     Backward compatibility:
     Old notes only had:
     id, category, title, createdAt
  */

  return notes[key].map(
    note => ({
      id:
        note.id,

      category:
        note.category ||
        "Personal",

      title:
        note.title ||
        "Untitled Note",

      description:
        note.description ||
        "",

      reminder:
        note.reminder ||
        "",

      createdAt:
        note.createdAt ||
        "",

      updatedAt:
        note.updatedAt ||
        ""
    })
  );
}


/* =========================================================
   8. GET ALL NOTE DATE KEYS
   ========================================================= */

function getNoteDateKeys() {

  const notes =
    getAllNotes();

  return Object.keys(
    notes
  ).filter(
    key =>
      Array.isArray(notes[key]) &&
      notes[key].length > 0
  );
}


/* =========================================================
   9. GET ALL NOTE OBJECTS
   ========================================================= */

function getAllNoteItems() {

  const notes =
    getAllNotes();

  const result = [];

  Object.keys(notes)
    .forEach(dateKey => {

      if (
        !Array.isArray(
          notes[dateKey]
        )
      ) {
        return;
      }

      notes[dateKey]
        .forEach(note => {

          result.push({
            ...note,
            dateKey
          });

        });

    });

  return result;
}


/* =========================================================
   10. CHECK NOTES FOR DATE
   ========================================================= */

function hasNotesForDate(
  dateKey
) {
  return (
    getNotesForDate(
      dateKey
    ).length > 0
  );
}


/* =========================================================
   11. COUNT NOTES
   ========================================================= */

function getNotesCount(
  dateKey = null
) {

  if (dateKey) {
    return getNotesForDate(
      dateKey
    ).length;
  }

  return getAllNoteItems()
    .length;
}


/* =========================================================
   12. DELETE ALL NOTES FOR DATE
   ========================================================= */

function deleteAllNotesForDate(
  dateKey
) {

  const key =
    normalizeNoteDateKey(dateKey);

  if (!key) {
    return false;
  }

  const notes =
    getAllNotes();

  if (
    !Object.prototype.hasOwnProperty
      .call(notes, key)
  ) {
    return false;
  }

  delete notes[key];

  return saveAllNotes(
    notes
  );
}


/* =========================================================
   13. CLEAR ALL NOTES
   ========================================================= */

function clearAllNotes() {

  try {

    localStorage.removeItem(
      NOTES_STORAGE_KEY
    );

    return true;

  } catch (error) {

    console.error(
      "Bodo Calendar: Unable to clear notes.",
      error
    );

    return false;
  }
}


/* =========================================================
   14. EXPORT NOTES AS JSON
   ========================================================= */

function exportNotes() {

  const notes =
    getAllNotes();

  return JSON.stringify(
    notes,
    null,
    2
  );
}


/* =========================================================
   15. IMPORT NOTES FROM JSON
   ========================================================= */

function importNotes(
  jsonData
) {

  try {

    const imported =
      typeof jsonData === "string"
        ? JSON.parse(jsonData)
        : jsonData;

    if (
      !imported ||
      typeof imported !== "object" ||
      Array.isArray(imported)
    ) {
      return false;
    }

    const current =
      getAllNotes();

    Object.keys(
      imported
    ).forEach(dateKey => {

      if (
        !Array.isArray(
          imported[dateKey]
        )
      ) {
        return;
      }

      if (
        !Array.isArray(
          current[dateKey]
        )
      ) {
        current[dateKey] = [];
      }

      imported[dateKey]
        .forEach(note => {

          current[dateKey]
            .push({
              id:
                note.id ||
                generateNoteId(),

              category:
                note.category ||
                "Personal",

              title:
                note.title ||
                "Untitled Note",

              description:
                note.description ||
                "",

              reminder:
                note.reminder ||
                "",

              createdAt:
                note.createdAt ||
                new Date()
                  .toISOString(),

              updatedAt:
                note.updatedAt ||
                ""
            });

        });

    });

    return saveAllNotes(
      current
    );

  } catch (error) {

    console.error(
      "Bodo Calendar: Invalid notes import.",
      error
    );

    return false;
  }
}


/* =========================================================
   16. DATE-BASED NOTE SUMMARY
   ========================================================= */

function getNoteDateStatus(
  dateKey
) {

  const notes =
    getNotesForDate(
      dateKey
    );

  return {
    dateKey,
    hasNotes:
      notes.length > 0,
    count:
      notes.length,
    notes
  };
}


/* =========================================================
   17. GLOBAL EXPORT
   ========================================================= */

window.BodoCalendarNotes = {

  storageKey:
    NOTES_STORAGE_KEY,

  getAllNotes,

  saveNote,

  updateNote,

  deleteNote,

  getNotesForDate,

  getNoteDateKeys,

  getAllNoteItems,

  hasNotesForDate,

  getNotesCount,

  deleteAllNotesForDate,

  clearAllNotes,

  exportNotes,

  importNotes,

  getNoteDateStatus
};


/* =========================================================
   18. BACKWARD COMPATIBILITY
   ========================================================= */

window.NOTES_STORAGE_KEY =
  NOTES_STORAGE_KEY;


/* =========================================================
   19. READY FLAG
   ========================================================= */

window.BODO_NOTES_READY =
  true;


/* =========================================================
   END OF NOTES
   ========================================================= */