import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "app_name": "Tahwelat",
      "home": "Home",
      "transactions": "Transactions",
      "analytics": "Analytics",
      "settings": "Settings",
      "total_income": "Total Income",
      "total_expenses": "Total Expenses",
      "current_balance": "Current Balance",
      "income": "Income",
      "expense": "Expense",
      "transfer": "Transfer",
      "completed": "Completed",
      "pending": "Pending",
      "cancelled": "Cancelled",
      "add_transaction": "Add Transaction",
      "edit_transaction": "Edit Transaction",
      "amount": "Amount",
      "currency": "Currency",
      "name": "Name",
      "description": "Description",
      "date": "Date",
      "category": "Category",
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "search": "Search",
      "filter": "Filter",
      "notifications": "Notifications",
      "sign_in": "Sign In",
      "sign_out": "Sign Out",
      "language": "Language",
      "theme": "Theme",
      "dark_mode": "Dark Mode",
      "light_mode": "Light Mode",
      "default_currency": "Default Currency",
      "export_data": "Export Data",
      "import_data": "Import Data",
      "backup_restore": "Backup & Restore",
      "reports": "Reports",
      "daily": "Daily",
      "monthly": "Monthly",
      "yearly": "Yearly",
      "accounts": "Accounts",
      "welcome": "Welcome back",
      "recent_transactions": "Recent Transactions",
      "no_transactions": "No transactions found",
      "receipts": "Receipts",
      "upload_images": "Upload Images",
      "status": "Status",
      "transaction_number": "TXN Number"
    }
  },
  ar: {
    translation: {
      "app_name": "تحويلات",
      "home": "الرئيسية",
      "transactions": "المعاملات",
      "analytics": "التحليلات",
      "settings": "الإعدادات",
      "total_income": "إجمالي الدخل",
      "total_expenses": "إجمالي المصروفات",
      "current_balance": "الرصيد الحالي",
      "income": "دخل",
      "expense": "مصروف",
      "transfer": "تحويل",
      "completed": "مكتمل",
      "pending": "قيد الانتظار",
      "cancelled": "ملغي",
      "add_transaction": "إضافة معاملة",
      "edit_transaction": "تعديل معاملة",
      "amount": "المبلغ",
      "currency": "العملة",
      "name": "الاسم",
      "description": "الوصف",
      "date": "التاريخ",
      "category": "الفئة",
      "save": "حفظ",
      "cancel": "إلغاء",
      "delete": "حذف",
      "search": "بحث",
      "filter": "تصفية",
      "notifications": "الإشعارات",
      "sign_in": "تسجيل الدخول",
      "sign_out": "تسجيل الخروج",
      "language": "اللغة",
      "theme": "المظهر",
      "dark_mode": "الوضع الداكن",
      "light_mode": "الوضع الفاتح",
      "default_currency": "العملة الافتراضية",
      "export_data": "تصدير البيانات",
      "import_data": "استيراد البيانات",
      "backup_restore": "النسخ الاحتياطي والاستعادة",
      "reports": "التقارير",
      "daily": "يومي",
      "monthly": "شهري",
      "yearly": "سنوي",
      "accounts": "الحسابات",
      "welcome": "مرحباً بعودتك",
      "recent_transactions": "المعاملات الأخيرة",
      "no_transactions": "لا توجد معاملات",
      "receipts": "الإيصالات",
      "upload_images": "رفع الصور",
      "status": "الحالة",
      "transaction_number": "رقم العملية"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
