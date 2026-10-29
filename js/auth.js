'use strict';

const Auth = (function () {
  const SESSION_KEY = 'tpi.session';
  const CREDENTIALS = {
    name: 'Steve Eagar',
    password: 'steveteslapassword1'
  };

  function isAuthenticated() {
    try {
      return Boolean(sessionStorage.getItem(SESSION_KEY));
    } catch (err) {
      return false;
    }
  }

  function login(name, password) {
    const valid = typeof name === 'string'
      && typeof password === 'string'
      && name.trim() === CREDENTIALS.name
      && password === CREDENTIALS.password;

    if (valid) {
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ name: CREDENTIALS.name }));
      } catch (err) {
        return false;
      }
    }

    return valid;
  }

  function logout() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (err) {
      // Ignore storage errors
    }
  }

  function getUser() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function requireAuth() {
    if (!isAuthenticated()) {
      window.location.replace('login.html');
    }
  }

  return {
    isAuthenticated,
    login,
    logout,
    getUser,
    requireAuth
  };
})();

function initLogoutLinks() {
  document.querySelectorAll('[data-logout]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      Auth.logout();
      window.location.replace('login.html');
    });
  });
}

const isGuardedPage = Boolean(document.currentScript && document.currentScript.hasAttribute('data-auth-guard'));

if (isGuardedPage) {
  Auth.requireAuth();

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      Auth.requireAuth();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLogoutLinks);
} else {
  initLogoutLinks();
}
