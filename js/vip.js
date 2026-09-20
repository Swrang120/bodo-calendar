const VIP_STORAGE_KEY = "bodo_calendar_vip_status";

function isVIPMember() {
  return localStorage.getItem(VIP_STORAGE_KEY) === "true";
}

function updateVIPUI() {
  const vipBadge = document.getElementById("vipBadgeHeader");
  const vipBtn = document.getElementById("goVipBtn");
  const adBanners = document.querySelectorAll(".ad-banner-box");

  if (isVIPMember()) {
    if (vipBadge) vipBadge.classList.remove("hidden");
    if (vipBtn) vipBtn.classList.add("hidden");
    adBanners.forEach((ad) => ad.classList.add("hidden"));
  } else {
    if (vipBadge) vipBadge.classList.add("hidden");
    if (vipBtn) vipBtn.classList.remove("hidden");
    adBanners.forEach((ad) => ad.classList.remove("hidden"));
  }
}

function triggerVIPPayment(planType) {
  const amount = planType === "monthly" ? 59 : 500;
  
  // Dummy payment handler simulating UPI / Razorpay checkout
  const confirmPay = confirm(
    `Confirm Subscription:\nPlan: ${planType.toUpperCase()}\nAmount: ₹${amount}\n\nProceed to unlock Ad-Free VIP Experience?`
  );

  if (confirmPay) {
    localStorage.setItem(VIP_STORAGE_KEY, "true");
    alert("🎉 Payment Successful! VIP Status activated. Ads have been removed.");
    closeVipModal();
    updateVIPUI();
  }
}

function openVipModal() {
  const modal = document.getElementById("vipModal");
  if (modal) modal.classList.remove("hidden");
}

function closeVipModal() {
  const modal = document.getElementById("vipModal");
  if (modal) modal.classList.add("hidden");
}
