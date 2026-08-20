import React, { useState, useRef } from 'react';
import { 
  Building2, BookOpen, Upload, CheckCircle2, FileSpreadsheet, 
  Sparkles, ArrowRight, ShieldCheck, RefreshCw, AlertCircle 
} from 'lucide-react';
import { Transaction } from '../types';
import { parseCSVString } from '../utils/reconciliation';
import { SAMPLE_BANK_CSV, SAMPLE_BOOK_CSV } from '../data/mockData';

interface ImportDataViewProps {
  onImportTransactions: (newTxs: Transaction[], source: 'bank' | 'book', fileName: string) => void;
  activeClientId: string;
  triggerToast: (msg: string) => void;
  logAudit: (action: string, affected?: string, prev?: string, next?: string) => void;
  setCurrentView: (v: any) => void;
}

export const ImportDataView: React.FC<ImportDataViewProps> = ({
  onImportTransactions,
  activeClientId,
  triggerToast,
  logAudit,
  setCurrentView,
}) => {
  const [bankFileName, setBankFileName] = useState<string | null>('Chase_Operating_June2026.csv');
  const [bankRowCount, setBankRowCount] = useState<number>(6);
  const [bookFileName, setBookFileName] = useState<string | null>('QBO_GeneralLedger_June2026.xlsx');
  const [bookRowCount, setBookRowCount] = useState<number>(9);

  const [previewData, setPreviewData] = useState<{ source: 'bank' | 'book'; rows: Transaction[] } | null>(null);

  const bankInputRef = useRef<HTMLInputElement>(null);
  const bookInputRef = useRef<HTMLInputElement>(null);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, source: 'bank' | 'book') {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const parsed = parseCSVString(text, source, activeClientId);
        if (parsed.length > 0) {
          onImportTransactions(parsed, source, file.name);
          if (source === 'bank') {
            setBankFileName(file.name);
            setBankRowCount(parsed.length);
          } else {
            setBookFileName(file.name);
            setBookRowCount(parsed.length);
          }
          setPreviewData({ source, rows: parsed.slice(0, 4) });
          logAudit(`IMPORT_${source.toUpperCase()}_FILE`, file.name, undefined, `Imported & normalized ${parsed.length} records`);
          triggerToast(`Successfully imported ${parsed.length} ${source} transactions.`);
        } else {
          triggerToast('Error: Could not parse CSV rows. Check file structure.');
        }
      }
    };
    reader.readAsText(file);
  }

  function handleLoadSampleData(source: 'bank' | 'book') {
    const rawCSV = source === 'bank' ? SAMPLE_BANK_CSV : SAMPLE_BOOK_CSV;
    const fileName = source === 'bank' ? 'Chase_Statement_Sample_June.csv' : 'QuickBooks_GeneralLedger_Sample.csv';
    const parsed = parseCSVString(rawCSV, source, activeClientId);

    onImportTransactions(parsed, source, fileName);
    if (source === 'bank') {
      setBankFileName(fileName);
      setBankRowCount(parsed.length);
    } else {
      setBookFileName(fileName);
      setBookRowCount(parsed.length);
    }
    setPreviewData({ source, rows: parsed.slice(0, 4) });
    logAudit(`LOAD_SAMPLE_${source.toUpperCase()}_CSV`, fileName, undefined, `Parsed ${parsed.length} sample rows`);
    triggerToast(`Sample ${source === 'bank' ? 'bank statement' : 'general ledger'} loaded and normalized.`);
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Upload className="w-5 h-5 text-indigo-400" />
            <span>Import Bank & General Ledger Data</span>
          </h2>
          <p className="text-sm text-white/60">
            Upload CSV or XLSX exports from Chase, SVB, BofA, Wells Fargo, QuickBooks Online, Xero, or NetSuite.
          </p>
        </div>
        <button 
          id="btn-goto-matching-after-import"
          onClick={() => setCurrentView('matching')}
          className="px-4.5 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white rounded-2xl text-xs font-semibold transition flex items-center space-x-2 shadow-lg shadow-indigo-500/25 border border-white/20 cursor-pointer shrink-0"
        >
          <span>Proceed to Match Review</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Two Import Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bank Statement Box */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/12 rounded-3xl p-6.5 flex flex-col justify-between space-y-6 shadow-xl">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Bank Statement Ingestion</h3>
                <span className="text-xs text-white/50">CSV, OFX, QBO, XLSX</span>
              </div>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Auto-detects transaction dates, deposits, withdrawals, merchant codes, ACH tokens, and check numbers.
            </p>
          </div>

          <div className="border-2 border-dashed border-white/15 rounded-3xl p-6 text-center space-y-3.5 bg-white/[0.02] backdrop-blur-md">
            {bankFileName ? (
              <div className="space-y-2">
                <CheckCircle2 className="w-9 h-9 text-emerald-400 mx-auto" />
                <div className="text-sm font-semibold text-white truncate max-w-xs mx-auto">{bankFileName}</div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {bankRowCount} Normalized Rows Ready
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-9 h-9 text-white/40 mx-auto" />
                <div className="text-xs text-white/70 font-medium">Drag & drop bank statement CSV, or browse</div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <input 
                id="input-file-bank-csv"
                type="file" 
                ref={bankInputRef} 
                onChange={(e) => handleFileUpload(e, 'bank')} 
                accept=".csv,.txt"
                className="hidden" 
              />
              <button 
                id="btn-upload-bank-file"
                onClick={() => bankInputRef.current?.click()}
                className="w-full sm:w-auto px-4 py-2 bg-white/10 hover:bg-white/15 text-white/90 rounded-xl text-xs font-semibold transition border border-white/15 cursor-pointer backdrop-blur-sm"
              >
                Upload Custom CSV
              </button>
              <button 
                id="btn-load-sample-bank-csv"
                onClick={() => handleLoadSampleData('bank')}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-500/20 border border-white/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample Bank File</span>
              </button>
            </div>
          </div>
        </div>

        {/* Book / General Ledger Box */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/12 rounded-3xl p-6.5 flex flex-col justify-between space-y-6 shadow-xl">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-300">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">General Ledger (GL) Export</h3>
                <span className="text-xs text-white/50">QuickBooks, Xero, NetSuite, Sage</span>
              </div>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Auto-maps journal entries, bills, vendor payments, invoices, chart-of-accounts codes, and credit amounts.
            </p>
          </div>

          <div className="border-2 border-dashed border-white/15 rounded-3xl p-6 text-center space-y-3.5 bg-white/[0.02] backdrop-blur-md">
            {bookFileName ? (
              <div className="space-y-2">
                <CheckCircle2 className="w-9 h-9 text-emerald-400 mx-auto" />
                <div className="text-sm font-semibold text-white truncate max-w-xs mx-auto">{bookFileName}</div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {bookRowCount} Normalized Rows Ready
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-9 h-9 text-white/40 mx-auto" />
                <div className="text-xs text-white/70 font-medium">Drag & drop general ledger CSV, or browse</div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <input 
                id="input-file-book-csv"
                type="file" 
                ref={bookInputRef} 
                onChange={(e) => handleFileUpload(e, 'book')} 
                accept=".csv,.txt"
                className="hidden" 
              />
              <button 
                id="btn-upload-book-file"
                onClick={() => bookInputRef.current?.click()}
                className="w-full sm:w-auto px-4 py-2 bg-white/10 hover:bg-white/15 text-white/90 rounded-xl text-xs font-semibold transition border border-white/15 cursor-pointer backdrop-blur-sm"
              >
                Upload Custom CSV
              </button>
              <button 
                id="btn-load-sample-book-csv"
                onClick={() => handleLoadSampleData('book')}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-md shadow-purple-500/20 border border-white/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample Ledger File</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Normalization & Mapping Rules Explanation */}
      <div className="bg-white/[0.04] backdrop-blur-xl border border-white/12 rounded-3xl p-6.5 space-y-4 shadow-xl">
        <h3 className="text-base font-semibold text-white flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <span>Automatic Normalization & Cleansing Pipeline</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-white/70">
          <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/10 space-y-1.5 backdrop-blur-sm">
            <span className="font-bold text-indigo-300">1. Descriptor Sanitization</span>
            <p className="text-white/50">
              Strips terminal noise like <code className="text-white/80 bg-white/10 px-1 py-0.5 rounded">POS#992</code>, <code className="text-white/80 bg-white/10 px-1 py-0.5 rounded">ACH DEBIT</code>, and state abbreviations to isolate core merchant identities.
            </p>
          </div>
          <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/10 space-y-1.5 backdrop-blur-sm">
            <span className="font-bold text-purple-300">2. Decimal & Sign Standard</span>
            <p className="text-white/50">
              Enforces strict signed floating arithmetic: negative for cash outflows (expenses), positive for inflows (deposits).
            </p>
          </div>
          <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/10 space-y-1.5 backdrop-blur-sm">
            <span className="font-bold text-emerald-300">3. Immutable Audit Metadata</span>
            <p className="text-white/50">
              Preserves exact original raw rows alongside normalized tokens for audit defense and compliance.
            </p>
          </div>
        </div>
      </div>

      {/* Normalized Data Preview Table */}
      {previewData && (
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/12 rounded-3xl p-6.5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Preview Normalized {previewData.source === 'bank' ? 'Bank' : 'Ledger'} Rows
            </h4>
            <span className="text-xs text-white/50 font-mono">Top 4 Sample Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white/60 bg-white/[0.03]">
                  <th className="p-3">ID</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Original Description</th>
                  <th className="p-3">Normalized Token</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {previewData.rows.map(tx => (
                  <tr key={tx.transaction_id} className="hover:bg-white/[0.04] font-mono transition">
                    <td className="p-3 text-white/50">{tx.transaction_id.substring(0, 12)}</td>
                    <td className="p-3 text-white/80">{tx.transaction_date}</td>
                    <td className="p-3 text-white font-sans">{tx.description}</td>
                    <td className="p-3 text-indigo-300">{tx.normalized_description}</td>
                    <td className={`p-3 font-semibold ${tx.amount < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      ${tx.amount.toFixed(2)}
                    </td>
                    <td className="p-3 text-white/50">{tx.transaction_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
