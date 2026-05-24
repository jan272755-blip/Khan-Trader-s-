import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  Wallet, 
  PlusCircle, 
  ArrowUpCircle, 
  History as HistoryIcon,
  Users as UsersIcon,
  LogOut,
  Bell,
  Home,
  Briefcase,
  PieChart,
  Settings,
  ChevronRight,
  TrendingUp,
  ArrowDownCircle,
  ShieldCheck,
  Star,
  Zap,
  Globe,
  Award,
  X,
  Camera,
  CheckCircle2,
  Menu,
  Clock,
  ArrowRightLeft,
  MessageCircle,
  Search
} from 'lucide-react';
import { User, InvestmentPlan, Transaction } from '../types';
import { storage } from '../lib/storage';

interface DashboardScreenProps {
  user: User;
  onLogout: () => void;
  showNotification: (msg: string, type?: 'success' | 'error') => void;
  refreshUser: () => void;
}

const PLANS: InvestmentPlan[] = [
  { id: '1', name: 'PLAN-01', price: 2000, dailyProfit: 1500, duration: 9999, level: 'Basic' },
  { id: '2', name: 'PLAN-02', price: 3000, dailyProfit: 2000, duration: 9999, level: 'Silver' },
  { id: '3', name: 'PLAN-03', price: 4000, dailyProfit: 3000, duration: 9999, level: 'Silver' },
  { id: '4', name: 'PLAN-04', price: 5000, dailyProfit: 4000, duration: 9999, level: 'Gold' },
  { id: '5', name: 'PLAN-05', price: 10000, dailyProfit: 8000, duration: 9999, level: 'VIP' },
];

const translations = {
  en: {
    dashboard: 'Dashboard',
    home: 'Home',
    plans: 'Plans',
    team: 'Team',
    profile: 'Profile',
    availableBalance: 'Available Balance',
    totalProfit: 'Total Profit',
    totalInvested: 'Total Invested',
    nextProfitCountdown: 'Next Profit Countdown',
    investmentPlansCount: 'Active Investments',
    quickActions: 'Quick Actions',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    recentActivity: 'Transaction History',
    viewAll: 'View All',
    noTransactions: 'No transactions yet.',
    activePlans: 'Active Plans',
    growWealth: 'Select a plan to grow your wealth',
    referralProgram: 'Referral Program',
    referralProgramDesc: 'Invite your friends and earn 10% commission on every investment they make!',
    yourReferralLink: 'Your Referral Link',
    copy: 'Copy',
    copied: 'Link copied to clipboard!',
    myReferrals: 'My Referrals',
    referralTeam: 'Referral Team',
    weeklyLeaderboard: 'Weekly Leaderboard',
    weeklyLeaderboardDesc: 'Top referrers win exclusive prizes every Sunday!',
    viewRankings: 'View Rankings',
    verifiedMember: 'Verified Member',
    verifiedWallet: 'Verified Wallet',
    myInvestments: 'My Investments',
    dailyEarnings: 'Daily earnings',
    language: 'Language',
    security: 'Security',
    logout: 'Logout Account',
    makeADeposit: 'Make a Deposit',
    depositDetails: 'Transfer Rs. 2,000 - Rs. 10,000 to the account details below and submit copy of screenshot.',
    accountNumber: 'Account Number',
    accountName: 'Account Name',
    amountPkr: 'Amount (PKR)',
    transactionId: 'Transaction ID (TID)',
    transactionReceipt: 'Transaction Receipt (Photo)',
    clickToUpload: 'Click to upload screenshot',
    confirmDeposit: 'Confirm Deposit Request',
    confirmWithdraw: 'Confirm Withdrawal',
    withdrawFunds: 'Withdraw Funds',
    availableForWithdrawal: 'Available for Withdrawal',
    withdrawalMethod: 'Withdrawal Method',
    bankNameField: 'Bank Name',
    enterBankName: 'Enter bank name',
    accountNumberIban: 'Account Number / IBAN',
    easypaisaJazzcashNum: 'EasyPaisa/JazzCash Number',
    enterIbanOrAcc: 'Enter IBAN or Account No.',
    enterMobileNum: 'Enter mobile number',
    accountHolderName: 'Account Holder Name',
    enterAccName: 'Enter account name',
    withdrawalTimeNote: 'Withdrawal processing time: 5 mins to 1 hour',
    noActivePlans: 'No active plans',
    plansFullyCompleted: 'Plans fully completed',
    nextPayout: 'Next Payout',
    profitNote: '* Profit is calculated daily 24 hours after purchase.',
    walletHistory: 'Wallet History',
    walletHistorySub: 'Record of your balance uploads, withdraws & daily earnings',
    all: 'All',
    deposits: 'Deposits',
    withdrawals: 'Withdrawals',
    earnings: 'Earnings',
    investments: 'Investments',
    noRecords: 'No records found.',
    selectLanguage: 'Select Language - زبان منتخب کریں',
    english: 'English',
    urdu: 'اردو (Urdu)',
    verified: 'Verified',
    unverified: 'Unverified',
    minDepositLimit: 'Deposit amount must be between Rs. 2,000 and Rs. 10,000.',
    minWithdrawLimit: 'Withdrawal amount must be between Rs. 1,500 and Rs. 800,000.',
    insufficientBalance: 'Insufficient balance.',
    requestSuccess: 'Request submitted successfully!',
    welcomeBack: 'Welcome Back',
    navigation: 'Navigation',
    durationDays: 'Duration: {days} Days',
    investNow: 'Invest Now',
    dailyProfit: 'Daily Profit',
    level: 'Level',
    investment: 'Investment',
    depositReceiptMinMax: 'Min: 2,000 - Max: 10,000',
    withdrawReceiptMinMax: 'Min: 1,500 - Max: 800,000',
    pasteTid: 'Paste Transaction ID',
    enterAmount: 'Enter amount',
    successNotification: 'Added Rs. {amount} daily profit from your active investments!',
    quickChat: 'Quick Chat',
    owner: 'Owner',
    whatsAppChannel: 'WhatsApp Channel',
    logoutConfirmTitle: 'Are you sure you want to logout?',
    logoutConfirmDesc: 'You will need to enter your username and password again to access your account.',
    yesLogout: 'Yes, Logout',
    cancel: 'Cancel',
    confirmDepositShort: 'Confirm Deposit',
    confirmDepositTitle: 'Confirm Deposit Details',
    reviewDetailsPrompt: 'Please review and confirm your deposit details below before submitting.',
    methodLabel: 'Deposit Method',
    pkrAmount: 'Amount',
    enteredTid: 'Entered Transaction ID',
    receiptUploaded: 'Receipt Uploaded',
    depositReviewNote: 'Make sure the payment has already been sent. Admin will verify your Transaction ID and approve the request.',
    confirmAndSubmit: 'Yes, Submit Request',
    backToEdit: 'Go Back & Edit'
  },
  ur: {
    dashboard: 'ڈیش بورڈ',
    home: 'ہوم',
    plans: 'پلانز',
    team: 'ٹیم',
    profile: 'پروفائل',
    availableBalance: 'دستیاب بیلنس',
    totalProfit: 'کل منافع',
    totalInvested: 'کل انویسٹمنٹ',
    nextProfitCountdown: 'اگلے منافع کا وقت',
    investmentPlansCount: 'فعال انویسٹمنٹ',
    quickActions: 'فوری اقدامات',
    deposit: 'ڈپازٹ',
    withdraw: 'ودڈرا',
    recentActivity: 'ٹرانزیکشن ہسٹری',
    viewAll: 'سب دیکھیں',
    noTransactions: 'کوئی ٹرانزیکشن نہیں ہے۔',
    activePlans: 'فعال پلانز',
    growWealth: 'اپنی دولت بڑھانے کے لیے پلان منتخب کریں',
    referralProgram: 'ریفرل پروگرام',
    referralProgramDesc: 'اپنے دوستوں کو مدعو کریں اور ان کی ہر انویسٹمنٹ پر 10% کمیشن حاصل کریں!',
    yourReferralLink: 'آپ کا ریفرل لنک',
    copy: 'کاپی کریں',
    copied: 'لنک کاپی ہو گیا ہے!',
    myReferrals: 'میرے ریفرلز',
    referralTeam: 'ریفرل ٹیم',
    weeklyLeaderboard: 'ہفتہ وار لیڈر بورڈ',
    weeklyLeaderboardDesc: 'ہر اتوار کو ٹاپ ریفررز جیتنے والے خصوصی انعامات حاصل کرتے ہیں!',
    viewRankings: 'رینکنگ دیکھیں',
    verifiedMember: 'تصدیق شدہ ممبر',
    verifiedWallet: 'تصدیق شدہ والٹ',
    myInvestments: 'میری انویسٹمنٹس',
    dailyEarnings: 'روزانہ کی آمدنی',
    language: 'زبان (Language)',
    security: 'سیکیورٹی',
    logout: 'لاگ آؤٹ اکاؤنٹ',
    makeADeposit: 'ڈپازٹ کریں',
    depositDetails: 'درج ذیل اکاؤنٹ کی تفصیلات پر Rs. 2,000 سے Rs. 10,000 بھیجیں اور اسکرین شاٹ کی کاپی جمع کرائیں۔',
    accountNumber: 'اکاؤنٹ نمبر',
    accountName: 'اکاؤنٹ کا نام',
    amountPkr: 'رقم (ہزاروں میں)',
    transactionId: 'ٹرانزیکشن ID (TID)',
    transactionReceipt: 'ٹرانزیکشن کی رسید (تصویر)',
    clickToUpload: 'اسکرین شاٹ لوڈ کرنے کے لیے کلک کریں',
    confirmDeposit: 'ڈپازٹ کی درخواست بھیجیں',
    confirmWithdraw: 'ودڈرا کی تصدیق کریں',
    withdrawFunds: 'رقم ودڈرا کریں',
    availableForWithdrawal: 'ودڈرا کے لیے دستیاب رقم',
    withdrawalMethod: 'ودڈرا کا طریقہ',
    bankNameField: 'بینک کا نام',
    enterBankName: 'بینک کا نام درج کریں',
    accountNumberIban: 'اکاؤنٹ نمبر / IBAN',
    easypaisaJazzcashNum: 'ایزی پیسہ/جاز کیش نمبر',
    enterIbanOrAcc: 'اکاؤنٹ نمبر یا IBAN درج کریں',
    enterMobileNum: 'موبائل نمبر درج کریں',
    accountHolderName: 'اکاؤنٹ ہولڈر کا نام',
    enterAccName: 'اکاؤنٹ ہولڈر کا نام درج کریں',
    withdrawalTimeNote: 'ودڈرال پروسیسنگ ٹائم: 5 منٹ سے 1 گھنٹہ',
    noActivePlans: 'کوئی فعال پلان نہیں ہے',
    plansFullyCompleted: 'پلانز مکمل ہو چکے ہیں',
    nextPayout: 'اگلا منافع',
    profitNote: '* منافع کی گنتی خریداری کے 24 گھنٹے بعد روزانہ کی جاتی ہے۔',
    walletHistory: 'والٹ ہسٹری',
    walletHistorySub: 'آپ کے بیلنس اپ لوڈز، ودڈراز اور روزانہ کے منافع کا ریکارڈ',
    all: 'تمام',
    deposits: 'ڈپازٹ',
    withdrawals: 'ودڈرال',
    earnings: 'پرافٹ',
    investments: 'انویسٹمنٹ',
    noRecords: 'کوئی ریکارڈ نہیں ملا۔',
    selectLanguage: 'زبان منتخب کریں - Select Language',
    english: 'English',
    urdu: 'اردو (Urdu)',
    verified: 'تصدیق شدہ',
    unverified: 'غیر تصدیق شدہ',
    minDepositLimit: 'ڈپازٹ رقم 2,000 اور 10,000 روپے کے درمیان ہونی چاہیے۔',
    minWithdrawLimit: 'ودڈرال رقم 1,500 اور 800,000 روپے کے درمیان ہونی چاہیے۔',
    insufficientBalance: 'بیلنس ناکافی ہے۔',
    requestSuccess: 'درخواست کامیابی کے ساتھ جمع ہو گئی!',
    welcomeBack: 'خوش آمدید',
    navigation: 'نیویگیشن',
    durationDays: 'مدت: {days} دن',
    investNow: 'ابھی انویسٹ کریں',
    dailyProfit: 'روزانہ منافع',
    level: 'لیول',
    investment: 'انویسٹمنٹ',
    depositReceiptMinMax: 'کم از کم: 2,000 - زیادہ سے زیادہ: 10,000',
    withdrawReceiptMinMax: 'کم از کم: 1,500 - زیادہ سے زیادہ: 800,000',
    pasteTid: 'ٹرانزیکشن ID پیسٹ کریں',
    enterAmount: 'رقم درج کریں',
    successNotification: 'آپ کی فعال انویسٹمنٹس سے Rs. {amount} روزانہ منافع شامل کر دیا گیا ہے!',
    quickChat: 'فوری چیٹ',
    owner: 'مالک (Owner)',
    whatsAppChannel: 'واٹس ایپ چینل',
    logoutConfirmTitle: 'کیا آپ واقعی لاگ آؤٹ کرنا چاہتے ہیں؟',
    logoutConfirmDesc: 'اپنے اکاؤنٹ تک رسائی حاصل کرنے کے لیے آپ کو دوبارہ اپنا صارف نام اور پاس ورڈ درج کرنا پڑے گا۔',
    yesLogout: 'جی ہاں، لاگ آؤٹ کریں',
    cancel: 'منسوخ کریں',
    confirmDepositShort: 'ڈپازٹ کی تصدیق',
    confirmDepositTitle: 'ڈپازٹ کی تفصیلات کی تصدیق کریں',
    reviewDetailsPrompt: 'براہ کرم جمع کرانے سے پہلے اپنے ڈپازٹ کی تفصیلات کا جائزہ لیں اور تصدیق کریں۔',
    methodLabel: 'ڈپازٹ کا طریقہ',
    pkrAmount: 'رقم',
    enteredTid: 'درج کردہ ٹرانزیکشن ID',
    receiptUploaded: 'رسید لوڈ ہو گئی',
    depositReviewNote: 'یقینی بنائیں کہ پیمنٹ پہلے ہی بھیجی جا چکی ہے۔ ایڈمن آپ کے ٹرانزیکشن ID کی تصدیق کر کے درخواست منظور کرے گا۔',
    confirmAndSubmit: 'ہاں، درخواست بھیجیں',
    backToEdit: 'واپس جائیں اور ایڈٹ کریں'
  }
};

