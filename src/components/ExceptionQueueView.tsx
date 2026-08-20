import React, { useState } from 'react';
import { 
  AlertTriangle, Check, Trash2, Plus, Sparkles, Filter, 
  HelpCircle, CheckCircle2, ArrowRight, ShieldAlert 
} from 'lucide-react';
import { Transaction } from '../types';
import { JournalEntryModal } from './JournalEntryModal';

interface ExceptionQueueViewProps {
  transactions: Transaction[];
  onVoidDuplicate: (txId: string) => void;
  onConfirmDIT: (txId: string) => void;
  onPostJournalEntry: (entry: any) => void;
  onAskAIAboutTx: (tx: Transaction) => void;
}

export type ExceptionFilter = 'all' | 'missing_in_books' | 'missing_in_bank' | 'duplicates';

export const ExceptionQueueView: React.FC<ExceptionQueueViewProps> = ({
  transactions,
  onVoidDuplicate,
  onConfirmDIT,
  onPostJournalEntry,
  onAskAIAboutTx,
}) => {
  const [filter, setFilter] = useState<ExceptionFilter>('all');
  const [selectedTxForJE, setSelectedTxForJE] = useState<Transaction | null>(null);

  const allExceptions = transactions.filter(t => t.status === 'exception' || t.status === 'duplicate');

  const filteredExceptions = allExceptions.filter(tx => {
    if (filter === 'missing_in_books') {
      return tx.source === 'bank' && tx.status === 'exception';
    }
    if (filter === 'missing_in_bank') {
      return tx.source === 'book' && tx.status === 'exception';
    }
    if (filter === 'duplicates') {
      return tx.status === 'duplicate';
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>Exception Management Queue</span>
          </h2>
          <p className="text-sm text-white/60">
            Triage timing differences, unrecorded bank charges, missing entries, and duplicate postings.
          </p>
        </div>

        <button
          id="btn-create-manual-je"
          onClick={() => setSelectedTxForJE({} as any)}
          className="px-4.5 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white rounded-2xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-lg shadow-indigo-500/25 border border-white/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Adjusting Entry</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-3 overflow-x-auto">
        <button
          id="filter-tab-all"
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-semibold transition cursor-pointer shrink-0 backdrop-blur-sm ${
            filter === 'all'
              ? 'bg-white/20 text-white border border-white/20'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          All Exceptions ({allExceptions.length})
        </button>
        <button
          id="filter-tab-missing-books"
          onClick={() => setFilter('missing_in_books')}
          className={`px-4 py-2 rounded-2xl text-xs font-semibold transition cursor-pointer shrink-0 backdrop-blur-sm ${
            filter === 'missing_in_books'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border border-white/20 shadow-md shadow-indigo-500/20'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          Missing in Books (Bank Fees/Charges)
        </button>
        <button
          id="filter-tab-missing-bank"
          onClick={() => setFilter('missing_in_bank')}
          className={`px-4 py-2 rounded-2xl text-xs font-semibold transition cursor-pointer shrink-0 backdrop-blur-sm ${
            filter === 'missing_in_bank'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border border-white/20 shadow-md shadow-purple-500/20'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          Missing in Bank (Deposits in Transit / Checks)
        </button>
        <button
          id="filter-tab-duplicates"
          onClick={() => setFilter('duplicates')}
          className={`px-4 py-2 rounded-2xl text-xs font-semibold transition cursor-pointer shrink-0 backdrop-blur-sm ${
            filter === 'duplicates'
              ? 'bg-rose-500/30 text-rose-200 border border-rose-500/40 shadow-md shadow-rose-500/20'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          Potential Duplicates
        </button>
      </div>

      {/* Exception Table */}
      {filteredExceptions.length === 0 ? (
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/12 rounded-3xl p-12 text-center space-y-3 shadow-xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No active exceptions in this filter!</h3>
          <p className="text-xs text-white/60">All corresponding ledger and bank records are balanced.</p>
        </div>
      ) : (
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/12 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/60 bg-white/[0.03] font-semibold">
                  <th className="p-4">Tx ID</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Description & Account</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4">Classification</th>
                  <th className="p-4">AI Guidance / Reasoning</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredExceptions.map(tx => {
                  const isDuplicate = tx.status === 'duplicate';
                  const isBankFee = tx.source === 'bank' && tx.amount < 0;
                  const isDIT = tx.source === 'book' && tx.amount > 0;
                  const isOutstandingCheck = tx.source === 'book' && tx.amount < 0;

                  return (
                    <tr key={tx.transaction_id} className="hover:bg-white/[0.04] transition">
                      <td className="p-4 font-mono text-white/50">{tx.transaction_id.substring(0, 10)}</td>

                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] uppercase backdrop-blur-sm ${
                          tx.source === 'bank' 
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}>
                          {tx.source}
                        </span>
                      </td>

                      <td className="p-4 text-white/80 font-mono">{tx.transaction_date}</td>

                      <td className="p-4 max-w-xs">
                        <div className="font-semibold text-white truncate">{tx.description}</div>
                        <div className="text-[11px] text-white/50 mt-0.5 truncate">
                          {tx.account || 'Operating Checking'} • Ref: {tx.reference_number || 'None'}
                        </div>
                      </td>

                      <td className={`p-4 text-right font-mono font-bold ${tx.amount < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        ${tx.amount.toFixed(2)}
                      </td>

                      <td className="p-4">
                        <span className={`inline-block px-3 py-1 rounded-full font-semibold text-[11px] backdrop-blur-sm ${
                          isDuplicate 
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                            : isBankFee 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                            : isDIT 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}>
                          {isDuplicate 
                            ? 'Duplicate Posting' 
                            : isBankFee 
                            ? 'Unrecorded Bank Fee' 
                            : isDIT 
                            ? 'Deposit in Transit' 
                            : 'Outstanding Check'}
                        </span>
                      </td>

                      <td className="p-4 max-w-xs text-white/70">
                        <div className="text-[11px] leading-relaxed text-purple-200">
                          {tx.aiSuggestion?.reason || 'Requires accountant review.'}
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {isBankFee && (
                            <button
                              id={`btn-post-je-${tx.transaction_id}`}
                              onClick={() => setSelectedTxForJE(tx)}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white rounded-xl font-semibold transition cursor-pointer shadow-md shadow-indigo-500/20 border border-white/20"
                              title="Create journal entry for this fee"
                            >
                              Post JE
                            </button>
                          )}

                          {isDuplicate && (
                            <button
                              id={`btn-void-dup-${tx.transaction_id}`}
                              onClick={() => onVoidDuplicate(tx.transaction_id)}
                              className="px-3.5 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl font-semibold transition cursor-pointer flex items-center space-x-1 shadow-md shadow-rose-600/20 border border-rose-500/30"
                              title="Void duplicate general ledger entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Void</span>
                            </button>
                          )}

                          {(isDIT || isOutstandingCheck) && (
                            <button
                              id={`btn-confirm-dit-${tx.transaction_id}`}
                              onClick={() => onConfirmDIT(tx.transaction_id)}
                              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-emerald-300 border border-emerald-500/30 rounded-xl font-semibold transition cursor-pointer backdrop-blur-sm"
                              title="Confirm as valid timing difference"
                            >
                              Keep as Timing
                            </button>
                          )}

                          <button
                            id={`btn-ask-ai-tx-${tx.transaction_id}`}
                            onClick={() => onAskAIAboutTx(tx)}
                            className="p-2 bg-white/10 hover:bg-white/15 text-purple-300 border border-purple-500/30 rounded-xl transition cursor-pointer backdrop-blur-sm"
                            title="Consult Gemini AI about this item"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjusting Journal Entry Modal */}
      {selectedTxForJE && (
        <JournalEntryModal
          transaction={selectedTxForJE.transaction_id ? selectedTxForJE : null}
          onClose={() => setSelectedTxForJE(null)}
          onPostJournalEntry={onPostJournalEntry}
        />
      )}
    </div>
  );
};
