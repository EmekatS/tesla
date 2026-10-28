'use strict';

let currentCurrency = 'USD';

function initDeposit() {
  const form = document.getElementById('deposit-form');
  const amountInput = document.getElementById('deposit-amount');
  const submitBtn = document.getElementById('deposit-submit-btn');
  const errorEl = document.getElementById('deposit-error');
  const currencyLabel = document.getElementById('deposit-currency-label');

  const resultContainer = document.getElementById('deposit-result');
  const statusEl = document.getElementById('deposit-result-status');
  const messageWrap = document.getElementById('deposit-result-message-wrap');
  const messageEl = document.getElementById('deposit-result-message');
  const instructionsWrap = document.getElementById('deposit-result-instructions-wrap');
  const instructionsEl = document.getElementById('deposit-result-instructions');
  const anotherBtn = document.getElementById('deposit-another-btn');

  DataLayer.getMeta()
    .then((meta) => {
      if (meta && meta.currency) {
        currentCurrency = meta.currency;
        if (currencyLabel) {
          currencyLabel.textContent = currentCurrency;
        }
      }
    })
    .catch(() => {
      // Fallback to default USD
    });

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
  }

  function hideError() {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    hideError();

    const rawValue = amountInput.value;
    const amountCents = toCents(rawValue);

    if (amountCents === null || amountCents <= 0) {
      showError('Please enter a valid deposit amount greater than zero.');
      amountInput.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    DataLayer.createDeposit({ amountCents })
      .then((res) => {
        form.classList.add('hidden');
        resultContainer.classList.remove('hidden');

        statusEl.textContent = res.status;

        if (res.message) {
          messageEl.textContent = res.message;
          messageWrap.classList.remove('hidden');
        } else {
          messageWrap.classList.add('hidden');
        }

        if (res.instructions) {
          instructionsEl.textContent = res.instructions;
          instructionsWrap.classList.remove('hidden');
        } else {
          instructionsWrap.classList.add('hidden');
        }
      })
      .catch((err) => {
        showError(err.message);
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Make deposit';
      });
  });

  if (anotherBtn) {
    anotherBtn.addEventListener('click', () => {
      resultContainer.classList.add('hidden');
      form.classList.remove('hidden');
      amountInput.value = '';
      hideError();
      amountInput.focus();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDeposit);
} else {
  initDeposit();
}
