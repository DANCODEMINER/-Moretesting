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

let inactivityTimeout;

function resetInactivityTimer() {
  clearTimeout(inactivityTimeout);
  inactivityTimeout = setTimeout(() => {
    // 🔒 What happens when user is inactive for too long
    sessionStorage.clear(); // or remove specific keys
    showToast("⏳ You were logged out due to inactivity.", "#e67e22");
    showForm("login"); // redirect to login
  }, 2 * 60 * 1000); // 2 minutes (adjust as needed)
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
    "reset-pin": "reset-pin-section",
     "dashboard-page",
     "profile-section",
     "change-password",
     "reset-pin-section",
     "withdrawal-history-section",
     "transaction-history",
     "withdraw-form-section"
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

function signupUser() {
  const firstName = document.getElementById("signup-firstname").value.trim();
  const lastName = document.getElementById("signup-lastname").value.trim();
  const country = document.getElementById("signup-country").value;
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();

  if (!firstName || !lastName || !country || !email || !password) {
    showToast("⚠️ Please fill in all fields.", "#e74c3c");
    return;
  }

  const fullName = `${firstName} ${lastName}`;

  // Save signup details temporarily in sessionStorage
  sessionStorage.setItem("name", fullName);
  sessionStorage.setItem("country", country);
  sessionStorage.setItem("email", email);
  sessionStorage.setItem("password", password);

  // Send OTP to email
  fetch("https://danoski-backend.onrender.com/user/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (ok) {
        showToast("✅ OTP sent to your email. Please verify.", "#4caf50");
        document.getElementById("otp-email").value = email;
        showForm("otp-form");
      } else {
        showToast("❌ " + (data.error || "Failed to send OTP."), "#e74c3c");
      }
    })
    .catch(() => {
      showToast("⚠️ Could not connect to server.", "#f39c12");
    });
}

function showToast(message, background = "#4caf50") {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.style.backgroundColor = background;
  toast.style.display = "block";
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    toast.style.display = "none";
  }, 4000);
}

function verifyOtp() {
  const email = document.getElementById("otp-email").value.trim();
  const otp = document.getElementById("otp-code").value.trim();

  if (!email || !otp) {
    showToast("⚠️ Please enter your email and OTP.", "#e74c3c");
    return;
  }

  fetch("https://danoski-backend.onrender.com/user/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp })
  })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (ok) {
        showToast("✅ OTP verified. Please set your 4-digit PIN.", "#4caf50");
        showForm("pin-form");
      } else {
        showToast("❌ " + (data.error || "OTP verification failed."), "#e74c3c");
      }
    })
    .catch(() => {
      showToast("⚠️ Unable to connect to server.", "#f39c12");
    });
}

function loginUser() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    showToast("⚠️ Please fill in all login fields.", "#e74c3c");
    return;
  }

  fetch("https://danoski-backend.onrender.com/user/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
    .then(async res => {
      let data;
      try {
        data = await res.json();
      } catch (err) {
        console.error("❌ Invalid JSON from server.");
        showToast("⚠️ Unexpected server response. Please try again.", "#e67e22");
        return;
      }

      if (res.ok) {
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("loginEmail", email);
        showToast("✅ Login successful! Please enter your PIN to continue.", "#4caf50");
        showForm("pin-verify");
        document.getElementById("pin-message").innerText = "Please enter your 4-digit PIN to continue.";
        focusFirstPinVerifyInput();
      } else {
        showToast("❌ Invalid email or password.", "#e74c3c");
      }
    })
    .catch(err => {
      console.error("Login error:", err);
      showToast("⚠️ Network error. Please check your connection and try again.", "#f39c12");
    });
}

function verifyLoginPin() {
  const pin = ["pinverify1", "pinverify2", "pinverify3", "pinverify4"]
    .map(id => document.getElementById(id).value)
    .join("");

  if (pin.length !== 4) {
    showToast("⚠️ Please enter a valid 4-digit PIN.", "#e74c3c");
    return;
  }

  const email = sessionStorage.getItem("loginEmail");

  fetch("https://danoski-backend.onrender.com/user/verify-login-pin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, pin })
  })
    .then(async res => {
      let data;
      try {
        data = await res.json();
      } catch (err) {
        console.error("❌ Invalid JSON from server.");
        showToast("⚠️ Unexpected server response.", "#e67e22");
        return;
      }

      if (res.ok) {
        showToast("✅ PIN verified. Welcome back!", "#4caf50");
        sessionStorage.setItem("pinVerified", "true");
        showDashboard();
      } else {
        showToast("❌ Incorrect PIN. Please try again.", "#e74c3c");
      }
    })
    .catch(err => {
      console.error("PIN verification error:", err);
      showToast("⚠️ Network/server issue during PIN verification.", "#f39c12");
    });
}

