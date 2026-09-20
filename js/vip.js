/* =========================================================
   BODO CALENDAR — VIP SYSTEM
   Version: 6.0

   Plans:
   - Monthly: ₹59
   - Yearly: ₹500

   IMPORTANT:
   GitHub Pages frontend alone cannot securely verify
   Razorpay payments.

   This file therefore keeps VIP UI/state separate from
   real payment verification.

   Production flow:
   Razorpay Checkout
        ↓
   Secure backend
        ↓
   Razorpay signature verification
        ↓
   VIP activation
   ========================================================= */


/* =========================================================
   1. CONFIGURATION
   ========================================================= */

const VIP_STORAGE_KEY =
  "bodo_calendar_vip_status";

const VIP_PLAN_STORAGE_KEY =
  "bodo_calendar_vip_plan";

const VIP_ACTIVATED_AT_KEY =
  "bodo_calendar_vip_activated_at";


const VIP_PLANS = {
  monthly: {
    id: "monthly",
    name: "Monthly VIP",
    amount: 59,
    currency: "INR",
    duration: "1 Month"
  },

  yearly: {
    id: "yearly",
    name: "Yearly VIP",
    amount: 500,
    currency: "INR",
    duration: "1 Year"
  }
};


/* =========================================================
   2. VIP STATUS
   ========================================================= */

function isVIPMember() {

  try {
    return (
      localStorage.getItem(
        VIP_STORAGE_KEY
      ) === "true"
    );

  } catch (error) {

    console.warn(
      "Bodo Calendar: Unable to read VIP status.",
      error
    );

    return false;
  }
}


/* =========================================================
   3. GET ACTIVE VIP PLAN
   ========================================================= */

function getVIPPlan() {

  try {

    const plan =
      localStorage.getItem(
        VIP_PLAN_STORAGE_KEY
      );

    return (
      VIP_PLANS[plan] ||
      null
    );

  } catch (error) {

    return null;
  }
}


/* =========================================================
   4. UPDATE VIP UI
   ========================================================= */

function updateVIPUI() {

  const isVIP =
    isVIPMember();


  /* -------------------------------------------------------
     Header VIP badge
     ------------------------------------------------------- */

  const vipBadge =
    document.getElementById(
      "vipBadgeHeader"
    );


  /* -------------------------------------------------------
     Current index.html VIP button
     ------------------------------------------------------- */

  const vipButton =
    document.getElementById(
      "vipButton"
    );


  /* -------------------------------------------------------
     Backward compatibility
     ------------------------------------------------------- */

  const oldVipButton =
    document.getElementById(
      "goVipBtn"
    );


  /* -------------------------------------------------------
     Ad containers
     ------------------------------------------------------- */

  const adBanners =
    document.querySelectorAll(
      ".ad-banner-box, #adContainer"
    );


  if (isVIP) {

    if (vipBadge) {
      vipBadge.classList.remove(
        "hidden"
      );
    }


    if (vipButton) {
      vipButton.classList.add(
        "hidden"
      );
    }


    if (oldVipButton) {
      oldVipButton.classList.add(
        "hidden"
      );
    }


    adBanners.forEach(
      ad => {
        ad.classList.add(
          "hidden"
        );
      }
    );

  } else {

    if (vipBadge) {
      vipBadge.classList.add(
        "hidden"
      );
    }


    if (vipButton) {
      vipButton.classList.remove(
        "hidden"
      );
    }


    if (oldVipButton) {
      oldVipButton.classList.remove(
        "hidden"
      );
    }


    adBanners.forEach(
      ad => {
        ad.classList.remove(
          "hidden"
        );
      }
    );
  }


  updateVIPPlanDisplay();
}


/* =========================================================
   5. VIP PLAN DISPLAY
   ========================================================= */

function updateVIPPlanDisplay() {

  const activePlan =
    getVIPPlan();


  document
    .querySelectorAll(
      "[data-vip-plan]"
    )
    .forEach(button => {

      const plan =
        button.dataset.vipPlan;

      if (
        activePlan &&
        plan === activePlan.id
      ) {

        button.classList.add(
          "active"
        );

      } else {

        button.classList.remove(
          "active"
        );
      }

    });
}


/* =========================================================
   6. GET PLAN
   ========================================================= */

function getVIPPlanByType(
  planType
) {

  const type =
    String(
      planType || ""
    )
      .trim()
      .toLowerCase();


  return (
    VIP_PLANS[type] ||
    null
  );
}


