/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signInWithGoogle } from './services/firebase';
import { transactionsService } from './services/db';
import { CURRENCIES, TRANSACTION_TYPES } from './constants';
import './i18n';
import { 
  Home, 
  ArrowLeftRight, 
  BarChart3, 
  Settings as SettingsIcon,
  Plus,
  LogOut,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
  Search,
  Filter,
  Bell,
  Sun,
  Moon,
  Globe,
  Download,
  FileSpreadsheet,
  FileText,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';
import TransactionForm from './components/TransactionForm';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Contexts
const AuthContext = createContext<{ user: User | null; loading: boolean }>({ user: null, loading: true });
const LayoutContext = createContext<{ 
  isDarkMode: boolean; 
  toggleDarkMode: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  defaultCurrency: string;
  setDefaultCurrency: (curr: string) => void;
}>({ 
  isDarkMode: false, 
  toggleDarkMode: () => {}, 
  language: 'ar', 
  setLanguage: () => {},
  defaultCurrency: 'SDG',
  setDefaultCurrency: () => {}
});

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState('ar');
  const [defaultCurrency, setDefaultCurrency] = useState('SDG');
  const { i18n } = useTranslation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    i18n.changeLanguage(language);
  }, [language, i18n]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 text-primary">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-4xl font-bold"
        >
          Tahwelat - تحويلات
        </motion.div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      <LayoutContext.Provider value={{ isDarkMode, toggleDarkMode, language, setLanguage, defaultCurrency, setDefaultCurrency }}>
        <div className={cn("min-h-screen font-sans", language === 'ar' ? 'rtl' : 'ltr')}>
          {!user ? <AuthScreen /> : <MainLayout />}
        </div>
      </LayoutContext.Provider>
    </AuthContext.Provider>
  );
}

function AuthScreen() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-slate-950 dark:to-slate-900">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 rounded-[2.5rem] w-full max-w-md text-center shadow-2xl"
      >
        <div className="w-24 h-24 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
          <Wallet className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl font-black mb-3 tracking-tight">تحويلات</h1>
        <h2 className="text-xl font-bold mb-3 text-slate-700 dark:text-slate-300">Tahwelat</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg">
          {t('welcome_message', 'Premium Money Management')}
        </p>
        
        <button 
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-5 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-md active:scale-95"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
          {t('sign_in')}
        </button>
      </motion.div>
    </div>
  );
}

function MainLayout() {
  const [activeTab, setActiveTab] = useState('home');
  const [showForm, setShowForm] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const { isDarkMode, toggleDarkMode, language, setLanguage } = useContext(LayoutContext);
  const { t } = useTranslation();

  useEffect(() => {
    const unsub = transactionsService.subscribeToUserTransactions(setTransactions);
    return () => unsub();
  }, []);

  return (
    <div className="pb-20 md:pb-0 md:ps-20 lg:ps-24 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100">
      <header className="fixed top-0 left-0 right-0 h-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 lg:px-10 z-[30]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <div>
            <span className="font-black text-2xl hidden sm:block">Tahwelat</span>
            <span className="font-black text-2xl sm:hidden">تحويلات</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all font-bold">
              <Globe className="w-5 h-5" />
            </button>
            <button onClick={toggleDarkMode} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
          <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block"></div>
          <div className="flex items-center gap-3 ps-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-tight">{auth.currentUser?.displayName}</p>
              <p className="text-[10px] text-slate-500 font-medium">Premium User</p>
            </div>
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-md">
              <img src={auth.currentUser?.photoURL || ''} alt="User" />
            </div>
          </div>
        </div>
      </header>

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="pt-24 px-4 lg:px-10 max-w-[1600px] mx-auto min-h-screen">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && <Dashboard transactions={transactions} key="home" />}
          {activeTab === 'transactions' && <TransactionsScreen transactions={transactions} key="transactions" />}
          {activeTab === 'analytics' && <AnalyticsScreen transactions={transactions} key="analytics" />}
          {activeTab === 'settings' && <SettingsScreen key="settings" />}
        </AnimatePresence>
      </main>

      <button 
        onClick={() => setShowForm(true)}
        className="fixed bottom-24 end-6 md:bottom-10 md:end-10 w-16 h-16 bg-primary text-white rounded-[2rem] shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
      >
        <Plus className="w-9 h-9" />
      </button>

      {showForm && <TransactionForm onClose={() => setShowForm(false)} />}
    </div>
  );
}

