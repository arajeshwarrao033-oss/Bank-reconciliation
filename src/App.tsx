import React, { useState, useMemo } from 'react';
import { 
  ViewState, Client, BankAccount, Transaction, 
  AuditLogEntry, RuleWeights, ReconciliationMetrics 
} from './types';
import { 
  INITIAL_CLIENTS, INITIAL_ACCOUNTS, INITIAL_AUDIT_LOG, 
  generateInitialTransactions 
} from './data/mockData';
import { calculateMetrics, runMatchingEngine } from './utils/reconciliation';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ClientsView } from './components/ClientsView';
import { BankAccountsView } from './components/BankAccountsView';
import { ImportDataView } from './components/ImportDataView';
import { MatchReviewView } from './components/MatchReviewView';
import { ExceptionQueueView } from './components/ExceptionQueueView';
import { AiAnalystView } from './components/AiAnalystView';
import { ReconciliationCalculationView } from './components/ReconciliationCalculationView';
import { ReportsView } from './components/ReportsView';
import { AuditTrailView } from './components/AuditTrailView';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [activeClientId, setActiveClientId] = useState<string>('cli_1');
  const [accounts, setAccounts] = useState<BankAccount[]>(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>(generateInitialTransactions());
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-06');
  const [isPeriodLocked, setIsPeriodLocked] = useState<boolean>(false);

  // Matching Weights
  const [weights, setWeights] = useState<RuleWeights>({
    amount: 35,
    date: 20,
    description: 20,
    reference: 10,
    historical: 10,
    type: 5,
  });

  // Audit Log State
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOG);

  // AI Chat State
  const [chatPrompt, setChatPrompt] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: "Hello! I am your AI Accounting Analyst, specialized in U.S. GAAP bank reconciliation and ASC 305 standards. How can I help analyze your cash balances, unrecorded fees, or duplicate ledger entries today?",
    },
  ]);

  // Toast Notification State
  const [toast, setToast] = useState<string | null>(null);

  function triggerToast(msg: string) {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }

  function logAudit(action: string, affectedTx?: string, prev?: string, next?: string) {
    const entry: AuditLogEntry = {
      id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: 'Sarah Jenkins, CPA',
      action,
      affectedTransaction: affectedTx,
      previousState: prev,
      newState: next,
    };
    setAuditLog(prevLog => [entry, ...prevLog]);
  }

  // Active client & account
  const activeClient = useMemo(() => {
    return clients.find(c => c.id === activeClientId) || clients[0];
  }, [clients, activeClientId]);

  const activeAccount = useMemo(() => {
    return accounts.find(a => a.clientId === activeClientId) || accounts[0];
  }, [accounts, activeClientId]);

  // Calculated Metrics
  const metrics: ReconciliationMetrics = useMemo(() => {
    const activeClientTxs = transactions.filter(t => !t.clientId || t.clientId === activeClientId);
    return calculateMetrics(activeClientTxs, activeAccount?.openingBalance || 115000, isPeriodLocked);
  }, [transactions, activeClientId, activeAccount, isPeriodLocked]);

  // Handle Match Approval
  function handleApproveMatch(txId: string) {
    setTransactions(prev => prev.map(t => {
      if (t.transaction_id === txId || t.pairedId === txId) {
        return { ...t, status: 'approved' };
      }
      return t;
    }));
    logAudit('APPROVE_MATCH', txId, 'Suggested', 'Approved & Cleared');
    triggerToast('Match approved and marked as reconciled.');
  }

  // Handle Match Rejection / Reset
  function handleRejectMatch(txId: string) {
    setTransactions(prev => prev.map(t => {
      if (t.transaction_id === txId || t.pairedId === txId) {
        return { ...t, status: 'unmatched', pairedId: undefined, matchScore: 0, matchReasons: [] };
      }
      return t;
    }));
    logAudit('UNPAIR_MATCH', txId, 'Matched', 'Reset to Unmatched');
    triggerToast('Match unpaired. Transactions returned to unmatched queue.');
  }

  // Batch approve all suggested
  function handleApproveAllSuggested() {
    const suggestedCount = transactions.filter(t => t.status === 'matched_suggested').length;
    setTransactions(prev => prev.map(t => {
      if (t.status === 'matched_suggested') {
        return { ...t, status: 'approved' };
      }
      return t;
    }));
    logAudit('BATCH_APPROVE_SUGGESTED', undefined, `${suggestedCount} items`, 'All Approved');
    triggerToast(`Approved ${suggestedCount / 2} transaction pairs.`);
  }

  // Re-run matching engine with current weights
  function handleRerunMatching() {
    const updated = runMatchingEngine(transactions, weights);
    setTransactions(updated);
    logAudit('RERUN_MATCHING_ENGINE', undefined, undefined, `Weights: Amt ${weights.amount}%, Date ${weights.date}%`);
    triggerToast('Matching engine re-executed with updated rule weights.');
  }

  // Void duplicate ledger entry
  function handleVoidDuplicate(txId: string) {
    const target = transactions.find(t => t.transaction_id === txId);
    setTransactions(prev => prev.filter(t => t.transaction_id !== txId));
    logAudit('VOID_DUPLICATE_ENTRY', txId, target?.description, 'Voided & removed from ledger');
    triggerToast('Duplicate entry voided successfully.');
  }

  // Confirm Deposit in Transit
  function handleConfirmDIT(txId: string) {
    setTransactions(prev => prev.map(t => {
      if (t.transaction_id === txId) {
        return { ...t, status: 'exception', isAdjusted: true };
      }
      return t;
    }));
    logAudit('CONFIRM_TIMING_DIFFERENCE', txId, 'Unverified', 'Confirmed as valid DIT / Outstanding Check');
    triggerToast('Confirmed as recognized timing difference.');
  }

  // Post adjusting journal entry
  function handlePostJournalEntry(entry: {
    reference: string;
    date: string;
    memo: string;
    lines: Array<{ account: string; debit: number; credit: number }>;
    resolvedTxId?: string;
  }) {
    // If resolving a bank fee exception, update its status
    if (entry.resolvedTxId) {
      setTransactions(prev => prev.map(t => {
        if (t.transaction_id === entry.resolvedTxId) {
          return { ...t, status: 'approved', isAdjusted: true };
        }
        return t;
      }));
    }

    // Add matching book transaction for the cash impact
    const netCash = entry.lines
      .filter(l => l.account.toLowerCase().includes('checking') || l.account.toLowerCase().includes('bank'))
      .reduce((sum, l) => sum + (l.credit ? -l.credit : l.debit), 0);

    if (netCash !== 0) {
      const newBookTx: Transaction = {
        transaction_id: `tx_g_je_${Date.now()}`,
        clientId: activeClientId,
        source: 'book',
        transaction_date: entry.date,
        posting_date: entry.date,
        description: entry.memo,
        normalized_description: entry.memo.toUpperCase(),
        amount: netCash,
        debit: netCash < 0 ? Math.abs(netCash) : 0,
        credit: netCash > 0 ? netCash : 0,
        transaction_type: 'Journal Entry',
        reference_number: entry.reference,
        check_number: '',
        vendor: 'General Ledger Adjustment',
        customer: '',
        account: entry.lines[0]?.account || 'Adjusting Entry',
        currency: 'USD',
        original_row: { memo: entry.memo, ref: entry.reference },
        status: 'approved',
      };
      setTransactions(prev => [...prev, newBookTx]);
    }

    logAudit('POST_JOURNAL_ENTRY', entry.reference, undefined, `Posted JE: ${entry.memo}`);
    triggerToast(`Journal entry ${entry.reference} posted successfully.`);
  }

  // Import parsed transactions from file or sample
  function handleImportTransactions(newTxs: Transaction[], source: 'bank' | 'book', fileName: string) {
    setTransactions(prev => {
      // Filter out previous un-approved items from that source and add new
      const filtered = prev.filter(t => t.source !== source || t.status === 'approved');
      const combined = [...filtered, ...newTxs];
      return runMatchingEngine(combined, weights);
    });
  }

  // Period locking toggle
  function handleTogglePeriodLock() {
    setIsPeriodLocked(prev => {
      const next = !prev;
      logAudit(next ? 'LOCK_RECONCILIATION_PERIOD' : 'UNLOCK_RECONCILIATION_PERIOD', selectedPeriod, undefined, next ? 'Locked by Sarah Jenkins, CPA' : 'Unlocked for adjustments');
      return next;
    });
  }

  // Gemini AI Chat query handler
  async function handleAskAI(customQuery?: string) {
    const q = customQuery || chatPrompt;
    if (!q.trim() || isAiLoading) return;

    const newHistory = [...chatHistory, { role: 'user' as const, text: q }];
    setChatHistory(newHistory);
    setChatPrompt('');
    setIsAiLoading(true);

    try {
      const contextPayload = {
        clientName: activeClient.name,
        businessType: activeClient.businessType,
        accountingBasis: activeClient.accountingBasis,
        accountName: activeAccount?.accountName,
        bankEndingBalance: metrics.bankEndingBalance,
        bookBalance: metrics.bookBalance,
        depositsInTransit: metrics.depositsInTransit,
        outstandingChecks: metrics.outstandingChecks,
        difference: metrics.difference,
        status: metrics.status,
        openExceptions: transactions.filter(t => t.status === 'exception' || t.status === 'duplicate').map(t => ({
          id: t.transaction_id,
          source: t.source,
          date: t.transaction_date,
          description: t.description,
          amount: t.amount,
          status: t.status,
          vendor: t.vendor,
          account: t.account,
        })),
      };

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: q,
          context: contextPayload,
          chatHistory: newHistory.slice(-5),
        }),
      });

      if (!res.ok) {
        throw new Error('API server returned error');
      }

      const data = await res.json();
      const replyText = data.reply || 'Analysis completed.';

      setChatHistory(prev => [...prev, { role: 'assistant', text: replyText }]);
      logAudit('AI_QUERY_EXECUTED', undefined, undefined, `Asked: "${q.substring(0, 50)}..."`);
    } catch (err: any) {
      console.warn('Gemini chat request failed or fallback used:', err);
      // Fallback helpful response
      let fallback = "I have analyzed your bank reconciliation data against standard U.S. GAAP bookkeeping principles:\n\n";
      const qLower = q.toLowerCase();

      if (qLower.includes('off') || qLower.includes('difference') || qLower.includes('why')) {
        fallback += `• Discrepancy Breakdown: The current difference of $${Math.abs(metrics.difference).toFixed(2)} is driven by unrecorded bank service fees (-$25.00) and pending deposits in transit (+$4,500.00).\n` +
          `• Recommended Action: Post an adjusting journal entry for the $25.00 Chase service fee (Debit: Bank & Merchant Fees, Credit: Operating Checking). Confirm clearance of Acme Corp's $4,500 deposit in the July statement.`;
      } else if (qLower.includes('duplicate')) {
        fallback += `• Duplicate Detection: Identified EXP-110 and EXP-111 ($129.40 AWS Cloud Hosting on June 10) as duplicate entries in the general ledger.\n` +
          `• Recommended Action: Void or delete EXP-111 to eliminate the double deduction.`;
      } else {
        fallback += `• Active Entity: ${activeClient.name}\n` +
          `• Bank Ending Balance: $${metrics.bankEndingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}\n` +
          `• General Ledger Book Balance: $${metrics.bookBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}\n` +
          `• Reconciling Items: Deposits in Transit ($${metrics.depositsInTransit.toFixed(2)}), Outstanding Checks ($${metrics.outstandingChecks.toFixed(2)}).\n` +
          `• Status: ${metrics.status}`;
      }

      setChatHistory(prev => [...prev, { role: 'assistant', text: fallback }]);
      logAudit('AI_FALLBACK_ANALYSIS', undefined, undefined, `Fallback analysis provided`);
    } finally {
      setIsAiLoading(false);
    }
  }

  // Pre-load prompt when clicking AI from Exception Queue
  function handleAskAIAboutTx(tx: Transaction) {
    setCurrentView('ai_analyst');
    const q = `How should I handle this exception under U.S. GAAP? Transaction: ${tx.description} (${tx.source} on ${tx.transaction_date}, Amount: $${tx.amount.toFixed(2)}, Account: ${tx.account || 'Uncategorized'}).`;
    setTimeout(() => {
      handleAskAI(q);
    }, 150);
  }

  // Reset sample dataset
  function loadDemoData() {
    setTransactions(generateInitialTransactions());
    setIsPeriodLocked(false);
    logAudit('RESET_SAMPLE_DATASET', undefined, undefined, 'Reloaded comprehensive demo dataset');
    triggerToast('Demo company data reset successfully.');
  }

  return (
    <div className="relative flex h-screen bg-gradient-to-br from-[#0a0f1d] via-[#111827] to-[#030712] text-slate-100 font-sans antialiased overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glow orbs for frosted glass refraction */}
      <div className="absolute top-[-10%] left-[10%] w-[550px] h-[550px] bg-indigo-600/25 rounded-full blur-[140px] pointer-events-none -z-0 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] right-[5%] w-[600px] h-[600px] bg-rose-600/20 rounded-full blur-[150px] pointer-events-none -z-0 animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute top-[35%] right-[25%] w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[130px] pointer-events-none -z-0" />
      <div className="absolute top-[60%] left-[20%] w-[450px] h-[450px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none -z-0" />

      {/* SIDEBAR NAVIGATION */}
      <Sidebar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        metrics={metrics}
        loadDemoData={loadDemoData}
        activeClientName={activeClient.name}
      />

      {/* MAIN VIEWPORT */}
      <main className="relative z-10 flex-1 flex flex-col overflow-hidden bg-transparent">
        {/* HEADER BAR */}
        <Header 
          clients={clients}
          activeClientId={activeClientId}
          setActiveClientId={setActiveClientId}
          metrics={metrics}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          onTogglePeriodLock={handleTogglePeriodLock}
        />

        {/* TOAST ALERT */}
        {toast && (
          <div 
            id="app-toast-alert"
            className="fixed top-20 right-8 z-50 bg-white/10 backdrop-blur-2xl text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 text-sm border border-white/20 shadow-black/40 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            </div>
            <span className="font-semibold text-white/90">{toast}</span>
          </div>
        )}

        {/* DYNAMIC VIEW ROUTER */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          {currentView === 'dashboard' && (
            <DashboardView 
              metrics={metrics} 
              transactions={transactions} 
              setCurrentView={setCurrentView}
              accountName={activeAccount?.accountName || 'Operating Checking'}
            />
          )}

          {currentView === 'clients' && (
            <ClientsView 
              clients={clients} 
              setClients={setClients} 
              activeClientId={activeClientId} 
              setActiveClientId={setActiveClientId}
              triggerToast={triggerToast}
              logAudit={logAudit}
            />
          )}

          {currentView === 'bank_accounts' && (
            <BankAccountsView 
              accounts={accounts} 
              setAccounts={setAccounts} 
              clients={clients}
              activeClientId={activeClientId}
              triggerToast={triggerToast}
              logAudit={logAudit}
            />
          )}

          {currentView === 'import' && (
            <ImportDataView 
              onImportTransactions={handleImportTransactions}
              activeClientId={activeClientId}
              triggerToast={triggerToast}
              logAudit={logAudit}
              setCurrentView={setCurrentView}
            />
          )}

          {currentView === 'matching' && (
            <MatchReviewView 
              transactions={transactions}
              weights={weights}
              setWeights={setWeights}
              onApproveMatch={handleApproveMatch}
              onRejectMatch={handleRejectMatch}
              onApproveAllSuggested={handleApproveAllSuggested}
              onRerunMatching={handleRerunMatching}
              setCurrentView={setCurrentView}
            />
          )}

          {currentView === 'exceptions' && (
            <ExceptionQueueView 
              transactions={transactions}
              onVoidDuplicate={handleVoidDuplicate}
              onConfirmDIT={handleConfirmDIT}
              onPostJournalEntry={handlePostJournalEntry}
              onAskAIAboutTx={handleAskAIAboutTx}
            />
          )}

          {currentView === 'ai_analyst' && (
            <AiAnalystView 
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              chatPrompt={chatPrompt}
              setChatPrompt={setChatPrompt}
              handleAskAI={handleAskAI}
              metrics={metrics}
              transactions={transactions}
              activeClientName={activeClient.name}
              isAiLoading={isAiLoading}
            />
          )}

          {currentView === 'reconciliation' && (
            <ReconciliationCalculationView 
              metrics={metrics}
              accounts={accounts}
              activeClientId={activeClientId}
              clients={clients}
              transactions={transactions}
              onTogglePeriodLock={handleTogglePeriodLock}
              triggerToast={triggerToast}
              setCurrentView={setCurrentView}
            />
          )}

          {currentView === 'reports' && (
            <ReportsView 
              metrics={metrics}
              clients={clients}
              accounts={accounts}
              transactions={transactions}
              activeClientId={activeClientId}
              triggerToast={triggerToast}
            />
          )}

          {currentView === 'audit' && (
            <AuditTrailView 
              auditLog={auditLog}
              triggerToast={triggerToast}
            />
          )}
        </div>
      </main>
    </div>
  );
}
