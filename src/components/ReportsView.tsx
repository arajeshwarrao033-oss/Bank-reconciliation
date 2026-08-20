import React from 'react';
import { 
  Download, FileSpreadsheet, Printer, CheckCircle2, 
  Building2, ShieldCheck, Calendar, UserCheck 
} from 'lucide-react';
import { ReconciliationMetrics, Client, BankAccount, Transaction } from '../types';

interface ReportsViewProps {
  metrics: ReconciliationMetrics;
  clients: Client[];
  accounts: BankAccount[];
  transactions: Transaction[];
  activeClientId: string;
  triggerToast: (msg: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  metrics,
  clients,
  accounts,
  transactions,
  activeClientId,
  triggerToast,
}) => {
  const client = clients.find(c => c.id === activeClientId) || clients[0];
  const account = accounts.find(a => a.clientId === activeClientId) || accounts[0];

  function handleExportCSV() {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Transaction ID,Source,Date,Description,Vendor,Account,Amount,Status,Match Score\n';

    transactions.forEach(t => {
      const row = [
        t.transaction_id,
        t.source,
        t.transaction_date,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        `"${(t.vendor || '').replace(/"/g, '""')}"`,
        `"${(t.account || '').replace(/"/g, '""')}"`,
        t.amount.toFixed(2),
        t.status,
        t.matchScore || '',
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reconciliation_Export_${client.name.replace(/\s+/g, '_')}_June2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Reconciliation CSV export downloaded.');
  }

  function handlePrintReport() {
    window.print();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            <span>Certified Reconciliation Reports</span>
          </h2>
          <p className="text-sm text-white/60">
            Generate printable PDF statements and structured CSV datasets for client delivery and tax audit defense.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            id="btn-download-rec-csv"
            onClick={handleExportCSV}
            className="px-4.5 py-2.5 bg-white/10 hover:bg-white/15 text-white/90 rounded-2xl text-xs font-semibold transition border border-white/15 flex items-center space-x-2 cursor-pointer backdrop-blur-sm shadow-md"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV Dataset</span>
          </button>
          <button
            id="btn-print-pdf-report"
            onClick={handlePrintReport}
            className="px-4.5 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white rounded-2xl text-xs font-semibold transition flex items-center space-x-2 shadow-lg shadow-indigo-500/25 border border-white/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Formal Printable Document Layout */}
      <div 
        id="printable-statement"
        className="bg-white/95 text-slate-900 rounded-3xl p-10 space-y-8 shadow-2xl border border-white/40 backdrop-blur-xl"
      >
        {/* Document Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-indigo-800">
              OFFICIAL ACCOUNTING STATEMENT
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              BANK RECONCILIATION REPORT
            </h1>
            <p className="text-sm font-semibold text-slate-700 mt-1">
              {client.name} • {account.bankName} ({account.accountName} - ****{account.lastFour})
            </p>
            <span className="text-xs text-slate-500 font-mono block mt-0.5">
              GAAP ASC 305 Compliance Standard • Tax ID Classification: {client.businessType}
            </span>
          </div>

          <div className="text-right text-xs text-slate-600 space-y-1">
            <div><strong>Period Ending:</strong> June 30, 2026</div>
            <div><strong>Prepared Date:</strong> {new Date().toISOString().substring(0, 10)}</div>
            <div><strong>Lead CPA:</strong> Sarah Jenkins, CPA</div>
            <div className="text-emerald-700 font-bold">Status: {metrics.status}</div>
          </div>
        </div>

        {/* 2-Column Balances Summary */}
        <div className="grid grid-cols-2 gap-8 text-sm">
          {/* Left Column: Bank Statement */}
          <div className="space-y-3 bg-slate-50/90 p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-300 pb-2">
              Bank Statement Balance
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Ending Cleared Bank Balance:</span>
                <span className="font-mono font-bold">${metrics.bankEndingBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Add: Deposits in Transit (DIT):</span>
                <span className="font-mono font-semibold">+${metrics.depositsInTransit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-rose-700">
                <span>Less: Outstanding Checks / Payments:</span>
                <span className="font-mono font-semibold">-${metrics.outstandingChecks.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-3 border-t border-slate-300">
                <span>Adjusted Bank Balance:</span>
                <span className="font-mono text-indigo-900">${metrics.adjustedBankBalance.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Right Column: General Ledger Book */}
          <div className="space-y-3 bg-slate-50/90 p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-300 pb-2">
              General Ledger Book Balance
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">GL Ending Cash Account Balance:</span>
                <span className="font-mono font-bold">${metrics.bookBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Total Items Processed:</span>
                <span className="font-mono">{metrics.bookCount} Ledger Rows</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Auto-Matched Transactions:</span>
                <span className="font-mono">{metrics.autoMatchedCount} Cleared Pairs</span>
              </div>

              <div className="flex justify-between font-bold text-sm text-slate-900 pt-3 border-t border-slate-300">
                <span>Net Discrepancy / Variance:</span>
                <span className={`font-mono ${metrics.difference === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  ${metrics.difference.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Summary List */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Reconciliation Itemization Sample
          </h3>

          <table className="w-full text-left text-xs border-collapse border border-slate-200 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold">
                <th className="p-2.5">Date</th>
                <th className="p-2.5">Source</th>
                <th className="p-2.5">Description</th>
                <th className="p-2.5 text-right">Amount</th>
                <th className="p-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {transactions.slice(0, 8).map(tx => (
                <tr key={tx.transaction_id}>
                  <td className="p-2.5 font-mono text-slate-600">{tx.transaction_date}</td>
                  <td className="p-2.5 capitalize font-medium">{tx.source}</td>
                  <td className="p-2.5 text-slate-800">{tx.description}</td>
                  <td className={`p-2.5 text-right font-mono font-semibold ${tx.amount < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                    ${tx.amount.toFixed(2)}
                  </td>
                  <td className="p-2.5 text-right capitalize text-slate-600">{tx.status.replace('_', ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Auditor Sign-off Box */}
        <div className="pt-6 border-t-2 border-slate-900 flex justify-between items-end text-xs text-slate-600">
          <div className="space-y-1">
            <div className="font-bold text-slate-900">CERTIFICATION OF ACCURACY:</div>
            <p className="max-w-md text-[11px] leading-relaxed">
              I have reviewed the cash balances and bank statement records in accordance with U.S. GAAP guidelines. 
              The schedule above represents a true and complete reconciliation of the accounts for June 2026.
            </p>
          </div>

          <div className="text-right border-t border-slate-400 pt-2 w-48">
            <div className="font-serif italic font-bold text-slate-900 text-sm">Sarah Jenkins, CPA</div>
            <div className="text-[10px] text-slate-500">Authorized Signature & Seal</div>
          </div>
        </div>
      </div>
    </div>
  );
};
