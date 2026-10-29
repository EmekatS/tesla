'use strict';

function initLogin() {
  if (Auth.isAuthenticated()) {
    window.location.replace('index.html');
    return;
  }

  const form = document.getElementById('login-form');
  const nameInput = document.getElementById('login-name');
  const passwordInput = document.getElementById('login-password');
  const errorEl = document.getElementById('login-error');
  const submitBtn = document.getElementById('login-submit');

  function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }

  function hideError() {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }

  [nameInput, passwordInput].forEach((input) => {
    input.addEventListener('input', hideError);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    hideError();

    const name = nameInput.value.trim();
    const password = passwordInput.value;

    if (!name || !password) {
      showError('Enter your name and password.');
      (name ? passwordInput : nameInput).focus();
      return;
    }

    if (!Auth.login(name, password)) {
      passwordInput.value = '';
      showError('Invalid name or password.');
      passwordInput.focus();
      return;
    }

    submitBtn.disabled = true;
    window.location.replace('index.html');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLogin);
} else {
  initLogin();
}