interface CountdownWidgetProps {
  transactions: Transaction[];
  language: 'en' | 'ur';
}

const CountdownWidget = React.memo(({ transactions, language }: CountdownWidgetProps) => {
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const nextProfitInfo = useMemo(() => {
    const investments = transactions.filter(tx => tx.type === 'investment');
    if (investments.length === 0) {
      return { text: language === 'ur' ? 'کوئی فعال پلان نہیں ہے' : 'No active plans', secondsLeft: -1 };
    }

    const activePayouts = investments.map(inv => {
      const plan = PLANS.find(p => p.price === Math.abs(inv.amount));
      if (!plan) return null;

      const startMs = new Date(inv.date).getTime();
      const elapsedMs = currentTime - startMs;
      const intervalMs = 24 * 60 * 60 * 1000;
      const rawElapsedCycles = Math.floor(elapsedMs / intervalMs);
      const completedCycles = Math.min(rawElapsedCycles, plan.duration);

      if (completedCycles >= plan.duration) return null;

      const nextPayoutMs = startMs + (completedCycles + 1) * intervalMs;
      const remainingMs = nextPayoutMs - currentTime;

      return {
        planName: plan.name,
        remainingMs,
        dailyProfit: plan.dailyProfit
      };
    }).filter(p => p !== null && p.remainingMs > 0);

    if (activePayouts.length === 0) {
      return { text: language === 'ur' ? 'پلانز مکمل ہو چکے ہیں' : 'Plans fully completed', secondsLeft: -1 };
    }

    activePayouts.sort((a, b) => a!.remainingMs - b!.remainingMs);
    const nearest = activePayouts[0]!;

    const totalSeconds = Math.max(0, Math.floor(nearest.remainingMs / 1000));
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    const formattedTime = `${h.toString().padStart(2, '0')}h : ${m.toString().padStart(2, '0')}m : ${s.toString().padStart(2, '0')}s`;
    return {
      text: formattedTime,
      secondsLeft: totalSeconds,
      planName: nearest.planName,
      profit: nearest.dailyProfit
    };
  }, [transactions, currentTime, language]);

  return (
    <div className="bg-gradient-to-br from-[#121212] to-[#1e1a0b] p-4 rounded-2xl border border-yellow-500/20 shadow-sm relative overflow-hidden">
      <div className="absolute top-2 right-2 text-yellow-500/10">
        <Clock size={40} />
      </div>
      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1">
        {language === 'ur' ? 'اگلے منافع کا کاؤنٹ ڈاؤن' : 'Next Profit Countdown'}
      </p>
      <h5 className="font-mono text-lg font-bold text-yellow-500 leading-none mb-1">
        {nextProfitInfo.text}
      </h5>
      {nextProfitInfo.secondsLeft > 0 && (
        <p className="text-[9px] text-slate-400 leading-none font-sans">
          {language === 'ur' ? `اگلا پے آؤٹ: +Rs. ${nextProfitInfo.profit} (${nextProfitInfo.planName})` : `Next Payout: +Rs. ${nextProfitInfo.profit} (${nextProfitInfo.planName})`}
        </p>
      )}
      <p className="text-[8px] text-yellow-500/70 font-sans tracking-wide mt-2 pt-2 border-t border-white/5">
        {language === 'ur' ? '* منافع کی واپسی خریداری کے 24 گھنٹے بعد روزانہ کی بنیاد پر کی جاتی ہے۔' : '* Profit is calculated daily 24 hours after purchase.'}
      </p>
    </div>
  );
});

CountdownWidget.displayName = 'CountdownWidget';

