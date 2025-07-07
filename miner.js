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
    "pin-verify": "pin-verify-form"
  };

  // Loop and toggle visibility
  for (const key in formMap) {
    const el = document.getElementById(formMap[key]);
    if (el) el.style.display = formType === key ? "block" : "none";
  }

  const dashboard = document.getElementById("dashboard-page");
  const loginPage = document.getElementById("login-page");

  // Toggle between dashboard and login-page view
  if (formType === "dashboard") {
    if (dashboard) dashboard.style.display = "block";
    if (loginPage) loginPage.style.display = "none";
  } else {
    if (dashboard) dashboard.style.display = "none";
    if (loginPage) loginPage.style.display = "block";
  }
}

function signupUser() {
  const fullName = document.getElementById("signup-name").value.trim();
  const country = document.getElementById("signup-country").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const otpMsg = document.getElementById("otp-message");

  const signupData = { full_name: fullName, country, email, password };

  fetch("https://danoski-backend.onrender.com/user/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(signupData)
  })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (ok) {
        localStorage.setItem("name", fullName);
        localStorage.setItem("country", country);
        localStorage.setItem("email", email);
        localStorage.setItem("password", password);
        otpMsg.style.color = "green";
        otpMsg.innerText = "✅ OTP sent to your email.";
        document.getElementById("otp-email").value = email;
        showForm("otp-form");
        otpMsg.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        otpMsg.style.color = "red";
        otpMsg.innerText = "❌ " + (data.error || "Signup failed.");
        otpMsg.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setTimeout(() => { otpMsg.innerText = ""; }, 5000);
    })
    .catch(err => {
      otpMsg.style.color = "orange";
      otpMsg.innerText = "⚠️ Failed to connect to server.";
      otpMsg.scrollIntoView({ behavior: "smooth", block: "center" });
      console.error(err);
    });
}

function verifyOtp() {
  const email = document.getElementById("otp-email").value.trim();
  const otp = document.getElementById("otp-code").value.trim();
  if (!email || !otp) return alert("Please enter both email and OTP.");

  fetch("https://danoski-backend.onrender.com/user/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (ok) {
        alert("✅ OTP verified! Please create your PIN.");
        showForm("pin-form");
        localStorage.setItem("email", email);
      } else {
        alert("❌ " + data.error);
      }
    })
    .catch(err => {
      alert("⚠️ Could not connect to the server.");
      console.error(err);
    });
}

function loginUser() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  if (!email || !password) return alert("Please fill in all login fields.");

  fetch("https://danoski-backend.onrender.com/user/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (ok) {
        sessionStorage.setItem("loginEmail", email);
        showForm("pin-verify");
        document.getElementById("pin-message").innerText = "Please enter your 4-digit PIN to continue.";
        focusFirstPinVerifyInput();
      } else {
        alert("❌ " + data.error);
      }
    })
    .catch(err => {
      alert("⚠️ Server error during login.");
      console.error(err);
    });
}

function verifyLoginPin() {
  const pin = ["pinverify1","pinverify2","pinverify3","pinverify4"].map(id => document.getElementById(id).value).join("");
  if (pin.length !== 4) return alert("Please enter a valid 4-digit PIN.");
  const email = sessionStorage.getItem("loginEmail");

  fetch("https://danoski-backend.onrender.com/user/verify-login-pin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, pin })
  })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (ok) {
        alert("✅ PIN verified. Welcome back!");
        sessionStorage.setItem("isLoggedIn", "true");
        showDashboard();
      } else {
        alert("❌ " + data.error);
      }
    })
    .catch(err => {
      alert("⚠️ Server error during PIN verification.");
      console.error(err);
    });
}

function setUserPin() {
  const pin = ["pin1","pin2","pin3","pin4"].map(id => document.getElementById(id).value.trim()).join("");
  if (pin.length !== 4 || !/^\d{4}$/.test(pin)) return alert("Please enter a valid 4-digit PIN.");
  const full_name = localStorage.getItem("name");
  const country = localStorage.getItem("country");
  const email = localStorage.getItem("email");
  const password = localStorage.getItem("password");
  if (!full_name || !country || !email || !password) return alert("User details missing. Please restart registration.");

  fetch("https://danoski-backend.onrender.com/user/create-account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name, country, email, password, pin })
  })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (ok) {
        alert("✅ Account created successfully!");
        sessionStorage.setItem("isLoggedIn", "true");
        showDashboard();
      } else {
        alert("❌ " + (data.error || "Failed to create account."));
      }
    })
    .catch(err => {
      console.error(err);
      alert("⚠️ Server connection failed.");
    });
}

function bindPinInputs() {
  const inputs = ["pin1","pin2","pin3","pin4"];
  inputs.forEach((id, i) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener("input", () => {
      input.value = input.value.replace(/[^0-9]/g, "");
      if (input.value.length === 1 && i < 3) document.getElementById(inputs[i + 1]).focus();
      checkPinLength();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && i > 0) document.getElementById(inputs[i - 1]).focus();
    });
  });
}

function bindVerifyPinInputs() {
  const inputs = ["pinverify1","pinverify2","pinverify3","pinverify4"];
  inputs.forEach((id, i) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener("input", () => {
      input.value = input.value.replace(/[^0-9]/g, "");
      if (input.value.length === 1 && i < 3) document.getElementById(inputs[i + 1]).focus();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && i > 0) document.getElementById(inputs[i - 1]).focus();
    });
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
  window.location.href = "login.html";
}

function showDashboard() {
  showForm("dashboard");
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

document.addEventListener("DOMContentLoaded", () => {
  if (sessionStorage.getItem("isLoggedIn") === "true") showDashboard();
  bindPinInputs();
  bindVerifyPinInputs();
});

function focusFirstPinVerifyInput() {
  const input = document.getElementById("pinverify1");
  if (input) input.focus();
    }
