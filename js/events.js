const bodoCulturalEvents = {
  // Key format: "MonthIndex-DayIndex" (e.g. Bwisag day 1 = "3-1")
  "3-1": [{ title: "Bwisag Festival", desc: "Main Bodo New Year Celebration Day" }],
  "3-2": [{ title: "Bwisag Dance & Cultural Program", desc: "Community folk performance and gatherings" }],
  "3-17": [{ title: "May Day", desc: "Public/State Holiday" }],
  "3-23": [{ title: "Domahi Rituals", desc: "Traditional Worship and Feasting" }],
  "3-28": [{ title: "Agricultural Ceremony", desc: "Seasonal Crop Blessing" }],
  "0-1": [{ title: "Magh Bihu / Maghw Domahi", desc: "Harvest Festival and Bonfire rituals" }],
  "1-15": [{ title: "Bathou San", desc: "Traditional Bathou Worship Day" }],
  "10-1": [{ title: "Kati Gasa", desc: "Lighting lamps in paddy fields" }]
};

// Fetch global announcements from admin notifications.json
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
    console.log("No active admin notification found or offline mode.");
  }
}

// Detect today's event automatically
function detectTodayStatus() {
  const today = new Date();
  const todayBox = document.getElementById("todayAlertBox");
  const todayText = document.getElementById("todayAlertText");

  if (!todayBox || !todayText) return;

  const monthStr = today.toLocaleString("en-US", { month: "short" });
  const dateNum = today.getDate();

  todayText.innerHTML = `<strong>Today (${dateNum} ${monthStr}):</strong> Live system date detected. Tap any date on the grid to attach personal notes or reminders.`;
  todayBox.classList.remove("hidden");
}
