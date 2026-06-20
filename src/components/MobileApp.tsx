/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRightLeft, 
  CheckCircle2, 
  ChevronRight, 
  CreditCard, 
  Download, 
  Eye, 
  EyeOff, 
  Fingerprint, 
  Info, 
  Lock, 
  MoreHorizontal, 
  Power, 
  QrCode, 
  RefreshCw, 
  Send, 
  Share2, 
  ShieldCheck, 
  TrendingDown, 
  TrendingUp, 
  User, 
  Wallet,
  Wifi,
  Battery,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AccountDetails, RecipientBank, Transaction, TransferFormState } from '../types';
import { MALAYSIAN_BANKS } from '../data';

interface MobileAppProps {
  account: AccountDetails;
  updateAccount: (updated: Partial<AccountDetails>) => void;
  transactions: Transaction[];
  addTransaction: (newTx: Transaction) => void;
  activeScreen: 'login' | 'dashboard' | 'transfer' | 'receipt' | 'otp' | 'processing';
  setActiveScreen: (screen: 'login' | 'dashboard' | 'transfer' | 'receipt' | 'otp' | 'processing') => void;
  activeNotification?: { id: string; sender: string; amount: number; time: string } | null;
  clearNotification?: () => void;
  hideTime?: boolean;
}

export default function MobileApp({
  account,
  updateAccount,
  transactions,
  addTransaction,
  activeScreen,
  setActiveScreen,
  activeNotification,
  clearNotification,
  hideTime = true,
}: MobileAppProps) {
  // Mobile app clock simulation (Malaysia timezone/standard format)
  const [timeStr, setTimeStr] = useState('15:04');
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const minStr = minutes < 10 ? '0' + minutes : minutes;
      const hrStr = hours < 10 ? '0' + hours : hours;
      setTimeStr(`${hrStr}:${minStr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // View States
  const [showBalance, setShowBalance] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Transfer Form States
  const [form, setForm] = useState<TransferFormState>({
    recipientName: 'Tan Ah Kao',
    recipientAccount: '16428394852',
    recipientBankId: 'mbb',
    amount: '500000', // Pre-fill with RM500,000 as requested or can be typed
    reference: 'Business Transfer',
    transferType: 'Instant',
  });
  
  const [formErrors, setFormErrors] = useState<Partial<TransferFormState>>({});
  
  // States of simulated execution
  const [currentOtp, setCurrentOtp] = useState('');
  const [userOtpInput, setUserOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [latestTransaction, setLatestTransaction] = useState<Transaction | null>(null);

  // Helper formatting for RM Malaysian Ringgit
  const formatRM = (val: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
    }).format(val).replace('MYR', 'RM');
  };

  // Login handler
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput.length === 6 || pinInput === '1234') {
      setActiveScreen('dashboard');
      setPinInput('');
      setLoginError('');
    } else if (pinInput === '') {
      // Allow fast bypass click login
      setActiveScreen('dashboard');
    } else {
      setLoginError('Invalid 6-digit PIN. Tap Face ID or bypass to login.');
    }
  };

  // Pre-fill fields helper
  const applyPresetAmount = (amt: string) => {
    setForm(prev => ({ ...prev, amount: amt }));
    if (formErrors.amount) {
      setFormErrors(prev => ({ ...prev, amount: undefined }));
    }
  };

  // Validate Transfer state
  const handleValidateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Partial<TransferFormState> = {};
    
    if (!form.recipientName.trim()) {
      errors.recipientName = 'Recipient name is required';
    }
    
    const plainAccountNumber = form.recipientAccount.trim();
    if (!plainAccountNumber) {
      errors.recipientAccount = 'Account number is required';
    } else if (!/^\d{6,18}$/.test(plainAccountNumber)) {
      errors.recipientAccount = 'Enter a valid numeric account number (6-18 digits)';
    }

    const numericAmount = parseFloat(form.amount || '0');
    if (!form.amount) {
      errors.amount = 'Amount is required';
    } else if (isNaN(numericAmount) || numericAmount <= 0) {
      errors.amount = 'Enter a valid positive amount';
    } else if (numericAmount > account.balance) {
      // In a real bank app, you cannot transfer more than balance. 
      // But as this is a simulated customized fake bank app, let's warn but not strictly block if they explicitly want to bypass. 
      // Instead, let's just flag it or show a low-balance alert but let them transfer for high-fidelity demonstration.
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Direct Instant Transfer without TAC page
    setActiveScreen('processing');

    setTimeout(() => {
      const amountNum = parseFloat(form.amount || '0');
      const updatedBalance = account.balance - amountNum;
      
      // Select selected bank
      const targetBank = MALAYSIAN_BANKS.find(b => b.id === form.recipientBankId);
      
      // Create transaction
      const newTx: Transaction = {
        id: `TXN-MBC-${Math.floor(100000 + Math.random() * 900000)}`,
        title: `Transfer to ${form.recipientName.toUpperCase()}`,
        description: form.reference || 'Instant Transfer',
        amount: amountNum,
        type: 'debit',
        date: new Date().toLocaleString('en-MY', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }).toUpperCase(),
        recipientBank: targetBank ? targetBank.name : 'MBC Bank',
        recipientAccount: form.recipientAccount,
        referenceId: `MBC${Date.now().toString().slice(-10)}`,
        status: 'SUCCESSFUL',
      };

      // Deduct balance and add transaction
      updateAccount({ balance: Math.max(0, updatedBalance) });
      addTransaction(newTx);
      setLatestTransaction(newTx);
      setActiveScreen('receipt');
    }, 2000); // 2 seconds processing loading
  };

  // Submit and deduct funds
  const handleOtpConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Bypass OTP checking for easier demos if desired, or require standard match
    const isCorrectOtp = userOtpInput === currentOtp || userOtpInput === '123412' || userOtpInput === '';
    
    if (!isCorrectOtp) {
      setOtpError('Incorrect SecureTAC code. Please try again.');
      return;
    }

    setActiveScreen('processing');

    setTimeout(() => {
      const amountNum = parseFloat(form.amount);
      const updatedBalance = account.balance - amountNum;
      
      // Select selected bank
      const targetBank = MALAYSIAN_BANKS.find(b => b.id === form.recipientBankId);
      
      // Create transaction
      const newTx: Transaction = {
        id: `TXN-MBC-${Math.floor(100000 + Math.random() * 900000)}`,
        title: `Transfer to ${form.recipientName.toUpperCase()}`,
        description: form.reference || 'Instant Transfer',
        amount: amountNum,
        type: 'debit',
        date: new Date().toLocaleString('en-MY', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }).toUpperCase(),
        recipientBank: targetBank ? targetBank.name : 'MBC Bank',
        recipientAccount: form.recipientAccount,
        referenceId: `MBC${Date.now().toString().slice(-10)}`,
        status: 'SUCCESSFUL',
      };

      // Deduct balance and add transaction
      updateAccount({ balance: Math.max(0, updatedBalance) });
      addTransaction(newTx);
      setLatestTransaction(newTx);
      setActiveScreen('receipt');
    }, 2000); // 2 seconds processing loading
  };

  return (
    <div className="relative w-full max-w-[420px] mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden h-[800px] flex flex-col font-sans select-none" id="simulated-phone-container">
      
      {/* Dynamic Slide-Down Push Notification Banner with high-fidelity visual layout */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ y: -120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -120, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 150 }}
            className="absolute top-4 inset-x-4 z-50 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-xl border border-slate-700/60 flex flex-col space-y-1.5 cursor-pointer active:scale-98 transition-transform"
            onClick={() => {
              // Direct navigation to dashboard when clicked so the user can see details
              setActiveScreen('dashboard');
              if (clearNotification) clearNotification();
            }}
          >
            <div className="flex justify-between items-center text-[10px] text-blue-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5 font-sans">
                <span className="w-5 h-5 bg-blue-700 rounded-lg flex items-center justify-center text-white text-[10px] font-black">M</span>
                <span>MBC Instant Alert</span>
              </span>
              {!hideTime && (
                <span className="text-slate-400 font-medium font-mono">{activeNotification.time}</span>
              )}
            </div>
            
            <div className="space-y-0.5">
              <p className="text-xs font-black text-slate-100 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>DuitNow {formatRM(activeNotification.amount)} Received</span>
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-300 leading-relaxed font-semibold">
                Successfully credited from <span className="text-white font-black uppercase">{activeNotification.sender}</span>.
              </p>
            </div>
            
            <div className="flex justify-between items-center pt-1 border-t border-slate-800/60 mt-1">
              <span className="text-[9px] text-slate-400">Tap banner to check balance</span>
              <span className="text-[9px] text-blue-300 font-black tracking-tight flex items-center gap-0.5">
                <span>View Dashboard</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* High-Fidelity Smartphone Status Bar */}
      <div className="bg-slate-50 text-slate-850 px-5 pt-3 pb-1 flex justify-between items-center text-[10px] font-bold select-none z-40 shrink-0 border-b border-slate-100">
        <span className="font-sans tracking-tight leading-none">
          {!hideTime ? timeStr : <span className="opacity-0">12:34</span>}
        </span>
        <div className="flex items-center space-x-1.5 text-slate-700">
          <Wifi className="w-3.5 h-3.5" />
          <span className="text-[8.5px] font-extrabold tracking-tighter col-span-1">5G</span>
          <Battery className="w-4 h-4" />
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-50 pt-0 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {/* SCREEN: LOGIN STATUS */}
          {activeScreen === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col justify-between bg-slate-50 text-slate-800 p-6 pt-4"
              id="login-screen-view"
            >
              {/* Optional high-fidelity Lock Screen Time display */}
              {!hideTime && (
                <div className="flex flex-col items-center text-center mt-2 mb-1" id="simulated-lock-screen-clock">
                  <span className="text-4xl font-extrabold text-slate-850 font-mono tracking-tighter leading-none">{timeStr}</span>
                  <span className="text-[9px] font-bold uppercase text-slate-450 tracking-widest mt-1">Saturday, May 30</span>
                </div>
              )}

              {/* HIGH-FIDELITY SMARTPHONE LOCK SCREEN NOTIFICATION POP-UP */}
              {activeNotification && (
                <motion.div
                  initial={{ scale: 0.95, y: -10, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  className="w-full max-w-xs mx-auto bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-slate-200/80 my-2 cursor-pointer active:scale-98 transition-transform select-none"
                  id="lockscreen-pop-up-widget"
                  onClick={() => {
                    // Direct deep link: bypass lock or trigger dashboard transition
                    setActiveScreen('dashboard');
                    if (clearNotification) clearNotification();
                  }}
                >
                  <div className="flex justify-between items-center text-[10px] text-blue-700 font-bold uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-4 bg-blue-700 rounded-md flex items-center justify-center text-white text-[8px] font-black">M</span>
                      <span className="font-extrabold font-sans">MBC Alert System</span>
                    </span>
                    {!hideTime && <span className="text-slate-450 font-medium font-mono">Just Now</span>}
                  </div>
                  <div className="space-y-0.5 text-left">
                    <p className="text-xs font-black text-slate-850 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span>DuitNow RM100,000.00 Received</span>
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-650 leading-relaxed font-semibold">
                      Payment credited from <span className="text-slate-900 font-black uppercase">{activeNotification.sender}</span>.
                    </p>
                  </div>
                  <div className="text-[8.5px] text-slate-400 mt-2.5 pt-1.5 border-t border-slate-100/80 flex justify-between items-center font-semibold">
                    <span>Tap lockscreen banner to login & verify balance</span>
                    <ChevronRight className="w-3 h-3 text-blue-700 font-black" />
                  </div>
                </motion.div>
              )}

              <div className="flex flex-col items-center pt-4">
                <div className="w-14 h-14 bg-blue-700 rounded-2xl flex items-center justify-center shadow-md mb-3" id="mbc-logo-badge">
                  <span className="font-extrabold text-2xl text-white font-sans tracking-tight" id="logo-branding-text">M</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-1" id="login-welcome-title">MBC Mobile</h1>
                <p className="text-xs text-slate-400 font-medium" id="login-branch-text">Secure Instant Digital Sandbox</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border border-slate-200 bg-blue-50/50 flex items-center justify-center mb-3" id="user-avatar-badge">
                  <User className="w-8 h-8 text-blue-700" />
                </div>
                <p className="text-xs font-bold text-slate-650 mb-5" id="login-greeting-text">Welcome Back, {account.accountHolderName}</p>

                <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
                  <div>
                    <label className="block text-center text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-3" id="pin-label-text">
                      Enter 6-Digit PIN or bypass
                    </label>
                    <div className="flex justify-center space-x-2.5">
                      {[1, 2, 3, 4, 5, 6].map((idx) => (
                        <div 
                          key={idx} 
                          className={`w-3.5 h-3.5 rounded-full border transition-all ${
                            pinInput.length >= idx ? 'bg-blue-700 border-blue-700' : 'bg-transparent border-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {loginError && (
                    <p className="text-center text-rose-600 text-xs font-semibold py-1 bg-rose-50 border border-rose-100 rounded-lg" id="login-error-toast">{loginError}</p>
                  )}

                  {/* Built-in numeric keypad */}
                  <div className="grid grid-cols-3 gap-y-3 gap-x-4 max-w-[200px] mx-auto pt-2" id="keypad-grid-interface">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => pinInput.length < 6 && setPinInput((p) => p + num)}
                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-250 active:bg-blue-700 active:text-white flex items-center justify-center font-bold text-slate-700 text-sm transition-colors cursor-pointer"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPinInput('')}
                      className="text-[10px] text-slate-400 hover:text-slate-800 uppercase font-semibold flex items-center justify-center cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => pinInput.length < 6 && setPinInput((p) => p + '0')}
                      className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-250 active:bg-blue-700 active:text-white flex items-center justify-center font-bold text-slate-700 text-sm transition-colors cursor-pointer"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLogin()}
                      className="text-[10px] text-blue-700 font-bold hover:text-blue-800 uppercase flex items-center justify-center cursor-pointer"
                      id="bypass-login-btn"
                    >
                      Login
                    </button>
                  </div>
                </form>
              </div>

              <div className="flex flex-col items-center space-y-3 pt-4">
                <button 
                  onClick={() => handleLogin()} 
                  className="w-full py-3.5 bg-blue-700 hover:bg-blue-850 active:scale-[0.98] transition-all text-white font-bold rounded-xl shadow-md text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-blue-100"
                  id="direct-login-btn"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>Face ID Quick Login</span>
                </button>
                <div className="text-[10px] text-slate-405 flex items-center space-x-1.5" id="security-footer-login">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Licensed under BNM regulations</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* SCREEN: DASHBOARD */}
          {activeScreen === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col overflow-y-auto"
              id="dashboard-screen-view"
            >
              {/* Header section style */}
              <div className="bg-white text-slate-800 pt-4 pb-5 px-5 border-b border-slate-200/60 shadow-sm flex flex-col space-y-4" id="dashboard-header-container">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center" id="mbc-nav-brand-logo">
                      <span className="font-black text-[13px] text-white tracking-tight">M</span>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">A/C Holder</p>
                      <h4 className="text-xs font-black text-slate-800 tracking-tight truncate max-w-[130px]">{account.accountHolderName}</h4>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveScreen('login')}
                    className="p-1 px-2.5 text-[9px] uppercase font-bold bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg flex items-center space-x-1 border border-slate-200 hover:text-slate-800 cursor-pointer active:scale-95 transition"
                    id="exit-app-btn"
                  >
                    <Power className="w-3 h-3" />
                    <span>Log Out</span>
                  </button>
                </div>

                {/* Account card layout conforming to Clean Minimalism available balance spec */}
                <div className="bg-blue-900 p-5 rounded-2xl relative overflow-hidden shadow-lg border border-blue-950/20 text-white" id="account-card-display">
                  <div className="absolute right-0 bottom-0 opacity-15">
                    <Wallet className="w-24 h-24 transform translate-x-1/4 translate-y-1/4 text-blue-800" />
                  </div>
                  
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-[10px] font-bold text-blue-250 uppercase tracking-widest">PREMIER CHECKING ACCOUNT</p>
                      <p className="text-[11px] font-mono text-blue-200 tracking-wide mt-0.5">{account.accountNumber}</p>
                    </div>
                    <button 
                      onClick={() => setShowBalance(!showBalance)}
                      className="p-1 text-blue-200 hover:text-white transition-colors cursor-pointer"
                      id="toggle-balance-visibility"
                    >
                      {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-blue-300 block">Available Balance</span>
                    <div className="flex items-baseline space-x-1" id="balance-rm-reading">
                      <span className="text-lg font-bold tracking-tight text-blue-200">RM</span>
                      <span className="text-3xl font-black tracking-tight text-white font-mono">
                        {showBalance ? account.balance.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '•••••••'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t border-blue-800/40 mt-3 pt-2.5 flex justify-between items-center text-[9px] uppercase font-bold text-blue-300">
                    <span>Active Status: Normal</span>
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400" /> MBC SafeTransfer™</span>
                  </div>
                </div>
              </div>

              {/* Action grid block with minimal blue layouts */}
              <div className="px-5 py-4" id="bank-quick-actions-bar">
                <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2.5">Quick Services</p>
                <div className="grid grid-cols-3 gap-2.5">
                  <button 
                    onClick={() => setActiveScreen('transfer')}
                    className="flex flex-col items-center bg-white border border-slate-200 py-3 rounded-xl hover:shadow hover:border-slate-350 active:scale-95 transition-all cursor-pointer"
                    id="trigger-money-transfer-action"
                  >
                    <div className="w-9 h-9 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center mb-1">
                      <ArrowRightLeft className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-650">Transfer</span>
                  </button>
                  <button 
                    className="flex flex-col items-center bg-slate-100 border border-slate-200/50 py-3 rounded-xl opacity-50 cursor-not-allowed text-center"
                    id="scan-qr-service-disabled"
                  >
                    <div className="w-9 h-9 bg-slate-200 text-slate-450 rounded-lg flex items-center justify-center mb-1">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">DuitNow QR</span>
                  </button>
                  <button 
                    className="flex flex-col items-center bg-slate-100 border border-slate-200/50 py-3 rounded-xl opacity-50 cursor-not-allowed text-center"
                    id="paybills-service-disabled"
                  >
                    <div className="w-9 h-9 bg-slate-200 text-slate-455 rounded-lg flex items-center justify-center mb-1">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">Pay Bills</span>
                  </button>
                </div>
              </div>

              {/* Account statement item details */}
              <div className="px-5 pb-4" id="alternate-accounts-block">
                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex justify-between items-center shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-blue-700">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-800">Local Savings Fund</p>
                      <p className="text-[10px] font-mono text-slate-400">{account.savingsAccountNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-440 block mb-0.5">Fixed Rate</span>
                    <span className="text-xs font-extrabold text-slate-800">
                      {formatRM(account.savingsBalance)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Transactions lists */}
              <div className="flex-1 bg-white rounded-t-[28px] border-t border-slate-200 px-5 pt-4 pb-12 flex flex-col shadow-inner" id="transactions-log-dashboard">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Transaction Statement</p>
                  <div className="flex items-center text-[10px] font-bold text-blue-700 space-x-0.5 cursor-pointer hover:underline">
                    <span>Filter Statement</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>

                <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[220px] pr-0.5 scrollbar-thin" id="transactions-scrolling-container">
                  {transactions.slice(0).reverse().map((tx) => (
                    <div 
                      key={tx.id} 
                      className="p-3 bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl flex justify-between items-center transition-colors"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.type === 'credit' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {tx.type === 'credit' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate" title={tx.title}>{tx.title}</h4>
                          <p className="text-[10px] text-slate-400 truncate">{tx.description}</p>
                          <p className="text-[9px] text-slate-400 font-medium">{tx.date}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xs font-bold font-mono tracking-tight block ${
                          tx.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {tx.type === 'credit' ? '+' : '-'}{tx.amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[8px] bg-emerald-100/60 text-emerald-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider mt-0.5 inline-block">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* SCREEN: TRANSFER */}
          {activeScreen === 'transfer' && (
            <motion.div
              key="transfer"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col p-5 overflow-y-auto"
              id="transfer-form-screen-view"
            >
              <div className="flex items-center space-x-2.5 mb-5 shrink-0" id="transfer-screen-header">
                <button 
                  onClick={() => setActiveScreen('dashboard')}
                  className="p-1.5 hover:bg-slate-200 rounded-xl text-slate-700 transition cursor-pointer"
                  id="transfer-go-back-dashboard"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-base font-black text-slate-900" id="transfer-page-title">Fund Transfer</h2>
                  <p className="text-[10px] text-slate-400 font-medium">Instant DuitNow Interbank Transfer</p>
                </div>
              </div>

              <form onSubmit={handleValidateTransfer} className="flex-1 flex flex-col justify-between" id="transfer-setup-form">
                <div className="space-y-4">
                  {/* Account Reference Header (conforms to Clean Minimalism with subtle background) */}
                  <div className="bg-blue-900 text-slate-100 p-4 rounded-2xl text-xs space-y-1.5 shadow-sm" id="transfer-from-indicator">
                    <span className="text-[9px] uppercase tracking-widest block font-bold text-blue-300">Transfer From</span>
                    <div className="flex justify-between items-center text-white">
                      <span className="font-extrabold truncate max-w-[170px]">{account.accountHolderName}</span>
                      <span className="font-mono text-xs font-black text-white">
                        {formatRM(account.balance)}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-blue-200 opacity-90 block">{account.accountNumber}</span>
                  </div>

                  {/* Recipient Bank selector */}
                  <div id="selection-recipient-bank">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Recipient Bank</label>
                    <select
                      value={form.recipientBankId}
                      onChange={(e) => setForm({ ...form, recipientBankId: e.target.value })}
                      className="w-full text-xs font-semibold bg-white text-slate-800 border border-slate-200 rounded-xl px-3 py-3 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                      id="beneficiary-bank-dropdown"
                    >
                      {MALAYSIAN_BANKS.map((bank) => (
                        <option key={bank.id} value={bank.id}>
                          {bank.name} ({bank.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Recipient Account Number */}
                  <div id="input-recipient-account-wrapper">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Account Number</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.recipientAccount}
                      placeholder="e.g. 16428394852"
                      onChange={(e) => {
                        const numericOnly = e.target.value.replace(/\D/g, '');
                        setForm({ ...form, recipientAccount: numericOnly });
                        if (formErrors.recipientAccount) setFormErrors({ ...formErrors, recipientAccount: undefined });
                      }}
                      className="w-full text-xs font-bold font-mono bg-white text-slate-800 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                      id="beneficiary-account-input"
                    />
                    {formErrors.recipientAccount && (
                      <p className="text-rose-600 text-[10px] mt-1 font-semibold flex items-center" id="error-recipient-account">
                        <AlertCircle className="w-3 h-3 mr-1" /> {formErrors.recipientAccount}
                      </p>
                    )}
                  </div>

                  {/* Recipient Name */}
                  <div id="input-recipient-name-wrapper">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Recipient Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Tan Ah Kao"
                      value={form.recipientName}
                      onChange={(e) => {
                        setForm({ ...form, recipientName: e.target.value });
                        if (formErrors.recipientName) setFormErrors({ ...formErrors, recipientName: undefined });
                      }}
                      className="w-full text-xs font-bold uppercase tracking-wider bg-white text-slate-800 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                      id="beneficiary-name-input"
                    />
                    {formErrors.recipientName && (
                      <p className="text-rose-600 text-[10px] mt-1 font-semibold flex items-center" id="error-recipient-name">
                        <AlertCircle className="w-3 h-3 mr-1" /> {formErrors.recipientName}
                      </p>
                    )}
                  </div>

                  {/* Amount of money */}
                  <div id="input-money-amount-wrapper">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transfer Amount</label>
                      <span className="text-[10px] font-bold text-slate-450 uppercase">Limit: RM500,050 / tx</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-blue-900">RM</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={form.amount}
                        placeholder="0.00"
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, '');
                          setForm({ ...form, amount: val });
                          if (formErrors.amount) setFormErrors({ ...formErrors, amount: undefined });
                        }}
                        className="w-full text-xl font-bold font-mono pl-10 pr-3 bg-blue-50/70 text-blue-900 border border-blue-200 rounded-xl py-3 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                        style={{ fontSize: '18px' }}
                        id="transfer-amount-input"
                      />
                    </div>
                    
                    {/* Common Shortcuts for simulations (Requested amounts like RM500,000!) */}
                    <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1" id="presets-scroller-shortcuts">
                      {['100', '1000', '10000', '50000', '500000', '1000000'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => applyPresetAmount(p)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-705 hover:text-white border border-slate-200/60 rounded-lg text-[9px] font-bold font-mono tracking-tight shrink-0 transition"
                        >
                          RM {parseInt(p).toLocaleString('en')}
                        </button>
                      ))}
                    </div>
 
                    {formErrors.amount && (
                      <p className="text-rose-600 text-[10px] mt-1 font-semibold flex items-center" id="error-transfer-amount">
                        <AlertCircle className="w-3 h-3 mr-1" /> {formErrors.amount}
                      </p>
                    )}

                    {parseFloat(form.amount) > account.balance && (
                      <div className="bg-amber-50 border border-amber-250 rounded-xl p-2.5 flex items-start space-x-2 mt-2" id="overdraw-alert">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-amber-805 leading-relaxed font-semibold">
                          Alert: This exceeds checking balance ({formatRM(account.balance)}). The simulator will bypass this & succeed.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Payment Purposed Reference */}
                  <div id="payment-purpose-wrapper">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Receipt Reference</label>
                    <input
                      type="text"
                      placeholder="e.g. Business Funds / Rent"
                      value={form.reference}
                      onChange={(e) => setForm({ ...form, reference: e.target.value })}
                      className="w-full text-xs font-bold bg-white text-slate-800 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                      id="payment-reference-input"
                    />
                  </div>
                </div>

                <div className="pt-4 pb-12 shrink-0">
                  <button
                    type="submit"
                    className="w-full py-4 bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white font-black uppercase text-[10px] tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-blue-105"
                    id="submit-transfer-form-btn"
                  >
                    <span>Confirm & Transfer Now</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* SCREEN: SECURE TAC MODULE CONFIRMATION */}
          {activeScreen === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col justify-between p-6 bg-slate-50 text-slate-800"
              id="otp-screen-view"
            >
              <div className="flex flex-col items-center text-center pt-6 space-y-4">
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-750 mb-2">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight" id="otp-header-label">SecureTAC™ Verification</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs animate-pulse" id="otp-explanation-text">
                  We sent a 6-digit dynamic authorization SecureTAC code to your device via SMS to verify this transfer of <strong className="text-blue-700 font-extrabold">{formatRM(parseFloat(form.amount || '0'))}</strong> to <strong className="text-slate-900 font-black uppercase">{form.recipientName || 'Tan Ah Kao'}</strong>.
                </p>

                {/* Highly authentic visual OTP SMS Simulation */}
                <div className="w-full bg-white border border-blue-200 rounded-xl p-3.5 flex flex-col space-y-1.5 text-left shadow-sm" id="otp-simulator-alert">
                  <div className="flex justify-between items-center text-[10px] text-blue-700 font-bold tracking-wider uppercase">
                    <span>SMS Alert Sim (Auto Generated)</span>
                    <span className="text-[8px] text-slate-400 font-mono font-medium">Just Now</span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium leading-relaxed font-mono">
                    RM{parseFloat(form.amount || '0').toLocaleString('en-MY')} to {form.recipientName || 'Tan Ah Kao'}. SecureTAC is <span className="text-blue-700 font-bold bg-blue-50 px-1 py-0.5 rounded font-bold border border-blue-100">{currentOtp}</span>. Do not share.
                  </p>
                </div>
              </div>

              <form onSubmit={handleOtpConfirm} className="space-y-4 pb-12 w-full max-w-xs mx-auto">
                <div>
                  <input
                    type="text"
                    placeholder="Enter SecureTAC"
                    value={userOtpInput}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setUserOtpInput(digits);
                    }}
                    className="w-full text-center font-mono font-bold tracking-[8px] bg-white border border-slate-205 rounded-xl py-3 text-base outline-none focus:border-blue-700 text-slate-800"
                    maxLength={6}
                    id="otp-input-field"
                  />
                  
                  {/* Convenient filler button helper for presentation and seamless clicks */}
                  <div className="flex justify-end mt-1.5">
                    <button
                      type="button"
                      onClick={() => setUserOtpInput(currentOtp)}
                      className="text-[10px] text-blue-700 hover:underline font-bold cursor-pointer"
                      id="opt-autofill-btn"
                    >
                      Autofill Code
                    </button>
                  </div>
                </div>

                {otpError && (
                  <p className="text-rose-600 text-center text-xs font-bold bg-rose-50 border border-rose-105 rounded-lg py-1.5" id="otp-error-feedback">{otpError}</p>
                )}

                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-blue-700 hover:bg-blue-805 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md cursor-pointer shadow-blue-100"
                    id="confirm-otp-action-btn"
                  >
                    Confirm & Authorize
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveScreen('transfer');
                    }}
                    className="w-full py-2.5 text-slate-400 hover:text-slate-800 text-xs font-bold transition cursor-pointer"
                    id="cancel-otp-action-btn"
                  >
                    Cancel Transaction
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* SCREEN: LOADING/PROCESSING SPIN */}
          {activeScreen === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-800"
              id="processing-loader-screen"
            >
              <div className="flex flex-col items-center space-y-6 text-center">
                <div className="relative">
                  {/* Outer spinning ring */}
                  <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-blue-700 animate-spin"></div>
                  {/* Lock static central Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-blue-700" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase" id="processing-main-header">Securing Funds Transfer</h3>
                  <p className="text-[10px] text-slate-400 max-w-[220px] font-medium leading-relaxed mx-auto" id="processing-sub-description">
                    Encrypting transaction parameters and communication tunnels. Please do not close the window.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* SCREEN: TRANSFERRED SUCCESSFUL RECEIPT */}
          {activeScreen === 'receipt' && latestTransaction && (
            <motion.div
              key="receipt"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col p-4 bg-slate-100 overflow-y-auto"
              id="receipt-screen-view"
            >
              {/* Receipt Content Container (Capturable with normal phone look for screenshot) */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm relative flex-1 flex flex-col justify-between" id="printable-area-receipt">
                
                {/* Simulated Bank Seal Header */}
                <div className="flex justify-between items-center border-b border-zinc-100 pb-3" id="receipt-header-seal">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                      <span className="font-bold text-white text-[11px] tracking-tight">M</span>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-tight">MBC Digital Sandbox</h4>
                      <p className="text-[8px] text-zinc-400 font-bold font-mono">DuitNow Transfer</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-250 px-2 py-0.5 rounded-full font-black text-[10px]" id="receipt-state-flag">
                    SUCCESSFUL
                  </span>
                </div>

                <div className="py-4 text-center" id="receipt-central-details">
                  <div className="flex justify-center mb-1.5" id="receipt-green-icon">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  </div>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Funds Transferred</p>
                  <h3 className="text-2xl font-black font-mono tracking-tight text-blue-900 mt-0.5" id="receipt-amount-display">
                    {formatRM(latestTransaction.amount)}
                  </h3>
                  <p className="text-[10px] text-slate-600 bg-slate-100 py-1 px-3 rounded-lg font-bold mt-1 inline-block" id="receipt-reference-flag">
                    Ref: {latestTransaction.description || 'Transfer'}
                  </p>
                </div>

                {/* Core Parameters Table Grid inside Receipt */}
                <div className="space-y-2 border-t border-b border-dashed border-zinc-200 py-3 text-[10px]" id="receipt-parameters-grid">
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-bold uppercase text-[9px]">Transaction Status</span>
                    <span className="text-emerald-600 font-bold uppercase text-[9px]" id="receipt-status-param">Successful</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-bold uppercase text-[9px]">Reference ID</span>
                    <span className="font-mono text-slate-700 font-bold uppercase text-[9px]" id="receipt-txid-param">{latestTransaction.referenceId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-bold uppercase text-[9px]">Recipient Name</span>
                    <span className="font-bold text-slate-800 uppercase tracking-wide truncate max-w-[150px] text-[9px]" id="receipt-to-name-param">
                      {form.recipientName.toUpperCase() || 'TAN AH KAO'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-bold uppercase text-[9px]">Recipient Bank</span>
                    <span className="font-bold text-slate-700 truncate max-w-[150px] text-[9px]" id="receipt-to-bank-param">
                      {latestTransaction.recipientBank}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-bold uppercase text-[9px]">Recipient Account</span>
                    <span className="font-mono text-slate-700 font-bold text-[9px]" id="receipt-to-acc-param">
                      {latestTransaction.recipientAccount ? latestTransaction.recipientAccount.replace(/(.{4})/g, '$1 ') : '164283942031'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-bold uppercase text-[9px]">Recipient Bank Code</span>
                    <span className="font-mono text-zinc-550 font-bold uppercase text-[9px]" id="receipt-target-code-param">
                      {form.recipientBankId.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-bold uppercase text-[9px]">Transfer Mode</span>
                    <span className="font-bold text-slate-705 text-[9px]" id="receipt-mode-param">DuitNow Instant ({form.transferType})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-bold uppercase text-[9px]">Date & Time</span>
                    <span className="font-mono text-slate-700 font-bold uppercase text-[9px]" id="receipt-datetime-param">{latestTransaction.date}</span>
                  </div>
                </div>

                {/* Interactive Sharing Area */}
                <div className="pt-2 text-center" id="receipt-foot-security">
                  <div className="flex items-center justify-center space-x-1 text-[8px] text-zinc-400 font-bold uppercase tracking-widest leading-none">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-800" />
                    <span>Digitally Certified Bank Document</span>
                  </div>
                  <p className="text-[7.5px] text-zinc-400 font-mono mt-0.5">MBC Mobile SEC-ID: 8092-2931-A104</p>
                </div>
              </div>

              {/* Bottom Receipts Panel screen navigation */}
              <div className="flex flex-col space-y-2 mt-3 shrink-0 pb-12" id="receipt-actions-footer">
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => {
                      alert('Receipt image successfully cached to device downloads stream.');
                    }}
                    className="flex items-center justify-center space-x-1.5 py-3 bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    id="save-receipt-pdf-btn"
                  >
                    <Download className="w-4 h-4" />
                    <span>Save receipt</span>
                  </button>
                  <button 
                    onClick={() => {
                      // Trigger normal web sharing mockup API
                      if (navigator.share) {
                        navigator.share({
                          title: 'MBC Mobile Bank Receipt',
                          text: `DuitNow Transfer Successful for RM ${form.amount}`,
                          url: window.location.href,
                        }).catch(() => {});
                      } else {
                        alert(`Sharing: RM ${form.amount} transferred successfully to ${form.recipientName}`);
                      }
                    }}
                    className="flex items-center justify-center space-x-1.5 py-3 bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    id="share-receipt-api-btn"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share Receipt</span>
                  </button>
                </div>
                <button 
                  onClick={() => {
                    // Reset transfer and go home
                    setForm({
                      recipientName: '',
                      recipientAccount: '',
                      recipientBankId: 'mbb',
                      amount: '500000',
                      reference: 'Business Transfer',
                      transferType: 'Instant',
                    });
                    setActiveScreen('dashboard');
                  }}
                  className="w-full text-center py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-205 font-black uppercase text-xs tracking-wider rounded-xl transition cursor-pointer"
                  id="receipt-return-dashboard-btn"
                >
                  Make Another Transfer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Simulated Home Indicator Bar */}
      <div className="absolute bottom-1 inset-x-0 h-1.5 flex justify-center pointer-events-none z-50">
        <div className="w-32 h-1 bg-black/60 rounded-full"></div>
      </div>
    </div>
  );
}
