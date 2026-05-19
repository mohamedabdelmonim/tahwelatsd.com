export const CURRENCIES = [
  { code: 'SDG', symbol: 'ج.س', name: 'Sudanese Pound' },
  { code: 'EGP', symbol: 'ج.م', name: 'Egyptian Pound' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
];

export const CATEGORIES = [
  { id: 'transfers', name: 'Transfers', icon: 'ArrowLeftRight' },
  { id: 'bills', name: 'Bills', icon: 'FileText' },
  { id: 'business', name: 'Business', icon: 'Briefcase' },
  { id: 'salaries', name: 'Salaries', icon: 'Banknote' },
  { id: 'expenses', name: 'Expenses', icon: 'ShoppingCart' },
  { id: 'other', name: 'Other', icon: 'Layers' },
];

export const TRANSACTION_TYPES = [
  { id: 'income', label: 'Income', color: 'text-income', bg: 'bg-income/10' },
  { id: 'expense', label: 'Expense', color: 'text-expense', bg: 'bg-expense/10' },
  { id: 'transfer', label: 'Transfer', color: 'text-primary', bg: 'bg-primary/10' },
];

export const TRANSACTION_STATUSES = [
  { id: 'completed', label: 'Completed' },
  { id: 'pending', label: 'Pending' },
  { id: 'cancelled', label: 'Cancelled' },
];