export default function DashboardScreen({ user, onLogout, showNotification, refreshUser }: DashboardScreenProps) {
  const getMyTransactions = () => {
    const all = storage.getTransactions();
    if (user.isAdmin) return all;
    return all.filter(t => t.username?.toLowerCase() === user.username.toLowerCase());
  };

  // Keep stable refs to avoid triggering hooks unnecessarily
  const refreshUserRef = React.useRef(refreshUser);
  const showNotificationRef = React.useRef(showNotification);

  useEffect(() => {
    refreshUserRef.current = refreshUser;
  }, [refreshUser]);

  useEffect(() => {
    showNotificationRef.current = showNotification;
  }, [showNotification]);

  const [activeTab, setActiveTab] = useState<'home' | 'plans' | 'team' | 'profile'>('home');
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const all = storage.getTransactions();
    if (user.isAdmin) return all;
    return all.filter(t => t.username?.toLowerCase() === user.username.toLowerCase());
  });
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedDepositMethod, setSelectedDepositMethod] = useState<'easypaisa' | 'mcb'>('easypaisa');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSupportMenu, setShowSupportMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDepositConfirm, setShowDepositConfirm] = useState(false);
  const [adminRefreshKey, setAdminRefreshKey] = useState(0);
  const [adminActiveTab, setAdminActiveTab] = useState<'pending' | 'all-users' | 'activity-logs'>('pending');
  const [language, setLanguage] = useState<'en' | 'ur'>(() => (localStorage.getItem('language') as 'en' | 'ur') || 'en');

  // Keep heartbeat active for user's online status
  useEffect(() => {
    if (!user || user.username === 'adminaccount') return;

    const updateLastSeen = () => {
      const db = storage.getUsersDB();
      const updatedDb = db.map(u => {
        if (u.username.toLowerCase() === user.username.toLowerCase()) {
          return { ...u, lastSeen: new Date().toISOString() };
        }
        return u;
      });
      localStorage.setItem('khan_traders_db', JSON.stringify(updatedDb));
    };

    updateLastSeen(); // initial
    const heartbeat = setInterval(updateLastSeen, 10000); // 10 seconds
    return () => clearInterval(heartbeat);
  }, [user?.username]);

  // Keep admin statistics refreshed
  useEffect(() => {
    if (!user.isAdmin) return;
    const interval = setInterval(() => {
      setAdminRefreshKey(prev => prev + 1);
    }, 5000); // auto refresh statistics every 5 seconds
    return () => clearInterval(interval);
  }, [user?.isAdmin, user?.username]);

  // Reset deposit confirmation when deposit modal is closed
  useEffect(() => {
    if (!showDepositModal) {
      setShowDepositConfirm(false);
    }
  }, [showDepositModal]);

  const [userSearch, setUserSearch] = useState('');
  const [selectedLogUser, setSelectedLogUser] = useState<string | null>(null);
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logActionFilter, setLogActionFilter] = useState<string>('all');
  const [logStartDate, setLogStartDate] = useState('');
  const [logEndDate, setLogEndDate] = useState('');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    if (selectedLogUser) {
      setLogSearchQuery(selectedLogUser);
    } else {
      setLogSearchQuery('');
      setLogActionFilter('all');
      setLogStartDate('');
      setLogEndDate('');
    }
  }, [selectedLogUser]);

  const stats = useMemo(() => {
    const allUsers = storage.getUsersDB().filter(u => u.username.toLowerCase() !== 'adminaccount');
    const totalUsers = allUsers.length;
    
    const onlineThreshold = 45 * 1000; // 45 seconds
    const now = Date.now();
    
    const onlineCount = allUsers.filter(u => {
      if (!u.lastSeen) return false;
      const age = now - new Date(u.lastSeen).getTime();
      return age < onlineThreshold;
    }).length;
    
    const offlineCount = Math.max(0, totalUsers - onlineCount);
    
    return {
      total: totalUsers,
      online: onlineCount,
      offline: offlineCount,
      allUsersList: allUsers
    };
  }, [adminRefreshKey, transactions]);

  const [txFilter, setTxFilter] = useState<'all' | 'deposit' | 'withdraw' | 'earning' | 'investment'>('all');
  const [depositForm, setDepositForm] = useState({ amount: '', tid: '' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', accountType: 'Easypaisa', accountNumber: '', accountName: '', bankName: '' });
  const [depositProof, setDepositProof] = useState<string | null>(null);

  const t = (key: keyof typeof translations.en, replace?: {[k: string]: string | number}) => {
    const str = translations[language]?.[key] || translations['en']?.[key] || '';
    if (replace) {
      let replacedStr = str;
      Object.entries(replace).forEach(([k, v]) => {
        replacedStr = replacedStr.replace(`{${k}}`, String(v));
      });
      return replacedStr;
    }
    return str;
  };

  // Auto-credit daily profits
  useEffect(() => {
    if (user.isAdmin) return;
    let updated = false;
    let totalEarningCredit = 0;
    const newEarningTxs: Transaction[] = [];

    const investments = transactions.filter(tx => tx.type === 'investment');

    investments.forEach(inv => {
      const plan = PLANS.find(p => p.price === Math.abs(inv.amount));
      if (!plan) return;

      const startMs = new Date(inv.date).getTime();
      const elapsedMs = Date.now() - startMs;
      const intervalMs = 24 * 60 * 60 * 1000; // 24 hours
      const rawElapsedCycles = Math.floor(elapsedMs / intervalMs);
      const completedCycles = Math.min(rawElapsedCycles, plan.duration);

      if (completedCycles <= 0) return;

      // Count existing earnings already claimed for this specific investment
      const claimedCount = transactions.filter(
        tx => tx.type === 'earning' && tx.investmentId === inv.id
      ).length;

      const missingPayments = completedCycles - claimedCount;
      if (missingPayments > 0) {
        for (let i = 1; i <= missingPayments; i++) {
          const cycleIndex = claimedCount + i;
          const payoutTime = new Date(startMs + cycleIndex * intervalMs).toISOString();
          const earningTx: Transaction = {
            id: `earn-${inv.id}-${cycleIndex}-${Math.random().toString(36).substr(2, 4)}`,
            type: 'earning',
            amount: plan.dailyProfit,
            date: payoutTime,
            status: 'success',
            investmentId: inv.id,
            username: inv.username || user.username,
            phone: inv.phone || user.phone
          };
          
          newEarningTxs.push(earningTx);
          totalEarningCredit += plan.dailyProfit;
        }
        updated = true;
      }
    });

    if (updated && (totalEarningCredit > 0 || newEarningTxs.length > 0)) {
      newEarningTxs.forEach(tx => storage.addTransaction(tx));
      storage.updateBalance(totalEarningCredit);
      setTransactions(getMyTransactions());
      refreshUserRef.current();
      showNotificationRef.current(`Added Rs. ${totalEarningCredit.toLocaleString()} daily profit from your active investments!`, 'success');
    }
  }, [transactions.length, user?.username, user?.phone]);

  const handleInvest = (plan: InvestmentPlan) => {
    if (user.balance < plan.price) {
      showNotification('Insufficient balance. Please deposit more.', 'error');
      return;
    }

    const tx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'investment',
      amount: -plan.price,
      date: new Date().toISOString(),
      status: 'success',
      username: user.username,
      phone: user.phone
    };

    storage.updateBalance(-plan.price);
    storage.addTransaction(tx);
    storage.addLog('plan_investment', user.username, `Invested Rs. ${plan.price.toLocaleString()} in ${plan.name}`);

    // Credit 10% commission to referrer if user is referred by someone
    if (user.referredBy) {
      const db = storage.getUsersDB();
      const referrerIndex = db.findIndex(u => u.username.toLowerCase() === user.referredBy?.toLowerCase());
      if (referrerIndex !== -1) {
        const commissionAmount = Math.floor(plan.price * 0.10); // 10% referral reward

        // 1. Update referrer's balance in user model DB
        db[referrerIndex].balance += commissionAmount;
        localStorage.setItem('khan_traders_db', JSON.stringify(db));

        // 2. Add Transaction object for referrer
        const commissionTx: Transaction = {
          id: `ref-com-${Math.random().toString(36).substr(2, 9)}`,
          type: 'earning',
          amount: commissionAmount,
          date: new Date().toISOString(),
          status: 'success',
          username: db[referrerIndex].username,
          phone: db[referrerIndex].phone,
          details: `10% commission from ${user.username}'s purchase in ${plan.name}`
        };
        storage.addTransaction(commissionTx);

        // 3. If the active user has the same username as the referrer, synchronize active user session model!
        const activeUser = storage.getUser();
        if (activeUser && activeUser.username.toLowerCase() === user.referredBy.toLowerCase()) {
          activeUser.balance += commissionAmount;
          storage.setUser(activeUser);
        }
      }
    }

    setTransactions(getMyTransactions());
    refreshUser();
    showNotification(`Successfully invested in ${plan.name}!`);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositForm.amount || !depositForm.tid || !depositProof) {
      showNotification('Please fill all fields and upload proof.', 'error');
      return;
    }

    const amount = parseInt(depositForm.amount);
    if (amount < 2000 || amount > 10000) {
      showNotification(t('minDepositLimit'), 'error');
      return;
    }

    setShowDepositConfirm(true);
  };

  const handleDepositConfirmSubmit = () => {
    const amount = parseInt(depositForm.amount);
    const tx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'deposit',
      amount: amount,
      date: new Date().toISOString(),
      status: 'pending', // Pending Admin approval
      username: user.username,
      phone: user.phone,
      details: `${selectedDepositMethod.toUpperCase()} | TID: ${depositForm.tid}`,
      tid: depositForm.tid,
      receiptImage: depositProof || undefined
    };
    
    // Balance is NOT updated now; Admin updates it upon approval!
    storage.addTransaction(tx);
    storage.addLog('deposit_request', user.username, `Requested deposit of Rs. ${amount.toLocaleString()} (TID: ${depositForm.tid})`);
    setTransactions(getMyTransactions());
    refreshUser();
    
    setShowDepositModal(false);
    setShowDepositConfirm(false);
    setDepositForm({ amount: '', tid: '' });
    setDepositProof(null);
    showNotification('Deposit request submitted! Admin will verify and approve.', 'success');
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(withdrawForm.amount);
    
    if (!amount || amount < 1500 || amount > 800000) {
      showNotification(t('minWithdrawLimit'), 'error');
      return;
    }

    if (user.balance < amount) {
      showNotification('Insufficient balance.', 'error');
      return;
    }

    const detailsStr = withdrawForm.accountType === 'Bank Transfer' 
      ? `${withdrawForm.bankName} - ${withdrawForm.accountNumber} (${withdrawForm.accountName})`
      : `${withdrawForm.accountType} - ${withdrawForm.accountNumber} (${withdrawForm.accountName})`;

    const tx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'withdraw',
      amount: -amount,
      date: new Date().toISOString(),
      status: 'pending', // Pending Admin approval
      username: user.username,
      phone: user.phone,
      details: detailsStr,
      accountType: withdrawForm.accountType,
      accountNumber: withdrawForm.accountNumber,
      accountName: withdrawForm.accountName,
      bankName: withdrawForm.accountType === 'Bank Transfer' ? withdrawForm.bankName : undefined
    };

    // Deduct immediately to hold funds, will refund if rejected
    storage.updateBalance(-amount);
    storage.addTransaction(tx);
    storage.addLog('withdraw_request', user.username, `Requested withdrawal of Rs. ${amount.toLocaleString()} to ${withdrawForm.accountType}`);
    setTransactions(getMyTransactions());
    refreshUser();
    
    setShowWithdrawModal(false);
    setWithdrawForm({ amount: '', accountType: 'Easypaisa', accountNumber: '', accountName: '', bankName: '' });
    showNotification('Withdrawal request submitted! Pending admin approval.', 'success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDepositProof(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApproveTransaction = (txId: string) => {
    const allTxs = storage.getTransactions();
    const index = allTxs.findIndex(t => t.id === txId);
    if (index === -1) return;

    const tx = allTxs[index];
    if (tx.status !== 'pending') {
      showNotification('Transaction has already been processed.', 'error');
      return;
    }

    tx.status = 'success';
    localStorage.setItem('khan_trader_transactions', JSON.stringify(allTxs));
    setTransactions(allTxs);

    // If it's a deposit, we need to add to user's balance
    if (tx.type === 'deposit') {
      const db = storage.getUsersDB();
      const userIndex = db.findIndex(u => u.username.toLowerCase() === tx.username?.toLowerCase());
      if (userIndex !== -1) {
        db[userIndex].balance += tx.amount;
        localStorage.setItem('khan_traders_db', JSON.stringify(db));
        
        // If the active user is the one receiving money, update active user session balance!
        const activeUser = storage.getUser();
        if (activeUser && activeUser.username.toLowerCase() === tx.username?.toLowerCase()) {
          activeUser.balance += tx.amount;
          storage.setUser(activeUser);
          refreshUser();
        }
      }
    }

    setAdminRefreshKey(p => p + 1);
    showNotification(`Approved ${tx.type} request of Rs. ${Math.abs(tx.amount).toLocaleString()}`, 'success');
  };

  const handleRejectTransaction = (txId: string) => {
    const allTxs = storage.getTransactions();
    const index = allTxs.findIndex(t => t.id === txId);
    if (index === -1) return;

    const tx = allTxs[index];
    if (tx.status !== 'pending') {
      showNotification('Transaction has already been processed.', 'error');
      return;
    }

    tx.status = 'failed';
    localStorage.setItem('khan_trader_transactions', JSON.stringify(allTxs));
    setTransactions(allTxs);

    // If it's a withdraw, refund deducted balance back to user
    if (tx.type === 'withdraw') {
      const db = storage.getUsersDB();
      const userIndex = db.findIndex(u => u.username.toLowerCase() === tx.username?.toLowerCase());
      if (userIndex !== -1) {
        const refundAmt = Math.abs(tx.amount);
        db[userIndex].balance += refundAmt;
        localStorage.setItem('khan_traders_db', JSON.stringify(db));

        // If the active user balance matches, update active user session balance
        const activeUser = storage.getUser();
        if (activeUser && activeUser.username.toLowerCase() === tx.username?.toLowerCase()) {
          activeUser.balance += refundAmt;
          storage.setUser(activeUser);
          refreshUser();
        }
      }
    }

    setAdminRefreshKey(p => p + 1);
    showNotification(`Rejected ${tx.type} request of Rs. ${Math.abs(tx.amount).toLocaleString()}`, 'error');
  };

  const totalInvested = useMemo(() => transactions
    .filter(tx => tx.type === 'investment')
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0), [transactions]);

  const dailyEarnings = useMemo(() => transactions
    .filter(tx => tx.type === 'investment')
    .reduce((sum, tx) => {
      const plan = PLANS.find(p => p.price === Math.abs(tx.amount));
      return sum + (plan ? plan.dailyProfit : 0);
    }, 0), [transactions]);

  if (user.isAdmin) {
    const pendingRequests = transactions.filter(tx => tx.status === 'pending');
    
    const filteredUsers = stats.allUsersList.filter(u => 
      u.username.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.phone.includes(userSearch)
    );

    const onlineThreshold = 45 * 1000; // 45s
    const now = Date.now();

    return (
      <div className="pb-12 pt-6 px-4 max-w-lg mx-auto bg-[#0a0a0a]" dir="ltr">
        {/* Header Block */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center text-black shadow-lg">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-white">Admin System</h1>
              <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">Verification Portal</p>
            </div>
          </div>
          <button 
             onClick={() => setShowLogoutConfirm(true)}
             className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-red-500/15 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* Info Stats Cards Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6 font-sans">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
            <span className="text-xl">👥</span>
            <span className="text-[10px] text-slate-405 font-medium mt-1 text-slate-400">Total Users</span>
            <span className="text-base font-bold text-white mt-0.5">{stats.total}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <span className="absolute top-1 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xl">🟢</span>
            <span className="text-[10px] text-slate-300 font-medium mt-1">Online</span>
            <span className="text-base font-bold text-emerald-400 mt-0.5">{stats.online}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
            <span className="text-xl">⚫</span>
            <span className="text-[10px] text-slate-405 font-medium mt-1 text-slate-400 font-sans">Offline</span>
            <span className="text-base font-bold mt-0.5 text-slate-400">{stats.offline}</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/5 p-1 rounded-xl mb-6 border border-white/5">
          <button
            onClick={() => setAdminActiveTab('pending')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${adminActiveTab === 'pending' ? 'bg-yellow-500 text-black shadow-md font-sans' : 'text-slate-400 hover:text-white font-sans'}`}
          >
            Pending Requests ({pendingRequests.length})
          </button>
          <button
            onClick={() => setAdminActiveTab('all-users')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${adminActiveTab === 'all-users' ? 'bg-yellow-500 text-black shadow-md font-sans' : 'text-slate-400 hover:text-white font-sans'}`}
          >
            All Users ({stats.total})
          </button>
          <button
            onClick={() => setAdminActiveTab('activity-logs')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${adminActiveTab === 'activity-logs' ? 'bg-yellow-500 text-black shadow-md font-sans' : 'text-slate-400 hover:text-white font-sans'}`}
          >
            Activity Logs
          </button>
        </div>

        {/* Tab Contents: Pending Requests */}
        {adminActiveTab === 'pending' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 font-sans">Verification Queue</h3>
            
            {pendingRequests.length === 0 ? (
              <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-[2rem] p-10 text-center text-slate-500 flex flex-col items-center justify-center">
                <ShieldCheck size={40} className="text-slate-600 mb-3" />
                <p className="text-sm font-bold text-slate-400">All Cleared!</p>
                <p className="text-xs text-slate-500 mt-1">No pending deposit or withdraw requests found.</p>
              </div>
            ) : (
              pendingRequests.map(tx => {
                const isDeposit = tx.type === 'deposit';
                return (
                  <div key={tx.id} className="bg-white/5 border border-white/10 rounded-[2rem] p-5 space-y-4 text-left">
                    {/* Header: Request details */}
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`inline-block text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${isDeposit ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {isDeposit ? 'DEPOSIT REQUEST' : 'WITHDRAW REQUEST'}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-2 font-sans">
                          User: <span className="text-yellow-500">{tx.username}</span>
                        </h4>
                        <p className="text-[11px] text-slate-400">Phone: {tx.phone}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-mono block">
                          {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          {new Date(tx.date).toLocaleDateString()}
                        </span>
                        <span className="text-base font-black text-white block mt-1 font-sans">
                          Rs. {Math.abs(tx.amount).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Transaction Metadata ID / Receipt Details / Bank */}
                    <div className="bg-black/45 rounded-xl p-3 border border-white/5 space-y-2">
                      {isDeposit ? (
                        <>
                          <div className="flex justify-between text-xs font-sans">
                            <span className="text-slate-500">Transaction ID (TID):</span>
                            <span className="font-bold text-yellow-500 font-mono select-all bg-white/5 px-2 py-0.5 rounded">{tx.tid || 'No TID info'}</span>
                          </div>
                          {tx.receiptImage ? (
                            <div className="mt-2 text-left">
                              <span className="block text-[10px] text-slate-500 mb-1 font-sans">Payment Receipt Screen:</span>
                              <div className="relative group w-32 h-32 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                                <img 
                                  src={tx.receiptImage} 
                                  className="w-full h-full object-cover cursor-zoom-in" 
                                  alt="Receipt Screenshot" 
                                  referrerPolicy="no-referrer"
                                  onClick={() => setZoomedImage(tx.receiptImage || null)}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold pointer-events-none">
                                  🔍 View Receipt
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-500 italic">No receipt image attached</div>
                          )}
                          <div className="text-[10px] text-slate-500 border-t border-white/5 pt-1 mt-1">
                            Raw Details: {tx.details}
                          </div>
                        </>
                      ) : (
                        <div className="space-y-1.5 text-xs text-left font-sans">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Account Type:</span>
                            <span className="font-bold text-white">{tx.accountType || 'Other'}</span>
                          </div>
                          {tx.bankName && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Bank Name:</span>
                              <span className="font-bold text-white">{tx.bankName}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Account Number:</span>
                            <span className="font-bold text-yellow-500 font-mono select-all bg-white/5 px-2 py-0.5 rounded">{tx.accountNumber || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Account Title / Name:</span>
                            <span className="font-bold text-white">{tx.accountName || 'N/A'}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 border-t border-white/5 pt-1 mt-1">
                            Raw Details / Destination: {tx.details}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-3.5 pt-1">
                      <button
                        onClick={() => handleRejectTransaction(tx.id)}
                        className="py-3 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 rounded-xl text-red-400 font-bold text-xs transition-all active:scale-95 cursor-pointer font-sans"
                      >
                        ❌ Reject
                      </button>
                      <button
                        onClick={() => handleApproveTransaction(tx.id)}
                        className="py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer font-sans"
                      >
                        ✅ Approve (Confirm)
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab Contents: All Registered Users */}
        {adminActiveTab === 'all-users' && (
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search user by name or phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none text-xs text-white placeholder:text-slate-500 focus:ring-1 focus:ring-yellow-500 font-sans"
              />
              {userSearch && (
                <button 
                  onClick={() => setUserSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 hover:text-white text-xs font-sans"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {filteredUsers.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6 font-sans">No users matched your search.</p>
              ) : (
                filteredUsers.map(u => {
                  const isOnline = u.lastSeen && (now - new Date(u.lastSeen).getTime() < onlineThreshold);
                  return (
                    <div key={u.username} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center hover:bg-white/[0.08] transition-all text-left">
                      <div>
                        <div className="flex items-center gap-1.5 font-sans">
                          <span className="font-bold text-sm text-white">{u.username}</span>
                          {isOnline ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                              ONLINE
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-white/5 text-slate-500 border border-white/5">
                              OFFLINE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 tracking-wide mt-0.5 font-sans">Phone: {u.phone}</p>
                        <p className="text-[9px] text-slate-500 font-sans">Joined: {new Date(u.joinDate).toLocaleDateString()}</p>
                        <button
                          onClick={() => {
                            setLogSearchQuery(u.username);
                            setAdminActiveTab('activity-logs');
                          }}
                          className="mt-2.5 px-3 py-1 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/10 hover:border-yellow-500/30 text-[10px] font-bold text-yellow-500 rounded-lg flex items-center gap-1 transition-all cursor-pointer font-sans"
                        >
                          <Clock size={12} />
                          <span>Activity Log</span>
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-sans">Balance</p>
                        <p className="text-sm font-extrabold text-yellow-500 mt-0.5 font-sans font-display">Rs. {u.balance.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab Contents: Activity Logs */}
        {adminActiveTab === 'activity-logs' && (
          <div className="space-y-4 text-left">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 font-sans">System Activity Logs</h3>
            
            {/* Filters Section */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3.5">
              {/* Text Search field */}
              <div>
                <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1 font-sans">Search Logs (User or details)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Search size={14} />
                  </span>
                  <input 
                    type="text" 
                    placeholder="Search username, Details, TID..." 
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl py-2 pl-9 pr-12 outline-none text-xs text-white placeholder:text-slate-500 focus:ring-1 focus:ring-yellow-500 font-sans"
                  />
                  {logSearchQuery && (
                    <button 
                      type="button"
                      onClick={() => setLogSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white font-bold font-sans"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Action Filter */}
              <div>
                <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1 font-sans">Filter by Action</label>
                <select
                  value={logActionFilter}
                  onChange={(e) => setLogActionFilter(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl py-2 px-3 outline-none text-xs text-slate-300 focus:ring-1 focus:ring-yellow-500 font-sans cursor-pointer"
                >
                  <option value="all" className="bg-[#121212] text-white">All Actions</option>
                  <option value="login" className="bg-[#121212] text-emerald-400">🔑 Logged In</option>
                  <option value="logout" className="bg-[#121212] text-slate-400">🚪 Logged Out</option>
                  <option value="deposit_request" className="bg-[#121212] text-blue-400">📥 Deposit Request</option>
                  <option value="withdraw_request" className="bg-[#121212] text-red-400">📤 Withdrawal Request</option>
                  <option value="plan_investment" className="bg-[#121212] text-yellow-400">💼 Invested in Plan</option>
                </select>
              </div>

              {/* Date range picker */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1 font-sans">Start Date</label>
                  <input 
                    type="date" 
                    value={logStartDate}
                    onChange={(e) => setLogStartDate(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl py-1.5 px-3 outline-none text-xs text-slate-300 focus:ring-1 focus:ring-yellow-500 font-sans cursor-pointer scheme-dark"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1 font-sans">End Date</label>
                  <input 
                    type="date" 
                    value={logEndDate}
                    onChange={(e) => setLogEndDate(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl py-1.5 px-3 outline-none text-xs text-slate-300 focus:ring-1 focus:ring-yellow-500 font-sans cursor-pointer scheme-dark"
                  />
                </div>
              </div>

              {/* Reset Filters button */}
              {(logSearchQuery || logActionFilter !== 'all' || logStartDate || logEndDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setLogSearchQuery('');
                    setLogActionFilter('all');
                    setLogStartDate('');
                    setLogEndDate('');
                  }}
                  className="w-full py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-xl font-bold text-xs border border-yellow-500/10 transition-colors font-sans cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            {/* Logs List Container */}
            <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
              {(() => {
                const allLogs = storage.getLogs();
                const filteredLogs = allLogs.filter(log => {
                  if (logSearchQuery.trim()) {
                    const q = logSearchQuery.toLowerCase();
                    const userMatch = log.username.toLowerCase().includes(q);
                    const actionMatch = log.action.toLowerCase().includes(q);
                    const detailsMatch = log.details && log.details.toLowerCase().includes(q);
                    if (!userMatch && !actionMatch && !detailsMatch) {
                      return false;
                    }
                  }

                  if (logActionFilter !== 'all') {
                    if (log.action !== logActionFilter) return false;
                  }

                  if (logStartDate) {
                    const start = new Date(logStartDate).getTime();
                    const logTime = new Date(log.timestamp).getTime();
                    if (logTime < start) return false;
                  }

                  if (logEndDate) {
                    const end = new Date(logEndDate + 'T23:59:59.999Z').getTime();
                    const logTime = new Date(log.timestamp).getTime();
                    if (logTime > end) return false;
                  }

                  return true;
                });

                if (filteredLogs.length === 0) {
                  return (
                    <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-[2rem] py-12 text-center text-slate-500">
                      <p className="text-xs font-bold text-slate-400 font-sans">No matching records</p>
                      <p className="text-[10px] text-slate-500 mt-1 font-sans">Try adjusting search query, filter action or date range selection.</p>
                    </div>
                  );
                }

                return filteredLogs.map(log => {
                  let actionName: string = log.action;
                  let colorClass = 'bg-slate-500/15 text-slate-400 border border-slate-500/10';
                  let iconStr = '⚡';

                  if (log.action === 'login') {
                    actionName = 'Logged In';
                    colorClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                    iconStr = '🔑';
                  } else if (log.action === 'logout') {
                    actionName = 'Logged Out';
                    colorClass = 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
                    iconStr = '🚪';
                  } else if (log.action === 'deposit_request') {
                    actionName = 'Deposit Request';
                    colorClass = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                    iconStr = '📥';
                  } else if (log.action === 'withdraw_request') {
                    actionName = 'Withdrawal Request';
                    colorClass = 'bg-red-500/10 text-red-400 border border-red-500/20';
                    iconStr = '📤';
                  } else if (log.action === 'plan_investment') {
                    actionName = 'Invested';
                    colorClass = 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/25';
                    iconStr = '💼';
                  }

                  return (
                    <div key={log.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2 text-left hover:bg-white/[0.07] transition-all font-sans">
                      <div className="flex justify-between items-center">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold ${colorClass}`}>
                          <span>{iconStr}</span>
                          <span>{actionName}</span>
                        </span>
                        <span className="text-[10px] text-yellow-500 font-extrabold">
                          {log.username}
                        </span>
                      </div>
                      <div className="flex justify-between items-end gap-2 pt-1">
                        <p className="text-xs text-slate-350 font-semibold text-slate-300">
                          {log.details || 'Performed transaction action'}
                        </p>
                        <span className="text-[9px] text-slate-500 font-mono whitespace-nowrap min-w-max pl-2">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                          {new Date(log.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* Global Logout Modal */}
        <AnimatePresence>
          {showLogoutConfirm && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 text-white">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setShowLogoutConfirm(false)}
                className="absolute inset-0 bg-black/85 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-sm bg-[#121212] rounded-[2.5rem] border border-white/10 p-8 shadow-2xl text-center z-50 animate-spring"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-500/25">
                  <LogOut size={22} className="rotate-180" />
                </div>
                <h3 className="text-lg font-bold text-white font-sans">Sign Out</h3>
                <p className="text-slate-400 text-xs mt-2 font-medium font-sans">Confirm logout from Administration System?</p>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <button 
                    onClick={() => setShowLogoutConfirm(false)}
                    className="py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs rounded-xl border border-white/5 transition-colors cursor-pointer font-sans animate-none"
                  >
                    No, stay
                  </button>
                  <button 
                    onClick={() => {
                      setShowLogoutConfirm(false);
                      onLogout();
                    }}
                    className="py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-500/10 transition-colors cursor-pointer font-sans"
                  >
                    Yes, Logout
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Activity Log Drawer / Modal */}
        <AnimatePresence>
          {selectedLogUser && (
            <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4 text-white">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setSelectedLogUser(null)}
                className="absolute inset-0 bg-black/85 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                className="relative w-full max-w-md bg-[#121212] rounded-[2.5rem] border border-white/10 p-6 md:p-8 shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh]"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedLogUser(null)}
                  className="absolute top-6 left-6 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>

                {/* Header Information */}
                <div className="text-left mt-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center text-black mb-3 select-none">
                    <HistoryIcon size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-white font-sans">
                    System Activity Logs
                  </h3>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">Filter action histories, timestamps & system details</p>
                </div>

                {/* Filters Section */}
                <div className="space-y-3 mb-4 border-b border-white/5 pb-4 text-left">
                  {/* Text Search field */}
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1 font-sans">Search Logs (User or details)</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Username, details, TID..." 
                        value={logSearchQuery}
                        onChange={(e) => setLogSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 outline-none text-xs text-white placeholder:text-slate-500 focus:ring-1 focus:ring-yellow-500 font-sans"
                      />
                      {logSearchQuery && (
                        <button 
                          type="button"
                          onClick={() => setLogSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white font-bold font-sans"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Grid for Action type selector & Reset */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1 font-sans">Filter by Action</label>
                      <select
                        value={logActionFilter}
                        onChange={(e) => setLogActionFilter(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-2.5 outline-none text-xs text-slate-300 focus:ring-1 focus:ring-yellow-500 font-sans cursor-pointer"
                      >
                        <option value="all" className="bg-[#121212] text-white">All Actions</option>
                        <option value="login" className="bg-[#121212] text-white">🔑 Logged In</option>
                        <option value="logout" className="bg-[#121212] text-white">🚪 Logged Out</option>
                        <option value="deposit_request" className="bg-[#121212] text-white">📥 Deposit Request</option>
                        <option value="withdraw_request" className="bg-[#121212] text-white">📤 Withdrawal Request</option>
                        <option value="plan_investment" className="bg-[#121212] text-white">💼 Invested in Plan</option>
                      </select>
                    </div>

                    <div className="flex flex-col justify-end">
                      {(logSearchQuery || logActionFilter !== 'all' || logStartDate || logEndDate) ? (
                        <button
                          type="button"
                          onClick={() => {
                            setLogSearchQuery('');
                            setLogActionFilter('all');
                            setLogStartDate('');
                            setLogEndDate('');
                          }}
                          className="w-full py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-xl font-bold text-xs border border-yellow-500/10 transition-colors font-sans cursor-pointer whitespace-nowrap"
                        >
                          Reset Filters
                        </button>
                      ) : (
                        <div className="text-[10px] text-slate-500 italic text-right self-center pb-2">Active filters logic applied</div>
                      )}
                    </div>
                  </div>

                  {/* Date range picker */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1 font-sans">Start Date</label>
                      <input 
                        type="date" 
                        value={logStartDate}
                        onChange={(e) => setLogStartDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-1.5 px-2 outline-none text-xs text-slate-300 focus:ring-1 focus:ring-yellow-500 font-sans cursor-pointer scheme-dark"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1 font-sans">End Date</label>
                      <input 
                        type="date" 
                        value={logEndDate}
                        onChange={(e) => setLogEndDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-1.5 px-2 outline-none text-xs text-slate-300 focus:ring-1 focus:ring-yellow-500 font-sans cursor-pointer scheme-dark"
                      />
                    </div>
                  </div>
                </div>

                {/* Logs List Container */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-left scrollbar-none">
                  {(() => {
                    const allLogs = storage.getLogs();
                    const filteredLogs = allLogs.filter(log => {
                      // Text search (username, details, action Type)
                      if (logSearchQuery.trim()) {
                        const q = logSearchQuery.toLowerCase();
                        const userMatch = log.username.toLowerCase().includes(q);
                        const actionMatch = log.action.toLowerCase().includes(q);
                        const detailsMatch = log.details && log.details.toLowerCase().includes(q);
                        if (!userMatch && !actionMatch && !detailsMatch) {
                          return false;
                        }
                      }

                      // Action filter
                      if (logActionFilter !== 'all') {
                        if (log.action !== logActionFilter) return false;
                      }

                      // Start date filter
                      if (logStartDate) {
                        const start = new Date(logStartDate).getTime();
                        const logTime = new Date(log.timestamp).getTime();
                        if (logTime < start) return false;
                      }

                      // End date filter (to end-of-day comparison)
                      if (logEndDate) {
                        const end = new Date(logEndDate + 'T23:59:59.999Z').getTime();
                        const logTime = new Date(log.timestamp).getTime();
                        if (logTime > end) return false;
                      }

                      return true;
                    });

                    if (filteredLogs.length === 0) {
                      return (
                        <div className="py-12 text-center text-slate-500">
                          <p className="text-xs font-bold text-slate-400 font-sans">No matching records</p>
                          <p className="text-[10px] text-slate-500 mt-1 font-sans">Try adjusting search key, filter type or date range selection.</p>
                        </div>
                      );
                    }
                    return filteredLogs.map(log => {
                      let actionName: string = log.action;
                      let colorClass = 'bg-slate-500/15 text-slate-400 border border-slate-500/10';
                      let iconStr = '⚡';

                      if (log.action === 'login') {
                        actionName = 'Logged In';
                        colorClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                        iconStr = '🔑';
                      } else if (log.action === 'logout') {
                        actionName = 'Logged Out';
                        colorClass = 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
                        iconStr = '🚪';
                      } else if (log.action === 'deposit_request') {
                        actionName = 'Deposit Request';
                        colorClass = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                        iconStr = '📥';
                      } else if (log.action === 'withdraw_request') {
                        actionName = 'Withdrawal Request';
                        colorClass = 'bg-red-500/10 text-red-400 border border-red-500/20';
                        iconStr = '📤';
                      } else if (log.action === 'plan_investment') {
                        actionName = 'Invested';
                        colorClass = 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
                        iconStr = '💼';
                      }

                      return (
                        <div key={log.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-3.5 space-y-1">
                          <div className="flex justify-between items-center font-sans">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${colorClass}`}>
                              <span>{iconStr}</span>
                              <span>{actionName}</span>
                            </span>
                            <span className="text-[9px] text-yellow-500/80 font-semibold font-sans">
                              {log.username}
                            </span>
                          </div>
                          <div className="flex justify-between items-end pt-1">
                            <p className="text-xs text-slate-300 font-semibold font-sans">
                              {log.details || 'Performed system action'}
                            </p>
                            <span className="text-[8px] text-slate-500 font-mono whitespace-nowrap min-w-max pl-2">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                              {new Date(log.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Footer close */}
                <button
                  onClick={() => setSelectedLogUser(null)}
                  className="mt-4 w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs rounded-xl border border-white/5 transition-colors cursor-pointer font-sans shrink-0"
                >
                  Close History
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Zoomed Image Receipt Modal */}
        <AnimatePresence>
          {zoomedImage && (
            <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setZoomedImage(null)}
                className="absolute inset-0 bg-black/95 backdrop-blur-md cursor-zoom-out"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative max-w-full max-h-[90vh] z-[140] overflow-hidden flex flex-col items-center justify-center"
              >
                <img 
                  src={zoomedImage} 
                  className="max-w-full max-h-[80vh] rounded-2xl object-contain border border-white/10 shadow-2xl" 
                  alt="Zoomed Payment Receipt" 
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => setZoomedImage(null)}
                  className="mt-4 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-xs border border-white/10 transition-colors cursor-pointer"
                >
                  Close View
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="pb-36 pt-4 px-4 max-w-lg mx-auto" dir={language === 'ur' ? 'rtl' : 'ltr'}>
      {/* Deposit Modal */}
      <AnimatePresence>
        {showDepositModal && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 text-white">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowDepositModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-md bg-[#121212] rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-white/10 p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white font-display">
                  {showDepositConfirm ? t('confirmDepositTitle') : t('makeADeposit')}
                </h3>
                <button 
                  type="button"
                  onClick={() => {
                    setShowDepositModal(false);
                    setShowDepositConfirm(false);
                  }} 
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              {showDepositConfirm ? (
                /* Confirmation Screen Step */
                <div className="space-y-6">
                  <p className="text-xs text-slate-400 leading-relaxed text-left">
                    {t('reviewDetailsPrompt')}
                  </p>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                    {/* Method */}
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-slate-400 text-xs">{t('methodLabel')}</span>
                      <span className="text-white font-bold text-sm">
                        {selectedDepositMethod === 'easypaisa' ? 'Easypaisa / ایزی پیسہ' : 'MCB Bank / ایم سی بی بینک'}
                      </span>
                    </div>

                    {/* Amount */}
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-slate-400 text-xs">{t('pkrAmount')}</span>
                      <span className="text-yellow-500 font-extrabold text-base">
                        Rs. {parseInt(depositForm.amount).toLocaleString()}
                      </span>
                    </div>

                    {/* TID */}
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-slate-400 text-xs">{t('enteredTid')}</span>
                      <span className="text-white font-mono font-bold text-sm select-all">
                        {depositForm.tid}
                      </span>
                    </div>

                    {/* Proof Receipt Attachment thumbnail */}
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-slate-400 text-xs">{t('receiptUploaded')}</span>
                      <div className="flex items-center gap-2">
                        {depositProof && (
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 shrink-0">
                            <img src={depositProof} className="w-full h-full object-cover" alt="Proof Thumbnail" />
                          </div>
                        )}
                        <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 size={14} /> {language === 'ur' ? 'منسلک ہے' : 'Yes'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Warning notice */}
                  <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-4 text-center leading-relaxed">
                    <p className="text-[11px] text-yellow-500 font-medium leading-relaxed">
                      {t('depositReviewNote')}
                    </p>
                  </div>

                  {/* Operational Action Buttons */}
                  <div className="flex flex-col gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleDepositConfirmSubmit}
                      className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-4 rounded-2xl font-bold shadow-lg shadow-yellow-500/20 active:scale-[0.98] transition-all text-xs cursor-pointer text-center"
                    >
                      {t('confirmAndSubmit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDepositConfirm(false)}
                      className="w-full bg-white/5 hover:bg-white/10 text-slate-300 py-4 rounded-2xl font-bold border border-white/5 active:scale-[0.98] transition-all text-xs cursor-pointer text-center"
                    >
                      {t('backToEdit')}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Urdu Instructions Banner */}
                  <div dir="rtl" className="bg-[#121212]/90 border border-yellow-500/20 rounded-2xl p-4 mb-6 leading-relaxed select-none shadow-md shadow-black/30 text-right">
                    <p className="text-yellow-400 font-bold text-xs md:text-[13px] leading-relaxed">
                      اگر آپ کے پاس ایزی پیسہ ہے تو ایزی پیسہ پر پیمنٹ بھیج دیں، اور اگر کوئی دوسرا والیٹ یا بینک اکاؤنٹ ہے تو اس بینک پر پیمنٹ بھیج دیں۔ اگر ایزی پیسہ پر پیمنٹ سینڈ نہیں ہو رہی تو پھر بینک اکاؤنٹ پر پیمنٹ بھیج دیں۔
                    </p>
                  </div>

                  {/* Select Deposit Method Option */}
                  <div className="mb-6">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 text-left">
                      {language === 'ur' ? 'ڈپازٹ کا طریقہ منتخب کریں' : 'Select Deposit Method'}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedDepositMethod('easypaisa')}
                        className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-1 w-full text-center ${
                          selectedDepositMethod === 'easypaisa'
                            ? 'bg-gradient-to-tr from-yellow-500/15 to-yellow-500/5 border-yellow-500 text-white'
                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-sm font-bold">Easypaisa</span>
                        <span className="text-[10px] opacity-60">Instant Upload</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDepositMethod('mcb')}
                        className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-1 w-full text-center ${
                          selectedDepositMethod === 'mcb'
                            ? 'bg-gradient-to-tr from-yellow-500/15 to-yellow-500/5 border-yellow-500 text-white'
                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-sm font-bold">MCB Bank</span>
                        <span className="text-[10px] opacity-60">Bank Transfer</span>
                      </button>
                    </div>
                  </div>

                  {/* Admin Account Details */}
                  <div className="bg-yellow-500/10 p-5 rounded-2xl border border-yellow-500/20 mb-8 select-none">
                    <p className="text-yellow-500 text-[12px] font-black uppercase tracking-widest mb-3 text-center">
                      {selectedDepositMethod === 'easypaisa' ? 'Easypaisa Details' : 'MCB Bank Details'}
                    </p>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center bg-black/25 p-3 rounded-xl gap-2">
                        <span className="text-slate-400 text-xs shrink-0">{language === 'ur' ? 'طریقہ کار' : 'Method'}</span>
                        <span className="text-white font-bold text-xs md:text-sm text-right">
                          {selectedDepositMethod === 'easypaisa' ? 'Easypaisa / ایزی پیسہ' : 'MCB Bank / ایم سی بی بینک'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center bg-black/25 p-3 rounded-xl gap-2">
                        <span className="text-slate-400 text-xs shrink-0">{language === 'ur' ? 'اکاؤنٹ نام' : 'Holder'}</span>
                        <span className="text-white font-bold text-xs md:text-sm text-right">Jan Muhammad</span>
                      </div>

                      <div className="flex justify-between items-center bg-black/25 p-3 rounded-xl gap-2">
                        <span className="text-slate-400 text-xs shrink-0">
                          {selectedDepositMethod === 'easypaisa' ? (language === 'ur' ? 'نمبر' : 'Number') : 'IBAN'}
                        </span>
                        <div className="flex items-center gap-2 max-w-[70%] justify-end text-right">
                          <span className="text-yellow-500 font-bold text-xs md:text-sm select-all break-all leading-normal">
                            {selectedDepositMethod === 'easypaisa' ? '03439255559' : 'PK29MUCB0971879791004737'}
                          </span>
                          <button 
                            type="button"
                            onClick={() => {
                              const valueToCopy = selectedDepositMethod === 'easypaisa' ? '03439255559' : 'PK29MUCB0971879791004737';
                              navigator.clipboard.writeText(valueToCopy);
                              showNotification(t('copied'));
                            }}
                            className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg text-slate-300 font-bold shrink-0 transition-all active:scale-95"
                          >
                            {t('copy')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleDepositSubmit} className="space-y-5">
                    <div>
                      <label className="text-slate-500 text-[10px] font-bold uppercase tracking-wide mb-2 block flex justify-between">
                        <span>{t('amountPkr')}</span>
                        <span className="text-yellow-500/50">{t('depositReceiptMinMax')}</span>
                      </label>
                      <input 
                        required
                        type="number"
                        min="2000"
                        max="10000"
                        placeholder={t('enterAmount')}
                        value={depositForm.amount}
                        onChange={(e) => setDepositForm({...depositForm, amount: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="text-slate-500 text-[10px] font-bold uppercase tracking-wide mb-2 block">{t('transactionId')}</label>
                      <input 
                        required
                        type="text"
                        placeholder={t('pasteTid')}
                        value={depositForm.tid}
                        onChange={(e) => setDepositForm({...depositForm, tid: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-slate-500 text-[10px] font-bold uppercase tracking-wide mb-2 block">{t('transactionReceipt')}</label>
                      <div className="relative">
                        <input 
                          required
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="proof-upload"
                        />
                        <label 
                          htmlFor="proof-upload"
                          className="w-full h-32 bg-white/5 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition-all overflow-hidden relative"
                        >
                          {depositProof ? (
                            <>
                              <img src={depositProof} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="Proof" />
                              <CheckCircle2 className="text-yellow-500 z-10" />
                              <span className="text-white text-xs font-bold z-10">Image Selected</span>
                            </>
                          ) : (
                            <>
                              <Camera className="text-slate-500" />
                              <span className="text-slate-500 text-xs font-medium">{t('clickToUpload')}</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-4 rounded-2xl font-bold shadow-lg shadow-yellow-500/20 active:scale-95 transition-all mt-4"
                    >
                      {t('confirmDeposit')}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 text-white">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowWithdrawModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-md bg-[#121212] rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-white/10 p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white font-display">{t('withdrawFunds')}</h3>
                <button 
                  type="button"
                  onClick={() => setShowWithdrawModal(false)} 
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-yellow-500/10 p-5 rounded-2xl border border-yellow-500/20 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs">{t('availableForWithdrawal')}</span>
                  <span className="text-white font-bold text-lg">Rs. {user.balance.toLocaleString()}</span>
                </div>
              </div>

              <form onSubmit={handleWithdrawSubmit} className="space-y-5">
                <div>
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-wide mb-2 block">{t('withdrawalMethod')}</label>
                  <div className="grid grid-cols-3 gap-2 w-full">
                    {[
                      { value: 'Easypaisa', label: 'Easypaisa', sub: language === 'ur' ? 'ایزی پیسہ' : 'Easy Wallet' },
                      { value: 'JazzCash', label: 'JazzCash', sub: language === 'ur' ? 'جیز کیش' : 'Jazz Wallet' },
                      { value: 'Bank Transfer', label: 'Bank Transfer', sub: language === 'ur' ? 'بینک ٹرانسفر' : 'Direct Bank' }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setWithdrawForm({...withdrawForm, accountType: opt.value})}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 w-full text-center group ${
                          withdrawForm.accountType === opt.value
                            ? 'bg-gradient-to-tr from-yellow-500/15 to-yellow-500/5 border-yellow-500 text-white shadow-lg shadow-yellow-500/5'
                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-300'
                        }`}
                      >
                        <span className="text-[11px] md:text-xs font-black tracking-tight">{opt.label}</span>
                        <span className={`text-[8px] tracking-wide transition-colors ${
                          withdrawForm.accountType === opt.value ? 'text-yellow-400/80 font-bold' : 'text-slate-500 group-hover:text-slate-400'
                        }`}>{opt.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {withdrawForm.accountType === 'Bank Transfer' && (
                  <div>
                    <label className="text-slate-500 text-[10px] font-bold uppercase tracking-wide mb-2 block">{t('bankNameField')}</label>
                    <input 
                      required
                      type="text"
                      placeholder={t('enterBankName')}
                      value={withdrawForm.bankName}
                      onChange={(e) => setWithdrawForm({...withdrawForm, bankName: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-wide mb-2 block">
                    {withdrawForm.accountType === 'Bank Transfer' ? t('accountNumberIban') : t('easypaisaJazzcashNum')}
                  </label>
                  <input 
                    required
                    type="text"
                    placeholder={withdrawForm.accountType === 'Bank Transfer' ? t('enterIbanOrAcc') : t('enterMobileNum')}
                    value={withdrawForm.accountNumber}
                    onChange={(e) => setWithdrawForm({...withdrawForm, accountNumber: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-wide mb-2 block">{t('accountHolderName')}</label>
                  <input 
                    required
                    type="text"
                    placeholder={t('enterAccName')}
                    value={withdrawForm.accountName}
                    onChange={(e) => setWithdrawForm({...withdrawForm, accountName: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-wide mb-2 block flex justify-between">
                    <span>{t('amountPkr')}</span>
                    <span className="text-yellow-500/50">{t('withdrawReceiptMinMax')}</span>
                  </label>
                  <input 
                    required
                    type="number"
                    min="1500"
                    max="800000"
                    placeholder={t('enterAmount')}
                    value={withdrawForm.amount}
                    onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                  />
                </div>

                <div className="pt-2">
                  <p className="text-[10px] text-slate-500 text-center mb-4">{t('withdrawalTimeNote')}</p>
                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-4 rounded-2xl font-bold shadow-lg shadow-yellow-500/20 active:scale-95 transition-all"
                  >
                    {t('confirmWithdraw')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 text-white">
            {/* Backdrop with elegant blur */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
              className="relative w-full max-w-sm bg-[#0e0e0e]/95 border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_25px_50px_rgba(0,0,0,0.8)] text-center z-10 overflow-hidden"
            >
              {/* Warning/Logout Red Ambient Icon */}
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto mb-4 shadow-lg shadow-red-500/5 select-none animate-pulse">
                <LogOut size={26} />
              </div>

              {/* Title Section */}
              <h3 className="text-lg md:text-xl font-black bg-gradient-to-r from-red-400 to-amber-500 bg-clip-text text-transparent leading-relaxed tracking-wide mb-2 select-none">
                {t('logoutConfirmTitle')}
              </h3>

              {/* Description paragraph */}
              <p className="text-xs text-slate-400 leading-relaxed mb-6 px-1.5 font-sans">
                {t('logoutConfirmDesc')}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onLogout();
                  }}
                  className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all text-xs cursor-pointer"
                >
                  {t('yesLogout')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-3.5 rounded-2xl border border-white/5 active:scale-[0.99] transition-all text-xs cursor-pointer"
                >
                  {t('cancel')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar Navigation Drawer */}
      <AnimatePresence>
        {showSidebar && (
          <div className="fixed inset-0 z-50 flex overflow-hidden text-white">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-xs bg-[#0c0c0c] border-r border-white/10 h-full p-6 flex flex-col justify-between shadow-2xl z-50 overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-400 to-yellow-600 flex items-center justify-center text-black shadow font-bold font-display">
                      K
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-sm text-white leading-none">Khan Trader</h4>
                      <span className="text-[9px] text-yellow-500 font-bold uppercase tracking-wider">Navigation</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowSidebar(false)} 
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                  <p className="text-slate-400 text-xs font-sans">Welcome Back,</p>
                  <p className="font-bold font-display text-white text-base truncate">{user.username}</p>
                  <div className="mt-2 inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                    <ShieldCheck size={10} /> Verified Wallet
                  </div>
                </div>

                <CountdownWidget transactions={transactions} language={language} />

                <div className="space-y-1">
                  <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest pl-2 mb-2 block">Core Services</span>
                  
                  <button 
                    onClick={() => {
                      setActiveTab('home');
                      setShowSidebar(false);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all ${activeTab === 'home' ? 'bg-yellow-500/10 text-yellow-500 font-bold' : 'hover:bg-white/5 text-slate-400 font-semibold'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Home size={18} />
                      <span className="text-sm">Dashboard</span>
                    </div>
                    <ChevronRight size={14} className="opacity-50" />
                  </button>

                  <button 
                    onClick={() => {
                      setActiveTab('plans');
                      setShowSidebar(false);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all ${activeTab === 'plans' ? 'bg-yellow-500/10 text-yellow-500 font-bold' : 'hover:bg-white/5 text-slate-400 font-semibold'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Briefcase size={18} />
                      <span className="text-sm">Investment Plans</span>
                    </div>
                    <ChevronRight size={14} className="opacity-50" />
                  </button>

                  <button 
                    onClick={() => {
                      setShowHistoryModal(true);
                      setShowSidebar(false);
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-white/5 text-slate-400 font-semibold transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <HistoryIcon size={18} />
                      <span className="text-sm">Transaction History</span>
                    </div>
                    <ChevronRight size={14} className="opacity-50" />
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest pl-2 block">Quick Actions</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button 
                      onClick={() => {
                        setShowDepositModal(true);
                        setShowSidebar(false);
                      }}
                      className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-3 rounded-xl font-bold text-xs active:scale-95 transition-all"
                    >
                      <PlusCircle size={14} />
                      <span>Deposit</span>
                    </button>
                    <button 
                      onClick={() => {
                        setShowWithdrawModal(true);
                        setShowSidebar(false);
                      }}
                      className="flex items-center justify-center gap-1.5 bg-white/5 border border-white/10 text-white hover:bg-white/10 py-3 rounded-xl font-bold text-xs active:scale-95 transition-all"
                    >
                      <ArrowUpCircle size={14} />
                      <span>Withdraw</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 mt-auto">
                <button 
                  onClick={() => {
                    setShowLogoutConfirm(true);
                    setShowSidebar(false);
                  }}
                  className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut size={14} />
                  <span>{t('logout')}</span>
                </button>
                <div className="text-center text-[8px] text-slate-600 font-sans mt-3">
                  Khan Trader’s Premium v2.1
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transaction History Modal with filter tabs */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 text-white">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowHistoryModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-md bg-[#121212] rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-white/10 p-6 shadow-2xl overflow-y-auto max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-4 shrink-0">
                <div>
                  <h3 className="text-xl font-bold text-white font-display">Wallet History</h3>
                  <p className="text-xs text-slate-500">Record of your balance uploads, withdraws & daily earnings</p>
                </div>
                <button 
                  onClick={() => setShowHistoryModal(false)} 
                  className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-4 scrollbar-none shrink-0 border-b border-white/5 mb-4">
                {(['all', 'deposit', 'withdraw', 'earning', 'investment'] as const).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setTxFilter(filter)}
                    className={`px-3 focus:outline-none transition-all py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap ${
                      txFilter === filter 
                        ? 'bg-yellow-500 text-black shadow' 
                        : 'bg-white/5 hover:bg-white/10 text-slate-400'
                    }`}
                  >
                    {filter === 'all' 
                      ? t('all') 
                      : filter === 'deposit' 
                      ? t('deposits') 
                      : filter === 'withdraw' 
                      ? t('withdrawals') 
                      : filter === 'earning' 
                      ? t('earnings') 
                      : t('investments')}
                  </button>
                ))}
              </div>

              <div className="space-y-3 overflow-y-auto pr-1 flex-1 min-h-[300px] max-h-[50vh]">
                {(() => {
                  const filtered = txFilter === 'all' ? transactions : transactions.filter(t => t.type === txFilter);
                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <HistoryIcon className="mx-auto text-slate-600 mb-2" size={32} />
                        <p className="text-slate-500 text-xs font-medium">No records found.</p>
                      </div>
                    );
                  }
                  return filtered.map((tx) => (
                    <div key={tx.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          tx.type === 'deposit' ? 'bg-yellow-500/10 text-yellow-500' : 
                          tx.type === 'withdraw' ? 'bg-red-500/10 text-red-500' : 
                          tx.type === 'earning' ? 'bg-emerald-500/10 text-emerald-500' :
                          'bg-blue-500/10 text-blue-500'
                        }`}>
                          {tx.type === 'deposit' ? <ArrowDownCircle size={18} /> : 
                           tx.type === 'withdraw' ? <ArrowUpCircle size={18} /> : 
                           tx.type === 'earning' ? <TrendingUp size={18} /> :
                           <Briefcase size={18} />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white capitalize">
                            {tx.type === 'earning' ? 'Daily Profit' : tx.type}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${tx.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {tx.amount > 0 ? '+' : ''}Rs. {Math.abs(tx.amount).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{tx.status}</p>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Language Selection Modal */}
      <AnimatePresence>
        {showLanguageModal && (
          <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 text-white">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowLanguageModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-sm bg-[#121212] rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-white/10 p-6 shadow-2xl overflow-y-auto max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                  <h3 className="text-xl font-bold text-white font-display">{t('selectLanguage')}</h3>
                </div>
                <button 
                  onClick={() => setShowLanguageModal(false)} 
                  className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setLanguage('en');
                    localStorage.setItem('language', 'en');
                    setShowLanguageModal(false);
                    showNotification('Language changed to English', 'success');
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    language === 'en'
                      ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500 font-bold'
                      : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🇬🇧</span>
                    <span>{t('english')}</span>
                  </div>
                  {language === 'en' && <CheckCircle2 size={18} className="text-yellow-500" />}
                </button>

                <button
                  onClick={() => {
                    setLanguage('ur');
                    localStorage.setItem('language', 'ur');
                    setShowLanguageModal(false);
                    showNotification('زبان اردو میں تبدیل کر دی گئی ہے', 'success');
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    language === 'ur'
                      ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500 font-bold'
                      : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🇵🇰</span>
                    <span>{t('urdu')}</span>
                  </div>
                  {language === 'ur' && <CheckCircle2 size={18} className="text-yellow-500" />}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setShowSidebar(true)}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95"
            title="Open Menu"
          >
            <Menu size={20} />
          </button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 to-yellow-600 flex items-center justify-center text-black shadow-lg overflow-hidden">
             <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight text-white">Khan Trader’s</h1>
            <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">{t('verifiedMember')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 shadow-sm flex items-center justify-center text-slate-400 relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-yellow-500 rounded-full border-2 border-[#0a0a0a]"></span>
          </button>
          <button 
             onClick={() => setShowLogoutConfirm(true)}
             className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Welcome & Balance Card */}
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#000000] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl border border-white/5">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <Wallet size={120} />
              </div>
              <div className="relative">
                <p className="text-slate-400 text-sm font-medium">{t('availableBalance')}</p>
                <div className="flex items-center gap-2 mt-1">
                  <h2 className="text-4xl font-bold font-display text-white">Rs. {user.balance.toLocaleString()}</h2>
                  <div className="bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide">PKR</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <button 
                    onClick={() => setShowDepositModal(true)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-3.5 rounded-2xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
                  >
                    <PlusCircle size={18} />
                    <span>{t('deposit')}</span>
                  </button>
                  <button 
                    onClick={() => setShowWithdrawModal(true)}
                    className="flex items-center justify-center gap-2 bg-white/5 backdrop-blur-md text-white border border-white/10 py-3.5 rounded-2xl font-bold hover:bg-white/10 active:scale-95 transition-all"
                  >
                    <ArrowUpCircle size={18} />
                    <span>{t('withdraw')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium font-sans">{t('totalProfit')}</p>
                  <p className="font-bold text-white text-lg font-display">+Rs. {dailyEarnings.toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0">
                  <UsersIcon size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium font-sans">{t('myReferrals')}</p>
                  <p className="font-bold text-white text-lg font-display">{user.referrals}</p>
                </div>
              </div>
            </div>

            {/* Section Header */}
            <div className="flex items-center justify-between pt-2 text-white">
              <h3 className="font-bold text-white text-lg">{t('recentActivity')}</h3>
              <button 
                onClick={() => setShowHistoryModal(true)}
                className="text-yellow-500 text-sm font-bold flex items-center gap-1 hover:underline transition-all active:scale-95"
              >
                {t('viewAll')} <ChevronRight size={16} />
              </button>
            </div>

            {/* Transactions List */}
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-10 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                   <HistoryIcon className="mx-auto text-slate-600 mb-2" size={32} />
                   <p className="text-slate-500 text-sm">{t('noTransactions')}</p>
                </div>
              ) : (
                transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        tx.type === 'deposit' ? 'bg-yellow-500/10 text-yellow-500' : 
                        tx.type === 'withdraw' ? 'bg-red-500/10 text-red-500' : 
                        tx.type === 'earning' ? 'bg-emerald-500/10 text-emerald-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {tx.type === 'deposit' ? <ArrowDownCircle size={20} /> : 
                         tx.type === 'withdraw' ? <ArrowUpCircle size={20} /> : 
                         tx.type === 'earning' ? <TrendingUp size={20} /> :
                         <Briefcase size={20} />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white capitalize">
                          {tx.type === 'earning' ? 'Daily Profit' : tx.type}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {new Date(tx.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${tx.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {tx.amount > 0 ? '+' : ''}Rs. {Math.abs(tx.amount).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">{tx.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'plans' && (
          <motion.div
            key="plans"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
             <div className="text-center mb-8">
               <h2 className="text-2xl font-bold text-white font-display">{t('activePlans')}</h2>
               <p className="text-slate-500 text-sm">{t('growWealth')}</p>
             </div>

             <div className="grid grid-cols-1 gap-6">
                {PLANS.map((plan) => (
                  <div 
                    key={plan.id}
                    className="group relative bg-white/5 rounded-[2.5rem] p-1 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/10 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          plan.level === 'Basic' ? 'bg-white/10 text-slate-400' :
                          plan.level === 'Silver' ? 'bg-slate-700/30 text-slate-300' :
                          plan.level === 'Gold' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {plan.level} {t('level')}
                        </div>
                        <div className="flex items-center gap-1 text-yellow-500">
                          {[...Array(plan.level === 'VIP' ? 4 : plan.level === 'Gold' ? 3 : 2)].map((_, i) => (
                            <Star key={i} size={14} fill="currentColor" />
                          ))}
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-white font-display mb-1">{plan.name}</h3>
                      <p className="text-slate-500 text-xs mb-6">
                        {plan.duration >= 9999 ? (language === 'ur' ? 'مدت: تاحیات' : 'Duration: Lifetime') : t('durationDays', { days: plan.duration })}
                      </p>

                      <div className="flex items-end justify-between">
                         <div>
                           <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wide">{t('investment')}</p>
                           <p className="text-2xl font-bold text-white font-display">Rs. {plan.price}</p>
                         </div>
                         <div className="text-right">
                           <p className="text-yellow-500 text-[10px] font-bold uppercase tracking-wide">{t('dailyProfit')}</p>
                           <p className="text-2xl font-bold text-yellow-500 font-display">Rs. {plan.dailyProfit}</p>
                         </div>
                      </div>

                      <button 
                        onClick={() => handleInvest(plan)}
                        className={`w-full mt-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                          user.balance >= plan.price 
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700 shadow-lg shadow-yellow-500/20' 
                            : 'bg-white/5 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                         <Zap size={18} />
                         <span>{t('investNow')}</span>
                      </button>
                    </div>
                  </div>
                ))}
             </div>
          </motion.div>
        )}

        {activeTab === 'team' && (
          <motion.div
            key="team"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
             <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-sm text-center">
                <div className="w-20 h-20 bg-yellow-500/10 rounded-[2rem] flex items-center justify-center text-yellow-500 mx-auto mb-6">
                  <UsersIcon size={40} />
                </div>
                <h2 className="text-2xl font-bold text-white font-display mb-2">{t('referralProgram')}</h2>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                  {t('referralProgramDesc')}
                </p>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-8 overflow-hidden">
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 text-left">{t('yourReferralLink')}</p>
                   <div className="flex items-center justify-between gap-2 overflow-hidden">
                      <code className="text-xs text-yellow-500 font-bold truncate font-mono">khan-traders.com/ref?user={user.username.toLowerCase()}</code>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`khan-traders.com/ref?user=${user.username.toLowerCase()}`);
                          showNotification(t('copied'), 'success');
                        }}
                        className="bg-white/10 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm shrink-0 whitespace-nowrap active:scale-95"
                      >
                        {t('copy')}
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{t('myReferrals')}</p>
                    <p className="text-xl font-bold text-white font-display">{user.referrals}</p>
                  </div>
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{t('referralTeam')}</p>
                    <p className="text-xl font-bold text-white font-display">Lv. {Math.floor(user.referrals / 5) + 1}</p>
                  </div>
                </div>
             </div>
             
             <div className="bg-gradient-to-br from-yellow-500 to-yellow-800 p-8 rounded-[2.5rem] text-black relative overflow-hidden">
                 <div className="absolute -bottom-4 -right-4 opacity-10">
                   <Award size={100} />
                 </div>
                 <h3 className="font-bold text-lg mb-2">{t('weeklyLeaderboard')}</h3>
                 <p className="text-black/60 text-xs mb-4">{t('weeklyLeaderboardDesc')}</p>
                 <button className="bg-black/20 hover:bg-black/30 backdrop-blur border border-black/10 px-4 py-2 rounded-xl text-xs font-bold transition-all">
                    {t('viewRankings')}
                 </button>
             </div>
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
             <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-sm text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-yellow-600 rounded-[2.5rem] flex items-center justify-center text-black text-3xl font-bold shadow-xl shadow-yellow-500/10 ring-4 ring-white/10">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black w-8 h-8 rounded-full flex items-center justify-center border-4 border-[#0a0a0a] shadow-lg">
                    <Star size={14} fill="currentColor" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white font-display mb-1">{user.username}</h2>
                <p className="text-slate-500 text-xs font-medium">{user.phone}</p>
                <div className="mt-4 inline-block bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {t('verifiedMember')}
                </div>
             </div>

             <div className="bg-white/5 rounded-[2.5rem] p-4 border border-white/10 shadow-sm divide-y divide-white/5">
                {[
                  { icon: <Briefcase size={20} />, label: t('myInvestments'), value: `Rs. ${totalInvested.toLocaleString()}`, action: null },
                  { icon: <TrendingUp size={20} />, label: t('dailyEarnings'), value: `Rs. ${dailyEarnings.toLocaleString()}`, action: null },
                  { icon: <Globe size={20} />, label: t('language'), value: language === 'ur' ? 'اردو' : 'English', action: () => setShowLanguageModal(true) },
                  { icon: <Settings size={20} />, label: t('security'), value: '', action: null },
                ].map((item, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      if (item.action) {
                        item.action();
                      }
                    }}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors rounded-xl group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-slate-500 group-hover:text-yellow-500 transition-colors">
                        {item.icon}
                      </div>
                      <span className="font-semibold text-slate-300">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-sm text-slate-500 font-medium">{item.value}</span>
                       <ChevronRight size={18} className="text-slate-600" />
                    </div>
                  </button>
                ))}
             </div>

             <button 
               onClick={() => setShowLogoutConfirm(true)}
               className="w-full bg-red-500/10 text-red-500 py-5 rounded-[2rem] font-bold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors border border-red-500/10"
             >
                <LogOut size={20} />
                <span>{t('logout')}</span>
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Chat FAB */}
      <div className="fixed bottom-28 right-6 md:right-[calc(50%-235px)] z-[45] flex flex-col items-end gap-3 pointer-events-none">
        <AnimatePresence>
          {showSupportMenu && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              className="bg-[#121212]/95 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl w-56 flex flex-col gap-2.5 pointer-events-auto"
            >
              <div className="px-1 text-slate-400 font-bold text-[10px] uppercase tracking-wider text-left">
                {t('quickChat')}
              </div>
              <a
                href="https://whatsapp.com/channel/0029Vb8BaomFsn0ljPYp8W2l"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center gap-3 bg-white/5 hover:bg-yellow-500/10 hover:text-yellow-500 p-3 rounded-2xl border border-white/5 hover:border-yellow-500/20 transition-all text-slate-300 group text-left"
              >
                <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500/20 transition-colors">
                  <UserIcon size={16} />
                </div>
                <div>
                  <p className="font-bold text-xs">{t('owner')}</p>
                  <p className="text-[10px] text-slate-500">Live Chat</p>
                </div>
              </a>

              <a
                href="https://whatsapp.com/channel/0029Vb8BaomFsn0ljPYp8W2l"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center gap-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 p-3 rounded-2xl border border-[#25D366]/10 hover:border-[#25D366]/30 transition-all text-slate-300 text-left"
              >
                <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366]">
                  <MessageCircle size={16} />
                </div>
                <div>
                  <p className="font-bold text-xs text-white">{t('whatsAppChannel')}</p>
                  <p className="text-[10px] text-slate-400">Join Community</p>
                </div>
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowSupportMenu(prev => !prev)}
          className="pointer-events-auto w-14 h-14 bg-gradient-to-tr from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 rounded-full flex items-center justify-center text-black shadow-xl shadow-yellow-500/15 active:scale-95 hover:scale-105 transition-all relative group"
        >
          {showSupportMenu ? (
            <X size={24} className="transition-transform duration-300 rotate-90" />
          ) : (
            <MessageCircle size={24} className="transition-transform duration-300" />
          )}
          
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 border border-black"></span>
          </span>
        </button>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm h-20 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-around px-4 z-40">
        <button 
          onClick={() => setActiveTab('home')}
          className={`relative p-3 flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'home' ? 'text-yellow-500 scale-110' : 'text-slate-600 hover:text-slate-400'}`}
        >
          <Home size={22} className={activeTab === 'home' ? 'fill-yellow-500/10' : ''} />
          {activeTab === 'home' && <motion.div layoutId="nav-dot" className="absolute -bottom-1 w-1 h-1 bg-yellow-500 rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('plans')}
          className={`relative p-3 flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'plans' ? 'text-yellow-500 scale-110' : 'text-slate-600 hover:text-slate-400'}`}
        >
          <Briefcase size={22} className={activeTab === 'plans' ? 'fill-yellow-500/10' : ''} />
          {activeTab === 'plans' && <motion.div layoutId="nav-dot" className="absolute -bottom-1 w-1 h-1 bg-yellow-500 rounded-full" />}
        </button>
        <div className="relative -top-8">
           <button 
            onClick={() => setShowDepositModal(true)}
            className="w-16 h-16 bg-gradient-to-tr from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-black shadow-xl shadow-yellow-500/10 border-4 border-[#0a0a0a] active:scale-95 transition-all"
           >
             <PlusCircle size={32} />
           </button>
        </div>
        <button 
          onClick={() => setActiveTab('team')}
          className={`relative p-3 flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'team' ? 'text-yellow-500 scale-110' : 'text-slate-600 hover:text-slate-400'}`}
        >
          <UsersIcon size={22} className={activeTab === 'team' ? 'fill-yellow-500/10' : ''} />
          {activeTab === 'team' && <motion.div layoutId="nav-dot" className="absolute -bottom-1 w-1 h-1 bg-yellow-500 rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`relative p-3 flex flex-col items-center justify-center gap-1 transition-all ${activeTab === 'profile' ? 'text-yellow-500 scale-110' : 'text-slate-600 hover:text-slate-400'}`}
        >
          <UserIcon size={22} className={activeTab === 'profile' ? 'fill-yellow-500/10' : ''} />
          {activeTab === 'profile' && <motion.div layoutId="nav-dot" className="absolute -bottom-1 w-1 h-1 bg-yellow-500 rounded-full" />}
        </button>
      </div>
    </div>
  );
}
