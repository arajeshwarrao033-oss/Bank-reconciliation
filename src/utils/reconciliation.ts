import { Transaction, ReconciliationMetrics, RuleWeights } from '../types';
import { normalizeText } from '../data/mockData';

export function calculateMetrics(
  transactions: Transaction[],
  openingBalance: number = 115000,
  isPeriodLocked: boolean = false
): ReconciliationMetrics {
  const bankTxs = transactions.filter(t => t.source === 'bank');
  const bookTxs = transactions.filter(t => t.source === 'book');

  const autoMatched = transactions.filter(t => t.status === 'matched_auto' || t.status === 'approved');
  const suggested = transactions.filter(t => t.status === 'matched_suggested');
  const duplicates = transactions.filter(t => t.status === 'duplicate');
  const exceptions = transactions.filter(t => t.status === 'exception');

  const unmatchedBank = bankTxs.filter(t => t.status === 'unmatched' || t.status === 'exception');
  const unmatchedBook = bookTxs.filter(t => t.status === 'unmatched' || t.status === 'exception');

  const bankNet = bankTxs.reduce((sum, t) => sum + t.amount, 0);
  const bookNet = bookTxs.reduce((sum, t) => sum + t.amount, 0);

  const bankEndingBalance = Number((openingBalance + bankNet).toFixed(2));
  const bookBalance = Number((openingBalance + bookNet).toFixed(2));

  // Deposits in Transit: Positive book transactions not yet in bank statement
  const depositsInTransit = Number(
    bookTxs
      .filter(t => t.amount > 0 && (t.status === 'unmatched' || t.status === 'exception'))
      .reduce((sum, t) => sum + t.amount, 0)
      .toFixed(2)
  );

  // Outstanding Checks: Negative book transactions not yet cleared at bank
  const outstandingChecks = Number(
    bookTxs
      .filter(t => t.amount < 0 && (t.status === 'unmatched' || t.status === 'exception'))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      .toFixed(2)
  );

  const adjustedBankBalance = Number((bankEndingBalance + depositsInTransit - outstandingChecks).toFixed(2));
  const difference = Number((adjustedBankBalance - bookBalance).toFixed(2));

  let status: 'Reconciled' | 'In Progress' | 'Discrepancy' = 'In Progress';
  if (Math.abs(difference) === 0 && exceptions.length === 0 && duplicates.length === 0 && suggested.length === 0) {
    status = 'Reconciled';
  } else if (Math.abs(difference) > 0) {
    status = 'Discrepancy';
  }

  return {
    totalClients: 3,
    bankCount: bankTxs.length,
    bookCount: bookTxs.length,
    autoMatchedCount: Math.floor(autoMatched.length / 2),
    suggestedCount: Math.floor(suggested.length / 2),
    unmatchedBankCount: unmatchedBank.length,
    unmatchedBookCount: unmatchedBook.length,
    duplicateCount: duplicates.length,
    exceptionCount: exceptions.length,
    bankEndingBalance,
    bookBalance,
    depositsInTransit,
    outstandingChecks,
    adjustedBankBalance,
    difference,
    status,
    isPeriodLocked,
    timeSavedHours: Number(((bankTxs.length + bookTxs.length) * 0.45).toFixed(1)),
  };
}

// Token-based Jaccard similarity for merchant strings
export function calculateStringSimilarity(s1: string, s2: string): number {
  if (!s1 || !s2) return 0;
  const set1 = new Set(s1.toUpperCase().split(/\s+/).filter(Boolean));
  const set2 = new Set(s2.toUpperCase().split(/\s+/).filter(Boolean));
  if (set1.size === 0 || set2.size === 0) return 0;

  let intersection = 0;
  for (const token of set1) {
    if (set2.has(token)) intersection++;
  }
  const union = new Set([...set1, ...set2]).size;
  return union === 0 ? 0 : intersection / union;
}