function setUserPin() {
  const pin = ["pin1", "pin2", "pin3", "pin4"]
    .map(id => document.getElementById(id).value.trim())
    .join("");

  if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    showToast("⚠️ Please enter a valid 4-digit PIN.", "#e74c3c");
    return;
  }

  const full_name = sessionStorage.getItem("name");
  const country = sessionStorage.getItem("country");
  const email = sessionStorage.getItem("email");
  const password = sessionStorage.getItem("password");

  if (![full_name, country, email, password].every(v => v && v.trim())) {
    showToast("⚠️ Missing user details. Please start the registration again.", "#e74c3c");
    return;
  }

  // ✅ Console log the data being sent
  console.log("Creating account with:", {
    full_name,
    country,
    email,
    password,
    pin
  });

  fetch("https://danoski-backend.onrender.com/user/create-account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name, country, email, password, pin })
  })
    .then(async res => {
      let data;
      try {
        data = await res.json();
      } catch (err) {
        console.error("Invalid JSON response:", err);
        showToast("⚠️ Unexpected server response.", "#e67e22");
        return;
      }

      if (res.ok) {
        showToast("✅ Account created successfully!", "#4caf50");
        sessionStorage.setItem("isLoggedIn", "true");
        showDashboard();
      } else {
        const errorMessage = data?.error || "❌ Account creation failed.";
        showToast(errorMessage, "#e74c3c");
      }
    })
    .catch(err => {
      console.error("Account creation error:", err);
      showToast("⚠️ Unable to connect to server.", "#f39c12");
    });
}

function sendForgotOtp() {
  const email = document.getElementById("forgot-pass-email").value.trim();

  if (!email) {
    showToast("⚠️ Please enter your email address.", "#e74c3c");
    return;
  }

  fetch("https://danoski-backend.onrender.com/user/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(async res => {
      let data;
      try {
        data = await res.json();
      } catch (err) {
        console.error("Invalid JSON response:", err);
        showToast("⚠️ Unexpected server response.", "#e67e22");
        return;
      }

      if (res.ok) {
        sessionStorage.setItem("resetEmail", email);
        showToast("✅ OTP has been sent to your email.", "#4caf50");
        showForm("verify-forgot-otp");
      } else {
        showToast("❌ Unable to send OTP. Please check your email and try again.", "#e74c3c");
      }
    })
    .catch(err => {
      console.error("Error sending OTP:", err);
      showToast("⚠️ Network error. Please try again later.", "#f39c12");
    });
}

function verifyForgotOtp() {
  const otp = document.getElementById("forgot-pass-otp").value.trim();
  const email = sessionStorage.getItem("resetEmail");

  if (!otp) {
    showToast("⚠️ Please enter the OTP sent to your email.", "#e74c3c");
    return;
  }

  if (!email) {
    showToast("⚠️ Session expired. Please request a new OTP.", "#e74c3c");
    showForm("forgot-password");
    return;
  }

  fetch("https://danoski-backend.onrender.com/user/verify-password-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp })
  })
    .then(async res => {
      let data;
      try {
        data = await res.json();
      } catch (err) {
        console.error("Invalid JSON response:", err);
        showToast("⚠️ Unexpected response from server.", "#e67e22");
        return;
      }

      if (res.ok) {
        showToast("✅ OTP verified. You can now set your new password.", "#4caf50");
        showForm("reset-password");
      } else {
        showToast("❌ Incorrect OTP. Please try again.", "#e74c3c");
      }
    })
    .catch(err => {
      console.error("OTP verification error:", err);
      showToast("⚠️ Could not connect to server. Try again later.", "#f39c12");
    });
}

