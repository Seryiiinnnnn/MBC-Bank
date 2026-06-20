/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Sparkles, 
  ShieldAlert, 
  Smartphone, 
  HelpCircle, 
  BookOpen,
  Scale,
  Settings,
  X
} from 'lucide-react';
import MobileApp from './components/MobileApp';
import ControlPanel from './components/ControlPanel';
import { AccountDetails, Transaction } from './types';
import { INITIAL_TRANSACTIONS } from './data';

const DEFAULT_ACCOUNT: AccountDetails = {
  accountHolderName: 'Sunny',
  accountNumber: '164283948529',
  bankName: 'MBC Malaysia',
  balance: 1500000.00, // Starting default at RM 1,500,000.00
  savingsAccountNumber: '304928341902',
  savingsBalance: 530280.50,
};

const LOCAL_STORAGE_ACCOUNT_KEY = 'mbc_sandbox_account_v2';
const LOCAL_STORAGE_TRANSACTIONS_KEY = 'mbc_sandbox_transactions_v2';

export default function App() {
  const [account, setAccount] = useState<AccountDetails>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ACCOUNT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.accountHolderName === 'CHONG SER YIN') {
          parsed.accountHolderName = 'Sunny';
        }
        return parsed;
      }
    } catch (e) {
      console.error("Failed to load account from local storage, using defaults", e);
    }
    return DEFAULT_ACCOUNT;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load transactions from local storage, using defaults", e);
    }
    return INITIAL_TRANSACTIONS;
  });

  const [activeScreen, setActiveScreen] = useState<'login' | 'dashboard' | 'transfer' | 'receipt' | 'otp' | 'processing'>('dashboard');
  
  // Mobile drawer overlay state for settings on mobile screens
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

  // Dynamic customized settings for incoming RM500k transfers
  const [incomingSender, setIncomingSender] = useState<string>(() => {
    return localStorage.getItem('mbc_sandbox_incoming_sender') || 'Tan Ah Kao';
  });
  const [incomingDelay, setIncomingDelay] = useState<number>(() => {
    const saved = localStorage.getItem('mbc_sandbox_incoming_delay');
    return saved ? parseInt(saved, 10) : 10;
  });
  const [timerCountdown, setTimerCountdown] = useState<number | null>(null);
  const [activeNotification, setActiveNotification] = useState<{ id: string; sender: string; amount: number; time: string } | null>(null);

  // Layout presentation customized toggles (preserved in localStorage)
  const [hideTime, setHideTime] = useState<boolean>(() => {
    const saved = localStorage.getItem('mbc_sandbox_hide_time');
    return saved === 'false' ? false : true; // Default to true as user requested "hide the time"
  });

  // Auto-persist changes back to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ACCOUNT_KEY, JSON.stringify(account));
  }, [account]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(transactions));
  }, [transactions]);

  // Save customized incoming transfer settings
  useEffect(() => {
    localStorage.setItem('mbc_sandbox_incoming_sender', incomingSender);
  }, [incomingSender]);

  useEffect(() => {
    localStorage.setItem('mbc_sandbox_incoming_delay', incomingDelay.toString());
  }, [incomingDelay]);

  useEffect(() => {
    localStorage.setItem('mbc_sandbox_hide_time', hideTime.toString());
  }, [hideTime]);

  // Countdown timer trigger loop
  useEffect(() => {
    let intervalId: any = null;
    if (timerCountdown !== null && timerCountdown > 0) {
      intervalId = setInterval(() => {
        setTimerCountdown((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            handleTriggerIncomingTransfer();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [timerCountdown, incomingSender]);

  const handleTriggerIncomingTransfer = () => {
    const transferAmount = 100000.00;
    
    // Add transaction
    const newTx: Transaction = {
      id: `TXN-INCOMING-${Math.floor(Math.random() * 90000)}`,
      title: 'DuitNow Receive',
      description: `RECEIVED FROM ${incomingSender.toUpperCase()}`,
      amount: transferAmount,
      type: 'credit',
      date: new Date().toLocaleString('en-MY', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).toUpperCase(),
      referenceId: `MBC${Date.now().toString().slice(-10)}`,
      status: 'SUCCESSFUL'
    };

    // Update account balance
    setAccount((prev) => ({
      ...prev,
      balance: prev.balance + transferAmount
    }));

    // Add transaction to history (appends to end, which is reversed in view to be on top)
    setTransactions((prev) => [...prev, newTx]);

    // Trigger visual notification
    setActiveNotification({
      id: Date.now().toString(),
      sender: incomingSender,
      amount: transferAmount,
      time: new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', hour12: false })
    });
  };

  // Update parts of the account details
  const updateAccount = (updated: Partial<AccountDetails>) => {
    setAccount((prev) => ({ ...prev, ...updated }));
  };

  // Add individual transaction to simulation logs
  const addTransaction = (newTx: Transaction) => {
    setTransactions((prev) => [...prev, newTx]);
  };

  // Hard reset simulator back to starting state
  const resetToDefault = () => {
    localStorage.removeItem(LOCAL_STORAGE_ACCOUNT_KEY);
    localStorage.removeItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
    localStorage.removeItem('mbc_sandbox_incoming_sender');
    localStorage.removeItem('mbc_sandbox_incoming_delay');
    localStorage.removeItem('mbc_sandbox_hide_time');
    setAccount(DEFAULT_ACCOUNT);
    setTransactions(INITIAL_TRANSACTIONS);
    setIncomingSender('Tan Ah Kao');
    setIncomingDelay(10);
    setTimerCountdown(null);
    setActiveNotification(null);
    setHideTime(true);
    setActiveScreen('dashboard');
    setIsMobileSettingsOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900 font-sans" id="main-app-root">
      
      {/* Pristine Clean Minimalist Header layout */}
      <nav className="h-20 bg-white border-b border-slate-250 flex items-center justify-between px-6 sm:px-10 shrink-0 shadow-sm" id="main-editor-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-blue-900 leading-none block">MBC Bank</span>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6 font-semibold text-slate-600 text-sm">
            <button onClick={() => setActiveScreen('dashboard')} className={`hover:text-blue-700 cursor-pointer pb-1 transition-all ${activeScreen === 'dashboard' ? 'text-blue-700 border-b-2 border-blue-700' : ''}`}>Dashboard</button>
            <button onClick={() => setActiveScreen('transfer')} className={`hover:text-blue-700 cursor-pointer pb-1 transition-all ${activeScreen === 'transfer' ? 'text-blue-700 border-b-2 border-blue-700' : ''}`}>Transfers</button>
            <span className="opacity-45 cursor-not-allowed text-slate-400">Accounts</span>
            <span className="opacity-45 cursor-not-allowed text-slate-400">Cards</span>
          </div>
          
          <div className="flex items-center gap-3 pl-6 border-l border-slate-200" id="header-user-status">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Welcome back,</p>
              <p className="text-xs font-black text-slate-800 tracking-tight">{account.accountHolderName}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-50 border-2 border-blue-200 shadow-sm flex items-center justify-center text-blue-800 font-bold text-xs" id="header-user-avatar">
              {account.accountHolderName.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Sandbox Interactive Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex items-center justify-center" id="workspace-layout">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
          
          {/* LEFT SECTION (Col Span 4): Presentation Info Sidebar (Shows only on large displays) */}
          <div className="hidden lg:flex lg:col-span-4 flex-col space-y-6" id="highlights-sidebar-container">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4 text-slate-800" id="presentation-highlights-card">
              <div className="flex items-center space-x-2 text-blue-700">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-xs font-black uppercase tracking-widest">Key features</h3>
              </div>
              
              <ul className="space-y-4 text-xs text-slate-600 leading-relaxed">
                <li className="flex items-start space-x-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900 block">DuitNow Interface</strong>
                    Authentic Malaysian banking transfer wizard supporting major local banks (Maybank, CIMB, PBB, etc.).
                  </div>
                </li>
                <li className="flex items-start space-x-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900 block">Instant Customization</strong>
                    Tweak account balances, holder's name, index identifiers, and savings streams live in real-time.
                  </div>
                </li>
                <li className="flex items-start space-x-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900 block">Authentication Loop</strong>
                    Simulates dynamic SecureTAC OTP SMS verification system blocks to preserve standard security layouts.
                  </div>
                </li>
                <li className="flex items-start space-x-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900 block">Perfect Mobile Receipts</strong>
                    Generates official-looking interbank transaction statements with precise alignment, ready for layout presentations.
                  </div>
                </li>
              </ul>
            </div>

            {/* Quick help sandbox notes */}
            <div className="bg-white border border-slate-200 rounded-[20px] p-6 space-y-3" id="presentation-compliance-card">
              <div className="flex items-center space-x-2 text-blue-700" id="sandbox-rules-header">
                <Scale className="w-4 h-4" />
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-900">Presenter Disclaimer</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium" id="compliance-regulatory-disclaimer">
                This sandbox application implements a fully offline client-state simulation. Use this secure interface solely for product design previews, mock testing, and internal demonstrations.
              </p>
            </div>
          </div>

          {/* MIDDLE SECTION (Col Span 4): The Phone Simulator */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center py-2 relative" id="center-mobile-sim-wrapper">
            <MobileApp
              account={account}
              updateAccount={updateAccount}
              transactions={transactions}
              addTransaction={addTransaction}
              activeScreen={activeScreen}
              setActiveScreen={setActiveScreen}
              activeNotification={activeNotification}
              clearNotification={() => setActiveNotification(null)}
              hideTime={hideTime}
            />
            
            {/* Elegant low-profile text link to access settings in mobile browser views */}
            <button
              onClick={() => setIsMobileSettingsOpen(true)}
              className="mt-3 text-[10px] sm:text-xs font-black uppercase tracking-wider text-blue-700 hover:text-blue-800 underline decoration-2 cursor-pointer lg:hidden"
              id="mobile-settings-text-trigger"
            >
              Configure Simulator Details
            </button>
          </div>

          {/* RIGHT SECTION (Col Span 4): Configuration Controls View */}
          <div className="hidden lg:block lg:col-span-4 h-full" id="desktop-controls-wrapper">
            <ControlPanel
              account={account}
              updateAccount={updateAccount}
              resetToDefault={resetToDefault}
              activeScreen={activeScreen}
              setActiveScreen={setActiveScreen}
              addTransaction={addTransaction}
              incomingSender={incomingSender}
              setIncomingSender={setIncomingSender}
              incomingDelay={incomingDelay}
              setIncomingDelay={setIncomingDelay}
              timerCountdown={timerCountdown}
              setTimerCountdown={setTimerCountdown}
              hideTime={hideTime}
              setHideTime={setHideTime}
            />
          </div>

        </div>
      </main>

      {/* MOBILE SETTINGS DRAWER OVERLAY (Hides on desktop screen resolutions) */}
      {isMobileSettingsOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-end lg:hidden" id="mobile-control-drawer-backdrop">
          <div className="bg-white rounded-t-[32px] w-full max-h-[85vh] overflow-y-auto p-5 pb-8 relative" id="mobile-control-drawer-inner">
            <button 
              onClick={() => setIsMobileSettingsOpen(false)}
              className="absolute right-4 top-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 active:scale-95 transition"
              id="close-drawer-handle"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="mt-2 text-slate-900">
              <ControlPanel
                account={account}
                updateAccount={updateAccount}
                resetToDefault={resetToDefault}
                activeScreen={activeScreen}
                setActiveScreen={setActiveScreen}
                addTransaction={addTransaction}
                incomingSender={incomingSender}
                setIncomingSender={setIncomingSender}
                incomingDelay={incomingDelay}
                setIncomingDelay={setIncomingDelay}
                timerCountdown={timerCountdown}
                setTimerCountdown={setTimerCountdown}
                hideTime={hideTime}
                setHideTime={setHideTime}
              />
            </div>
          </div>
        </div>
      )}

      {/* System Footer brandings */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-[10px] text-slate-450 tracking-wider uppercase shrink-0" id="main-editor-footer">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <span className="text-slate-400 font-semibold">© 1998 - 2026 MBC Interbank Services Berhad. All Rights Reserved.</span>
          <span className="text-blue-600 font-bold bg-blue-50/80 px-2.5 py-1 rounded-md">Malaysia Secure Sandbox v4.2.1-Prod</span>
        </div>
      </footer>

    </div>
  );
}
