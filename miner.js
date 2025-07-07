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

  // ✅ Re-bind pin inputs after showing new form
  bindPinInputs();
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
        sessionStorage.setItem("name", fullName);
        sessionStorage.setItem("country", country);
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("password", password);
        otpMsg.style.color = "green";
        otpMsg.innerText = "✅ OTP sent to your email.";
        document.getElementById("otp-email").value = email;
        showForm("otp-form");
        otpMsg.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        otpMsg.style.color = "red";
        otpMsg.innerText = "❌ Something went wrong during signup. Please try again.";
        otpMsg.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setTimeout(() => { otpMsg.innerText = ""; }, 5000);
    })
    .catch(err => {
      otpMsg.style.color = "orange";
      otpMsg.innerText = "⚠️ Failed to connect to server. Please check your network.";
      otpMsg.scrollIntoView({ behavior: "smooth", block: "center" });
      console.error(err);
    });
}

function verifyOtp() {
  const email = document.getElementById("otp-email").value.trim();
  const otp = document.getElementById("otp-code").value.trim();

  if (!email || !otp) {
    alert("⚠️ Please enter both email and OTP.");
    return;
  }

  fetch("https://danoski-backend.onrender.com/user/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  })
    .then(async res => {
      let data;
      try {
        data = await res.json();
      } catch (err) {
        console.error("Invalid JSON response:", err);
        alert("⚠️ Unexpected server response.");
        return;
      }

      if (res.ok) {
        alert("✅ OTP verified successfully. Please proceed to create your PIN.");
        localStorage.setItem("email", email);
        showForm("pin-form");
      } else {
        alert("❌ " + (data.error || "Invalid OTP. Please try again."));
      }
    })
    .catch(err => {
      console.error("OTP verification error:", err);
      alert("⚠️ Could not connect to the server. Please check your internet and try again.");
    });
}

function loginUser() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    alert("⚠️ Please fill in all login fields.");
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
        alert("⚠️ Unexpected server response. Please try again.");
        return;
      }

      if (res.ok) {
        sessionStorage.setItem("loginEmail", email);
        alert("✅ Login successful! Please enter your PIN to continue.");
        showForm("pin-verify");
        document.getElementById("pin-message").innerText = "Please enter your 4-digit PIN to continue.";
        focusFirstPinVerifyInpufunction signupUser() {
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

  if (!email || !otp) {
    alert("⚠️ Please enter both email and OTP.");
    return;
  }

  fetch("https://danoski-backend.onrender.com/user/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  })
    .then(async res => {
      let data;
      try {
        data = await res.json();
      } catch (err) {
        console.error("Invalid JSON response:", err);
        alert("⚠️ Unexpected server response.");
        return;
      }

      if (res.ok) {
        alert("✅ OTP verified successfully. Please proceed to create your PIN.");
        localStorage.setItem("email", email);
        showForm("pin-form");
      } else {
        alert("❌ " + (data.error || "Invalid OTP. Please try again."));
      }
    })
    .catch(err => {
      console.error("OTP verification error:", err);
      alert("⚠️ Could not connect to the server. Please check your internet and try again.");
    });
}

function loginUser() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    alert("⚠️ Please fill in all login fields.");
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
        alert("⚠️ Unexpected server response. Please try again.");
        return;
      }

      if (res.ok) {
        sessionStorage.setItem("loginEmail", email);
        alert("✅ Login successful! Please enter your PIN to continue.");
        showForm("pin-verify");
        document.getElementById("pin-message").innerText = "Please enter your 4-digit PIN to continue.";
        focusFirstPinVerifyInput();
      } else {
t();
      } else {
        // Don't show backend message — show a generic frontend message
        alert("❌ Invalid email or password.");
      }
    })
    .catch(err => {
      console.error("Login error:", err);
      alert("⚠️ Network error. Please check your connection and try again.");
    });
}

function verifyLoginPin() {
  const pin = ["pinverify1","pinverify2","pinverify3","pinverify4"]
    .map(id => document.getElementById(id).value)
    .join("");

  if (pin.length !== 4) {
    alert("⚠️ Please enter a valid 4-digit PIN.");
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
        alert("⚠️ Unexpected server response.");
        return;
      }

      if (res.ok) {
        alert("✅ PIN verified. Welcome back!");
        sessionStorage.setItem("isLoggedIn", "true");
        showDashboard();
      } else {
        alert("❌ Incorrect PIN. Please try again.");
      }
    })
    .catch(err => {
      console.error("PIN verification error:", err);
      alert("⚠️ Network/server issue during PIN verification.");
    });
}

