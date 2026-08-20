import React, { useState } from 'react';
import { 
  Check, X, Sliders, CheckCircle2, AlertCircle, Info, 
  Sparkles, RefreshCw, Layers, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { Transaction, RuleWeights } from '../types';

interface MatchReviewViewProps {
  transactions: Transaction[];
  weights: RuleWeights;
  setWeights: React.Dispatch<React.SetStateAction<RuleWeights>>;
  onApproveMatch: (txId: string) => void;
  onRejectMatch: (txId: string) => void;
  onApproveAllSuggested: () => void;
  onRerunMatching: () => void;
  setCurrentView: (v: any) => void;
}

export const MatchReviewView: React.FC<MatchReviewViewProps> = ({
  transactions,
  weights,
  setWeights,
  onApproveMatch,
  onRejectMatch,
  onApproveAllSuggested,
  onRerunMatching,
  setCurrentView,
}) => {
  const [activeTab, setActiveTab] = useState<'suggested' | 'auto_approved' | 'all'>('suggested');
  const [showWeightsModal, setShowWeightsModal] = useState(false);

  // Extract matched pairs (bank side)
  const suggestedPairs = transactions.filter(t => t.source === 'bank' && t.status === 'matched_suggested');
  const autoMatchedPairs = transactions.filter(t => t.source === 'bank' && (t.status === 'matched_auto' || t.status === 'approved'));
  
  const displayedPairs = activeTab === 'suggested' 
    ? suggestedPairs 
    : activeTab === 'auto_approved' 
    ? autoMatchedPairs 
    : [...suggestedPairs, ...autoMatchedPairs];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Transaction Match Review</span>
          </h2>
          <p className="text-sm text-white/60">
            Verify automated deterministic pairings and evaluate medium-confidence suggested matches.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button 
            id="btn-tune-weights-modal"
            onClick={() => setShowWeightsModal(true)}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white/90 rounded-2xl text-xs font-semibold transition border border-white/15 flex items-center space-x-2 cursor-pointer backdrop-blur-sm shadow-md"
          >
            <Sliders className="w-4 h-4 text-indigo-300" />
            <span>Tune Rule Weights</span>
          </button>

          {suggestedPairs.length > 0 && (
            <button 
              id="btn-approve-all-suggested"
              onClick={onApproveAllSuggested}
              className="px-4.5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-2xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-lg shadow-emerald-500/25 border border-white/20 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Approve All ({suggestedPairs.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
        <button
          id="tab-suggested-matches"
          onClick={() => setActiveTab('suggested')}
          className={`px-4 py-2 rounded-2xl text-xs font-semibold transition cursor-pointer flex items-center space-x-2 backdrop-blur-sm ${
            activeTab === 'suggested'
              ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border border-white/20 shadow-md shadow-indigo-500/20'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <span>Pending Suggested Review</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            activeTab === 'suggested' ? 'bg-white/20 text-white' : 'bg-white/10 text-indigo-300'
          }`}>
            {suggestedPairs.length}
          </span>
        </button>

        <button
          id="tab-auto-approved-matches"
          onClick={() => setActiveTab('auto_approved')}
          className={`px-4 py-2 rounded-2xl text-xs font-semibold transition cursor-pointer flex items-center space-x-2 backdrop-blur-sm ${
            activeTab === 'auto_approved'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border border-white/20 shadow-md shadow-emerald-500/20'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <span>Auto-Matched & Cleared</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            activeTab === 'auto_approved' ? 'bg-white/20 text-white' : 'bg-white/10 text-emerald-300'
          }`}>
            {autoMatchedPairs.length}
          </span>
        </button>

        <button
          id="tab-all-matches"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-semibold transition cursor-pointer backdrop-blur-sm ${
            activeTab === 'all'
              ? 'bg-white/20 text-white border border-white/20'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          All Matches ({suggestedPairs.length + autoMatchedPairs.length})
        </button>
      </div>

      {/* Match Cards List */}
      {displayedPairs.length === 0 ? (
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/12 rounded-3xl p-12 text-center space-y-4 shadow-xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-white">No Pending Matches in this view</h3>
            <p className="text-xs text-white/60 mt-1">
              All high-confidence pairs have been matched. Inspect the Exception Queue for missing items.
            </p>
          </div>
          <button
            id="btn-goto-exceptions-from-match-empty"
            onClick={() => setCurrentView('exceptions')}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white/90 rounded-2xl text-xs font-semibold transition border border-white/15 cursor-pointer backdrop-blur-sm"
          >
            Review Exceptions & Missing Items →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedPairs.map(bankTx => {
            const bookTx = transactions.find(
              t => t.source === 'book' && (t.transaction_id === bankTx.pairedId || t.pairedId === bankTx.transaction_id)
            );

            const isSuggested = bankTx.status === 'matched_suggested';

            return (
              <div 
                key={bankTx.transaction_id}
                id={`match-pair-${bankTx.transaction_id}`}
                className="bg-white/[0.04] backdrop-blur-xl border border-white/12 rounded-3xl p-6.5 space-y-4 hover:border-white/25 hover:bg-white/[0.06] transition shadow-xl"
              >
                {/* Match Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-3.5">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono backdrop-blur-sm ${
                      (bankTx.matchScore || 0) >= 95
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      Confidence: {bankTx.matchScore || 90}%
                    </span>

                    <span className="text-xs text-white/60">
                      {isSuggested ? 'Suggested Match (Requires CPA Sign-off)' : 'Deterministic High-Confidence Match'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {isSuggested ? (
                      <>
                        <button 
                          id={`btn-approve-match-${bankTx.transaction_id}`}
                          onClick={() => onApproveMatch(bankTx.transaction_id)}
                          className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 border border-white/20 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve Match</span>
                        </button>
                        <button 
                          id={`btn-reject-match-${bankTx.transaction_id}`}
                          onClick={() => onRejectMatch(bankTx.transaction_id)}
                          className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-white/80 rounded-xl text-xs font-semibold transition border border-white/15 flex items-center space-x-1.5 cursor-pointer backdrop-blur-sm"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Unpair</span>
                        </button>
                      </>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1.5 backdrop-blur-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Matched & Approved</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Side-by-Side Comparison Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                  {/* Left: Bank Side */}
                  <div className="bg-white/[0.03] p-4.5 rounded-2xl border border-white/10 space-y-2 backdrop-blur-sm">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-indigo-300 uppercase tracking-wider">Bank Statement Record</span>
                      <span className="text-white/50 font-mono">ID: {bankTx.transaction_id}</span>
                    </div>

                    <div className="text-sm font-bold text-white leading-snug">{bankTx.description}</div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-white/70 pt-1.5">
                      <div>
                        <span className="text-white/40 block">Transaction Date:</span>
                        <span className="font-medium text-white/90">{bankTx.transaction_date}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-white/40 block">Amount:</span>
                        <span className={`font-mono font-bold ${bankTx.amount < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          ${bankTx.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-white/50 pt-1">
                      Type: <span className="text-white/80">{bankTx.transaction_type}</span> • Ref: <span className="text-white/80 font-mono">{bankTx.reference_number || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Right: General Ledger / Book Side */}
                  <div className="bg-white/[0.03] p-4.5 rounded-2xl border border-white/10 space-y-2 backdrop-blur-sm">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-purple-300 uppercase tracking-wider">General Ledger Entry</span>
                      <span className="text-white/50 font-mono">ID: {bookTx?.transaction_id || 'N/A'}</span>
                    </div>

                    <div className="text-sm font-bold text-white leading-snug">{bookTx?.description || 'Matching Ledger Line'}</div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-white/70 pt-1.5">
                      <div>
                        <span className="text-white/40 block">Ledger Date:</span>
                        <span className="font-medium text-white/90">{bookTx?.transaction_date || 'N/A'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-white/40 block">Amount:</span>
                        <span className={`font-mono font-bold ${(bookTx?.amount || bankTx.amount) < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          ${(bookTx?.amount ?? bankTx.amount).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-white/50 pt-1">
                      Account: <span className="text-purple-300 font-medium">{bookTx?.account || 'General Expense'}</span> • Vendor: <span className="text-white/80">{bookTx?.vendor || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Match Factors and AI Context */}
                {bankTx.matchReasons && bankTx.matchReasons.length > 0 && (
                  <div className="flex items-center space-x-2 text-xs text-white/60 pt-1 bg-white/[0.02] p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <Info className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                    <span><strong className="text-white/80">Rule Match Factors:</strong> {bankTx.matchReasons.join('  |  ')}</span>
                  </div>
                )}

                {bankTx.aiSuggestion && (
                  <div className="text-xs text-purple-200 bg-purple-500/10 p-3.5 rounded-2xl border border-purple-500/20 space-y-1 backdrop-blur-sm">
                    <div className="flex items-center space-x-1.5 font-bold text-purple-300">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gemini AI Reasoning:</span>
                    </div>
                    <p className="text-white/80">{bankTx.aiSuggestion.reason}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Rule Weight Tuning Modal */}
      {showWeightsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/90 border border-white/20 rounded-3xl w-full max-w-md p-6.5 space-y-5 shadow-2xl shadow-black/50 backdrop-blur-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3.5">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Tune Matching Rule Weights</h3>
              </div>
              <button 
                onClick={() => setShowWeightsModal(false)}
                className="text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-white/60">
              Adjust relative scoring weight percentages for the deterministic matching algorithm.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-white/80 font-semibold mb-1">
                  <span>Exact & Near Amount Match:</span>
                  <span className="font-mono text-indigo-300">{weights.amount}%</span>
                </div>
                <input 
                  type="range" 
                  min={10} 
                  max={60} 
                  value={weights.amount} 
                  onChange={e => setWeights(w => ({ ...w, amount: Number(e.target.value) }))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-white/80 font-semibold mb-1">
                  <span>Date Proximity (+/- 3 days):</span>
                  <span className="font-mono text-indigo-300">{weights.date}%</span>
                </div>
                <input 
                  type="range" 
                  min={5} 
                  max={40} 
                  value={weights.date} 
                  onChange={e => setWeights(w => ({ ...w, date: Number(e.target.value) }))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-white/80 font-semibold mb-1">
                  <span>Normalized Description & Vendor:</span>
                  <span className="font-mono text-indigo-300">{weights.description}%</span>
                </div>
                <input 
                  type="range" 
                  min={5} 
                  max={40} 
                  value={weights.description} 
                  onChange={e => setWeights(w => ({ ...w, description: Number(e.target.value) }))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-white/80 font-semibold mb-1">
                  <span>Reference & Check Number:</span>
                  <span className="font-mono text-indigo-300">{weights.reference}%</span>
                </div>
                <input 
                  type="range" 
                  min={5} 
                  max={25} 
                  value={weights.reference} 
                  onChange={e => setWeights(w => ({ ...w, reference: Number(e.target.value) }))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
              <button 
                type="button" 
                onClick={() => setShowWeightsModal(false)}
                className="px-4 py-2 bg-white/10 text-white/80 rounded-xl text-xs font-semibold hover:bg-white/15 hover:text-white cursor-pointer"
              >
                Close
              </button>
              <button 
                id="btn-rerun-matching-engine"
                type="button"
                onClick={() => {
                  onRerunMatching();
                  setShowWeightsModal(false);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-indigo-500/25 border border-white/20 flex items-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-run Matching Engine</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
