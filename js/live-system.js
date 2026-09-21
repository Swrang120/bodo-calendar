/* =========================================================
   BODO CALENDAR — LIVE SYSTEM
   VERSION 8.0

   FEATURES:
   - Supabase live messages
   - Local JSON fallback
   - Device-level dismiss
   - Automatic refresh
   - Safe HTML rendering
   - Future app compatible API
   ========================================================= */

"use strict";

(function () {

  const LOCAL_FEED =
    "./data/live-updates.json";

  const DISMISSED_KEY =
    "bodo_calendar_dismissed_live_v8";


  /* =======================================================
     DOM
     ======================================================= */

  function $(id) {
    return document.getElementById(id);
  }


  /* =======================================================
     ESCAPE
     ======================================================= */

  function escapeHTML(value) {

    return String(
      value == null ? "" : value
    )
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }


  /* =======================================================
     DISMISSED MESSAGES
     ======================================================= */

  function getDismissed() {

    try {

      return new Set(
        JSON.parse(
          localStorage.getItem(
            DISMISSED_KEY
          ) || "[]"
        )
      );

    } catch (_) {

      return new Set();

    }

  }


  function saveDismissed(set) {

    try {

      localStorage.setItem(
        DISMISSED_KEY,
        JSON.stringify(
          Array.from(set)
        )
      );

    } catch (_) {}

  }


  /* =======================================================
     DATE
     ======================================================= */

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
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }
    ).format(date);

  }


  /* =======================================================
     SUPABASE FEED
     ======================================================= */

  async function fetchSupabaseFeed() {

    const config =
      window.BODO_BACKEND || {};

    if (
      !config.supabaseUrl ||
      !config.supabaseAnonKey
    ) {

      throw new Error(
        "Supabase configuration missing."
      );

    }


    const base =
      config.supabaseUrl.replace(
        /\/$/,
        ""
      );


    const url =
      base +
      "/rest/v1/live_messages" +
      "?select=id,title,message,icon,source,active,created_at,updated_at" +
      "&active=eq.true" +
      "&order=created_at.desc" +
      "&limit=20";


    const response =
      await fetch(
        url,
        {
          method: "GET",
          headers: {
            apikey:
              config.supabaseAnonKey,

            Authorization:
              "Bearer " +
              config.supabaseAnonKey,

            Accept:
              "application/json"
          },

          cache: "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        "Supabase returned HTTP " +
        response.status
      );

    }


    const messages =
      await response.json();


    return {
      messages:
        Array.isArray(messages)
          ? messages
          : [],
      shared: true
    };

  }


  /* =======================================================
     LOCAL FALLBACK
     ======================================================= */

  async function fetchLocalFeed() {

    const response =
      await fetch(
        LOCAL_FEED +
        "?v=" +
        Date.now(),
        {
          cache: "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        "Local live feed unavailable."
      );

    }


    const raw =
      await response.json();


    const messages =
      Array.isArray(raw)
        ? raw
        : Array.isArray(raw.messages)
          ? raw.messages
          : [];


    return {
      messages,
      shared: false
    };

  }


  /* =======================================================
     FETCH
     ======================================================= */

  async function fetchFeed() {

    try {

      return await fetchSupabaseFeed();

    } catch (supabaseError) {

      console.warn(
        "Bodo Calendar: Supabase live feed unavailable.",
        supabaseError
      );


      return await fetchLocalFeed();

    }

  }


  /* =======================================================
     LOAD
     ======================================================= */

  async function load() {

    const list =
      $("liveUpdatesList");

    const empty =
      $("liveEmpty");

    const status =
      $("liveUpdatesStatus");

    const infoBox =
      $("liveSystemInfo");

    const infoText =
      $("liveSystemInfoText");


    if (!list) {
      return;
    }


    if (status) {
      status.textContent =
        "Updating live calendar...";
    }


    try {

      const feed =
        await fetchFeed();


      const dismissed =
        getDismissed();


      const visible =
        feed.messages

          .filter(
            message => {

              if (!message) {
                return false;
              }

              if (!message.id) {
                return false;
              }

              if (
                message.active === false
              ) {
                return false;
              }

              return !dismissed.has(
                String(message.id)
              );

            }
          )

          .sort(
            (a, b) =>
              new Date(
                b.created_at ||
                b.updated_at ||
                b.date ||
                0
              ).getTime() -

              new Date(
                a.created_at ||
                a.updated_at ||
                a.date ||
                0
              ).getTime()
          )

          .slice(
            0,
            20
          );


      list.innerHTML =
        visible
          .map(
            message => {

              const id =
                escapeHTML(
                  message.id
                );

              const title =
                escapeHTML(
                  message.title ||
                  "Bodo Calendar Update"
                );

              const body =
                escapeHTML(
                  message.message ||
                  ""
                );

              const icon =
                escapeHTML(
                  message.icon ||
                  "📢"
                );

              const source =
                message.source
                  ? ` • ${escapeHTML(
                      message.source
                    )}`
                  : "";


              const time =
                escapeHTML(
                  formatTime(
                    message.created_at ||
                    message.updated_at ||
                    message.date
                  )
                );


              return `

                <article
                  class="live-update"
                  data-live-id="${id}"
                >

                  <div class="live-update-icon">
                    ${icon}
                  </div>


                  <div class="live-update-content">

                    <h3>
                      ${title}
                    </h3>

                    <p>
                      ${body}
                    </p>

                    <time>
                      ${time}${source}
                    </time>

                  </div>


                  <button
                    type="button"
                    class="dismiss-btn"
                    data-dismiss="${id}"
                    aria-label="Hide this update on this device"
                    title="Hide on this device"
                  >
                    ×
                  </button>

                </article>

              `;

            }
          )
          .join("");


      if (empty) {

        empty.classList.toggle(
          "hidden",
          visible.length > 0
        );

      }


      if (infoBox) {

        infoBox.classList.remove(
          "hidden"
        );

      }


      if (infoText) {

        infoText.textContent =
          feed.shared

            ? "Shared live feed connected. Admin updates appear here and can also be reused by the future app."

            : "Local fallback feed active. Connect Supabase to enable shared admin updates.";

      }


      /*
       * DISMISS
       */

      list
        .querySelectorAll(
          "[data-dismiss]"
        )
        .forEach(
          button => {

            button.addEventListener(
              "click",
              function () {

                const id =
                  String(
                    button.dataset.dismiss
                  );


                const current =
                  getDismissed();


                current.add(id);

                saveDismissed(
                  current
                );


                const card =
                  button.closest(
                    ".live-update"
                  );


                if (card) {

                  card.remove();

                }


                const remaining =
                  list.querySelectorAll(
                    ".live-update"
                  );


                if (
                  empty &&
                  remaining.length === 0
                ) {

                  empty.classList.remove(
                    "hidden"
                  );

                }

              }
            );

          }
        );


      if (status) {

        const timeNow =
          new Intl.DateTimeFormat(
            "en-IN",
            {
              hour: "numeric",
              minute: "2-digit"
            }
          ).format(
            new Date()
          );


        status.textContent =
          `${visible.length} live update${
            visible.length === 1
              ? ""
              : "s"
          } • refreshed ${timeNow}`;

      }


    } catch (error) {

      console.error(
        "Bodo Live System Error:",
        error
      );


      if (status) {

        status.textContent =
          "Live feed unavailable — local data will be used when available.";

      }


      if (empty) {

        empty.classList.remove(
          "hidden"
        );

      }

    }

  }


  /* =======================================================
     PUBLIC API
     ======================================================= */

  window.BodoLiveSystem = {
    load
  };


  /* =======================================================
     AUTO LOAD
     ======================================================= */

  function start() {

    load();

    /*
     * Refresh every 5 minutes.
     */

    setInterval(
      load,
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
        once: true
      }
    );

  } else {

    start();

  }

})();