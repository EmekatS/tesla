'use strict';

let dashboardCurrency = 'USD';

function setDashboardText(id, text) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = text;
  }
}

function loadDashboardSummary() {
  const feedback = document.getElementById('dashboard-summary-feedback');

  feedback.classList.add('hidden');
  clearElement(feedback);

  DataLayer.getMeta()
    .then((meta) => {
      if (meta && meta.currency) {
        dashboardCurrency = meta.currency;
      }
      if (meta && meta.clientName) {
        setDashboardText('client-name', meta.clientName);
      }
      return DataLayer.getAccountSummary();
    })
    .then((summary) => {
      const checkingCents = typeof summary.checkingCents === 'number'
        ? summary.checkingCents
        : summary.availableToWithdrawCents;

      setDashboardText('available-balance', formatMoney(summary.balanceCents, dashboardCurrency));
      setDashboardText('checking-balance', formatMoney(checkingCents, dashboardCurrency));
      setDashboardText('withdrawal-balance', formatMoney(summary.availableToWithdrawCents, dashboardCurrency));
      setDashboardText('invested-total', formatMoney(summary.investedCents, dashboardCurrency) + ' invested');
      setDashboardText('dashboard-as-of', 'As of ' + formatDate(summary.asOf));

      feedback.classList.add('hidden');
      clearElement(feedback);
    })
    .catch((err) => {
      setDashboardText('dashboard-as-of', 'Account data unavailable');
      feedback.classList.remove('hidden');
      renderError(feedback, err.message, loadDashboardSummary);
    });
}

function loadDashboardHoldings() {
  const feedback = document.getElementById('dashboard-feedback');
  const container = document.getElementById('dashboard-holdings');
  const template = document.getElementById('dashboard-holding-template');

  container.classList.add('hidden');
  feedback.classList.remove('hidden');
  renderLoading(feedback, 'Loading holdings...');

  DataLayer.getMeta()
    .then((meta) => {
      if (meta && meta.currency) {
        dashboardCurrency = meta.currency;
      }
      return DataLayer.getHoldings();
    })
    .then((holdings) => {
      clearElement(container);

      if (!holdings || holdings.length === 0) {
        container.classList.add('hidden');
        feedback.classList.remove('hidden');
        renderEmpty(feedback, 'No holdings in this account.');
        return;
      }

      feedback.classList.add('hidden');
      clearElement(feedback);
      container.classList.remove('hidden');

      holdings.forEach((holding) => {
        const card = template.content.cloneNode(true);

        const nameEl = card.querySelector('[data-field="name"]');
        const symbolEl = card.querySelector('[data-field="symbol"]');
        const quantityEl = card.querySelector('[data-field="quantity"]');
        const valueEl = card.querySelector('[data-field="value"]');
        const gainEl = card.querySelector('[data-field="gain"]');

        const unitLabel = holding.kind === 'Stock' ? 'shares' : 'units';

        nameEl.textContent = holding.name;
        symbolEl.textContent = holding.symbol;
        quantityEl.textContent = holding.quantity + ' ' + unitLabel + ' · ' + holding.kind;
        valueEl.textContent = formatMoney(holding.valueCents, dashboardCurrency);

        gainEl.textContent = formatMoney(holding.gainCents, dashboardCurrency, { signed: true });
        gainEl.classList.add(holding.gainCents >= 0 ? 'text-gain' : 'text-loss');

        container.appendChild(card);
      });
    })
    .catch((err) => {
      container.classList.add('hidden');
      feedback.classList.remove('hidden');
      renderError(feedback, err.message, loadDashboardHoldings);
    });
}

function initDashboard() {
  loadDashboardSummary();
  loadDashboardHoldings();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}