export function runMatchingEngine(
  transactions: Transaction[],
  weights: RuleWeights = { amount: 35, date: 20, description: 20, reference: 10, historical: 10, type: 5 }
): Transaction[] {
  const bankTxs = transactions.filter(t => t.source === 'bank' && (t.status === 'unmatched' || t.status === 'matched_suggested'));
  const bookTxs = transactions.filter(t => t.source === 'book' && (t.status === 'unmatched' || t.status === 'matched_suggested'));
  
  const updatedTransactions = [...transactions];
  const matchedBookIds = new Set<string>();

  for (const bTx of bankTxs) {
    let bestMatch: Transaction | null = null;
    let bestScore = 0;
    let matchReasons: string[] = [];

    for (const gTx of bookTxs) {
      if (matchedBookIds.has(gTx.transaction_id)) continue;

      let score = 0;
      const reasons: string[] = [];

      // 1. Amount matching (Exact vs. Near)
      const amountDiff = Math.abs(Math.abs(bTx.amount) - Math.abs(gTx.amount));
      if (amountDiff === 0) {
        score += weights.amount;
        reasons.push(`Amount: Exact $${Math.abs(bTx.amount).toFixed(2)}`);
      } else if (amountDiff < 0.05) {
        score += weights.amount * 0.8;
        reasons.push(`Amount: Penny difference ($${amountDiff.toFixed(2)})`);
      }

      // 2. Date proximity (Exact, +/- 1 day, +/- 3 days)
      const d1 = new Date(bTx.transaction_date).getTime();
      const d2 = new Date(gTx.transaction_date).getTime();
      const diffDays = Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);

      if (diffDays === 0) {
        score += weights.date;
        reasons.push('Date: Exact date match');
      } else if (diffDays <= 1) {
        score += weights.date * 0.9;
        reasons.push('Date: Within 1 day');
      } else if (diffDays <= 3) {
        score += weights.date * 0.6;
        reasons.push(`Date: Within ${Math.round(diffDays)} days`);
      }

      // 3. Normalized Description & Vendor Similarity
      const textSim = calculateStringSimilarity(bTx.normalized_description, gTx.normalized_description);
      const vendorSim = bTx.vendor && gTx.vendor ? calculateStringSimilarity(bTx.vendor, gTx.vendor) : 0;
      const effectiveSim = Math.max(textSim, vendorSim);

      if (effectiveSim >= 0.7) {
        score += weights.description * effectiveSim;
        reasons.push(`Description: ${Math.round(effectiveSim * 100)}% token match`);
      } else if (effectiveSim >= 0.4) {
        score += weights.description * (effectiveSim * 0.7);
        reasons.push(`Description: Partial similarity (${Math.round(effectiveSim * 100)}%)`);
      }

      // 4. Reference Number match
      if (bTx.reference_number && gTx.reference_number && bTx.reference_number === gTx.reference_number) {
        score += weights.reference;
        reasons.push(`Reference: Exact match (${bTx.reference_number})`);
      }

      // 5. Type similarity
      if (bTx.transaction_type && gTx.transaction_type && bTx.transaction_type.toUpperCase() === gTx.transaction_type.toUpperCase()) {
        score += weights.type;
      }

      // Normalize score to 100 max
      const totalWeight = weights.amount + weights.date + weights.description + weights.reference + weights.historical + weights.type;
      const normalizedScore = Math.min(100, Math.round((score / totalWeight) * 100));

      if (normalizedScore > bestScore && normalizedScore >= 50) {
        bestScore = normalizedScore;
        bestMatch = gTx;
        matchReasons = reasons;
      }
    }

    if (bestMatch && bestScore >= 75) {
      matchedBookIds.add(bestMatch.transaction_id);

      const isAuto = bestScore >= 95;
      const newStatus = isAuto ? 'matched_auto' : 'matched_suggested';

      // Update Bank Tx
      const bIndex = updatedTransactions.findIndex(t => t.transaction_id === bTx.transaction_id);
      if (bIndex !== -1) {
        updatedTransactions[bIndex] = {
          ...updatedTransactions[bIndex],
          status: newStatus,
          matchScore: bestScore,
          matchReasons,
          pairedId: bestMatch.transaction_id,
        };
      }

      // Update Book Tx
      const gIndex = updatedTransactions.findIndex(t => t.transaction_id === bestMatch.transaction_id);
      if (gIndex !== -1) {
        updatedTransactions[gIndex] = {
          ...updatedTransactions[gIndex],
          status: newStatus,
          matchScore: bestScore,
          matchReasons,
          pairedId: bTx.transaction_id,
        };
      }
    }
  }

  return updatedTransactions;
}

// Parse raw CSV string into normalized Transaction objects
export function parseCSVString(csvText: string, source: 'bank' | 'book', clientId: string): Transaction[] {
  const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());

  const parsedTransactions: Transaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 2) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });

    const dateVal = row['date'] || row['transaction date'] || row['posting date'] || new Date().toISOString().substring(0, 10);
    const descVal = row['description'] || row['memo'] || row['payee'] || row['name'] || 'Unspecified Transaction';
    let amountVal = 0;

    if (row['amount']) {
      amountVal = parseFloat(row['amount'].replace(/[^0-9.-]/g, '')) || 0;
    } else if (row['debit'] && parseFloat(row['debit'].replace(/[^0-9.-]/g, '')) > 0) {
      amountVal = -Math.abs(parseFloat(row['debit'].replace(/[^0-9.-]/g, '')));
    } else if (row['credit'] && parseFloat(row['credit'].replace(/[^0-9.-]/g, '')) > 0) {
      amountVal = Math.abs(parseFloat(row['credit'].replace(/[^0-9.-]/g, '')));
    }

    const refVal = row['reference'] || row['ref'] || row['ref number'] || row['check #'] || row['check number'] || '';
    const vendorVal = row['vendor'] || row['vendor/customer'] || row['payee'] || '';
    const customerVal = row['customer'] || '';
    const accountVal = row['account'] || row['category'] || (source === 'bank' ? 'Operating Checking' : 'Uncategorized Expense');
    const typeVal = row['type'] || (amountVal < 0 ? 'Debit' : 'Credit');

    const tx: Transaction = {
      transaction_id: `tx_${source[0]}_${Date.now()}_${i}`,
      clientId,
      source,
      transaction_date: dateVal,
      posting_date: dateVal,
      description: descVal,
      normalized_description: normalizeText(descVal),
      amount: amountVal,
      debit: amountVal < 0 ? Math.abs(amountVal) : 0,
      credit: amountVal > 0 ? amountVal : 0,
      transaction_type: typeVal,
      reference_number: refVal,
      check_number: refVal.startsWith('CHK') ? refVal.replace('CHK-', '') : '',
      vendor: vendorVal,
      customer: customerVal,
      account: accountVal,
      currency: 'USD',
      original_row: row,
      status: 'unmatched',
    };

    parsedTransactions.push(tx);
  }

  return parsedTransactions;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}
