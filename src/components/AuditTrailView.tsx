import React, { useState } from 'react';
import { Database, Search, Filter, Download, ShieldCheck, Clock } from 'lucide-react';
import { AuditLogEntry } from '../types';

interface AuditTrailViewProps {
  auditLog: AuditLogEntry[];
  triggerToast: (msg: string) => void;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  auditLog,
  triggerToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  const filteredLogs = auditLog.filter(entry => {
    const matchesSearch = 
      entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.affectedTransaction && entry.affectedTransaction.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.newState && entry.newState.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAction = filterAction === 'ALL' || entry.action.includes(filterAction);

    return matchesSearch && matchesAction;
  });

  function handleExportAuditLog() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLog, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Audit_Trail_Log_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Immutable audit log JSON downloaded.');
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <span>Immutable Audit Trail & Compliance Log</span>
          </h2>
          <p className="text-sm text-white/60">
            Cryptographically structured event log capturing all user approvals, AI decisions, and ledger adjustments.
          </p>
        </div>

        <button
          id="btn-export-audit-json"
          onClick={handleExportAuditLog}
          className="px-4.5 py-2.5 bg-white/10 hover:bg-white/15 text-white/90 rounded-2xl text-xs font-semibold transition border border-white/15 flex items-center space-x-2 cursor-pointer shrink-0 backdrop-blur-sm shadow-md"
        >
          <Download className="w-4 h-4 text-indigo-300" />
          <span>Export Audit Log (JSON)</span>
        </button>
      </div>

      {/* Search & Action Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/[0.04] backdrop-blur-xl border border-white/12 p-3.5 rounded-3xl shadow-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
          <input 
            id="input-audit-search"
            type="text" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search action, actor, or transaction..."
            className="w-full bg-white/[0.05] border border-white/12 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-indigo-400/50 backdrop-blur-sm"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-white/40" />
          <span className="text-xs text-white/60">Action Filter:</span>
          <select
            id="select-audit-filter-action"
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="bg-white/[0.05] border border-white/12 rounded-2xl px-3.5 py-2 text-xs text-white/90 focus:outline-none focus:border-indigo-400/50 backdrop-blur-sm cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900 text-white">All Actions</option>
            <option value="MATCH" className="bg-slate-900 text-white">Matches & Approvals</option>
            <option value="IMPORT" className="bg-slate-900 text-white">Data Imports</option>
            <option value="JOURNAL" className="bg-slate-900 text-white">Journal Entries</option>
            <option value="AI" className="bg-slate-900 text-white">AI Analyst Actions</option>
            <option value="PERIOD" className="bg-slate-900 text-white">Period Locks</option>
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white/[0.04] backdrop-blur-xl border border-white/12 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/60 bg-white/[0.02] font-semibold">
                <th className="p-4 w-44">Timestamp (UTC)</th>
                <th className="p-4 w-48">Actor / Subsystem</th>
                <th className="p-4 w-52">Action Type</th>
                <th className="p-4 w-44">Affected ID</th>
                <th className="p-4">State Transition & Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredLogs.map(entry => (
                <tr key={entry.id} className="hover:bg-white/[0.03] transition">
                  <td className="p-4 font-mono text-white/60 flex items-center space-x-1.5">
                    <Clock className="w-3 h-3 text-white/40" />
                    <span>{entry.timestamp}</span>
                  </td>

                  <td className="p-4 font-medium text-white/90">{entry.user}</td>

                  <td className="p-4">
                    <span className="inline-block px-3 py-1 rounded-full font-mono font-bold text-[11px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 backdrop-blur-sm">
                      {entry.action}
                    </span>
                  </td>

                  <td className="p-4 font-mono text-white/60">{entry.affectedTransaction || '—'}</td>

                  <td className="p-4 text-white/80">
                    {entry.previousState && (
                      <span className="text-white/40 mr-2 font-mono">[{entry.previousState}] →</span>
                    )}
                    <span className="text-emerald-400 font-medium">{entry.newState}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