function submitNewPassword() {
  const newPassword = document.getElementById("new-password").value.trim();
  const confirmPassword = document.getElementById("confirm-password").value.trim();
  const email = sessionStorage.getItem("resetEmail");

  if (!newPassword || !confirmPassword) {
    showToast("⚠️ Please fill in both password fields.", "#e74c3c");
    return;
  }

  if (newPassword !== confirmPassword) {
    showToast("❌ Passwords do not match.", "#e74c3c");
    return;
  }

  if (newPassword.length < 6) {
    showToast("⚠️ Password must be at least 6 characters long.", "#e74c3c");
    return;
  }

  if (!email) {
    showToast("⚠️ Session expired. Please request a new OTP.", "#e74c3c");
    showForm("forgot-password");
    return;
  }

  fetch("https://danoski-backend.onrender.com/user/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: newPassword })
  })
    .then(async res => {
      let data;
      try {
        data = await res.json();
      } catch (err) {
        console.error("Invalid JSON from server:", err);
        showToast("⚠️ Unexpected response. Try again later.", "#e67e22");
        return;
      }

      if (res.ok) {
        showToast("✅ Password reset successful. You can now log in.", "#4caf50");
        sessionStorage.removeItem("resetEmail");
        showForm("login");
      } else {
        showToast("❌ Failed to reset password. Try again.", "#e74c3c");
      }
    })
    .catch(err => {
      console.error("Password reset error:", err);
      showToast("⚠️ Could not connect to server. Please check your internet connection.", "#f39c12");
    });
}

function sendResetPin() {
  const email = sessionStorage.getItem("loginEmail");

  if (!email) {
    showToast("⚠️ No email found in session. Please log in again.", "#e74c3c");
    showForm("login");
    return;
  }

  fetch("https://danoski-backend.onrender.com/user/sendresetpin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(async res => {
      let data;
      try {
        data = await res.json();
      } catch (err) {
        console.error("Invalid JSON from server:", err);
        showToast("⚠️ Unexpected response. Please try again.", "#e67e22");
        return;
      }

      if (res.ok) {
        showToast("✅ An OTP has been sent to your email to reset your PIN.", "#4caf50");
        showForm("verify-pin-otp");
      } else {
        showToast("❌ Failed to send OTP. Please try again.", "#e74c3c");
      }
    })
    .catch(err => {
      console.error("Error sending PIN OTP:", err);
      showToast("⚠️ Could not connect to the server. Please check your connection.", "#f39c12");
    });
}

function verifyPinOtp() {
  const email = sessionStorage.getItem("loginEmail");
  const otp = document.getElementById("pin-otp").value.trim();

  if (!otp) {
    showToast("⚠️ Please enter the OTP sent to your email.", "#e74c3c");
    return;
  }

  fetch("https://danoski-backend.onrender.com/user/verify-pin-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp })
  })
    .then(async res => {
      let data;
      try {
        data = await res.json();
      } catch (err) {
        console.error("Invalid JSON from server:", err);
        showToast("⚠️ Unexpected response from server.", "#e67e22");
        return;
      }

      if (res.ok) {
        showToast("✅ OTP verified successfully. You can now set a new PIN.", "#4caf50");
        showForm("reset-pin");
      } else {
        showToast("❌ The OTP you entered is invalid or expired.", "#e74c3c");
      }
    })
    .catch(err => {
      console.error("Error verifying OTP:", err);
      showToast("⚠️ Could not connect to the server. Please try again.", "#f39c12");
    });
}

function setNewPin() {
  const email = sessionStorage.getItem("email");
  const pin =
    document.getElementById("resetpin1").value +
    document.getElementById("resetpin2").value +
    document.getElementById("resetpin3").value +
    document.getElementById("resetpin4").value;

  if (!/^\d{4}$/.test(pin)) {
    showToast("⚠️ Please enter a valid 4-digit numeric PIN.", "#e74c3c");
    return;
  }

  fetch("https://danoski-backend.onrender.com/user/reset-pin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, pin })
  })
    .then(async res => {
      let data;
      try {
        data = await res.json();
      } catch (err) {
        console.error("Invalid JSON response from server:", err);
        showToast("⚠️ Unexpected response from server.", "#e67e22");
        return;
      }

      if (res.ok) {
        showToast("✅ Your PIN has been reset successfully.", "#4caf50");
        showForm("pin-verify");
      } else {
        showToast("❌ Failed to reset your PIN. Please try again.", "#e74c3c");
      }
    })
    .catch(err => {
      console.error("Error resetting PIN:", err);
      showToast("⚠️ Network/server error. Please try again.", "#f39c12");
    });
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

function fetchBTCCounter() {
  const email = sessionStorage.getItem("email");
  if (!email) return;

  fetch("/user/btc-counter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("btc-counter").innerText = data.counter + " BTC";
    })
    .catch(() => console.error("Failed to fetch BTC counter"));
}

function fetchTotalHashrate() {
  const email = sessionStorage.getItem("email");
  if (!email) return;

  fetch("/user/total-hashrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("total-hashrate").innerText = data.hashrate + " Th/s";
    })
    .catch(() => console.error("Failed to fetch total hashrate"));
}