function Sidebar({ activeTab, setActiveTab }: any) {
  const { t } = useTranslation();
  const tabs = [
    { id: 'home', icon: Home, label: t('home') },
    { id: 'transactions', icon: ArrowLeftRight, label: t('transactions') },
    { id: 'analytics', icon: BarChart3, label: t('analytics') },
    { id: 'settings', icon: SettingsIcon, label: t('settings') },
  ];

  return (
    <nav className="fixed start-0 top-20 bottom-0 w-20 lg:w-24 bg-white dark:bg-slate-900 border-e border-slate-200 dark:border-slate-800 hidden md:flex flex-col items-center py-8 gap-8 z-[20]">
      {tabs.map((tab) => (
        <button 
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "p-4 rounded-3xl transition-all relative group shadow-sm",
            activeTab === tab.id ? "bg-primary text-white shadow-primary/30" : "text-slate-400 hover:text-primary hover:bg-primary/5"
          )}
        >
          <tab.icon className="w-7 h-7" />
          <span className="absolute start-full ms-5 px-3 py-2 bg-slate-900 text-white text-sm font-bold rounded-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
            {tab.label}
          </span>
        </button>
      ))}
      <div className="mt-auto">
        <button onClick={() => auth.signOut()} className="p-4 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-3xl transition-all">
          <LogOut className="w-7 h-7" />
        </button>
      </div>
    </nav>
  );
}

