export const APP_CONFIG = {
  APP_NAME: 'CampusLedger',
  APP_VERSION: '1.0.0',
  CURRENCY: {
    CODE: 'INR',
    SYMBOL: '₹',
    LOCALE: 'en-IN',
  },
  DEFAULT_VALUES: {
    MONTHLY_ALLOWANCE: 12000,
    MONTHLY_BUDGET: 10000,
    SAVINGS_TARGET: 2000,
  },
  // As of Phase B8, every financial data slice (transactions, budget,
  // category budgets, recurring expenses, savings goals) and all user
  // profile/preference fields are MongoDB-authoritative via the API — none
  // of them are read from or written to localStorage anymore. The
  // deprecated keys that used to back them (campusledger_transactions/
  // _budget/_goals/_recurring/_preferences) have been removed entirely.
  // Only genuinely local-only concerns remain here: theme (a per-browser
  // display preference with no server equivalent) and the JWT.
  STORAGE_KEYS: {
    THEME: 'campusledger_theme',
    TOKEN: 'campusledger_token',
  },
};
