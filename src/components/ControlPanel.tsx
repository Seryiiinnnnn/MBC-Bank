/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  DollarSign, 
  User, 
  CreditCard, 
  Sliders, 
  RotateCcw, 
  Plus, 
  HelpCircle,
  TrendingDown,
  TrendingUp,
  SlidersHorizontal,
  Lock,
  Wallet,
  Bell,
  Clock,
  Play,
  XSquare
} from 'lucide-react';
import { AccountDetails, Transaction } from '../types';

interface ControlPanelProps {
  account: AccountDetails;
  updateAccount: (updated: Partial<AccountDetails>) => void;
  resetToDefault: () => void;
  activeScreen: string;
  setActiveScreen: (screen: 'login' | 'dashboard' | 'transfer' | 'receipt' | 'otp' | 'processing') => void;
  addTransaction: (tx: Transaction) => void;
  
  // Custom interactive incoming transfer scheduler props
  incomingSender: string;
  setIncomingSender: (name: string) => void;
  incomingDelay: number;
  setIncomingDelay: (delay: number) => void;
  timerCountdown: number | null;
  setTimerCountdown: (val: number | null) => void;

  // Customizable toggle to hide time across the application
  hideTime: boolean;
  setHideTime: (hide: boolean) => void;
}

export default function ControlPanel({
  account,
  updateAccount,
  resetToDefault,
  activeScreen,
  setActiveScreen,
  addTransaction,
  incomingSender,
  setIncomingSender,
  incomingDelay,
  setIncomingDelay,
  timerCountdown,
  setTimerCountdown,
  hideTime,
  setHideTime,
}: ControlPanelProps) {
  
  // Custom numeric handle
  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9.]/g, '');
    const num = parseFloat(rawVal) || 0;
    updateAccount({ balance: num });
  };

  const handleSavingsBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9.]/g, '');
    const num = parseFloat(rawVal) || 0;
    updateAccount({ savingsBalance: num });
  };

  const setBalancePreset = (amount: number) => {
    updateAccount({ balance: amount });
  };

  // Inject customizable test debit/credit transactions directly
  const injectCustomTransaction = (type: 'debit' | 'credit') => {
    const amount = type === 'credit' ? 250000.00 : 80000.00;
    const title = type === 'credit' ? 'Wire Transfer' : 'Property Purchase';
    const desc = type === 'credit' ? 'EXTERNAL INTERBANK' : 'MBC GLOBAL ASSETS';
    
    const newTx: Transaction = {
      id: `TXN-INJECT-${Math.floor(Math.random() * 90000)}`,
      title,
      description: desc,
      amount,
      type,
      date: new Date().toLocaleString('en-MY', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).toUpperCase(),
      referenceId: `MBC${Date.now().toString().slice(-10)}`,
      status: 'SUCCESSFUL'
    };
    addTransaction(newTx);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm h-full flex flex-col justify-between" id="control-panel-container">
      <div className="space-y-6">
        
        {/* Title branding header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center text-white">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest leading-none mb-1">Simulator Panel</h3>
              <p className="text-[11px] text-slate-400 font-semibold uppercase font-mono">Live Configuration Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/50 px-2 py-1 rounded-lg font-bold flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse pointer-events-none" />
              <span>Saved</span>
            </span>
            <button 
              type="button"
              onClick={resetToDefault} 
              className="p-1 px-2 text-[10px] text-rose-600 hover:text-white hover:bg-rose-600 border border-slate-200 hover:border-rose-600 rounded-lg flex items-center space-x-1 font-semibold active:scale-95 transition-all cursor-pointer"
              title="Reset to default settings"
              id="reset-preset-trigger"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Dynamic screen shortcut controller */}
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-450 tracking-wider mb-2">Simulate Screen State Navigation</p>
          <div className="grid grid-cols-3 gap-1.5" id="screen-navigation-shortcuts">
            {[
              { id: 'login', label: 'Login Lock' },
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'transfer', label: 'Transfer Form' },
            ].map((scr) => (
              <button
                key={scr.id}
                type="button"
                onClick={() => setActiveScreen(scr.id as any)}
                className={`py-2 px-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider text-center transition-all cursor-pointer ${
                  activeScreen === scr.id 
                    ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {scr.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Parameters Form Fields */}
        <div className="space-y-4">
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Edit A/C Metrics</h4>
            
            {/* Balance Customization in Ringgit (RM) */}
            <div className="space-y-1.5 mb-3" id="edit-primary-balance-field">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                <span>Checking A/C Balance (RM)</span>
                <span className="text-slate-400 font-mono">Input values dynamically</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">RM</span>
                <input
                  type="text"
                  value={account.balance}
                  onChange={handleBalanceChange}
                  className="w-full text-xs font-mono font-bold bg-slate-50 text-slate-800 border border-slate-200 rounded-xl py-2 pl-9 pr-3 outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                  id="ctrl-checking-balance"
                />
              </div>
              
              {/* Account balances shortcuts */}
              <div className="flex flex-wrap gap-1 mt-1.5" id="quick-balance-shortcut-triggers">
                {[5000, 75000, 500000, 1000000, 5000000, 15000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setBalancePreset(amt)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-lg text-[9px] font-mono font-bold transition"
                  >
                    RM {amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Holder Full Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div id="edit-holder-name-field">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">A/C Holder Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={account.accountHolderName}
                    onChange={(e) => updateAccount({ accountHolderName: e.target.value })}
                    className="w-full text-xs font-semibold bg-slate-50 text-slate-800 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 outline-none focus:bg-white focus:border-blue-600 transition"
                    placeholder="Holder Name"
                    id="ctrl-holder-name"
                  />
                </div>
              </div>

              {/* Account ID code mockup */}
              <div id="edit-account-num-field">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Checking A/C number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={account.accountNumber}
                    onChange={(e) => updateAccount({ accountNumber: e.target.value })}
                    className="w-full text-xs font-mono font-bold bg-slate-50 text-slate-800 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 outline-none focus:bg-white focus:border-blue-600 transition"
                    placeholder="0000-0000-00"
                    id="ctrl-holder-acc"
                  />
                </div>
              </div>
            </div>

            {/* Savings Balance input customize */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div id="edit-savings-balance-field">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Savings Fund Balance (RM)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">RM</span>
                  <input
                    type="text"
                    value={account.savingsBalance}
                    onChange={handleSavingsBalanceChange}
                    className="w-full text-xs font-mono font-bold bg-slate-50 text-slate-800 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 outline-none focus:bg-white focus:border-blue-600 transition"
                    id="ctrl-savings-balance"
                  />
                </div>
              </div>

              <div id="edit-savings-num-field">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Savings Account NO</label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={account.savingsAccountNumber}
                    onChange={(e) => updateAccount({ savingsAccountNumber: e.target.value })}
                    className="w-full text-xs font-mono font-bold bg-slate-50 text-slate-800 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 outline-none focus:bg-white focus:border-blue-600 transition"
                    placeholder="Savings No"
                    id="ctrl-savings-acc"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Statement Feed Simulator Injections */}
          <div className="border-t border-slate-100 pt-4" id="statementfeed-actions-group">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Simulate Transaction Event</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => injectCustomTransaction('credit')}
                className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-100 flex items-center justify-center space-x-1.5 text-xs font-bold active:scale-95 transition-all text-center"
                id="inject-credit-event-btn"
              >
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>+ Deposit RM250k</span>
              </button>
              <button
                type="button"
                onClick={() => injectCustomTransaction('debit')}
                className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl border border-rose-100 flex items-center justify-center space-x-1.5 text-xs font-bold active:scale-95 transition-all text-center"
                id="inject-debit-event-btn"
              >
                <TrendingDown className="w-4 h-4 text-rose-600" />
                <span>- Debit RM80k</span>
              </button>
            </div>
          </div>

          {/* Time & Layout Presentation Customs */}
          <div className="border-t border-slate-100 pt-4" id="timestamp-customizer-config">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Layout Customization</h4>
            
            <div className="bg-slate-50 border border-slate-200/65 rounded-2xl p-4 flex items-center justify-between">
              <div className="space-y-0.5 pr-2">
                <span className="block text-xs font-black text-slate-800 uppercase tracking-wide">Hide Clock & Timestamps</span>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  Removes dynamic receipt times, simulated clocks & lock-screen timestamps instantly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHideTime(!hideTime)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  hideTime ? 'bg-blue-700' : 'bg-slate-250'
                }`}
                role="switch"
                aria-checked={hideTime}
                id="toggle-hide-time-switch"
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    hideTime ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Simulated Incoming RM100,000 Transfer Block */}
          <div className="border-t border-slate-100 pt-4" id="incoming-simulated-transfer-config">
            <div className="flex items-center space-x-1.5 mb-2">
              <Bell className="w-4 h-4 text-blue-700" />
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Simulate Incoming Transfer (RM100,000)</h4>
            </div>
            
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              {/* Sender Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex justify-between">
                  <span>Sender's Name</span>
                  <span className="text-[9px] text-emerald-600 font-bold font-mono">Auto-Saved</span>
                </label>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={incomingSender}
                    onChange={(e) => setIncomingSender(e.target.value)}
                    placeholder="e.g. Tan Ah Kao"
                    className="w-full text-xs font-semibold bg-white text-slate-800 border border-slate-200 rounded-xl py-2 pl-8 pr-3 outline-none focus:border-blue-600 transition"
                    id="outgoing-transfer-sender-input"
                  />
                </div>
              </div>

              {/* Delay Config */}
              <div>
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  <span>Alert Delay (Seconds)</span>
                  <span className="text-blue-700 font-mono font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{incomingDelay}s</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={incomingDelay}
                  onChange={(e) => setIncomingDelay(parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700 mb-2"
                />
                
                {/* Timer presets */}
                <div className="flex gap-1.5">
                  {[3, 10, 30].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setIncomingDelay(sec)}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${
                        incomingDelay === sec 
                          ? 'bg-blue-700 text-white' 
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {sec}s Preset
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons / Countdown Indicators */}
              <div className="pt-1">
                {timerCountdown !== null ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 animate-pulse bg-amber-50 border border-amber-200/65 rounded-xl px-3 py-2">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                        <span>Receiving in <strong className="text-amber-600 font-black">{timerCountdown}s</strong>...</span>
                      </div>
                      <span className="text-[9px] text-amber-500 font-medium">Auto-firing</span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setTimerCountdown(null)}
                      className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-100 flex items-center justify-center space-x-1 text-xs font-bold active:scale-95 transition-all text-center cursor-pointer"
                    >
                      <XSquare className="w-3.5 h-3.5" />
                      <span>Cancel Countdown</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => setTimerCountdown(incomingDelay)}
                      className="py-2.5 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl shadow-sm flex items-center justify-center space-x-1.5 text-xs font-bold active:scale-95 transition-all text-center cursor-pointer"
                      id="trigger-incoming-transfer-timer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start {incomingDelay}s Countdown</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Guide disclaimer indicator */}
      <div className="mt-8 bg-zinc-50 rounded-2xl p-4 border border-zinc-100 self-end w-full" id="control-panel-guide-badge">
        <div className="flex space-x-2.5 items-start">
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed text-slate-500">
            <h5 className="font-bold text-slate-700 uppercase tracking-widest text-[9px] mb-0.5">Presentation Instructions</h5>
            <ol className="list-decimal list-inside space-y-1 text-[10px]">
              <li>Configure credentials dynamically in this controller.</li>
              <li>Toggle <strong className="text-slate-800">Transfer Form</strong> to enter client recipient information.</li>
              <li>Input any custom value (example: <strong className="text-slate-800 font-mono">500000</strong>) and tap Confirm.</li>
              <li>Verify SMS alerts and export standard downloadable receipt logs.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
