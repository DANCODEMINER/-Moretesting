// === Toggle Menu for Login Page ===
function toggleMenu() {
  const menu = document.getElementById("menu");
  menu.classList.toggle("show");
}

// === Toggle Sidebar for Dashboard ===
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  sidebar.classList.toggle("active");
  overlay.classList.toggle("show");
}

function showForm(formType) {
  // All possible form sections by ID
  const formMap = {
    login: "login-form",
    register: "register-form",
    forgot: "forgot-form",
    "otp-form": "otp-form",
    "pin-form": "pin-form",
    "pin-verify": "pin-verify-form",
    "forgot-password": "forgot-password-section",
    "verify-forgot-otp": "verify-forgot-otp-section",
    "reset-password": "reset-password-section",

    // ✅ Added these for PIN reset flow
    "verify-pin-otp": "verify-pin-otp-section",
    "reset-pin": "reset-pin-section"
  };

  // Loop and toggle visibility
  for (const key in formMap) {
    const el = document.getElementById(formMap[key]);
    if (el) el.style.display = formType === key ? "block" : "none";
  }

  // Handle dashboard and login-page toggle
  const dashboard = document.getElementById("dashboard-page");
  const loginPage = document.getElementById("login-page");

  if (formType === "dashboard") {
    if (dashboard) dashboard.style.display = "block";
    if (loginPage) loginPage.style.display = "none";
  } else {
    if (dashboard) dashboard.style.display = "none";
    if (loginPage) loginPage.style.display = "block";
  }

  // ✅ Clear pin-verify inputs when showing pin-verify form
  if (formType === "pin-verify") {
    ["pinverify1", "pinverify2", "pinverify3", "pinverify4"].forEach(id => {
      const input = document.getElementById(id);
      if (input) input.value = "";
    });
  }

  // ✅ Re-bind pin inputs after showing new form
  bindPinInputs();
}


function bindPinInputs() {
  const forms = {};

  // Group .pin-inputs by form (e.g. reset PIN, verify PIN, create PIN)
  document.querySelectorAll(".pin-input").forEach((input) => {
    const formId = input.closest("form")?.id || "default";
    if (!forms[formId]) forms[formId] = [];
    forms[formId].push(input);
  });

  // Apply input behavior per form group
  Object.values(forms).forEach(inputs => {
    inputs.forEach((input, i) => {
      input.addEventListener("input", () => {
        input.value = input.value.replace(/[^0-9]/g, ""); // allow only numbers
        if (input.value.length === 1 && i < inputs.length - 1) {
          inputs[i + 1].focus();
        }
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !input.value && i > 0) {
          inputs[i - 1].focus();
        }
      });
    });

    // Optional: Autofocus first input in the group
    if (inputs[0]) inputs[0].focus();
  });
}

function checkPinLength() {
  const pin = ["pin1","pin2","pin3","pin4"].map(id => document.getElementById(id).value).join("");
  const btn = document.getElementById("create-account-btn");
  if (btn) {
    btn.disabled = pin.length !== 4;
    btn.style.opacity = pin.length === 4 ? "1" : "0.5";
    btn.style.cursor = pin.length === 4 ? "pointer" : "not-allowed";
  }
}

function logout() {
  sessionStorage.clear();
  localStorage.clear();
  window.location.href = "index.html";
}

function showDashboard() {
  showForm("dashboard");

  const name = sessionStorage.getItem("name");
  const countryCode = sessionStorage.getItem("country"); // ISO 2-letter code

  const welcomeEl = document.getElementById("welcome-name");
  const flagEl = document.getElementById("country-flag");

  if (name && welcomeEl) {
    welcomeEl.innerText = `Welcome, ${name}!`;
  }

  if (countryCode && flagEl) {
    flagEl.src = `https://flagcdn.com/48x36/${countryCode.toLowerCase()}.png`;
    flagEl.alt = countryCode.toUpperCase();
    flagEl.style.display = "inline-block";
  }
}

function withdrawNow() {
  alert("🔄 Withdrawal logic to be added soon!");
}

let btcValue = 0.00000000;
setInterval(() => {
  const btcCounter = document.getElementById("btc-counter");
  if (btcCounter) {
    btcValue += 0.00000001;
    btcCounter.innerText = btcValue.toFixed(8) + " BTC";
  }
}, 1000);

// ========== DOMContentLoaded Setup ==========
document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
  const pinVerified = sessionStorage.getItem("pinVerified") === "true";

  // Only show dashboard if both logged in AND PIN verified
  if (isLoggedIn && pinVerified) {
    showDashboard();
  } else if (isLoggedIn && !pinVerified) {
    showForm("pin-verify");
  }

  // Bind pin input fields
  bindPinInputs();

  // Show password length on signup
  const passwordInput = document.getElementById("signup-password");
  const passwordCount = document.getElementById("password-count");
  if (passwordInput && passwordCount) {
    passwordInput.addEventListener("input", function () {
      const len = this.value.length;
      passwordCount.innerText = `${len}/12 characters`;
    });
  }

  // Bind all logout buttons with class
  const logoutButtons = document.querySelectorAll(".logout-btn");
  logoutButtons.forEach(button => button.addEventListener("click", logout));

  // Start inactivity timer
  resetInactivityTimer();
});
