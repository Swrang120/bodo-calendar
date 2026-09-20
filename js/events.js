const bodoCulturalEvents = {
  // Format: "MonthIndex-DayIndex"
  "3-1": [{ title: "Bwisag Festival", desc: "Main Bodo New Year Celebration Day" }],
  "3-2": [{ title: "Bwisag Cultural Day", desc: "Community folk performance and dance" }],
  "3-17": [{ title: "May Day", desc: "Public Holiday" }],
  "3-23": [{ title: "Domahi Rituals", desc: "Traditional Worship and Feasting" }],
  "3-28": [{ title: "Agricultural Ceremony", desc: "Seasonal Crop Blessing" }],
  "0-1": [{ title: "Magh Bihu / Maghw Domahi", desc: "Harvest Festival and Bonfire" }],
  "1-15": [{ title: "Bathou San", desc: "Traditional Bathou Worship Day" }],
  "8-5": [{ title: "Special Day", desc: "Current Month Event" }],
  "9-1": [{ title: "Kati Gasa", desc: "Lighting lamps in paddy fields" }]
};

// Fetch global admin notification from notifications.json
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
