import React from 'react';
import { 
  LayoutDashboard, Users, Building2, Upload, CheckCircle2, 
  AlertTriangle, Sparkles, FileText, FileSpreadsheet, 
  Database, RefreshCw, ShieldCheck 
} from 'lucide-react';
import { ViewState, ReconciliationMetrics } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  metrics: ReconciliationMetrics;
  loadDemoData: () => void;
  activeClientName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  metrics,
  loadDemoData,
  activeClientName,
}) => {
  return (
    <aside className="w-72 bg-white/[0.03] backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between shrink-0 h-screen relative z-20 shadow-2xl shadow-black/30">
      <div className="overflow-y-auto">
        {/* App Branding */}
        <div className="p-6 border-b border-white/10 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0 border border-white/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white">AI Bank Rec Assistant</h1>
            <span className="text-xs text-indigo-300 font-medium flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>U.S. GAAP Automation</span>
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          <NavItem 
            id="nav-dashboard"
            icon={<LayoutDashboard className="w-4 h-4" />} 
            label="Dashboard" 
            active={currentView === 'dashboard'} 
            onClick={() => setCurrentView('dashboard')} 
          />
          <NavItem 
            id="nav-clients"
            icon={<Users className="w-4 h-4" />} 
            label="Clients & Entities" 
            active={currentView === 'clients'} 
            onClick={() => setCurrentView('clients')} 
          />
          <NavItem 
            id="nav-accounts"
            icon={<Building2 className="w-4 h-4" />} 
            label="Bank Accounts" 
            active={currentView === 'bank_accounts'} 
            onClick={() => setCurrentView('bank_accounts')} 
          />
          <NavItem 
            id="nav-import"
            icon={<Upload className="w-4 h-4" />} 
            label="Import Data (CSV/XLSX)" 
            active={currentView === 'import'} 
            onClick={() => setCurrentView('import')} 
          />
          <NavItem 
            id="nav-matching"
            icon={<CheckCircle2 className="w-4 h-4" />} 
            label="Match Review" 
            active={currentView === 'matching'} 
            onClick={() => setCurrentView('matching')} 
            badge={metrics.suggestedCount > 0 ? String(metrics.suggestedCount) : undefined}
            badgeColor="bg-indigo-500/20 text-indigo-200 border border-indigo-500/30"
          />
          <NavItem 
            id="nav-exceptions"
            icon={<AlertTriangle className="w-4 h-4" />} 
            label="Exception Queue" 
            active={currentView === 'exceptions'} 
            onClick={() => setCurrentView('exceptions')} 
            badge={metrics.exceptionCount > 0 ? String(metrics.exceptionCount) : undefined}
            badgeColor="bg-amber-500/20 text-amber-200 border border-amber-500/30"
          />
          <NavItem 
            id="nav-ai-analyst"
            icon={<Sparkles className="w-4 h-4" />} 
            label="AI Accounting Analyst" 
            active={currentView === 'ai_analyst'} 
            onClick={() => setCurrentView('ai_analyst')} 
            badge="Gemini"
            badgeColor="bg-purple-500/20 text-purple-200 border border-purple-500/30"
          />
          <NavItem 
            id="nav-reconciliation"
            icon={<FileText className="w-4 h-4" />} 
            label="Reconciliation Calculation" 
            active={currentView === 'reconciliation'} 
            onClick={() => setCurrentView('reconciliation')} 
          />
          <NavItem 
            id="nav-reports"
            icon={<FileSpreadsheet className="w-4 h-4" />} 
            label="Reports & Statements" 
            active={currentView === 'reports'} 
            onClick={() => setCurrentView('reports')} 
          />
          <NavItem 
            id="nav-audit"
            icon={<Database className="w-4 h-4" />} 
            label="Audit Trail & Logs" 
            active={currentView === 'audit'} 
            onClick={() => setCurrentView('audit')} 
          />
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/10 space-y-3 shrink-0">
        <button 
          id="btn-reload-demo-data"
          onClick={loadDemoData}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-500/25 border border-white/20 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset Sample Company</span>
        </button>
        
        <div className="bg-white/[0.04] backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-xs text-white/60 space-y-1.5">
          <div className="flex justify-between font-medium text-white/80">
            <span>Active Entity:</span>
            <span className="text-indigo-300 truncate max-w-[130px] font-semibold">{activeClientName}</span>
          </div>
          <div className="flex justify-between">
            <span>Accounting Basis:</span>
            <span className="text-white/90">Accrual (US GAAP)</span>
          </div>
          <div className="flex justify-between">
            <span>Standard:</span>
            <span className="text-emerald-400 font-mono">ASC 305</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

function NavItem({ 
  id,
  icon, 
  label, 
  active, 
  onClick, 
  badge, 
  badgeColor = 'bg-indigo-500/20 text-indigo-300' 
}: {
  id: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
        active 
          ? 'bg-white/10 text-white border border-white/15 backdrop-blur-md shadow-lg shadow-black/20 font-semibold' 
          : 'text-white/60 hover:text-white hover:bg-white/5'
      }`}
    >
      <div className="flex items-center space-x-3">
        <span className={active ? 'text-indigo-400' : 'text-white/50'}>{icon}</span>
        <span>{label}</span>
      </div>
      {badge && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badgeColor}`}>
          {badge}
        </span>
      )}
    </button>
  );
}