function fetchTotalMined() {
  const email = sessionStorage.getItem("email");
  if (!email) return;

  fetch("/user/total-mined", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("total-mined").innerText = data.total_mined + " BTC";
    })
    .catch(() => console.error("Failed to fetch total mined"));
}

function fetchTotalWithdrawn() {
  const email = sessionStorage.getItem("email");
  if (!email) return;

  fetch("/user/total-withdrawn", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("total-withdrawn").innerText = data.total_withdrawn + " BTC";
    })
    .catch(() => console.error("Failed to fetch total withdrawn"));
}

function fetchActiveSessions() {
  const email = sessionStorage.getItem("email");
  if (!email) return;

  fetch("/user/active-sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("active-sessions").innerText = data.count;
    })
    .catch(() => console.error("Failed to fetch active sessions"));
}

function fetchNextWithdrawalDate() {
  const email = sessionStorage.getItem("email");
  if (!email) return;

  fetch("/user/next-withdrawal-date", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("next-withdrawal-date").innerText = data.next_date;
    })
    .catch(() => console.error("Failed to fetch next withdrawal date"));
}

function loadDashboardMessages() {
  const email = sessionStorage.getItem("email");
  if (!email) return;

  fetch("/user/dashboard-messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("dashboard-messages");
      container.innerHTML = "";
      data.messages.forEach(msg => {
        container.innerHTML += `<p>${msg}</p>`;
      });
    })
    .catch(() => console.error("Failed to load dashboard messages"));
}

function fetchMyRank() {
  const email = sessionStorage.getItem("email");
  if (!email) return;

  fetch("/user/my-rank", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("my-rank").innerText = data.rank;
    })
    .catch(() => console.error("Failed to fetch my rank"));
}

function fetchMyBTC() {
  const email = sessionStorage.getItem("email");
  if (!email) return;

  fetch("/user/my-btc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("my-btc").innerText = data.btc + " BTC";
    })
    .catch(() => console.error("Failed to fetch my BTC"));
}

function fetchMyHashrate() {
  const email = sessionStorage.getItem("email");
  if (!email) return;

  fetch("/user/my-hashrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("my-hashrate").innerText = data.hashrate;
    })
    .catch(() => console.error("Failed to fetch my hashrate"));
}


  function watchAd() {
  const email = sessionStorage.getItem("email");
  if (!email) return;

  fetch("/user/watch-ad", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast("✅ Mining session started!");
        currentHashrate = data.hashrate; // from server
        btcPerSecond = data.btc_per_sec; // from server
        miningDuration = data.duration; // e.g., 120 sec

        startMiningCounter();
        startMiningSessionCountdown();
        fetchDashboardSummary(); // Refresh UI
      } else {
        showToast("❌ " + data.error);
      }
    })
    .catch(err => {
      console.error("Failed to start mining session", err);
      showToast("❌ Failed to start mining.");
    });
  }

let miningInterval = null;
let miningTimer = null;
let minedBTC = 0;

function startMiningCounter() {
  clearInterval(miningInterval);
  minedBTC = 0;

  miningInterval = setInterval(() => {
    minedBTC += btcPerSecond;
    document.getElementById("btc-counter").innerText = minedBTC.toFixed(8) + " BTC";
    document.getElementById("total-mined").innerText = minedBTC.toFixed(8) + " BTC";
  }, 1000);
}

function startMiningSessionCountdown() {
  clearTimeout(miningTimer);

  miningTimer = setTimeout(() => {
    stopMiningSession();
  }, miningDuration * 1000);
}

function stopMiningSession() {
  clearInterval(miningInterval);

  const email = sessionStorage.getItem("email");
  if (!email || !minedBTC) return;

  // Send mined BTC to backend
  fetch("/user/save-mined-btc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      mined_btc: minedBTC.toFixed(8)
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast("✅ Mined BTC saved to your wallet.");
        fetchDashboardSummary(); // Refresh values
      } else {
        showToast("⚠️ " + data.error);
      }
    })
    .catch(err => {
      console.error("Error saving mined BTC:", err);
      showToast("❌ Failed to save mined BTC.");
    });

  minedBTC = 0;
}

function fetchDashboardSummary() {
  fetchBTCCounter();
  fetchTotalHashrate();
  fetchTotalMined();
  fetchTotalWithdrawn();
  fetchActiveSessions();
  fetchNextWithdrawalDate();
  loadDashboardMessages();
  fetchMyRank();
  fetchMyBTC();
  fetchMyHashrate();
}

