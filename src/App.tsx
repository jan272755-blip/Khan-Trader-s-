/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  Lock, 
  Phone, 
  ArrowRight, 
  Wallet, 
  TrendingUp, 
  History, 
  Users, 
  LogOut, 
  PlusCircle, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Bell,
  Home,
  Briefcase,
  PieChart,
  Settings,
  ChevronRight,
  ShieldCheck,
  X,
  MessageCircle
} from 'lucide-react';
import { storage } from './lib/storage';
import { User, InvestmentPlan, Transaction } from './types';

// Components
import AuthScreen from './components/AuthScreen';
import DashboardScreen from './components/DashboardScreen';
import LoadingScreen from './components/LoadingScreen';
import Notification from './components/Notification';

export default function App() {
  const [view, setView] = useState<'loading' | 'auth' | 'dashboard'>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      const savedUser = storage.getUser();
      if (savedUser) {
        setUser(savedUser);
        setView('dashboard');
      } else {
        setView('auth');
      }
      setShowWelcomePopup(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    storage.setUser(userData);
    storage.addLog('login', userData.username);
    setView('dashboard');
    showNotification(`Welcome back, ${userData.username}!`);
  };

  const handleRegister = (userData: User) => {
    setUser(userData);
    storage.setUser(userData);
    storage.addLog('login', userData.username, 'Newly registered account');
    setView('dashboard');
    showNotification(`Welcome to Khan Trader’s, ${userData.username}!`);
  };

  const handleLogout = () => {
    if (user) {
      storage.addLog('logout', user.username);
    }
    storage.logout();
    setUser(null);
    setView('auth');
    showNotification('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-x-hidden selection:bg-yellow-500/20 text-white">
      <AnimatePresence mode="wait">
        {view === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingScreen />
          </motion.div>
        )}
        
        {view === 'auth' && (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AuthScreen 
              onLogin={handleLogin} 
              onRegister={handleRegister} 
            />
          </motion.div>
        )}
        
        {view === 'dashboard' && user && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DashboardScreen 
              user={user} 
              onLogout={handleLogout} 
              showNotification={showNotification}
              refreshUser={() => setUser(storage.getUser())}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          <Notification 
            message={notification.message} 
            type={notification.type} 
            onClose={() => setNotification(null)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWelcomePopup && view !== 'loading' && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Backdrop with elegant blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWelcomePopup(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 35 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 35 }}
              transition={{ type: "spring", duration: 0.6, bounce: 0.15 }}
              dir="rtl"
              className="relative w-full max-w-lg bg-[#0e0e0e]/95 border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)] max-h-[85vh] overflow-y-auto scrollbar-none text-right z-10"
            >
              {/* Close button on top left */}
              <button
                onClick={() => setShowWelcomePopup(false)}
                className="absolute top-6 left-6 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-20"
              >
                <X size={16} />
              </button>

              {/* Title Section */}
              <div className="text-center mt-2 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-400/20 to-amber-500/10 flex items-center justify-center text-yellow-500 mx-auto mb-4 border border-yellow-500/20 shadow-lg shadow-yellow-500/5 select-none">
                  ✨
                </div>
                <h2 className="text-xl md:text-2xl font-black bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent leading-relaxed tracking-wide">
                  خوش آمدید خان ٹریڈرز میں ✨
                </h2>
              </div>

              {/* Description Paragraph 1 */}
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed text-justify mb-5 font-sans">
                خان ٹریڈرز ایک قابلِ اعتماد اور جدید آن لائن سرمایہ کاری پلیٹ فارم ہے جہاں آپ محفوظ طریقے سے سرمایہ کاری کر کے روزانہ منافع حاصل کر سکتے ہیں۔ ہمارا مقصد لوگوں کو ایک آسان، محفوظ اور بہتر کمائی کا موقع فراہم کرنا ہے تاکہ ہر شخص اپنے مستقبل کو مالی طور پر مضبوط بنا سکے۔
              </p>

              {/* Key Features Bento Grid */}
              <div className="grid grid-cols-2 gap-2.5 mb-5 text-right">
                {[
                  { emoji: '💰', text: 'کم سرمایہ کاری سے آغاز' },
                  { emoji: '📈', text: 'روزانہ منافع حاصل کریں' },
                  { emoji: '🔒', text: 'محفوظ اور قابلِ اعتماد سسٹم' },
                  { emoji: '⚡', text: 'تیز ڈپازٹ اور ودڈرال' },
                  { emoji: '👥', text: 'ریفرل بونس کی سہولت' },
                  { emoji: '📞', text: '24/7 سپورٹ سروس' }
                ].map((perk, i) => (
                  <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-3 flex items-center gap-3 hover:bg-white/[0.05] transition-all">
                    <span className="text-xl shrink-0">{perk.emoji}</span>
                    <span className="text-[11px] md:text-xs text-slate-200 font-semibold leading-normal">{perk.text}</span>
                  </div>
                ))}
              </div>

              {/* Description Paragraph 2 */}
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed text-justify mb-5 font-sans">
                خان ٹریڈرز اپنے صارفین کو شفاف اور آسان سرمایہ کاری کے پلان فراہم کرتا ہے تاکہ ہر فرد اپنی ضرورت کے مطابق پلان منتخب کر سکے۔ ہماری ٹیم بہترین سروس اور بروقت ادائیگی کو یقینی بناتی ہے۔
              </p>

              {/* Supporting sentence */}
              <p className="text-xs md:text-sm font-bold text-yellow-400 text-center mb-6 leading-relaxed font-sans">
                آج ہی خان ٹریڈرز کے ساتھ جڑیں اور اپنے روشن مستقبل کی بنیاد رکھیں۔ 🌟
              </p>

              {/* Footer CTA Buttons */}
              <div className="flex flex-col gap-3">
                <a 
                  href="https://whatsapp.com/channel/0029Vb8BaomFsn0ljPYp8W2l"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-gradient-to-r from-[#25D366] to-[#1ebd54] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/10 hover:shadow-green-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all text-xs md:text-sm"
                >
                  <MessageCircle size={18} shrink-0="true" />
                  <span>واٹس ایپ چینل جوائن کریں 📢</span>
                </a>
                
                <button
                  onClick={() => setShowWelcomePopup(false)}
                  className="w-full bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-3 rounded-2xl transition-all text-xs active:scale-[0.99] border border-white/5"
                >
                  ٹھیک ہے، آگے بڑھیں (Continue)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