function MobileNav({ activeTab, setActiveTab }: any) {
  const { t } = useTranslation();
  const tabs = [
    { id: 'home', icon: Home, label: t('home') },
    { id: 'transactions', icon: ArrowLeftRight, label: t('transactions') },
    { id: 'analytics', icon: BarChart3, label: t('analytics') },
    { id: 'settings', icon: SettingsIcon, label: t('settings') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-24 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-4 z-[35] md:hidden">
      {tabs.map((tab) => (
        <button 
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "flex flex-col items-center gap-2 transition-all w-16 px-1",
            activeTab === tab.id ? "text-primary bg-primary/5 rounded-2xl py-2" : "text-slate-400"
          )}
        >
          <tab.icon className="w-6 h-6" />
          <span className="text-[10px] font-black uppercase tracking-wider">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

function Dashboard({ transactions }: { transactions: any[]; key?: string }) {
  const { t } = useTranslation();
  const { defaultCurrency } = useContext(LayoutContext);
  
  const stats = useMemo(() => {
    let income = 0;
    let expenses = 0;
    transactions.forEach(t => {
      // For simplicity we assume all in default currency for now
      // Real app would convert based on T.currency
      if (t.type === 'income') income += t.amount;
      else if (t.type === 'expense') expenses += t.amount;
    });
    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return format(d, 'MMM dd');
    }).reverse();

    return last7Days.map(day => {
      let dailyIncome = 0;
      let dailyExpense = 0;
      transactions.forEach(t => {
        if (t.timestamp && format(new Date(t.timestamp.seconds * 1000), 'MMM dd') === day) {
          if (t.type === 'income') dailyIncome += t.amount;
          else if (t.type === 'expense') dailyExpense += t.amount;
        }
      });
      return { name: day, income: dailyIncome, expenses: dailyExpense };
    });
  }, [transactions]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 pb-10"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">{t('welcome')}, {auth.currentUser?.displayName?.split(' ')[0]}!</h1>
          <p className="text-slate-500 font-medium">Keep track of your financial health.</p>
        </div>
        <div className="hidden sm:flex gap-3">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('default_currency')}</p>
            <p className="text-lg font-black text-primary">{defaultCurrency}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title={t('current_balance')} amount={stats.balance} currency={defaultCurrency} type="balance" />
        <StatCard title={t('total_income')} amount={stats.income} currency={defaultCurrency} type="income" />
        <StatCard title={t('total_expenses')} amount={stats.expenses} currency={defaultCurrency} type="expense" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 glass-card p-8 rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-xl">{t('analytics')}</h3>
            <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
              <button className="px-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-700 shadow-sm font-bold">{t('monthly')}</button>
              <button className="px-4 py-2 text-xs rounded-xl hover:bg-white/50 dark:hover:bg-slate-700/50 font-bold text-slate-500">Weekly</button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                />
                <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 glass-card p-8 rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-xl">{t('recent_transactions')}</h3>
            <button className="text-primary text-sm font-black hover:underline uppercase tracking-wider">All</button>
          </div>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {transactions.slice(0, 5).map(txn => (
              <TransactionItem key={txn.id} {...txn} />
            ))}
            {transactions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-3">
                <Clock className="w-10 h-10 opacity-20" />
                <p className="font-bold text-sm tracking-wide">{t('no_transactions')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, amount, currency, type }: any) {
  const isBalance = type === 'balance';
  const isIncome = type === 'income';
  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      className={cn(
        "p-8 rounded-[2.5rem] shadow-xl border-2 transition-all",
        isBalance ? "bg-primary text-white border-primary shadow-primary/30" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <span className={cn("text-xs font-black uppercase tracking-widest", isBalance ? "text-white/60" : "text-slate-400")}>{title}</span>
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
          isBalance ? "bg-white/20" : isIncome ? "bg-income/10 text-income shadow-income/10" : "bg-expense/10 text-expense shadow-expense/10"
        )}>
          {isBalance ? <Wallet className="w-6 h-6" /> : isIncome ? <ArrowUpCircle className="w-6 h-6" /> : <ArrowDownCircle className="w-6 h-6" />}
        </div>
      </div>
      <div className="space-y-1">
        <h2 className="text-3xl font-black tracking-tight">{amount.toLocaleString()}</h2>
        <p className={cn("text-sm font-bold", isBalance ? "text-white/70" : "text-slate-500")}>{currency}</p>
      </div>
    </motion.div>
  );
}

function TransactionItem({ id, personName, amount, currency, timestamp, type, status }: any) {
  const { t } = useTranslation();
  const dateStr = timestamp ? format(new Date(timestamp.seconds * 1000), 'MMM dd, HH:mm') : '';
  const isIncome = type === 'income';
  const isExpense = type === 'expense';
  
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-transparent hover:border-primary/20 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer group shadow-sm">
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-inner",
          isIncome ? "bg-income/10 text-income" : isExpense ? "bg-expense/10 text-expense" : "bg-primary/10 text-primary"
        )}>
          {isIncome ? <ArrowUpCircle className="w-7 h-7" /> : isExpense ? <ArrowDownCircle className="w-7 h-7" /> : <ArrowLeftRight className="w-7 h-7" />}
        </div>
        <div className="space-y-1">
          <h4 className="font-black text-sm group-hover:text-primary transition-colors">{personName || 'Unnamed'}</h4>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{dateStr}</span>
        </div>
      </div>
      <div className="text-right">
        <div className={cn(
          "font-black text-lg tracking-tight",
          isIncome ? "text-income" : isExpense ? "text-expense" : ""
        )}>
          {isIncome ? '+' : isExpense ? '-' : ''}{amount.toLocaleString()}
          <span className="text-[10px] ms-1 uppercase opacity-60 font-black">{currency}</span>
        </div>
        <div className={cn(
          "text-[9px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest mt-1 inline-block shadow-sm",
          status === 'completed' ? "bg-income/10 text-income" : status === 'pending' ? "bg-pending/10 text-pending" : "bg-slate-100 text-slate-400"
        )}>
          {t(status)}
        </div>
      </div>
    </div>
  );
}