/* =========================================================
   7. OPEN VIP MODAL
   ========================================================= */

function openVipModal(
  planType = null
) {

  const modal =
    document.getElementById(
      "vipModal"
    );

  if (!modal) {
    return false;
  }


  if (planType) {

    const plan =
      getVIPPlanByType(
        planType
      );

    if (plan) {
      updateVIPModalContent(
        plan
      );
    }
  }


  modal.classList.remove(
    "hidden"
  );


  document.body.classList.add(
    "modal-open"
  );


  return true;
}


/* =========================================================
   8. CLOSE VIP MODAL
   ========================================================= */

function closeVipModal() {

  const modal =
    document.getElementById(
      "vipModal"
    );

  if (modal) {

    modal.classList.add(
      "hidden"
    );
  }


  document.body.classList.remove(
    "modal-open"
  );
}


/* =========================================================
   9. UPDATE MODAL CONTENT
   ========================================================= */

function updateVIPModalContent(
  plan
) {

  if (!plan) {
    return;
  }


  const title =
    document.getElementById(
      "vipModalTitle"
    );


  if (title) {

    title.textContent =
      `${plan.name} — ₹${plan.amount}`;
  }


  document
    .querySelectorAll(
      "[data-vip-plan]"
    )
    .forEach(button => {

      const buttonPlan =
        button.dataset.vipPlan;

      if (
        buttonPlan === plan.id
      ) {

        button.classList.add(
          "selected"
        );

      } else {

        button.classList.remove(
          "selected"
        );
      }

    });
}


/* =========================================================
   10. PAYMENT HANDLER
   =========================================================

   This is intentionally NOT pretending that a payment
   happened.

   Real production payment must be verified server-side.
   ========================================================= */

function triggerVIPPayment(
  planType
) {

  const plan =
    getVIPPlanByType(
      planType
    );


  if (!plan) {

    showVIPMessage(
      "Please select a valid VIP plan."
    );

    return false;
  }


  /*
     --------------------------------------------------------
     DEMO / TEST MODE
     --------------------------------------------------------

     Since this GitHub Pages application has no secure
     payment backend connected yet, we do not claim that
     money was paid.

     Instead we tell the user that payment integration
     is pending.
     --------------------------------------------------------
  */

  const message =
    [
      `${plan.name}`,
      `Amount: ₹${plan.amount}`,
      `Duration: ${plan.duration}`,
      "",
      "Razorpay payment verification is not connected yet.",
      "",
      "This website is currently in VIP test mode."
    ].join("\n");


  const proceed =
    window.confirm(
      message +
      "\n\nOpen VIP test activation?"
    );


  if (!proceed) {
    return false;
  }


  /*
     Test activation only.
     This MUST NOT be considered a real payment.
  */

  activateVIPDemo(
    plan.id
  );


  return true;
}


/* =========================================================
   11. DEMO VIP ACTIVATION
   ========================================================= */

function activateVIPDemo(
  planType
) {

  const plan =
    getVIPPlanByType(
      planType
    );


  if (!plan) {
    return false;
  }


  try {

    localStorage.setItem(
      VIP_STORAGE_KEY,
      "true"
    );


    localStorage.setItem(
      VIP_PLAN_STORAGE_KEY,
      plan.id
    );


    localStorage.setItem(
      VIP_ACTIVATED_AT_KEY,
      new Date().toISOString()
    );


    updateVIPUI();

    closeVipModal();


    showVIPMessage(
      `VIP TEST MODE activated: ${plan.name}. No real payment was processed.`
    );


    return true;

  } catch (error) {

    console.error(
      "Bodo Calendar: VIP activation failed.",
      error
    );

    showVIPMessage(
      "Unable to activate VIP test mode."
    );

    return false;
  }
}


/* =========================================================
   12. DEACTIVATE VIP
   ========================================================= */

function deactivateVIP() {

  try {

    localStorage.removeItem(
      VIP_STORAGE_KEY
    );

    localStorage.removeItem(
      VIP_PLAN_STORAGE_KEY
    );

    localStorage.removeItem(
      VIP_ACTIVATED_AT_KEY
    );


    updateVIPUI();


    showVIPMessage(
      "VIP test status has been removed."
    );


    return true;

  } catch (error) {

    console.error(
      "Bodo Calendar: Unable to deactivate VIP.",
      error
    );

    return false;
  }
}


/* =========================================================
   13. VIP MESSAGE
   ========================================================= */

