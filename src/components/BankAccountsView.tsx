import React, { useState } from 'react';
import { Building2, Plus, Lock, CheckCircle2, DollarSign, X } from 'lucide-react';
import { BankAccount, Client } from '../types';

interface BankAccountsViewProps {
  accounts: BankAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
  clients: Client[];
  activeClientId: string;
  triggerToast: (msg: string) => void;
  logAudit: (action: string, affected?: string, prev?: string, next?: string) => void;
}

export const BankAccountsView: React.FC<BankAccountsViewProps> = ({
  accounts,
  setAccounts,
  clients,
  activeClientId,
  triggerToast,
  logAudit,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<BankAccount['accountType']>('Checking');
  const [lastFour, setLastFour] = useState('');
  const [openingBalance, setOpeningBalance] = useState('100000.00');

  const clientAccounts = accounts.filter(a => a.clientId === activeClientId);
  const activeClient = clients.find(c => c.id === activeClientId) || clients[0];

  function handleAddAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!bankName.trim() || !accountName.trim()) return;

    const newAcc: BankAccount = {
      id: `acc_${Date.now()}`,
      clientId: activeClientId,
      bankName: bankName.trim(),
      accountName: accountName.trim(),
      accountType,
      lastFour: lastFour.trim() || String(Math.floor(1000 + Math.random() * 9000)),
      currency: 'USD',
      openingBalance: parseFloat(openingBalance) || 0,
      currentStatus: 'Connected',
    };

    setAccounts(prev => [...prev, newAcc]);
    logAudit('CREATE_BANK_ACCOUNT', newAcc.id, undefined, `Added ${newAcc.bankName} (${newAcc.accountName} *${newAcc.lastFour})`);
    triggerToast(`Bank account ${newAcc.accountName} added successfully.`);

    setBankName('');
    setAccountName('');
    setLastFour('');
    setOpeningBalance('100000.00');
    setShowAddModal(false);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <span>Bank & Financial Accounts</span>
          </h2>
          <p className="text-sm text-white/60">
            Registered financial institutions and general ledger cash accounts for <strong className="text-white font-semibold">{activeClient?.name}</strong>.
          </p>
        </div>
        <button 
          id="btn-open-add-bank-modal"
          onClick={() => setShowAddModal(true)}
          className="px-4.5 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white rounded-2xl text-xs font-semibold transition flex items-center space-x-2 shadow-lg shadow-indigo-500/25 border border-white/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Bank Account</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clientAccounts.map(acc => (
          <div 
            key={acc.id} 
            id={`bank-account-card-${acc.id}`}
            className="bg-white/[0.04] backdrop-blur-xl border border-white/12 rounded-3xl p-6.5 flex flex-col justify-between space-y-4 hover:border-white/25 hover:bg-white/[0.06] transition shadow-xl"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">{acc.bankName}</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{acc.accountName}</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90 border border-white/15 font-mono backdrop-blur-sm">
                  {acc.accountType} (****{acc.lastFour})
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-white/70 py-3.5 border-t border-b border-white/10">
                <div className="flex justify-between">
                  <span className="text-white/50">Currency / Denomination:</span>
                  <span className="font-semibold text-white">{acc.currency} (United States Dollar)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Opening Balance (Reconciliation Baseline):</span>
                  <span className="font-mono font-bold text-white">${acc.openingBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Integration Status:</span>
                  <span className="font-medium text-emerald-300 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{acc.currentStatus} (Encrypted Session)</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs text-white/50">
              <span className="flex items-center space-x-1 text-white/40">
                <Lock className="w-3 h-3 text-white/40" />
                <span>Zero Credentials Stored</span>
              </span>
              <span className="text-indigo-300 font-semibold cursor-pointer hover:text-indigo-200">
                View Account Statements →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Bank Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/90 border border-white/20 rounded-3xl w-full max-w-lg p-6.5 space-y-5 shadow-2xl shadow-black/50 backdrop-blur-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3.5">
              <h3 className="text-lg font-bold text-white">Add Bank Account for {activeClient?.name}</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Bank Institution</label>
                  <input 
                    id="input-new-bank-institution"
                    type="text" 
                    value={bankName} 
                    onChange={e => setBankName(e.target.value)}
                    placeholder="e.g. JPMorgan Chase" 
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 backdrop-blur-md placeholder-white/40"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Account Label</label>
                  <input 
                    id="input-new-account-label"
                    type="text" 
                    value={accountName} 
                    onChange={e => setAccountName(e.target.value)}
                    placeholder="e.g. Primary Operating Checking" 
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 backdrop-blur-md placeholder-white/40"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Account Classification</label>
                  <select
                    id="select-new-account-type"
                    value={accountType}
                    onChange={e => setAccountType(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 backdrop-blur-md"
                  >
                    <option value="Checking" className="bg-slate-900 text-white">Checking Account</option>
                    <option value="Savings" className="bg-slate-900 text-white">Savings / Money Market</option>
                    <option value="Credit Card" className="bg-slate-900 text-white">Corporate Credit Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Last 4 Digits</label>
                  <input 
                    id="input-new-account-last4"
                    type="text" 
                    maxLength={4}
                    value={lastFour} 
                    onChange={e => setLastFour(e.target.value)}
                    placeholder="e.g. 8492" 
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-400 backdrop-blur-md placeholder-white/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Opening Balance ($ USD)</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
                  <input 
                    id="input-new-opening-balance"
                    type="number" 
                    step="0.01"
                    value={openingBalance} 
                    onChange={e => setOpeningBalance(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-400 backdrop-blur-md placeholder-white/40"
                    required
                  />
                </div>
                <span className="text-[11px] text-white/40 mt-1 block">Baseline cash balance at start of reconciliation period.</span>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-white/10 text-white/80 rounded-xl text-sm font-semibold hover:bg-white/15 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  id="btn-submit-new-account"
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-500/25 border border-white/20 cursor-pointer"
                >
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
