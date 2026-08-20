import React from 'react';
import { Client, ReconciliationMetrics } from '../types';
import { Lock, Unlock } from 'lucide-react';

interface HeaderProps {
  clients: Client[];
  activeClientId: string;
  setActiveClientId: (id: string) => void;
  metrics: ReconciliationMetrics;
  selectedPeriod: string;
  setSelectedPeriod: (p: string) => void;
  onTogglePeriodLock: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  clients,
  activeClientId,
  setActiveClientId,
  metrics,
  selectedPeriod,
  setSelectedPeriod,
  onTogglePeriodLock,
}) => {
  const activeClient = clients.find(c => c.id === activeClientId) || clients[0];

  return (
    <header className="h-16 border-b border-white/10 px-8 flex items-center justify-between bg-white/[0.03] backdrop-blur-2xl shrink-0 z-20 shadow-sm">
      <div className="flex items-center space-x-4">
        {/* Client Entity Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-white/60">Entity:</span>
          <select 
            id="select-active-client"
            value={activeClientId}
            onChange={(e) => setActiveClientId(e.target.value)}
            className="bg-white/5 border border-white/15 rounded-xl px-3.5 py-1.5 text-sm font-semibold text-white focus:outline-none focus:border-indigo-400 backdrop-blur-md cursor-pointer hover:bg-white/10 transition"
          >
            {clients.map(c => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                {c.name} ({c.businessType})
              </option>
            ))}
          </select>
        </div>

        <span className="text-white/20">|</span>

        {/* Period Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-white/60">Close Period:</span>
          <select 
            id="select-close-period"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-white/5 border border-white/15 rounded-xl px-3.5 py-1.5 text-sm font-medium text-white/90 focus:outline-none focus:border-indigo-400 backdrop-blur-md cursor-pointer hover:bg-white/10 transition"
          >
            <option value="2026-06" className="bg-slate-900 text-white">June 2026</option>
            <option value="2026-05" className="bg-slate-900 text-white">May 2026</option>
            <option value="2026-04" className="bg-slate-900 text-white">April 2026</option>
            <option value="2026-Q2" className="bg-slate-900 text-white">Q2 2026 (Cumulative)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Lock Status Action Button */}
        <button
          id="btn-toggle-period-lock"
          onClick={onTogglePeriodLock}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition border cursor-pointer backdrop-blur-md ${
            metrics.isPeriodLocked
              ? 'bg-purple-500/20 text-purple-200 border-purple-500/40 hover:bg-purple-500/30'
              : 'bg-white/5 text-white/80 border-white/15 hover:bg-white/10 hover:text-white'
          }`}
          title={metrics.isPeriodLocked ? 'Reconciliation period is locked for edits' : 'Period open for posting and matching'}
        >
          {metrics.isPeriodLocked ? (
            <>
              <Lock className="w-3.5 h-3.5 text-purple-300" />
              <span>Period Locked</span>
            </>
          ) : (
            <>
              <Unlock className="w-3.5 h-3.5 text-white/50" />
              <span>Period Open</span>
            </>
          )}
        </button>

        {/* Reconciliation Status Badge */}
        <div 
          id="status-reconciliation-badge"
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-2 backdrop-blur-md ${
            metrics.status === 'Reconciled' 
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10' 
              : metrics.status === 'Discrepancy'
              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-lg shadow-rose-500/10'
              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/10'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${
            metrics.status === 'Reconciled' 
              ? 'bg-emerald-400 shadow-sm shadow-emerald-400' 
              : metrics.status === 'Discrepancy' 
              ? 'bg-rose-400 animate-pulse shadow-sm shadow-rose-400' 
              : 'bg-amber-400 animate-pulse shadow-sm shadow-amber-400'
          }`} />
          <span>{metrics.status}</span>
        </div>

        {/* Auditor Profile */}
        <div className="flex items-center space-x-2.5 border-l border-white/10 pl-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-400 flex items-center justify-center text-xs font-bold text-white shadow-md border border-white/20">
            SJ
          </div>
          <div className="text-xs text-left">
            <div className="font-semibold text-white">Sarah Jenkins, CPA</div>
            <div className="text-white/50 text-[10px]">Senior Accounting Lead</div>
          </div>
        </div>
      </div>
    </header>
  );
};
