'use strict';

let currentCurrency = 'USD';
let pendingAmountCents = null;

function initWithdrawal() {
  const availableEl = document.getElementById('available-amount');
  const availableFeedback = document.getElementById('available-feedback');
  const currencyLabel = document.getElementById('withdrawal-currency-label');

  const form = document.getElementById('withdrawal-form');
  const amountInput = document.getElementById('withdrawal-amount');
  const reviewBtn = document.getElementById('review-btn');
  const withdrawalError = document.getElementById('withdrawal-error');

  const reviewSection = document.getElementById('withdrawal-review');
  const reviewAmount = document.getElementById('review-amount');
  const reviewFee = document.getElementById('review-fee');
  const reviewNet = document.getElementById('review-net');
  const reviewMessageWrap = document.getElementById('review-message-wrap');
  const reviewMessage = document.getElementById('review-message');
  const reviewError = document.getElementById('review-error');
  const confirmBtn = document.getElementById('confirm-btn');
  const changeAmountBtn = document.getElementById('change-amount-btn');

  const resultSection = document.getElementById('withdrawal-result');
  const resultStatus = document.getElementById('result-status');
  const resultMessageWrap = document.getElementById('result-message-wrap');
  const resultMessage = document.getElementById('result-message');

  function showFormError(msg) {
    withdrawalError.textContent = msg;
    withdrawalError.classList.remove('hidden');
  }

  function hideFormError() {
    withdrawalError.textContent = '';
    withdrawalError.classList.add('hidden');
  }

  function showReviewError(msg) {
    reviewError.textContent = msg;
    reviewError.classList.remove('hidden');
  }

  function hideReviewError() {
    reviewError.textContent = '';
    reviewError.classList.add('hidden');
  }

  function loadAvailableBalance() {
    DataLayer.getMeta()
      .then((meta) => {
        if (meta && meta.currency) {
          currentCurrency = meta.currency;
          if (currencyLabel) {
            currencyLabel.textContent = currentCurrency;
          }
        }
        return DataLayer.getAccountSummary();
      })
      .then((summary) => {
        availableFeedback.classList.add('hidden');
        availableEl.textContent = formatMoney(summary.availableToWithdrawCents, currentCurrency);
      })
      .catch((err) => {
        availableFeedback.textContent = err.message;
        availableFeedback.classList.remove('hidden');
      });
  }

  loadAvailableBalance();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    hideFormError();

    const rawValue = amountInput.value;
    const amountCents = toCents(rawValue);

    if (amountCents === null || amountCents <= 0) {
      showFormError('Please enter a valid positive amount.');
      amountInput.focus();
      return;
    }

    reviewBtn.disabled = true;
    reviewBtn.textContent = 'Fetching quote...';

    DataLayer.getWithdrawalQuote({ amountCents })
      .then((quote) => {
        pendingAmountCents = quote.amountCents;

        reviewAmount.textContent = formatMoney(quote.amountCents, currentCurrency);
        reviewFee.textContent = formatMoney(quote.feeCents, currentCurrency);
        reviewNet.textContent = formatMoney(quote.netCents, currentCurrency);

        if (quote.message) {
          reviewMessage.textContent = quote.message;
          reviewMessageWrap.classList.remove('hidden');
        } else {
          reviewMessageWrap.classList.add('hidden');
        }

        hideReviewError();
        form.classList.add('hidden');
        reviewSection.classList.remove('hidden');
      })
      .catch((err) => {
        showFormError(err.message);
      })
      .finally(() => {
        reviewBtn.disabled = false;
        reviewBtn.textContent = 'Review withdrawal';
      });
  });

  changeAmountBtn.addEventListener('click', () => {
    reviewSection.classList.add('hidden');
    form.classList.remove('hidden');
    hideFormError();
    hideReviewError();
    amountInput.focus();
  });

  confirmBtn.addEventListener('click', () => {
    if (pendingAmountCents === null) {
      return;
    }

    confirmBtn.disabled = true;
    changeAmountBtn.disabled = true;
    confirmBtn.textContent = 'Confirming...';
    hideReviewError();

    DataLayer.requestWithdrawal({ amountCents: pendingAmountCents })
      .then((res) => {
        reviewSection.classList.add('hidden');
        resultSection.classList.remove('hidden');

        resultStatus.textContent = res.status;

        if (res.message) {
          resultMessage.textContent = res.message;
          resultMessageWrap.classList.remove('hidden');
        } else {
          resultMessageWrap.classList.add('hidden');
        }
      })
      .catch((err) => {
        showReviewError(err.message);
        confirmBtn.disabled = false;
        changeAmountBtn.disabled = false;
        confirmBtn.textContent = 'Confirm withdrawal';
      });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWithdrawal);
} else {
  initWithdrawal();
}
