import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Camera, Upload, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { CURRENCIES, CATEGORIES, TRANSACTION_TYPES, TRANSACTION_STATUSES } from '../constants';
import { transactionsService } from '../services/db';
import { Timestamp } from 'firebase/firestore';

interface TransactionFormProps {
  onClose: () => void;
  initialData?: any;
}

export default function TransactionForm({ onClose, initialData }: TransactionFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    amount: initialData?.amount || '',
    currency: initialData?.currency || 'SDG',
    type: initialData?.type || 'expense',
    status: initialData?.status || 'completed',
    personName: initialData?.personName || '',
    description: initialData?.description || '',
    category: initialData?.category || 'expenses',
    transactionNumber: initialData?.transactionNumber || '',
    timestamp: initialData?.timestamp ? new Date(initialData.timestamp.seconds * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount as string),
        timestamp: Timestamp.fromDate(new Date(formData.timestamp))
      };
      
      if (initialData?.id) {
        await transactionsService.update(initialData.id, data);
      } else {
        await transactionsService.add(data);
      }
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold">{initialData ? t('edit_transaction') : t('add_transaction')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="flex gap-2">
            {TRANSACTION_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.id })}
                className={`flex-1 py-3 rounded-2xl border-2 transition-all font-bold text-sm ${
                  formData.type === type.id 
                    ? `border-primary bg-primary/5 ${type.color}` 
                    : 'border-slate-100 dark:border-slate-800 text-slate-400'
                }`}
              >
                {t(type.id)}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">{t('amount')}</label>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-lg font-bold"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">{t('currency')}</label>
                <select 
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                >
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase px-1">{t('name')} / {t('company')}</label>
              <input 
                value={formData.personName}
                onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder={t('person_or_company', 'Recipient or Payer name')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">{t('category')}</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{t(c.id)}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">{t('status')}</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {TRANSACTION_STATUSES.map(s => <option key={s.id} value={s.id}>{t(s.id)}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase px-1">{t('date')}</label>
              <input 
                type="date"
                value={formData.timestamp}
                onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase px-1">{t('transaction_number')}</label>
              <input 
                value={formData.transactionNumber}
                onChange={(e) => setFormData({ ...formData, transactionNumber: e.target.value })}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="TXN-123456"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase px-1">{t('description')}</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none h-24 resize-none"
                placeholder="..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase px-1">{t('receipts')}</label>
              <div className="flex gap-2">
                <button type="button" className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors gap-2">
                  <Camera className="w-6 h-6 text-slate-400" />
                  <span className="text-xs font-bold text-slate-400">{t('camera')}</span>
                </button>
                <button type="button" className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors gap-2">
                  <Upload className="w-6 h-6 text-slate-400" />
                  <span className="text-xs font-bold text-slate-400">{t('upload')}</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-4">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {t('cancel')}
          </button>
          <button 
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
          >
            {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div> : t('save')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
