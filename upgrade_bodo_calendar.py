#!/usr/bin/env python3

"""
=========================================================
BODO CALENDAR — COMPLETE FRONTEND UPDATER
Version: 8.0
=========================================================

Repository:
https://github.com/Swrang120/bodo-calendar

This updater:
- Reads the existing project files
- Keeps existing calendar/events/notes/VIP logic
- Updates hero images
- Makes Bodo date primary
- Makes Gregorian date secondary
- Adds Aronai cultural styling
- Adds live update feed
- Adds per-device dismiss
- Adds live JSON data source

Run:
python upgrade_bodo_calendar.py
=========================================================
"""

from pathlib import Path
import re
import json
import shutil
import datetime


ROOT = Path.cwd()

INDEX = ROOT / "index.html"
STYLE = ROOT / "css" / "style.css"
APP = ROOT / "js" / "app.js"

LIVE_JS = ROOT / "js" / "live-system.js"
LIVE_DATA = ROOT / "data" / "live-updates.json"


print()
print("=" * 60)
print("🌿 BODO CALENDAR — VERSION 8.0 UPDATER")
print("=" * 60)
print()


# =========================================================
# CHECK PROJECT
# =========================================================

if not INDEX.exists():
    print("❌ index.html nahi mila.")
    print("Is script ko Bodo Calendar repository ke root folder mein run karo.")
    raise SystemExit(1)

if not STYLE.exists():
    print("❌ css/style.css nahi mila.")
    raise SystemExit(1)

if not APP.exists():
    print("❌ js/app.js nahi mila.")
    raise SystemExit(1)


# =========================================================
# BACKUP
# =========================================================

backup_dir = ROOT / "backup-before-v8"

backup_dir.mkdir(exist_ok=True)

for source in [INDEX, STYLE, APP]:

    target = backup_dir / source.name

    shutil.copy2(source, target)

print("✅ Backup created:")
print("   backup-before-v8/")
print()


# =========================================================
# READ FILES
# =========================================================

index = INDEX.read_text(
    encoding="utf-8"
)

style = STYLE.read_text(
    encoding="utf-8"
)

app = APP.read_text(
    encoding="utf-8"
)


# =========================================================
# INDEX — CSS CACHE
# =========================================================

index = index.replace(
    './css/style.css?v=7.0',
    './css/style.css?v=8.0'
)

index = index.replace(
    './css/style.css?v=6.2',
    './css/style.css?v=8.0'
)


# =========================================================
# HERO IMAGE
# =========================================================

index = index.replace(
    './assets/bodo-women.jpg',
    './assets/1735633-bagrumba.jpg'
)

index = index.replace(
    './assets/bodo-scarf.jpg',
    './assets/bodo-aronai.jpg'
)


# =========================================================
# HERO IMAGE ATTRIBUTES
# =========================================================

index = index.replace(
    'src="./assets/1735633-bagrumba.jpg"',
    '''src="./assets/1735633-bagrumba.jpg"
          class="bodo-hero-photo"
          decoding="async"'''
)

index = index.replace(
    'src="./assets/bodo-aronai.jpg"',
    '''src="./assets/bodo-aronai.jpg"
          class="bodo-aronai-photo"
          decoding="async"'''
)


# =========================================================
# IMAGE ERROR HANDLING
# =========================================================

index = index.replace(
    "onerror=\"this.style.display='none';this.parentElement.classList.add('image-fallback')\"",
    "onerror=\"this.classList.add('image-load-error');this.parentElement.classList.add('image-fallback')\""
)

index = index.replace(
    "onerror=\"this.style.display='none';this.parentElement.classList.add('textile-fallback')\"",
    "onerror=\"this.classList.add('image-load-error');this.parentElement.classList.add('textile-fallback')\""
)


# =========================================================
# LIVE UPDATE HTML
# =========================================================