function setUserPin() {
  const pin = ["pin1", "pin2", "pin3", "pin4"]
    .map(id => document.getElementById(id).value.trim())
    .join("");

  if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    alert("⚠️ Please enter a valid 4-digit PIN.");
    return;
  }

  const full_name = localStorage.getItem("name");
  const country = localStorage.getItem("country");
  const email = localStorage.getItem("email");
  const password = localStorage.getItem("password");

  if (!full_name || !country || !email || !password) {
    alert("⚠️ Missing user details. Please start the registration again.");
    return;
  }

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
        alert("⚠️ Unexpected server response.");
        return;
      }

      if (res.ok) {
        alert("✅ Account created successfully!");
        sessionStorage.setItem("isLoggedIn", "true");
        showDashboard();
      } else {
        alert("❌ Account creation failed. Please try again.");
      }
    })
    .catch(err => {
      console.error("Account creation error:", err);
      alert("⚠️ Unable to connect to server.");
    });
}

// Step 1: Send OTP
function sendForgotOtp() {
  const email = document.getElementById("forgot-pass-email").value.trim();

  if (!email) {
    alert("⚠️ Please enter your email address.");
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
        alert("⚠️ Unexpected server response.");
        return;
      }

      if (res.ok) {
        sessionStorage.setItem("resetEmail", email);
        alert("✅ OTP has been sent to your email.");
        showForm("verify-forgot-otp");
      } else {
        alert("❌ Unable to send OTP. Please check your email and try again.");
      }
    })
    .catch(err => {
      console.error("Error sending OTP:", err);
      alert("⚠️ Network error. Please try again later.");
    });
}
// Step 2: Verify OTP
function verifyForgotOtp() {
  const otp = document.getElementById("forgot-pass-otp").value.trim();
  const email = sessionStorage.getItem("resetEmail");

  if (!otp) {
    alert("⚠️ Please enter the OTP sent to your email.");
    return;
  }

  if (!email) {
    alert("⚠️ Session expired. Please request a new OTP.");
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
        alert("⚠️ Unexpected response from server.");
        return;
      }

      if (res.ok) {
        alert("✅ OTP verified. You can now set your new password.");
        showForm("reset-password");
      } else {
        alert("❌ Incorrect OTP. Please try again.");
      }
    })
    .catch(err => {
      console.error("OTP verification error:", err);
      alert("⚠️ Could not connect to server. Try again later.");
    });
}

// Step 3: Submit new password
function submitNewPassword() {
  const newPassword = document.getElementById("new-password").value.trim();
  const confirmPassword = document.getElementById("confirm-password").value.trim();
  const email = sessionStorage.getItem("resetEmail");

  if (!newPassword || !confirmPassword) {
    alert("⚠️ Please fill in both password fields.");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("❌ Passwords do not match.");
    return;
  }

  if (newPassword.length < 6) {
    alert("⚠️ Password must be at least 6 characters long.");
    return;
  }

  if (!email) {
    alert("⚠️ Session expired. Please request a new OTP.");
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
        alert("⚠️ Unexpected response. Try again later.");
        return;
      }

      if (res.ok) {
        alert("✅ Password reset successful. You can now log in.");
        sessionStorage.removeItem("resetEmail");
        showForm("login");
      } else {
        alert("❌ " + (data.error || "Failed to reset password. Try again."));
      }
    })
    .catch(err => {
      console.error("Password reset error:", err);
      alert("⚠️ Could not connect to server. Please check your internet connection.");
    });
}

