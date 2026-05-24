import React, { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, Lock, Phone, ArrowRight, ShieldCheck, Coins, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { storage } from '../lib/storage';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
}

export default function AuthScreen({ onLogin, onRegister }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('register');
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotData, setForgotData] = useState({
    username: '',
    phone: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const trimmedUsername = formData.username.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedPassword = formData.password.trim();

    // Reserved Admin Login check
    const isLoginAdmin = trimmedUsername.toLowerCase() === 'adminaccount' && trimmedPassword === '@admin@account@2727';
    
    if (isLoginAdmin) {
      const adminUser: User = {
        username: 'adminaccount',
        phone: '0000000000',
        balance: 0,
        referrals: 0,
        joinDate: new Date().toISOString(),
        isAdmin: true
      };
      
      // Auto-register inside DB to let storage methods recognize it
      const db = storage.getUsersDB();
      if (!db.some(u => u.username.toLowerCase() === 'adminaccount')) {
        const withAdmin = [...db, adminUser];
        localStorage.setItem('khan_traders_db', JSON.stringify(withAdmin));
      }
      
      onLogin(adminUser);
      return;
    }

    if (trimmedUsername.toLowerCase() === 'adminaccount') {
      setError('This username is reserved for administration.');
      return;
    }

    if (mode === 'register') {
      const referredBy = localStorage.getItem('khan_traders_referred_by') || undefined;
      const newUser: User = {
        username: trimmedUsername,
        phone: trimmedPhone,
        password: trimmedPassword,
        balance: 0, 
        referrals: 0,
        joinDate: new Date().toISOString(),
        referredBy: referredBy,
      };
      
      const success = storage.registerUser(newUser);
      if (success) {
        onRegister(newUser);
      } else {
        setError('Username already exists. Please choose another.');
      }
    } else {
      const existingUser = storage.findUser(trimmedUsername);
      if (existingUser && existingUser.password === trimmedPassword) {
        onLogin(existingUser);
      } else {
        setError('Invalid username or password. Please register first.');
      }
    }
  };

  const handleForgotSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const trimmedUsername = forgotData.username.trim();
    const trimmedPhone = forgotData.phone.trim();
    const trimmedNewPassword = forgotData.newPassword.trim();
    const trimmedConfirmNewPassword = forgotData.confirmNewPassword.trim();

    if (forgotStep === 1) {
      if (!trimmedUsername || !trimmedPhone) {
        setError('Please enter both username and phone number.');
        return;
      }
      const existingUser = storage.findUser(trimmedUsername);
      if (!existingUser) {
        setError('Username not found.');
        return;
      }
      if (existingUser.phone !== trimmedPhone) {
        setError('The phone number does not match registered details.');
        return;
      }
      // Successful verification
      setForgotStep(2);
    } else {
      if (!trimmedNewPassword || !trimmedConfirmNewPassword) {
        setError('Please enter and confirm your new password.');
        return;
      }
      if (trimmedNewPassword !== trimmedConfirmNewPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (trimmedNewPassword.length < 4) {
        setError('Password must be at least 4 chars long.');
        return;
      }

      const updatedStatus = storage.updatePassword(trimmedUsername, trimmedNewPassword);
      if (updatedStatus) {
        setSuccessMessage('Password reset successfully! Log in matching your new password.');
        setError(null);
        setFormData({
          username: trimmedUsername,
          phone: '',
          password: trimmedNewPassword,
        });
        setForgotData({
          username: '',
          phone: '',
          newPassword: '',
          confirmNewPassword: '',
        });
        setForgotStep(1);
        setMode('login');
      } else {
        setError('Failed to update password. Please check user details and try again.');
      }
    }
  };

  return (
    <div className="relative min-h-screen items-center justify-center p-6 flex flex-col overflow-hidden bg-[#050505] text-white">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
            rotate: [0, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -left-20 w-64 h-64 bg-yellow-900/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            x: [0, -100, 0],
            y: [0, -50, 0],
            rotate: [360, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-20 -right-20 w-80 h-80 bg-stone-900/20 rounded-full blur-3xl"
        />
        
        {/* Floating Coins (Animated) */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: '110vh', x: `${Math.random() * 100}vw` }}
            animate={{ y: '-10vh' }}
            transition={{ 
              duration: 5 + Math.random() * 5, 
              repeat: Infinity, 
              delay: Math.random() * 5,
              ease: "linear"
            }}
            className="absolute opacity-10"
          >
            <Coins className="text-yellow-500" size={24 + Math.random() * 24} />
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-500/20 mb-4"
          >
            <ShieldCheck size={32} />
          </motion.div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">Khan Trader’s</h1>
          <p className="text-yellow-500/60 font-medium mt-1">Premium Investment Platform</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">
            {mode === 'register' ? 'Create Account' : mode === 'login' ? 'Login Now' : forgotStep === 1 ? 'Verify Account' : 'Choose New Password'}
          </h2>

          <AnimatePresence>
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl flex items-center gap-2 text-sm">
                  <ShieldCheck size={18} className="shrink-0 text-emerald-400" />
                  <p>{successMessage}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center gap-2 text-sm">
                  <AlertCircle size={18} className="shrink-0" />
                  <p>{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {mode === 'forgot' ? (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              {forgotStep === 1 ? (
                <>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-500 transition-colors">
                      <UserIcon size={18} />
                    </div>
                    <input 
                      required
                      type="text"
                      placeholder="Username"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500 text-white"
                      value={forgotData.username}
                      onChange={(e) => setForgotData({...forgotData, username: e.target.value})}
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-500 transition-colors">
                      <Phone size={18} />
                    </div>
                    <input 
                      required
                      type="tel"
                      placeholder="Phone Number"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500 text-white"
                      value={forgotData.phone}
                      onChange={(e) => setForgotData({...forgotData, phone: e.target.value})}
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mt-6 group cursor-pointer"
                  >
                    <span>Verify Phone Number</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </>
              ) : (
                <>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-500 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input 
                      required
                      type="password"
                      placeholder="New Password"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500 text-white"
                      value={forgotData.newPassword}
                      onChange={(e) => setForgotData({...forgotData, newPassword: e.target.value})}
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-500 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input 
                      required
                      type="password"
                      placeholder="Confirm New Password"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500 text-white"
                      value={forgotData.confirmNewPassword}
                      onChange={(e) => setForgotData({...forgotData, confirmNewPassword: e.target.value})}
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mt-6 group cursor-pointer"
                  >
                    <span>Reset Password</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </>
              )}
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-500 transition-colors">
                  <UserIcon size={18} />
                </div>
                <input 
                  required
                  type="text"
                  placeholder="Username"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500 text-white"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>

              {mode === 'register' && (
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-500 transition-colors">
                    <Phone size={18} />
                  </div>
                  <input 
                    required
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500 text-white"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              )}

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  required
                  type="password"
                  placeholder="Password"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500 text-white"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              {mode === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setForgotStep(1);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs text-yellow-500/80 hover:text-yellow-500 hover:underline transition-all mt-1 cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mt-6 group cursor-pointer"
              >
                <span>{mode === 'register' ? 'Register Now' : 'Login Now'}</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          <div className="mt-8 text-center flex flex-col gap-2 select-none">
            {mode === 'forgot' ? (
              <button 
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMessage(null);
                  setForgotStep(1);
                }}
                className="text-slate-400 hover:text-yellow-500 font-medium transition-colors cursor-pointer text-sm"
              >
                Back to Login
              </button>
            ) : (
              <button 
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-slate-400 hover:text-yellow-500 font-medium transition-colors cursor-pointer text-sm"
              >
                {mode === 'login' 
                  ? 'Create new account' 
                  : 'Already registered? Login to account'}
              </button>
            )}
          </div>
        </div>
        
        <div className="mt-10 flex flex-col items-center gap-4">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Supported Payment Methods</p>
          <div className="flex items-center justify-center gap-6 opacity-40 grayscale pointer-events-none">
            <div className="flex flex-col items-center gap-1">
              <div className="text-white font-bold text-xs tracking-tight">EasyPaisa</div>
            </div>
            <div className="w-px h-4 bg-white/10"></div>
            <div className="flex flex-col items-center gap-1">
              <div className="text-white font-bold text-xs tracking-tight">JazzCash</div>
            </div>
            <div className="w-px h-4 bg-white/10"></div>
            <div className="flex flex-col items-center gap-1">
              <div className="text-white font-bold text-xs tracking-tight">Bank Transfer</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