live_html = r'''

    <!-- ===================================================
         BODO CALENDAR — LIVE UPDATE SYSTEM
         =================================================== -->

    <section
      id="liveUpdatesSection"
      class="live-updates-section hidden"
      aria-live="polite"
    >

      <div class="live-updates-header">

        <div>

          <h2 class="live-updates-title">
            📢 Bodo Calendar Live
          </h2>

          <p class="live-updates-subtitle">
            Latest updates, cultural information &amp; announcements
          </p>

        </div>

        <span
          id="liveUpdatesStatus"
          class="notification-badge"
        >
          Updating...
        </span>

      </div>


      <div
        id="liveUpdatesList"
        class="live-updates-list"
      ></div>

    </section>

'''

if 'id="liveUpdatesSection"' not in index:

    marker = '''
    <!-- ===================================================
         LIVE CALENDAR
         =================================================== -->
'''

    if marker in index:

        index = index.replace(
            marker,
            live_html + marker,
            1
        )

    else:

        print(
            "⚠️ LIVE CALENDAR marker nahi mila."
        )


# =========================================================
# LIVE JS SCRIPT
# =========================================================

if 'live-system.js' not in index:

    script_marker = (
        '<script src="./js/app.js?v=8.0"></script>'
    )

    if script_marker in index:

        index = index.replace(
            script_marker,
            '''
  <script src="./js/live-system.js?v=1.0"></script>
  <script src="./js/app.js?v=8.0"></script>
''',
            1
        )

    else:

        app_script = re.search(
            r'<script[^>]+app\.js[^>]*></script>',
            index
        )

        if app_script:

            original = app_script.group(0)

            index = index.replace(
                original,
                '''
  <script src="./js/live-system.js?v=1.0"></script>
  ''' + original,
                1
            )


# =========================================================
# WRITE INDEX
# =========================================================

INDEX.write_text(
    index,
    encoding="utf-8"
)

print("✅ index.html updated")


# =========================================================
# APP.JS — DATE HIERARCHY
# =========================================================

old_calendar = r'''<div class="gregorian">
            ${date.getDate()}
          </div>


          <div class="gregorian-month">
            ${monthShort}
          </div>


          <div class="bodo-date">

            ${
              info
                ? `Bodo ${escapeHTML(
                    info.day
                  )}`
                : ""
            }

          </div>'''


new_calendar = r'''<div class="calendar-date-content">

            <span class="bodo-date-number">
              ${info ? escapeHTML(info.day) : ""}
            </span>

            <span class="bodo-date-label">
              ${info ? escapeHTML(info.month.name) : ""}
            </span>

            <span class="gregorian-date-number">
              ${date.getDate()} ${escapeHTML(monthShort)}
            </span>

          </div>'''


if "calendar-date-content" not in app:

    if old_calendar in app:

        app = app.replace(
            old_calendar,
            new_calendar,
            1
        )

        print(
            "✅ app.js date hierarchy updated"
        )

    else:

        print(
            "⚠️ Calendar date block exact match nahi mila."
        )

else:

    print(
        "ℹ️ app.js already contains new date hierarchy."
    )


# =========================================================
# WRITE APP
# =========================================================

APP.write_text(
    app,
    encoding="utf-8"
)


# =========================================================
# CSS — ARONAI DESIGN
# =========================================================

