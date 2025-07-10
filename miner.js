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

function fetchDashboardStats() {
  const email = sessionStorage.getItem("email");
  if (!email) return;

  fetch("/dashboard-stats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        showToast("⚠️ " + data.error);
        return;
      }

      document.getElementById("btc-counter").innerText = data.total_mined.toFixed(8) + " BTC";
      document.getElementById("total-mined").innerText = data.total_mined.toFixed(4) + " BTC";
      document.getElementById("total-hashrate").innerText = data.total_hashrate.toFixed(2) + " Th/s";
      document.getElementById("active-sessions").innerText = data.active_sessions;
    });
}

window.fetchDashboardStats = fetchDashboardStats;

function fetchHashSessions() {
  const email = sessionStorage.getItem("email");
  if (!email) return;

  fetch("/hash-sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(res => res.json())
    .then(sessions => {
      const tableBody = document.querySelector("#hash-sessions-table tbody");
      tableBody.innerHTML = "";

      if (!Array.isArray(sessions) || sessions.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='4'>No sessions found.</td></tr>";
        return;
      }

      sessions.forEach(s => {
        const row = `
          <tr>
            <td>${s.id}</td>
            <td>${s.date}</td>
            <td>${s.power}</td>
            <td>${s.duration}</td>
          </tr>
        `;
        tableBody.innerHTML += row;
      });
    });
}

window.fetchHashSessions = fetchHashSessions;

function fetchLeaderboard() {
  const email = sessionStorage.getItem("email");
  if (!email) return;

  fetch("/leaderboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(res => res.json())
    .then(data => {
      // Top Miners Table
      const minersBody = document.querySelector("#top-miners-table tbody");
      minersBody.innerHTML = "";
      if (data.top_miners.length === 0) {
        minersBody.innerHTML = "<tr><td colspan='4'>No miners found.</td></tr>";
      } else {
        data.top_miners.forEach(miner => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${miner.rank}</td>
            <td>${miner.email}</td>
            <td>${miner.btc.toFixed(4)} BTC</td>
            <td>${miner.hashrate.toFixed(2)} Th/s</td>
          `;
          minersBody.appendChild(row);
        });
      }

      // My Rank Table
      document.getElementById("my-rank").innerText = data.my_rank;
      document.getElementById("my-btc").innerText = data.my_btc.toFixed(4);
      document.getElementById("my-hashrate").innerText = data.my_hashrate.toFixed(2) + " Th/s";
    });
}

function loadWelcomeInfo() {
  const email = sessionStorage.getItem("email");
  if (!email) return;

  fetch("/user-info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) return;

      // Show name and flag
      document.getElementById("welcome-name").innerText = "Welcome, " + data.first_name + "!";
      const flagImg = document.getElementById("country-flag");
      flagImg.src = data.flag_url;
      flagImg.style.display = "inline-block";
    });
}

window.loadWelcomeInfo = loadWelcomeInfo;

function fetchHashSessions() {
  const email = sessionStorage.getItem("email");
  if (!email) return;

  fetch("/hash-sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector("#hash-sessions-table tbody");
      tbody.innerHTML = ""; // clear previous entries

      if (!data.length) {
        tbody.innerHTML = "<tr><td colspan='4'>No sessions found.</td></tr>";
        return;
      }

      data.forEach(session => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${session.id}</td>
          <td>${session.date}</td>
          <td>${session.hashrate} Th/s</td>
          <td>${session.duration}</td>
        `;
        tbody.appendChild(row);
      });
    });
}

window.fetchHashSessions = fetchHashSessions;

function viewUserProfile() {
  const email = sessionStorage.getItem("email");
  if (!email) return showToast("Session expired.");

  showDashboardForm("profile-section");

  fetch("/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) return showToast("❌ " + data.error);

      document.getElementById("profile-name").innerText = data.name;
      document.getElementById("profile-email").innerText = data.email;
      document.getElementById("profile-country").innerText = data.country;
      document.getElementById("profile-join-date").innerText = data.join_date;
    });
}

function showForm(sectionId) {
  // Hide dashboard and sidebar
  document.getElementById('dashboard-content').style.display = 'none';
  document.getElementById('sidebar').style.display = 'none';
  document.getElementById('dashboard-header').style.display = 'none';

  // Hide all forms first
  const forms = document.querySelectorAll('.form-section');
  forms.forEach(f => f.style.display = 'none');

  // Show selected form
  document.getElementById(sectionId).style.display = 'block';
}

function closeForm() {
  // Hide all forms
  document.querySelectorAll('.form-section').forEach(f => f.style.display = 'none');

  // Show dashboard again
  document.getElementById('dashboard-content').style.display = 'block';
  document.getElementById('sidebar').style.display = 'block';
  document.getElementById('dashboard-header').style.display = 'flex';
}

// Hook your sidebar items:
function viewUserProfile() {
  showForm("profile-section");
}
function showChangePasswordForm() {
  showForm("change-password-section");
}
function showResetPinForm() {
  showForm("reset-pin-section");
}
function showWithdrawalHistory() {
  showForm("withdrawal-history-dashboard");
  if (typeof loadWithdrawalHistory === 'function') {
    loadWithdrawalHistory();
  }
}
function showTransactionHistory() {
  showForm("transaction-history-section");
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

function initDashboard() {
  fetchBTCCounter();
  fetchTotalHashrate();
  fetchTotalMined();
  fetchTotalWithdrawn();
  fetchActiveSessions();
  fetchNextWithdrawalDate();
  loadDashboardMessages();
  fetchTopMiners();
  fetchMyRank();
}

// ========== DOMContentLoaded Setup ==========
document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
  const pinVerified = sessionStorage.getItem("pinVerified") === "true";

  if (isLoggedIn && pinVerified) {
    showDashboard();
    initDashboard():
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

  // ✅ Inactivity timer logic here
  resetInactivityTimer();
  document.addEventListener("mousemove", resetInactivityTimer);
  document.addEventListener("keydown", resetInactivityTimer);
  document.addEventListener("click", resetInactivityTimer);
});
