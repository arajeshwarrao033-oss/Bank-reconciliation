import React, { useState } from 'react';
import { 
  Building2, BookOpen, CheckCircle2, AlertTriangle, Lock, 
  Unlock, ShieldCheck, Download, FileSpreadsheet, ArrowRight 
} from 'lucide-react';
import { ReconciliationMetrics, BankAccount, Transaction, Client } from '../types';

interface ReconciliationCalculationViewProps {
  metrics: ReconciliationMetrics;
  accounts: BankAccount[];
  activeClientId: string;
  clients: Client[];
  transactions: Transaction[];
  onTogglePeriodLock: () => void;
  triggerToast: (msg: string) => void;
  setCurrentView: (v: any) => void;
}

export const ReconciliationCalculationView: React.FC<ReconciliationCalculationViewProps> = ({
  metrics,
  accounts,
  activeClientId,
  clients,
  transactions,
  onTogglePeriodLock,
  triggerToast,
  setCurrentView,
}) => {
  const account = accounts.find(a => a.clientId === activeClientId) || accounts[0];
  const client = clients.find(c => c.id === activeClientId) || clients[0];

  // Specific timing items for detail list
  const ditItems = transactions.filter(
    t => t.source === 'book' && t.amount > 0 && (t.status === 'unmatched' || t.status === 'exception')
  );
  const outstandingCheckItems = transactions.filter(
    t => t.source === 'book' && t.amount < 0 && (t.status === 'unmatched' || t.status === 'exception')
  );
  const unrecordedBankFees = transactions.filter(
    t => t.source === 'bank' && t.amount < 0 && (t.status === 'unmatched' || t.status === 'exception')
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <span>Monthly Bank Reconciliation Schedule</span>
          </h2>
          <p className="text-sm text-white/60">
            Certified U.S. GAAP bank reconciliation statement (ASC 305 Cash & Cash Equivalents).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="btn-goto-reports-from-calc"
            onClick={() => setCurrentView('reports')}
            className="px-4.5 py-2.5 bg-white/10 hover:bg-white/15 text-white/90 rounded-2xl text-xs font-semibold transition border border-white/15 flex items-center space-x-2 cursor-pointer backdrop-blur-sm shadow-md"
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-300" />
            <span>Generate Full Statement</span>
          </button>
        </div>
      </div>

      {/* Main Reconciliation Card */}
      <div className="bg-white/[0.04] backdrop-blur-xl border border-white/12 rounded-3xl p-8 space-y-6 shadow-2xl">
        {/* Entity and Account Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-5">
          <div>
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">{client.name}</span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              {account.bankName} — {account.accountName} (****{account.lastFour})
            </h3>
            <span className="text-xs text-white/50">Period Ending: June 30, 2026 • Basis: Accrual</span>
          </div>

          <div className={`px-4 py-1.5 rounded-full text-xs font-bold font-mono flex items-center space-x-2 backdrop-blur-sm ${
            metrics.difference === 0 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${metrics.difference === 0 ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse shadow-sm shadow-amber-400'}`} />
            <span>{metrics.difference === 0 ? 'RECONCILED ($0.00 VARIANCE)' : `DISCREPANCY: $${Math.abs(metrics.difference).toFixed(2)}`}</span>
          </div>
        </div>

        {/* Math Schedule */}
        <div className="space-y-3.5 text-sm">
          {/* Section 1: Bank Balance & Timing Items */}
          <div className="flex justify-between py-2 border-b border-white/10 font-medium">
            <span className="text-white/80">1. Bank Statement Ending Balance</span>
            <span className="font-mono font-bold text-white">${metrics.bankEndingBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>

          {/* DIT */}
          <div className="pl-4 space-y-1 py-1">
            <div className="flex justify-between text-xs">
              <span className="text-white/60">Add: Deposits in Transit (DIT)</span>
              <span className="font-mono font-semibold text-emerald-400">+${metrics.depositsInTransit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            {ditItems.map(dit => (
              <div key={dit.transaction_id} className="flex justify-between text-[11px] text-white/40 pl-4">
                <span>• {dit.description} ({dit.transaction_date})</span>
                <span className="font-mono text-emerald-300/80">+${dit.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Outstanding Checks */}
          <div className="pl-4 space-y-1 py-1">
            <div className="flex justify-between text-xs">
              <span className="text-white/60">Less: Outstanding Checks & In-Transit Outflows</span>
              <span className="font-mono font-semibold text-rose-400">-${metrics.outstandingChecks.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            {outstandingCheckItems.map(chk => (
              <div key={chk.transaction_id} className="flex justify-between text-[11px] text-white/40 pl-4">
                <span>• {chk.description} (Ref: {chk.reference_number || 'N/A'})</span>
                <span className="font-mono text-rose-300/80">-${Math.abs(chk.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Subtotal: Adjusted Bank Balance */}
          <div className="flex justify-between py-3.5 px-5 rounded-2xl bg-white/[0.03] border border-white/10 font-bold text-white backdrop-blur-sm">
            <span className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Adjusted Bank Balance</span>
            </span>
            <span className="font-mono text-indigo-300">${metrics.adjustedBankBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>

          {/* Section 2: General Ledger Book Balance */}
          <div className="flex justify-between py-2 border-b border-white/10 font-medium pt-3">
            <span className="text-white/80">2. General Ledger Book Balance</span>
            <span className="font-mono font-bold text-white">${metrics.bookBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>

          {/* Unrecorded Bank Fees */}
          {unrecordedBankFees.length > 0 && (
            <div className="pl-4 space-y-1 py-1">
              <div className="flex justify-between text-xs">
                <span className="text-amber-300">Unrecorded Bank Charges (Pending Adjusting JE):</span>
                <span className="font-mono font-semibold text-amber-300">
                  -${unrecordedBankFees.reduce((s, t) => s + Math.abs(t.amount), 0).toFixed(2)}
                </span>
              </div>
              {unrecordedBankFees.map(fee => (
                <div key={fee.transaction_id} className="flex justify-between text-[11px] text-white/40 pl-4">
                  <span>• {fee.description} ({fee.transaction_date})</span>
                  <span className="font-mono text-amber-200/80">-${Math.abs(fee.amount).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Variance / Discrepancy Box */}
          <div className={`flex justify-between py-4.5 px-6 rounded-2xl font-bold text-base transition backdrop-blur-sm ${
            metrics.difference === 0 
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10' 
              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/10'
          }`}>
            <span className="flex items-center space-x-2.5">
              <ShieldCheck className="w-5 h-5" />
              <span>Net Reconciliation Variance</span>
            </span>
            <span className="font-mono text-lg">${metrics.difference.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
        </div>

        {/* Lock / Sign-off Footer */}
        <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-xs text-white/50">
            <span>Prepared By: <strong className="text-white/80">Sarah Jenkins, CPA</strong></span>
            <span className="mx-2">•</span>
            <span>Period Status: <strong className={metrics.isPeriodLocked ? 'text-purple-300' : 'text-emerald-300'}>{metrics.isPeriodLocked ? 'Locked' : 'Open'}</strong></span>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              id="btn-sign-off-lock-period"
              onClick={() => {
                onTogglePeriodLock();
                triggerToast(metrics.isPeriodLocked ? 'Reconciliation period unlocked.' : 'Reconciliation signed off & locked.');
              }}
              className={`px-5 py-2.5 rounded-2xl text-xs font-semibold transition flex items-center space-x-2 cursor-pointer ${
                metrics.isPeriodLocked
                  ? 'bg-white/10 text-purple-300 hover:bg-white/15 border border-purple-400/40 backdrop-blur-sm'
                  : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white shadow-lg shadow-indigo-500/25 border border-white/20'
              }`}
            >
              {metrics.isPeriodLocked ? (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Period for Edits</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign Off & Lock June 2026 Close</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