aronai_css = r'''

/* =========================================================
   BODO CALENDAR 8.0
   ARONAI CULTURAL DESIGN SYSTEM
   ========================================================= */

:root {

  --aronai-green:
    #075c47;

  --aronai-green-dark:
    #033b30;

  --aronai-green-light:
    #e8f5ef;

  --aronai-red:
    #9d1c25;

  --aronai-red-dark:
    #70131a;

  --aronai-red-light:
    #f8e7e8;

  --aronai-gold:
    #d4a72c;

  --aronai-gold-light:
    #f7e8a8;

  --aronai-black:
    #11110f;

  --aronai-cream:
    #fff9e9;

}


/* =========================================================
   CULTURAL HERO
   ========================================================= */

.bodo-hero-image {

  position: relative;

  min-height: 390px;

  overflow: hidden;

  background:
    linear-gradient(
      135deg,
      var(--aronai-green-dark),
      var(--aronai-black)
    );

}


.bodo-hero-photo {

  position: absolute;

  inset: 0;

  width: 100%;

  height: 100%;

  max-width: none;

  object-fit: cover;

  object-position: center 42%;

}


.bodo-hero-overlay {

  position: absolute;

  inset: 0;

  z-index: 2;

  background:
    linear-gradient(
      90deg,
      rgba(3, 59, 48, .92),
      rgba(3, 59, 48, .52) 45%,
      rgba(0, 0, 0, .12)
    );

}


.bodo-hero-pattern {

  position: absolute;

  inset: 0;

  z-index: 3;

  pointer-events: none;

  opacity: .18;

  background:
    repeating-linear-gradient(
      135deg,
      transparent 0,
      transparent 18px,
      rgba(212,167,44,.30) 19px,
      rgba(212,167,44,.30) 21px
    );

}


.bodo-hero-content {

  z-index: 5;

}


/* =========================================================
   ARONAI IMAGE
   ========================================================= */

.bodo-textile-strip {

  position: relative;

  min-height: 125px;

  overflow: hidden;

  background:
    linear-gradient(
      135deg,
      var(--aronai-black),
      #271f0c,
      var(--aronai-green-dark)
    );

  border-top:
    3px solid var(--aronai-gold);

}


.bodo-aronai-photo {

  width: 100%;

  height: 125px;

  max-width: none;

  object-fit: cover;

  object-position: center;

}


.bodo-textile-strip
.textile-overlay {

  z-index: 3;

  background:
    linear-gradient(
      90deg,
      rgba(0,0,0,.72),
      rgba(0,0,0,.20),
      rgba(0,0,0,.72)
    );

}


/* =========================================================
   IMAGE FALLBACK
   ========================================================= */

.image-load-error {

  opacity:
    0 !important;

}


.image-fallback {

  background:
    radial-gradient(
      circle at 20% 30%,
      rgba(212,167,44,.25),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      var(--aronai-green-dark),
      var(--aronai-black)
    );

}


.textile-fallback {

  background:
    repeating-linear-gradient(
      135deg,
      var(--aronai-black) 0,
      var(--aronai-black) 18px,
      var(--aronai-red) 18px,
      var(--aronai-red) 24px,
      var(--aronai-gold) 24px,
      var(--aronai-gold) 30px
    );

}


/* =========================================================
   CALENDAR DATE HIERARCHY
   BODO = BIG
   ENGLISH = SMALL
   ========================================================= */

.calendar-date-content {

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  gap: 2px;

  min-height: 68px;

  text-align: center;

}


.bodo-date-number {

  display: block;

  color:
    var(--aronai-green);

  font-size:
    23px;

  line-height:
    1;

  font-weight:
    900;

}


.bodo-date-label {

  display: block;

  color:
    var(--aronai-green-dark);

  font-size:
    9px;

  line-height:
    1;

  font-weight:
    800;

}


.gregorian-date-number {

  display: block;

  color:
    var(--text-soft);

  font-size:
    11px;

  line-height:
    1;

  font-weight:
    600;

}


/* TODAY */

.calendar-day.today
.bodo-date-number,

.today .bodo-date-number {

  color:
    var(--aronai-red);

}


/* =========================================================
   LIVE UPDATE FEED
   ========================================================= */

.live-updates-section {

  overflow:
    hidden;

  border-radius:
    20px;

  background:
    #ffffff;

  border:
    1px solid var(--border);

  box-shadow:
    var(--shadow);

  margin-top:
    20px;

}


.live-updates-header {

  padding:
    16px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    12px;

  background:
    linear-gradient(
      135deg,
      var(--aronai-green-dark),
      var(--aronai-green)
    );

  color:
    #ffffff;

}


.live-updates-title {

  margin:
    0;

  font-size:
    18px;

  font-weight:
    900;

}


.live-updates-subtitle {

  margin:
    2px 0 0;

  font-size:
    11px;

  opacity:
    .78;

}


.live-updates-list {

  display:
    grid;

}


.live-update-item {

  padding:
    15px;

  border-bottom:
    1px solid var(--border);

  display:
    grid;

  grid-template-columns:
    auto 1fr auto;

  gap:
    12px;

  align-items:
    start;

}


.live-update-item:last-child {

  border-bottom:
    0;

}


.live-update-icon {

  width:
    38px;

  height:
    38px;

  border-radius:
    12px;

  display:
    grid;

  place-items:
    center;

  background:
    var(--aronai-gold-light);

}


.live-update-title {

  margin:
    0;

  font-size:
    14px;

  font-weight:
    900;

}


.live-update-message {

  margin:
    4px 0 0;

  font-size:
    12px;

  line-height:
    1.55;

  color:
    var(--text-soft);

}


.live-update-time {

  margin-top:
    5px;

  font-size:
    10px;

  color:
    var(--text-soft);

}


.live-update-dismiss {

  width:
    30px;

  height:
    30px;

  border:
    0;

  border-radius:
    9px;

  background:
    #f1f4f3;

  color:
    #586661;

}


.live-update-dismiss:hover {

  background:
    var(--aronai-red-light);

  color:
    var(--aronai-red);

}


/* =========================================================
   INSTALL BUTTON
   ========================================================= */

#installAppBtn {

  background:
    var(--aronai-gold) !important;

  color:
    var(--aronai-black) !important;

}


/* =========================================================
   MOBILE
   ========================================================= */

@media (max-width: 640px) {

  .bodo-hero-image {

    min-height:
      330px;

  }


  .bodo-date-number {

    font-size:
      19px;

  }


  .gregorian-date-number {

    font-size:
      10px;

  }


  .live-update-item {

    grid-template-columns:
      auto 1fr auto;

  }

}

'''


