'use strict';

// ===== PLACEHOLDER DATA: REPLACE WITH REAL API =====

const PLACEHOLDER_META = {
  isSample: true,
  currency: 'USD',
  clientName: 'Steve Eagar'
};

const PLACEHOLDER_SUMMARY = {
  balanceCents: 2000000,
  investedCents: 1753000,
  checkingCents: 247000,
  availableToWithdrawCents: 247000,
  asOf: '2026-10-28T08:00:00Z'
};

const PLACEHOLDER_HOLDINGS = [
  {
    id: 'hld-1',
    kind: 'Private Equity',
    name: 'SpaceX',
    symbol: 'SPACEX',
    quantity: '120',
    valueCents: 1000000,
    gainCents: 85000
  },
  {
    id: 'hld-2',
    kind: 'Stock',
    name: 'Tesla Energy',
    symbol: 'TSLA',
    quantity: '80',
    valueCents: 753000,
    gainCents: -12000
  }
];

const PLACEHOLDER_TRANSACTIONS = [
  {
    id: 'tx-1',
    type: 'deposit',
    amountCents: 500000,
    status: 'Completed',
    createdAt: '2026-10-15T14:32:00Z'
  },
  {
    id: 'tx-2',
    type: 'withdrawal',
    amountCents: 100000,
    status: 'Completed',
    createdAt: '2026-10-18T09:15:00Z'
  },
  {
    id: 'tx-3',
    type: 'deposit',
    amountCents: 250000,
    status: 'Pending',
    createdAt: '2026-10-27T18:45:00Z'
  }
];

function simulateLatency() {
  return new Promise((resolve) => {
    setTimeout(resolve, 250);
  });
}

const DataLayer = {
  getMeta() {
    return simulateLatency().then(() => {
      return Object.assign({}, PLACEHOLDER_META);
    });
  },

  getAccountSummary() {
    return simulateLatency().then(() => {
      return Object.assign({}, PLACEHOLDER_SUMMARY);
    });
  },

  getHoldings() {
    return simulateLatency().then(() => {
      return PLACEHOLDER_HOLDINGS.map((h) => Object.assign({}, h));
    });
  },

  getTransactions() {
    return simulateLatency().then(() => {
      return PLACEHOLDER_TRANSACTIONS.map((t) => Object.assign({}, t));
    });
  },

  createDeposit({ amountCents }) {
    return simulateLatency().then(() => {
      if (!Number.isInteger(amountCents) || amountCents <= 0) {
        throw new Error('Please enter a valid deposit amount greater than zero.');
      }
      return {
        id: 'dep-1001',
        status: 'Initiated',
        message: 'Deposit request created successfully.',
        instructions: 'Transfer funds using reference DEP-84920 to complete settlement.'
      };
    });
  },

  getWithdrawalQuote({ amountCents }) {
    return simulateLatency().then(() => {
      if (!Number.isInteger(amountCents) || amountCents <= 0) {
        throw new Error('Please enter a valid withdrawal amount greater than zero.');
      }
      if (amountCents > PLACEHOLDER_SUMMARY.availableToWithdrawCents) {
        throw new Error('Requested amount exceeds available balance to withdraw.');
      }
      return {
        amountCents,
        feeCents: 0,
        netCents: amountCents,
        message: null
      };
    });
  },

  requestWithdrawal({ amountCents }) {
    return simulateLatency().then(() => {
      if (!Number.isInteger(amountCents) || amountCents <= 0) {
        throw new Error('Please enter a valid withdrawal amount greater than zero.');
      }
      if (amountCents > PLACEHOLDER_SUMMARY.availableToWithdrawCents) {
        throw new Error('Requested amount exceeds available balance to withdraw.');
      }
      return {
        id: 'wd-1001',
        status: 'Submitted',
        amountCents,
        feeCents: 0,
        netCents: amountCents,
        message: 'Your withdrawal request has been received and is being processed.'
      };
    });
  }
};
