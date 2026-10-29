'use strict';

function formatMoney(cents, currency, options) {
  const curr = currency || 'USD';
  const isSigned = Boolean(options && options.signed);
  const dollars = cents / 100;
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: curr,
    signDisplay: isSigned ? 'always' : 'auto'
  });
  return formatter.format(dollars);
}

function toCents(text) {
  if (typeof text !== 'string') {
    return null;
  }
  const trimmed = text.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return null;
  }
  const parts = trimmed.split('.');
  const dollars = parts[0];
  const cents = (parts[1] || '').padEnd(2, '0');
  const total = parseInt(dollars + cents, 10);
  return Number.isNaN(total) ? null : total;
}

function formatDate(isoString) {
  if (!isoString) {
    return '';
  }
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) {
    return isoString;
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(d);
}

function clearElement(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

function renderLoading(container, message) {
  clearElement(container);
  const wrap = document.createElement('div');
  wrap.className = 'py-8 text-center text-sm text-muted';
  wrap.setAttribute('aria-live', 'polite');
  wrap.textContent = message || 'Loading...';
  container.appendChild(wrap);
}

function renderError(container, message, onRetry) {
  clearElement(container);
  const wrap = document.createElement('div');
  wrap.className = 'py-6 px-4 rounded border border-line bg-surface text-center space-y-4';
  wrap.setAttribute('aria-live', 'polite');

  const msg = document.createElement('p');
  msg.className = 'text-sm text-loss';
  msg.textContent = message || 'An error occurred.';
  wrap.appendChild(msg);

  if (typeof onRetry === 'function') {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'inline-flex items-center justify-center h-10 px-5 text-sm font-medium rounded border border-line text-ink hover:bg-canvas focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent transition-colors duration-200';
    btn.textContent = 'Try again';
    btn.addEventListener('click', onRetry);
    wrap.appendChild(btn);
  }

  container.appendChild(wrap);
}

function renderEmpty(container, message) {
  clearElement(container);
  const wrap = document.createElement('div');
  wrap.className = 'py-8 text-center text-sm text-muted';
  wrap.setAttribute('aria-live', 'polite');
  wrap.textContent = message || 'No items to display.';
  container.appendChild(wrap);
}

function initNav() {
  const toggle = document.getElementById('nav-toggle');
  const overlay = document.getElementById('mobile-nav-overlay');
  const drawer = document.getElementById('mobile-nav');
  if (!toggle || !overlay || !drawer) {
    return;
  }

  const closeBtn = document.getElementById('nav-close');
  let isOpen = false;

  function setOpen(nextOpen, restoreFocus) {
    isOpen = nextOpen;

    toggle.setAttribute('aria-expanded', String(isOpen));
    drawer.setAttribute('aria-hidden', String(!isOpen));
    drawer.inert = !isOpen;
    document.body.classList.toggle('overflow-hidden', isOpen);

    overlay.classList.toggle('opacity-0', !isOpen);
    overlay.classList.toggle('pointer-events-none', !isOpen);
    drawer.classList.toggle('translate-x-full', !isOpen);

    if (isOpen) {
      if (closeBtn) {
        closeBtn.focus({ preventScroll: true });
      }
    } else if (restoreFocus !== false) {
      toggle.focus({ preventScroll: true });
    }
  }

  toggle.addEventListener('click', () => {
    setOpen(true);
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      setOpen(false);
    });
  }

  overlay.addEventListener('click', () => {
    setOpen(false);
  });

  drawer.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      setOpen(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen) {
      setOpen(false);
    }
  });

  window.matchMedia('(min-width: 640px)').addEventListener('change', (event) => {
    if (event.matches && isOpen) {
      setOpen(false, false);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNav);
} else {
  initNav();
}