if "BODO CALENDAR 8.0" not in style:

    style += aronai_css

    print(
        "✅ Aronai CSS added"
    )

else:

    print(
        "ℹ️ Aronai CSS already exists"
    )


STYLE.write_text(
    style,
    encoding="utf-8"
)


# =========================================================
# CREATE LIVE SYSTEM JS
# =========================================================

LIVE_JS.parent.mkdir(
    parents=True,
    exist_ok=True
)


live_js = r'''/* =========================================================
   BODO CALENDAR — LIVE UPDATE SYSTEM
   ========================================================= */

"use strict";

(function () {

  const API_URL =
    window.BODO_LIVE_API_URL ||
    "./data/live-updates.json";


  const STORAGE_KEY =
    "bodo_calendar_dismissed_live_messages_v1";


  function $(id) {

    return document.getElementById(id);

  }


  function escapeHTML(value) {

    return String(value ?? "")

      .replace(/&/g, "&amp;")

      .replace(/</g, "&lt;")

      .replace(/>/g, "&gt;")

      .replace(/"/g, "&quot;")

      .replace(/'/g, "&#039;");

  }


  function getDismissed() {

    try {

      return new Set(
        JSON.parse(
          localStorage.getItem(
            STORAGE_KEY
          ) || "[]"
        )
      );

    } catch (error) {

      return new Set();

    }

  }


  function saveDismissed(set) {

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          Array.from(set)
        )
      );

    } catch (error) {}

  }


  function formatTime(value) {

    if (!value) {

      return "";

    }


    const date =
      new Date(value);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "";

    }


    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day:
          "numeric",

        month:
          "short",

        year:
          "numeric",

        hour:
          "numeric",

        minute:
          "2-digit"
      }
    ).format(date);

  }


  async function loadMessages() {

    try {

      const response =
        await fetch(
          API_URL +
          (
            API_URL.includes("?")
              ? "&"
              : "?"
          ) +
          "_=" +
          Date.now(),
          {
            cache:
              "no-store"
          }
        );


      if (!response.ok) {

        throw new Error(
          "Live update request failed"
        );

      }


      const data =
        await response.json();


      const messages =
        Array.isArray(data)
          ? data
          : (
              Array.isArray(
                data.messages
              )
                ? data.messages
                : []
            );


      renderMessages(
        messages
      );


    } catch (error) {

      console.warn(
        "Bodo Live System:",
        error.message
      );

    }

  }


  function renderMessages(
    messages
  ) {

    const section =
      $("liveUpdatesSection");


    const list =
      $("liveUpdatesList");


    if (
      !section ||
      !list
    ) {

      return;

    }


    const dismissed =
      getDismissed();


    const visible =
      messages

        .filter(
          message =>
            message &&
            message.id &&
            !dismissed.has(
              String(
                message.id
              )
            )
        )

        .sort(
          (a, b) =>
            new Date(
              b.created_at || 0
            ) -
            new Date(
              a.created_at || 0
            )
        )

        .slice(
          0,
          10
        );


    section.classList.toggle(
      "hidden",
      !visible.length
    );


    list.innerHTML =
      visible
        .map(
          message => `

            <article
              class="live-update-item"
              data-live-id="${escapeHTML(
                message.id
              )}"
            >

              <div
                class="live-update-icon"
                aria-hidden="true"
              >
                ${escapeHTML(
                  message.icon ||
                  "📢"
                )}
              </div>


              <div>

                <h3
                  class="live-update-title"
                >
                  ${escapeHTML(
                    message.title ||
                    "Bodo Calendar Update"
                  )}
                </h3>


                <p
                  class="live-update-message"
                >
                  ${escapeHTML(
                    message.message ||
                    ""
                  )}
                </p>


                <div
                  class="live-update-time"
                >
                  ${escapeHTML(
                    formatTime(
                      message.created_at
                    )
                  )}
                </div>

              </div>


              <button
                type="button"
                class="live-update-dismiss"
                data-dismiss-live="${escapeHTML(
                  message.id
                )}"
                aria-label="Dismiss update"
              >
                ×
              </button>

            </article>

          `
        )
        .join("");


    list
      .querySelectorAll(
        "[data-dismiss-live]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const dismissed =
                getDismissed();


              dismissed.add(
                String(
                  button.dataset
                    .dismissLive
                )
              );


              saveDismissed(
                dismissed
              );


              loadMessages();

            }
          );

        }
      );


    const status =
      $("liveUpdatesStatus");


    if (status) {

      status.textContent =
        "Updated " +
        new Intl.DateTimeFormat(
          "en-IN",
          {
            hour:
              "numeric",

            minute:
              "2-digit"
          }
        ).format(
          new Date()
        );

    }

  }


  window.BodoLiveSystem = {

    load:
      loadMessages

  };


  function start() {

    loadMessages();


    /*
      Check for new messages
      every five minutes.
    */

    setInterval(
      loadMessages,
      5 * 60 * 1000
    );

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      start,
      {
        once:
          true
      }
    );

  } else {

    start();

  }

})();
'''


