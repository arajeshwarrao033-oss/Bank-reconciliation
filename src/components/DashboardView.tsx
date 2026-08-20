import React from 'react';
import { 
  Building2, BookOpen, CheckCircle2, Sparkles, ArrowRight, 
  ShieldCheck, AlertTriangle, Layers, TrendingUp, Scale, Clock
} from 'lucide-react';
import { ViewState, ReconciliationMetrics, Transaction } from '../types';

interface DashboardViewProps {
  metrics: ReconciliationMetrics;
  transactions: Transaction[];
  setCurrentView: (v: ViewState) => void;
  accountName: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  transactions,
  setCurrentView,
  accountName,
}) => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Call to Action */}
      <div className="bg-white/[0.05] backdrop-blur-2xl border border-white/15 rounded-3xl p-6.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-2xl shadow-black/20">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2.5">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Monthly Bank Reconciliation Workspace
            </h2>
            <span className="text-xs bg-indigo-500/20 text-indigo-200 px-2.5 py-0.5 rounded-full font-mono border border-indigo-500/30 font-medium">
              ASC 305 GAAP
            </span>
          </div>
          <p className="text-sm text-white/70 max-w-2xl leading-relaxed">
            Deterministic matching and AI normalization completed for <strong className="text-white font-semibold">{accountName}</strong>. 
            Review proposed pairs and clear open ledger exceptions to finalize the current period.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <button 
            id="btn-dash-review-matches"
            onClick={() => setCurrentView('matching')}
            className="px-4.5 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white rounded-2xl text-sm font-semibold transition shadow-lg shadow-indigo-500/25 border border-white/20 flex items-center space-x-2 cursor-pointer"
          >
            <span>Review Matches</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            id="btn-dash-ask-gemini"
            onClick={() => setCurrentView('ai_analyst')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-2xl text-sm font-semibold transition border border-white/15 backdrop-blur-md flex items-center space-x-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span>Ask Gemini Analyst</span>
          </button>
        </div>
      </div>

      {/* Key Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard 
          id="metric-bank-balance"
          title="Bank Statement Balance" 
          value={`$${metrics.bankEndingBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
          subtitle="Cleared Bank Account Ending Balance"
          icon={<Building2 className="w-5 h-5 text-indigo-300" />}
        />
        <MetricCard 
          id="metric-book-balance"
          title="General Ledger Balance" 
          value={`$${metrics.bookBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
          subtitle="General Ledger Cash Account Balance"
          icon={<BookOpen className="w-5 h-5 text-purple-300" />}
        />
        <MetricCard 
          id="metric-reconciliation-diff"
          title="Reconciliation Difference" 
          value={`$${Math.abs(metrics.difference).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
          subtitle={metrics.difference === 0 ? "Perfect Balance ($0.00)" : "Pending Adjustment / Clearing"}
          statusColor={metrics.difference === 0 ? "text-emerald-400" : "text-amber-400"}
          icon={<Scale className={`w-5 h-5 ${metrics.difference === 0 ? 'text-emerald-300' : 'text-amber-300'}`} />}
        />
        <MetricCard 
          id="metric-time-saved"
          title="Estimated Time Saved" 
          value={`${metrics.timeSavedHours} Hours`} 
          subtitle="Automated Match & Normalization Engine"
          icon={<Clock className="w-5 h-5 text-pink-300" />}
        />
      </div>

      {/* Status Breakdown & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Status Breakdown */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-6.5 lg:col-span-2 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Transaction Status Breakdown</h3>
              <p className="text-xs text-white/50 mt-0.5">Summary of processed bank vs. general ledger entries</p>
            </div>
            <span className="text-xs bg-white/10 text-white/80 border border-white/15 px-3 py-1 rounded-full font-mono backdrop-blur-sm">
              Total: {metrics.bankCount + metrics.bookCount} Items
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatusBox 
              id="status-auto-matched"
              title="Auto-Matched" 
              count={metrics.autoMatchedCount} 
              color="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-lg shadow-emerald-500/5" 
              onClick={() => setCurrentView('matching')}
            />
            <StatusBox 
              id="status-suggested"
              title="Suggested Review" 
              count={metrics.suggestedCount} 
              color="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 shadow-lg shadow-indigo-500/5" 
              onClick={() => setCurrentView('matching')}
            />
            <StatusBox 
              id="status-exceptions"
              title="Open Exceptions" 
              count={metrics.exceptionCount} 
              color="border-amber-500/30 bg-amber-500/10 text-amber-300 shadow-lg shadow-amber-500/5" 
              onClick={() => setCurrentView('exceptions')}
            />
            <StatusBox 
              id="status-duplicates"
              title="Potential Duplicates" 
              count={metrics.duplicateCount} 
              color="border-rose-500/30 bg-rose-500/10 text-rose-300 shadow-lg shadow-rose-500/5" 
              onClick={() => setCurrentView('exceptions')}
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-white/60">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
              <span>Matching Rule Engine: 95%+ confidence auto-clears</span>
            </div>
            <button 
              id="btn-goto-exceptions-link"
              onClick={() => setCurrentView('exceptions')} 
              className="text-indigo-300 hover:text-indigo-200 font-semibold cursor-pointer"
            >
              Open Exception Resolution Queue →
            </button>
          </div>
        </div>

        {/* Accounting Controls & Safety Box */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-6.5 flex flex-col justify-between space-y-4 shadow-xl">
          <div>
            <h3 className="text-base font-semibold text-white mb-1.5 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>GAAP Integrity & Controls</span>
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Every reconciliation step produces immutable audit logs and preserves original source metadata.
            </p>
          </div>

          <div className="space-y-3 py-2">
            <div className="flex items-center space-x-2.5 text-xs text-white/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Strict Double-Entry Bookkeeping Validation</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-white/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Deterministic Matching Engine First</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-white/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Human CPA Confirmation for all Adjustments</span>
            </div>
          </div>

          <button 
            id="btn-dash-open-rec-sheet"
            onClick={() => setCurrentView('reconciliation')}
            className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-2xl text-xs font-semibold transition border border-white/15 text-center cursor-pointer backdrop-blur-sm"
          >
            Open Full Reconciliation Calculation Sheet
          </button>
        </div>
      </div>
    </div>
  );
};

function MetricCard({ 
  id,
  title, 
  value, 
  subtitle, 
  icon, 
  statusColor = 'text-white' 
}: { 
  id: string;
  title: string; 
  value: string; 
  subtitle: string; 
  icon: React.ReactNode; 
  statusColor?: string; 
}) {
  return (
    <div id={id} className="bg-white/[0.04] backdrop-blur-xl border border-white/12 rounded-3xl p-5 flex flex-col justify-between hover:border-white/25 hover:bg-white/[0.07] transition shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">{title}</span>
        <div className="p-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm">
          {icon}
        </div>
      </div>
      <div>
        <div className={`text-2xl font-bold tracking-tight ${statusColor}`}>{value}</div>
        <div className="text-xs text-white/50 mt-1">{subtitle}</div>
      </div>
    </div>
  );
}

function StatusBox({ 
  id,
  title, 
  count, 
  color, 
  onClick 
}: { 
  id: string;
  title: string; 
  count: number; 
  color: string; 
  onClick: () => void; 
}) {
  return (
    <div 
      id={id}
      onClick={onClick}
      className={`p-4.5 rounded-2xl border ${color} flex flex-col justify-between cursor-pointer hover:opacity-90 transition backdrop-blur-md`}
    >
      <span className="text-xs font-medium opacity-90">{title}</span>
      <span className="text-2xl font-bold mt-2">{count}</span>
    </div>
  );
}