function sendResetPin() {
  const email = sessionStorage.getItem("loginEmail");

  if (!email) {
    alert("⚠️ No email found in session. Please log in again.");
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
// ✅ 1. SIGNUP USER
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
    .then(({ ok }) => {
      if (ok) {
        localStorage.setItem("name", fullName);
        localStorage.setItem("country", country);
        localStorage.setItem("email", email);
        localStorage.setItem("password", password);
        otpMsg.style.color = "green";
        otpMsg.innerText = "✅ A verification code has been sent to your email.";
        document.getElementById("otp-email").value = email;
        showForm("otp-form");
        otpMsg.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        otpMsg.style.color = "red";
        otpMsg.innerText = "❌ Unable to sign up. Please try again.";
        otpMsg.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setTimeout(() => { otpMsg.innerText = ""; }, 5000);
    })
    .catch(() => {
      otpMsg.style.color = "orange";
      otpMsg.innerText = "⚠️ Could not reach the server. Please try later.";
      otpMsg.scrollIntoView({ behavior: "smooth", block: "center" });
    });
}

// ✅ 2. VERIFY OTP
function verifyOtp() {
  const email = document.getElementById("otp-email").value.trim();
  const otp = document.getElementById("otp-code").value.trim();

  if (!email || !otp) {
    alert("⚠️ Please enter both your email and OTP.");
    return;
  }

  fetch("https://danoski-backend.onrender.com/user/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp })
  })
    .then(res => res.ok)
    .then(success => {
      if (success) {
        alert("✅ Email verified successfully! Please create your PIN.");
        localStorage.setItem("email", email);
        showForm("pin-form");
      } else {
        alert("❌ Invalid or expired OTP. Please check and try again.");
      }
    })
    .catch(() => {
      alert("⚠️ Unable to reach the server. Please try again.");
    });
}

// ✅ 3. LOGIN
function loginUser() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    alert("⚠️ Please complete all login fields.");
    return;
  }

  fetch("https://danoski-backend.onrender.com/user/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.ok)
    .then(success => {
      if (success) {
        sessionStorage.setItem("loginEmail", email);
        alert("✅ Login successful! Enter your PIN to continue.");
        showForm("pin-verify");
        document.getElementById("pin-message").innerText = "Please enter your 4-digit PIN.";
        focusFirstPinVerifyInput();
      } else {
        alert("❌ Incorrect email or password.");
      }
    })
    .catch(() => {
      alert("⚠️ Unable to connect. Check your internet and try again.");
    });
}

// ✅ 4. VERIFY LOGIN PIN
function verifyLoginPin() {
  const pin = ["pinverify1","pinverify2","pinverify3","pinverify4"]
    .map(id => document.getElementById(id).value)
    .join("");

  if (pin.length !== 4) {
    alert("⚠️ Please enter a valid 4-digit PIN.");
    return;
  }

  const email = sessionStorage.getItem("loginEmail");

  fetch("https://danoski-backend.onrender.com/user/verify-login-pin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, pin })
  })
    .then(res => res.ok)
    .then(success => {
      if (success) {
        alert("✅ Access granted! Welcome.");
        sessionStorage.setItem("isLoggedIn", "true");
        showDashboard();
      } else {
        alert("❌ PIN incorrect. Please try again.");
      }
    })
    .catch(() => {
      alert("⚠️ Server error while verifying PIN. Try again later.");
    });
}

// ✅ 5. SET USER PIN
function setUserPin() {
  const pin = ["pin1", "pin2", "pin3", "pin4"].map(id => document.getElementById(id).value.trim()).join("");

  if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    alert("⚠️ Please enter a valid 4-digit PIN.");
    return;
  }

  const full_name = localStorage.getItem("name");
  const country = localStorage.getItem("country");
  const email = localStorage.getItem("email");
  const password = localStorage.getItem("password");

  if (!full_name || !country || !email || !password) {
    alert("⚠️ Incomplete signup information. Please register again.");
    return;
  }

  fetch("https://danoski-backend.onrender.com/user/create-account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name, country, email, password, pin })
  })
    .then(res => res.ok)
    .then(success => {
      if (success) {
        alert("✅ Your account has been created!");
        sessionStorage.setItem("isLoggedIn", "true");
        showDashboard();
      } else {
        alert("❌ Unable to create account. Please try again later.");
      }
    })
    .catch(() => {
      alert("⚠️ Connection issue. Please try again.");
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

  // ✅ Show password length while typing
  const passwordInput = document.getElementById("signup-password");
  const passwordCount = document.getElementById("password-count");

  if (passwordInput && passwordCount) {
    passwordInput.addEventListener("input", function () {
      const len = this.value.length;
      passwordCount.innerText = `${len}/12 characters`;
    });
  }
});
