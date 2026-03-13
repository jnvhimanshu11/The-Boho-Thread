// Customer Login/Register - LocalStorage Demo Auth
// Demo credentials: test@test.com / password123

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginContainer = document.querySelector('.login-container');
  const registerContainer = document.querySelector('.register-container');
  const showRegister = document.getElementById('showRegister');
  const showLogin = document.getElementById('showLogin');

  // Toggle forms
  if (showRegister) showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginContainer.style.display = 'none';
    registerContainer.style.display = 'block';
  });

  if (showLogin) showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerContainer.style.display = 'none';
    loginContainer.style.display = 'block';
  });

  // Check if already logged in
  if (isLoggedIn()) {
    window.location.href = 'index.html';
    return;
  }

  // Login handler
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      const remember = document.getElementById('rememberMe').checked;

      if (validateLogin(email, password)) {
        loginUser({ email, password, remember });
        alert('✅ Login successful! Redirecting to store...');
        setTimeout(() => window.location.href = 'index.html', 1000);
      } else {
        showError('Invalid email or password. Demo: test@test.com / password123');
      }
    });
  }

  // Register handler
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = {
        firstName: document.getElementById('regFirstName').value,
        lastName: document.getElementById('regLastName').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value
      };

      if (validateRegister(user)) {
        registerUser(user);
        alert('✅ Account created! Please login.');
        showLogin.click(); // Switch to login
      }
    });
  }
});

// Auth functions
function validateLogin(email, password) {
  // Demo validation
  return email === 'test@test.com' && password === 'password123';
}

function validateRegister(user) {
  return user.email && user.password.length >= 6 && user.firstName && user.lastName;
}

function loginUser({ email, password, remember }) {
  localStorage.setItem('customerToken', btoa(email + ':' + password)); // Simple token
  localStorage.setItem('customerEmail', email);
  if (remember) localStorage.setItem('rememberMe', 'true');
}

function registerUser(user) {
  // Store users (demo - in real app, send to server)
  const users = JSON.parse(localStorage.getItem('demoUsers') || '[]');
  if (!users.find(u => u.email === user.email)) {
    users.push(user);
    localStorage.setItem('demoUsers', JSON.stringify(users));
  }
}

function isLoggedIn() {
  return localStorage.getItem('customerToken');
}

function logoutUser() {
  localStorage.removeItem('customerToken');
  localStorage.removeItem('customerEmail');
}

function showError(msg) {
  // Simple alert for demo
  alert(msg);
}

// Global helpers for index.html
window.isCustomerLoggedIn = isLoggedIn;
window.logoutCustomer = logoutUser;
window.getCustomerEmail = () => localStorage.getItem('customerEmail');