function showVIPMessage(
  message
) {

  /*
     Use existing toast system if app.js provides it.
  */

  if (
    typeof window.showToast ===
    "function"
  ) {

    window.showToast(
      message,
      "info"
    );

    return;
  }


  const toastContainer =
    document.getElementById(
      "toastContainer"
    );


  if (!toastContainer) {

    window.alert(
      message
    );

    return;
  }


  const toast =
    document.createElement(
      "div"
    );


  toast.className =
    "toast vip-toast";


  toast.textContent =
    message;


  toastContainer.appendChild(
    toast
  );


  setTimeout(
    () => {

      toast.classList.add(
        "show"
      );

    },
    10
  );


  setTimeout(
    () => {

      toast.classList.remove(
        "show"
      );


      setTimeout(
        () => {
          toast.remove();
        },
        300
      );

    },
    4000
  );
}


/* =========================================================
   14. VIP PLAN CLICK HANDLER
   ========================================================= */

function handleVIPPlanClick(
  event
) {

  const button =
    event.currentTarget;


  if (!button) {
    return;
  }


  const planType =
    button.dataset.vipPlan;


  if (!planType) {
    return;
  }


  updateVIPModalContent(
    getVIPPlanByType(
      planType
    )
  );


  triggerVIPPayment(
    planType
  );
}


/* =========================================================
   15. BIND VIP BUTTONS
   ========================================================= */

function bindVIPButtons() {

  /*
     Main header VIP button
  */

  const vipButton =
    document.getElementById(
      "vipButton"
    );


  if (vipButton) {

    vipButton.addEventListener(
      "click",
      () => {
        openVipModal();
      }
    );
  }


  /*
     Backward compatibility
  */

  const oldVipButton =
    document.getElementById(
      "goVipBtn"
    );


  if (
    oldVipButton &&
    oldVipButton !== vipButton
  ) {

    oldVipButton.addEventListener(
      "click",
      () => {
        openVipModal();
      }
    );
  }


  /*
     Plan buttons
  */

  document
    .querySelectorAll(
      "[data-vip-plan]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        handleVIPPlanClick
      );

    });


  /*
     Close button
  */

  const closeButton =
    document.getElementById(
      "closeVipModalBtn"
    );


  if (closeButton) {

    closeButton.addEventListener(
      "click",
      closeVipModal
    );
  }


  /*
     Click outside modal
  */

  const modal =
    document.getElementById(
      "vipModal"
    );


  if (modal) {

    modal.addEventListener(
      "click",
      event => {

        if (
          event.target === modal
        ) {
          closeVipModal();
        }

      }
    );
  }


  /*
     Escape key
  */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape"
      ) {

        if (
          modal &&
          !modal.classList.contains(
            "hidden"
          )
        ) {
          closeVipModal();
        }

      }

    }
  );
}


/* =========================================================
   16. GET VIP INFORMATION
   ========================================================= */

function getVIPStatus() {

  return {
    isVIP:
      isVIPMember(),

    plan:
      getVIPPlan(),

    activatedAt:
      localStorage.getItem(
        VIP_ACTIVATED_AT_KEY
      )
  };
}


/* =========================================================
   17. INITIALIZE VIP SYSTEM
   ========================================================= */

function initVIP() {

  updateVIPUI();

  bindVIPButtons();
}


/* =========================================================
   18. GLOBAL EXPORT
   ========================================================= */

window.BodoCalendarVIP = {

  plans:
    VIP_PLANS,

  isVIPMember,

  getVIPPlan,

  getVIPPlanByType,

  updateVIPUI,

  openVipModal,

  closeVipModal,

  triggerVIPPayment,

  activateVIPDemo,

  deactivateVIP,

  getVIPStatus,

  showVIPMessage,

  initVIP
};


/* =========================================================
   19. BACKWARD COMPATIBILITY
   ========================================================= */

window.isVIPMember =
  isVIPMember;

window.updateVIPUI =
  updateVIPUI;

window.triggerVIPPayment =
  triggerVIPPayment;

window.openVipModal =
  openVipModal;

window.closeVipModal =
  closeVipModal;


/* =========================================================
   20. READY FLAG
   ========================================================= */

window.BODO_VIP_READY =
  true;


/* =========================================================
   21. AUTO INITIALIZATION
   ========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initVIP,
    {
      once: true
    }
  );

} else {

  initVIP();
}


/* =========================================================
   END OF VIP SYSTEM
   ========================================================= */