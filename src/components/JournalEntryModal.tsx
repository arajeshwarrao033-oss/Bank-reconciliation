import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Transaction } from '../types';

interface JournalEntryModalProps {
  transaction?: Transaction | null;
  onClose: () => void;
  onPostJournalEntry: (entry: {
    reference: string;
    date: string;
    memo: string;
    lines: Array<{ account: string; debit: number; credit: number }>;
    resolvedTxId?: string;
  }) => void;
}

export const JournalEntryModal: React.FC<JournalEntryModalProps> = ({
  transaction,
  onClose,
  onPostJournalEntry,
}) => {
  const [date, setDate] = useState(transaction?.transaction_date || '2026-06-30');
  const [reference, setReference] = useState(`ADJ-${Math.floor(100 + Math.random() * 900)}`);
  const [memo, setMemo] = useState(
    transaction ? `Adjusting entry for: ${transaction.description}` : 'Month-end bank fee adjustment'
  );

  const amount = Math.abs(transaction?.amount || 25.00);

  // Initial debit & credit lines
  const [lines, setLines] = useState<Array<{ account: string; debit: number; credit: number }>>([
    {
      account: transaction?.aiSuggestion?.suggested_account || 'Bank & Merchant Fees',
      debit: amount,
      credit: 0,
    },
    {
      account: 'Operating Checking (*8492)',
      debit: 0,
      credit: amount,
    },
  ]);

  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001 && totalDebit > 0;

  function handleLineChange(index: number, field: 'account' | 'debit' | 'credit', val: any) {
    setLines(prev => {
      const next = [...prev];
      if (field === 'account') {
        next[index].account = val;
      } else {
        next[index][field] = parseFloat(val) || 0;
      }
      return next;
    });
  }

  function handleAddLine() {
    setLines(prev => [...prev, { account: 'Miscellaneous Expense', debit: 0, credit: 0 }]);
  }

  function handleRemoveLine(index: number) {
    if (lines.length <= 2) return;
    setLines(prev => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isBalanced) return;

    onPostJournalEntry({
      reference,
      date,
      memo,
      lines,
      resolvedTxId: transaction?.transaction_id,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/90 border border-white/20 rounded-3xl w-full max-w-2xl p-6.5 space-y-6 shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <div className="flex justify-between items-center border-b border-white/10 pb-3.5">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span>Create Adjusting Journal Entry</span>
            </h3>
            <span className="text-xs text-white/50">Strict U.S. GAAP Double-Entry Posting</span>
          </div>
          <button 
            onClick={onClose}
            className="text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Posting Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/15 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Reference Number</label>
              <input 
                type="text" 
                value={reference} 
                onChange={e => setReference(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/15 rounded-2xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-400 transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Entry Memo</label>
              <input 
                type="text" 
                value={memo} 
                onChange={e => setMemo(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/15 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 transition"
              />
            </div>
          </div>

          {/* Lines Table */}
          <div className="border border-white/15 rounded-2xl overflow-hidden bg-white/[0.02]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white/60 bg-white/[0.04]">
                  <th className="p-3">Chart of Accounts</th>
                  <th className="p-3 w-28">Debit ($)</th>
                  <th className="p-3 w-28">Credit ($)</th>
                  <th className="p-3 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.04] transition">
                    <td className="p-2.5">
                      <input 
                        type="text" 
                        value={line.account} 
                        onChange={e => handleLineChange(idx, 'account', e.target.value)}
                        placeholder="Select or type account name..."
                        className="w-full bg-transparent text-white focus:outline-none border-b border-transparent focus:border-indigo-400 py-1"
                        required
                      />
                    </td>
                    <td className="p-2.5">
                      <input 
                        type="number" 
                        step="0.01"
                        value={line.debit || ''} 
                        onChange={e => handleLineChange(idx, 'debit', e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-transparent text-white font-mono focus:outline-none border-b border-transparent focus:border-indigo-400 py-1"
                      />
                    </td>
                    <td className="p-2.5">
                      <input 
                        type="number" 
                        step="0.01"
                        value={line.credit || ''} 
                        onChange={e => handleLineChange(idx, 'credit', e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-transparent text-white font-mono focus:outline-none border-b border-transparent focus:border-indigo-400 py-1"
                      />
                    </td>
                    <td className="p-2.5 text-center">
                      {lines.length > 2 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveLine(idx)}
                          className="text-white/40 hover:text-rose-400 p-1 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button 
              type="button" 
              onClick={handleAddLine}
              className="text-xs text-indigo-300 hover:text-indigo-200 font-semibold flex items-center space-x-1 cursor-pointer transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Split Line</span>
            </button>

            <div className="flex items-center space-x-4 text-xs font-mono">
              <span className="text-white/60">Debits: <strong className="text-white">${totalDebit.toFixed(2)}</strong></span>
              <span className="text-white/60">Credits: <strong className="text-white">${totalCredit.toFixed(2)}</strong></span>
              <span className={`px-3 py-1 rounded-full font-bold backdrop-blur-sm ${
                isBalanced ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {isBalanced ? 'Balanced' : `Off by $${Math.abs(totalDebit - totalCredit).toFixed(2)}`}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2.5 bg-white/10 text-white/80 rounded-2xl text-xs font-semibold hover:bg-white/15 hover:text-white cursor-pointer backdrop-blur-sm transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!isBalanced}
              className={`px-5 py-2.5 rounded-2xl text-xs font-semibold flex items-center space-x-1.5 transition ${
                isBalanced 
                  ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white shadow-lg shadow-indigo-500/25 border border-white/20 cursor-pointer' 
                  : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Post to General Ledger</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
