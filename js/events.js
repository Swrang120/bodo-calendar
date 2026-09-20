// Bodo & Assamese Solar Calendar Sync Events Data
const bodoCulturalEvents = {
  // Format: "MonthIndex-DayIndex"
  "3-1": [{ title: "Bwisag Festival", desc: "Main Bodo New Year Celebration Day" }],
  "3-2": [{ title: "Bwisag Cultural Day", desc: "Folk Dance and Music Celebrations" }],
  "3-17": [{ title: "May Day", desc: "Public Holiday" }],
  "3-23": [{ title: "Domahi Rituals", desc: "Traditional Worship & Feasting" }],
  "0-1": [{ title: "Magh Bihu / Maghw Domahi", desc: "Harvest Festival" }],
  "1-15": [{ title: "Bathou San", desc: "Traditional Bathou Worship Day" }],
  "8-5": [{ title: "Aasin Special Day", desc: "Traditional Autumn Solar Day" }],
  "9-1": [{ title: "Kati Gasa / Lamp Festival", desc: "Lighting lamps in paddy fields" }]
};

// Admin Notification Fetcher
async function loadAdminNotification() {
  try {
    const response = await fetch("./notifications.json");
    if (!response.ok) return;
    const data = await response.json();

    const banner = document.getElementById("adminNoticeBanner");
    const titleEl = document.getElementById("adminNoticeTitle");
    const msgEl = document.getElementById("adminNoticeMsg");

    if (data && data.active && banner) {
      titleEl.textContent = data.title;
      msgEl.textContent = data.message;
      banner.classList.remove("hidden");
    }
  } catch (err) {
    console.log("No active admin notification found.");
  }
}
