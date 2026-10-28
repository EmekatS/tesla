'use strict';

let currentCurrency = 'USD';

function loadSummary() {
  const content = document.getElementById('summary-content');
  const feedback = document.getElementById('summary-feedback');
  const asOfEl = document.getElementById('portfolio-as-of');
  const balanceEl = document.getElementById('portfolio-balance');
  const investedEl = document.getElementById('portfolio-invested');
  const availableEl = document.getElementById('portfolio-available');

  content.classList.add('opacity-50');
  feedback.classList.remove('hidden');
  renderLoading(feedback, 'Loading account summary...');

  DataLayer.getAccountSummary()
    .then((summary) => {
      feedback.classList.add('hidden');
      clearElement(feedback);
      content.classList.remove('opacity-50');

      asOfEl.textContent = 'As of ' + formatDate(summary.asOf);
      balanceEl.textContent = formatMoney(summary.balanceCents, currentCurrency);
      investedEl.textContent = formatMoney(summary.investedCents, currentCurrency);
      availableEl.textContent = formatMoney(summary.availableToWithdrawCents, currentCurrency);
    })
    .catch((err) => {
      content.classList.add('opacity-50');
      feedback.classList.remove('hidden');
      renderError(feedback, err.message, loadSummary);
    });
}

function loadHoldings() {
  const wrapper = document.getElementById('holdings-wrapper');
  const feedback = document.getElementById('holdings-feedback');
  const tbody = document.getElementById('holdings-tbody');
  const template = document.getElementById('holding-row-template');

  wrapper.classList.add('hidden');
  feedback.classList.remove('hidden');
  renderLoading(feedback, 'Loading holdings...');

  DataLayer.getHoldings()
    .then((holdings) => {
      clearElement(tbody);
      if (!holdings || holdings.length === 0) {
        wrapper.classList.add('hidden');
        feedback.classList.remove('hidden');
        renderEmpty(feedback, 'No holdings in this portfolio.');
        return;
      }

      feedback.classList.add('hidden');
      clearElement(feedback);
      wrapper.classList.remove('hidden');

      holdings.forEach((h) => {
        const row = template.content.cloneNode(true);

        const nameEl = row.querySelector('[data-field="name"]');
        const symbolEl = row.querySelector('[data-field="symbol"]');
        const quantityEl = row.querySelector('[data-field="quantity"]');
        const valueEl = row.querySelector('[data-field="value"]');
        const gainEl = row.querySelector('[data-field="gain"]');

        nameEl.textContent = h.name;
        symbolEl.textContent = h.symbol + ' • ' + h.kind;
        quantityEl.textContent = h.quantity;
        valueEl.textContent = formatMoney(h.valueCents, currentCurrency);

        gainEl.textContent = formatMoney(h.gainCents, currentCurrency, { signed: true });
        if (h.gainCents >= 0) {
          gainEl.classList.add('text-gain');
        } else {
          gainEl.classList.add('text-loss');
        }

        tbody.appendChild(row);
      });
    })
    .catch((err) => {
      wrapper.classList.add('hidden');
      feedback.classList.remove('hidden');
      renderError(feedback, err.message, loadHoldings);
    });
}

function loadTransactions() {
  const list = document.getElementById('transactions-list');
  const feedback = document.getElementById('transactions-feedback');
  const template = document.getElementById('transaction-item-template');

  clearElement(list);
  feedback.classList.remove('hidden');
  renderLoading(feedback, 'Loading transactions...');

  DataLayer.getTransactions()
    .then((transactions) => {
      clearElement(list);
      if (!transactions || transactions.length === 0) {
        feedback.classList.remove('hidden');
        renderEmpty(feedback, 'No transactions found.');
        return;
      }

      feedback.classList.add('hidden');
      clearElement(feedback);

      transactions.forEach((tx) => {
        const item = template.content.cloneNode(true);

        const typeEl = item.querySelector('[data-field="type"]');
        const statusEl = item.querySelector('[data-field="status"]');
        const dateEl = item.querySelector('[data-field="date"]');
        const amountEl = item.querySelector('[data-field="amount"]');

        const capitalizedType = tx.type.charAt(0).toUpperCase() + tx.type.slice(1);
        typeEl.textContent = capitalizedType;
        statusEl.textContent = tx.status;
        dateEl.textContent = formatDate(tx.createdAt);
        amountEl.textContent = formatMoney(tx.amountCents, currentCurrency);

        list.appendChild(item);
      });
    })
    .catch((err) => {
      clearElement(list);
      feedback.classList.remove('hidden');
      renderError(feedback, err.message, loadTransactions);
    });
}

function initPortfolio() {
  DataLayer.getMeta()
    .then((meta) => {
      if (meta && meta.currency) {
        currentCurrency = meta.currency;
      }
      loadSummary();
      loadHoldings();
      loadTransactions();
    })
    .catch(() => {
      loadSummary();
      loadHoldings();
      loadTransactions();
    });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}
