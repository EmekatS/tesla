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

function initSampleBanner() {
  if (typeof DataLayer !== 'undefined' && typeof DataLayer.getMeta === 'function') {
    DataLayer.getMeta().then((meta) => {
      if (meta && meta.isSample === false) {
        const banner = document.getElementById('sample-banner');
        if (banner) {
          banner.remove();
        }
      }
    }).catch(() => {
      // Leave banner visible on error
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSampleBanner);
} else {
  initSampleBanner();
}