LIVE_JS.write_text(
    live_js,
    encoding="utf-8"
)


print(
    "✅ js/live-system.js created"
)


# =========================================================
# LIVE JSON
# =========================================================

LIVE_DATA.parent.mkdir(
    parents=True,
    exist_ok=True
)


live_data = {

    "version": 1,

    "messages": [

        {

            "id":
                "welcome-2026-09-21",

            "title":
                "Bodo Calendar Live",

            "message":
                "Bodo Calendar live update system is active.",

            "type":
                "update",

            "icon":
                "📢",

            "created_at":
                "2026-09-21T05:00:00+05:30"

        }

    ]

}


LIVE_DATA.write_text(
    json.dumps(
        live_data,
        ensure_ascii=False,
        indent=2
    ),
    encoding="utf-8"
)


print(
    "✅ data/live-updates.json created"
)


# =========================================================
# FINAL REPORT
# =========================================================

print()
print("=" * 60)
print("🎉 BODO CALENDAR 8.0 UPDATE COMPLETE")
print("=" * 60)
print()

print("Updated:")
print("  ✅ index.html")
print("  ✅ css/style.css")
print("  ✅ js/app.js")
print("  ✅ js/live-system.js")
print("  ✅ data/live-updates.json")
print()

print("Images required:")
print("  📷 assets/1735633-bagrumba.jpg")
print("  🧵 assets/bodo-aronai.jpg")
print()

print("IMPORTANT:")
print(
    "Image files ko exact naam se assets/ folder mein rakho."
)
print()

print(
    "Bodo date ab BIG hoga aur Gregorian date SMALL."
)

print(
    "Live message × sirf current device par message hide karega."
)

print()
print(
    "Backup available at:"
)
print(
    "  backup-before-v8/"
)

print()
print("=" * 60)