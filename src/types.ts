export type ViewState = 
  | 'dashboard' 
  | 'clients' 
  | 'bank_accounts' 
  | 'import' 
  | 'matching' 
  | 'exceptions' 
  | 'ai_analyst' 
  | 'reconciliation' 
  | 'reports' 
  | 'audit';

export interface Client {
  id: string;
  name: string;
  businessType: 'LLC' | 'C-Corp' | 'S-Corp' | 'Sole Proprietorship' | 'Partnership';
  contactName: string;
  email: string;
  industry: string;
  accountingBasis: 'Cash' | 'Accrual';
  fiscalYear: string;
  status: 'Active' | 'Onboarding' | 'Archived';
}

export interface BankAccount {
  id: string;
  clientId: string;
  bankName: string;
  accountName: string;
  accountType: 'Checking' | 'Savings' | 'Credit Card';
  lastFour: string;
  currency: string;
  openingBalance: number;
  currentStatus: 'Connected' | 'Manual Import';
}

export interface Transaction {
  transaction_id: string;
  clientId?: string;
  source: 'bank' | 'book';
  transaction_date: string;
  posting_date: string;
  description: string;
  normalized_description: string;
  amount: number; // positive = deposit/credit, negative = withdrawal/debit
  debit: number;
  credit: number;
  transaction_type: string;
  reference_number: string;
  check_number: string;
  vendor: string;
  customer: string;
  account: string;
  currency: string;
  original_row: Record<string, any>;
  status: 'unmatched' | 'matched_auto' | 'matched_suggested' | 'approved' | 'exception' | 'duplicate';
  matchScore?: number;
  matchReasons?: string[];
  pairedId?: string;
  isAdjusted?: boolean;
  aiSuggestion?: {
    likely_vendor: string;
    suggested_account: string;
    confidence: number;
    reason: string;
    recommended_action: string;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  affectedTransaction?: string;
  previousState?: string;
  newState?: string;
}

export interface RuleWeights {
  amount: number;
  date: number;
  description: number;
  reference: number;
  historical: number;
  type: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  memo: string;
  lines: Array<{
    account: string;
    debit: number;
    credit: number;
  }>;
}

export interface ReconciliationMetrics {
  totalClients: number;
  bankCount: number;
  bookCount: number;
  autoMatchedCount: number;
  suggestedCount: number;
  unmatchedBankCount: number;
  unmatchedBookCount: number;
  duplicateCount: number;
  exceptionCount: number;
  bankEndingBalance: number;
  bookBalance: number;
  depositsInTransit: number;
  outstandingChecks: number;
  adjustedBankBalance: number;
  difference: number;
  status: 'Reconciled' | 'In Progress' | 'Discrepancy';
  isPeriodLocked: boolean;
  timeSavedHours: number;
}