function watchAd() {
  const email = sessionStorage.getItem("email");

  if (!email) {
    showToast("❌ Session expired. Please log in.");
    return;
  }

  fetch("/user/watch-ad", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.message) {
        showToast("✅ " + data.message);
        fetchMiningSettingsAndStartCounter(); // triggers mining
        loadRecentHashSessions(); // updates session list
        saveDashboardStateToBackend(); // save BTC/hashrate/etc
        refreshDashboardView(); // show updates
      } else if (data.error) {
        showToast("❌ " + data.error);
      }
    })
    .catch(err => {
      console.error(err);
      showToast("❌ Failed to log ad watch.");
    });
}

function submitWithdrawal() {
  const email = sessionStorage.getItem("email");
  const btc = parseFloat(document.getElementById("withdraw-btc").value);
  const wallet = document.getElementById("withdraw-wallet").value.trim();

  if (!email || isNaN(btc) || !wallet) {
    showToast("❌ Please fill in all fields correctly.");
    return;
  }

  // First, fetch the actual mined BTC from the database
  fetch("/user/get-total-mined", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(res => res.json())
    .then(data => {
      const totalMined = parseFloat(data.total_mined || 0);

      if (btc > totalMined) {
        showToast("⚠️ Insufficient BTC balance.");
        return;
      }

      // Proceed to submit withdrawal request
      fetch("/user/withdraw-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, btc, wallet })
      })
        .then(res => res.json())
        .then(result => {
          if (result.error) {
            showToast("❌ " + result.error);
          } else {
            showToast("✅ Withdrawal request submitted. Awaiting admin approval.");
            document.getElementById("withdraw-btc").value = "";
            document.getElementById("withdraw-wallet").value = "";
            closeWithdrawForm();
          }
        })
        .catch(() => {
          showToast("❌ Server error during withdrawal.");
        });

    })
    .catch(() => {
      showToast("❌ Could not verify BTC balance.");
    });
}

function initDashboard() {
  // Personalized Welcome
  const name = sessionStorage.getItem("name");
  const countryCode = sessionStorage.getItem("country");
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

  // Core Dashboard Data
  fetchBTCCounter();                  // 1
  fetchTotalHashrate();              // 2
  fetchTotalMined();                 // 3
  fetchTotalWithdrawn();            // 4
  fetchActiveSessions();            // 5
  fetchNextWithdrawalDate();        // 6
  loadDashboardMessages();          // 7
  fetchMyRank();                    // 8
  fetchMyBTC();                     // 9
  fetchMyHashrate();               // 10

  // Additional Features
  loadRecentHashSessions();         // Optional extra
  loadWithdrawalHistory();          // Optional extra
  fetchTopMiners();                 // Optional extra
}

function loadWithdrawalHistory() {
  const email = sessionStorage.getItem("email");
  if (!email) return;

  fetch("/user/get-withdrawal-history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById("withdrawal-history-body");
      tbody.innerHTML = "";

      if (!data.history || data.history.length === 0) {
        tbody.innerHTML = "<tr><td colspan='4'>No withdrawal history found.</td></tr>";
        return;
      }

      data.history.forEach(entry => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${entry.amount}</td>
          <td>${entry.wallet}</td>
          <td>${entry.status}</td>
          <td>${new Date(entry.date).toLocaleString()}</td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch((err) => {
      console.error("❌ Failed to load withdrawal history:", err);
    });
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
// ✅ End of DOMContentLoaded and full script
document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
  const pinVerified = sessionStorage.getItem("pinVerified") === "true";

  if (isLoggedIn && pinVerified) {
    showDashboard();
    initDashboard();
  } else if (isLoggedIn && !pinVerified) {
    showForm("pin-verify");
  }

  bindPinInputs();

  const passwordInput = document.getElementById("signup-password");
  const passwordCount = document.getElementById("password-count");

  if (passwordInput && passwordCount) {
    passwordInput.addEventListener("input", function () {
      const len = this.value.length;
      passwordCount.innerText = `${len}/12 characters`;
    });
  }

  const logoutButtons = document.querySelectorAll(".logout-btn");
  logoutButtons.forEach(button => button.addEventListener("click", logout));

  // ✅ Inactivity timer setup
  resetInactivityTimer();
  document.addEventListener("mousemove", resetInactivityTimer);
  document.addEventListener("keydown", resetInactivityTimer);
  document.addEventListener("click", resetInactivityTimer);
}); // ✅ DON'T MISS THIS!