function TransactionsScreen({ transactions }: { transactions: any[]; key?: string }) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = (t.personName || '').toLowerCase().includes(searchTerm.toLowerCase()) || (t.transactionNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'all' || t.type === filterType;
      return matchSearch && matchType;
    });
  }, [transactions, searchTerm, filterType]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Tahwelat - Financial Report", 14, 15);
    autoTable(doc, {
      head: [['Date', 'Name', 'Type', 'Amount', 'Currency', 'Status']],
      body: filtered.map(t => [
        format(new Date(t.timestamp.seconds * 1000), 'yyyy-MM-dd'),
        t.personName,
        t.type,
        t.amount,
        t.currency,
        t.status
      ]),
    });
    doc.save('tahwelat_report.pdf');
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map(t => ({
      Date: format(new Date(t.timestamp.seconds * 1000), 'yyyy-MM-dd'),
      Name: t.personName,
      Type: t.type,
      Amount: t.amount,
      Currency: t.currency,
      Status: t.status,
      ID: t.transactionNumber
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "tahwelat_report.xlsx");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="space-y-8 pb-10"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black">{t('transactions')}</h2>
          <p className="text-slate-500 font-medium">Manage and monitor all your movements.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('search')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-5 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-primary/50 outline-none transition-all shadow-sm font-bold text-sm"
            />
          </div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-sm outline-none transition-all shadow-sm"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
          </select>
          <div className="flex gap-2">
            <button onClick={exportPDF} className="p-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
              <FileText className="w-5 h-5 text-primary" />
            </button>
            <button onClick={exportExcel} className="p-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
              <FileSpreadsheet className="w-5 h-5 text-income" />
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-xl">
        <div className="hidden md:grid grid-cols-5 p-6 bg-slate-50/50 dark:bg-slate-800/50 border-b-2 border-slate-100 dark:border-slate-800 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">
          <div className="ps-4">{t('name')}</div>
          <div className="text-center">{t('date')}</div>
          <div className="text-center">{t('status')}</div>
          <div className="text-center">Category</div>
          <div className="text-right pe-4">{t('amount')}</div>
        </div>
        <div className="divide-y-2 divide-slate-50 dark:divide-slate-800/50">
          {filtered.map(txn => (
            <div 
              key={txn.id} 
              className="p-6 grid grid-cols-1 md:grid-cols-5 items-center hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-all cursor-pointer group"
              onClick={() => {}}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                  txn.type === 'income' ? "bg-income/10 text-income" : "bg-expense/10 text-expense"
                )}>
                  <Plus className={cn("w-6 h-6", txn.type === 'expense' && "rotate-45")} />
                </div>
                <div className="font-bold text-sm tracking-tight">{txn.personName || 'Unnamed'}</div>
              </div>
              <div className="hidden md:block text-center text-[10px] font-black uppercase text-slate-500">
                {format(new Date(txn.timestamp.seconds * 1000), 'MMM dd, yyyy')}
              </div>
              <div className="hidden md:flex justify-center">
                <span className={cn(
                  "text-[9px] px-3 py-1 rounded-xl font-black uppercase tracking-widest shadow-sm",
                  txn.status === 'completed' ? "bg-income/10 text-income" : "bg-pending/10 text-pending"
                )}>
                  {t(txn.status)}
                </span>
              </div>
              <div className="hidden md:block text-center text-xs font-bold text-slate-400 capitalize">
                {txn.category || 'General'}
              </div>
              <div className="text-right font-black text-lg tracking-tight">
                <span className={txn.type === 'income' ? "text-income" : "text-expense"}>
                  {txn.type === 'income' ? '+' : '-'}{txn.amount.toLocaleString()}
                </span>
                <span className="text-[10px] ms-1 opacity-50">{txn.currency}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-300 gap-4">
              <Search className="w-16 h-16 opacity-10" />
              <p className="font-black text-lg tracking-widest">{t('no_transactions')}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function AnalyticsScreen({ transactions }: { transactions: any[]; key?: string }) {
  const { t } = useTranslation();
  
  const pieData = useMemo(() => {
    const cats: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        cats[t.category || 'other'] = (cats[t.category || 'other'] || 0) + t.amount;
      }
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const COLORS = ['#1e40af', '#0ea5e9', '#22c55e', '#ef4444', '#f97316', '#8b5cf6'];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-8 pb-10"
    >
      <div>
        <h2 className="text-3xl font-black">{t('analytics')}</h2>
        <p className="text-slate-500 font-medium">Visual insights into your spending habits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-10 rounded-[2.5rem] min-h-[450px] flex flex-col">
          <h3 className="font-black text-xl mb-8">Expense Distribution</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.2)' }}
                  itemStyle={{ fontSize: '14px', fontWeight: 800 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-6">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                <span className="text-[10px] font-bold uppercase tracking-tighter truncate">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-10 rounded-[2.5rem] min-h-[450px] flex flex-col items-center justify-center gap-6">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center">
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-black text-xl">Monthly Financial Report</h3>
            <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">Generate a detailed breakdown of your performance this month.</p>
          </div>
          <button className="px-10 py-5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
            Generate Report
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function SettingsScreen() {
  const { t } = useTranslation();
  const { language, setLanguage, isDarkMode, toggleDarkMode, defaultCurrency, setDefaultCurrency } = useContext(LayoutContext);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      className="max-w-3xl mx-auto space-y-8 pb-20"
    >
      <div>
        <h2 className="text-3xl font-black">{t('settings')}</h2>
        <p className="text-slate-500 font-medium">Personalize your experience.</p>
      </div>
      
      <div className="space-y-6">
        <section className="glass-card p-8 rounded-[2.5rem] shadow-lg">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">{t('language')}</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setLanguage('ar')}
              className={cn(
                "p-5 rounded-3xl border-2 font-black transition-all flex items-center justify-between",
                language === 'ar' ? "border-primary bg-primary/5 text-primary" : "border-slate-100 dark:border-slate-800"
              )}
            >
              <span>العربية</span>
              {language === 'ar' && <div className="w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/50"></div>}
            </button>
            <button 
              onClick={() => setLanguage('en')}
              className={cn(
                "p-5 rounded-3xl border-2 font-black transition-all flex items-center justify-between",
                language === 'en' ? "border-primary bg-primary/5 text-primary" : "border-slate-100 dark:border-slate-800"
              )}
            >
              <span>English</span>
              {language === 'en' && <div className="w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/50"></div>}
            </button>
          </div>
        </section>

        <section className="glass-card p-8 rounded-[2.5rem] shadow-lg">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">{t('default_currency')}</h3>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {CURRENCIES.map(curr => (
              <button 
                key={curr.code}
                onClick={() => setDefaultCurrency(curr.code)}
                className={cn(
                  "p-4 rounded-2xl border-2 font-black transition-all text-xs",
                  defaultCurrency === curr.code ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-slate-100 dark:border-slate-800 text-slate-400"
                )}
              >
                {curr.code}
              </button>
            ))}
          </div>
        </section>

        <section className="glass-card p-8 rounded-[2.5rem] shadow-lg">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">{t('theme')}</h3>
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                {isDarkMode ? <Moon className="w-6 h-6 text-primary" /> : <Sun className="w-6 h-6 text-orange-500" />}
              </div>
              <div>
                <p className="font-bold">{isDarkMode ? t('dark_mode') : t('light_mode')}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('system_theme', 'Sync with OS')}</p>
              </div>
            </div>
            <button 
              onClick={toggleDarkMode}
              className={cn(
                "w-16 h-8 rounded-full transition-all relative p-1",
                isDarkMode ? "bg-primary" : "bg-slate-200"
              )}
            >
              <div className={cn(
                "w-6 h-6 bg-white rounded-full transition-all shadow-md",
                isDarkMode ? "translate-x-8" : "translate-x-0"
              )} />
            </button>
          </div>
        </section>

        <div className="pt-4">
          <button 
            onClick={() => auth.signOut()}
            className="w-full p-6 rounded-[2rem] bg-red-50 dark:bg-red-950/20 text-red-600 font-black border-2 border-red-100 dark:border-red-900/40 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-sm"
          >
            <LogOut className="w-6 h-6" />
            {t('sign_out')}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
