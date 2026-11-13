/**
 * Smart PhonePe for Business CSV Statement Parser
 * 
 * Supports statements exported from PhonePe for Business Web Portal (business.phonepe.com)
 * Handles varying column headers, quoted values, date formats, and currency symbols.
 */

export interface ParsedPhonePeRow {
  provider_reference_id: string; // Bank UTR (unique idempotency key)
  merchant_transaction_id: string;
  phonepe_transaction_id?: string;
  amount_rupees: number;
  amount_paise: number;
  payment_mode: string;
  status: 'COMPLETED' | 'FAILED' | 'REFUNDED';
  payer_vpa?: string;
  payer_name?: string;
  payer_phone?: string;
  notes?: string;
  paid_at: string;
}

export interface ParseResult {
  success: boolean;
  transactions: ParsedPhonePeRow[];
  totalRows: number;
  validCount: number;
  totalAmountRupees: number;
  uniqueCustomersCount: number;
  startDate?: string;
  endDate?: string;
  error?: string;
}

function parseCsvLines(csvText: string): string[][] {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField.trim());
      if (currentRow.some((field) => field.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((field) => field.length > 0)) {
      lines.push(currentRow);
    }
  }

  return lines;
}

function cleanHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function parseDateToIso(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();

  // Try standard parse first
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  // Handle DD-MM-YYYY or DD/MM/YYYY
  const ddmmyyyy = dateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (ddmmyyyy) {
    const day = Number(ddmmyyyy[1]);
    const month = Number(ddmmyyyy[2]) - 1;
    const year = Number(ddmmyyyy[3]);
    const hour = Number(ddmmyyyy[4] || 12);
    const min = Number(ddmmyyyy[5] || 0);
    const sec = Number(ddmmyyyy[6] || 0);
    const d = new Date(Date.UTC(year, month, day, hour, min, sec));
    return d.toISOString();
  }

  return new Date().toISOString();
}

export function parsePhonePeCsv(csvText: string): ParseResult {
  try {
    const rows = parseCsvLines(csvText.trim());
    if (rows.length < 2) {
      return {
        success: false,
        transactions: [],
        totalRows: 0,
        validCount: 0,
        totalAmountRupees: 0,
        uniqueCustomersCount: 0,
        error: 'CSV file must have a header row and at least one transaction row.',
      };
    }

    const headers = rows[0].map(cleanHeader);

    // Dynamic header lookup
    const utrIdx = headers.findIndex((h) =>
      ['bankref', 'bankreferenceno', 'utr', 'rrn', 'providerreferenceid', 'bankreferencenumber'].some((k) =>
        h.includes(k),
      ),
    );

    const txnIdIdx = headers.findIndex((h) =>
      ['transactionid', 'merchanttransactionid', 'txnid', 'transactionreference'].some((k) =>
        h.includes(k),
      ),
    );

    const amountIdx = headers.findIndex((h) =>
      ['amount', 'amountinr', 'transactionamount', 'netamount', 'totalamount'].some((k) =>
        h.includes(k),
      ),
    );

    const dateIdx = headers.findIndex((h) =>
      ['transactiondate', 'date', 'datetime', 'createdat', 'paidat', 'time'].some((k) =>
        h.includes(k),
      ),
    );

    const vpaIdx = headers.findIndex((h) =>
      ['payervpa', 'vpa', 'customerupiid', 'customerhandle', 'senderupiid', 'upiid'].some((k) =>
        h.includes(k),
      ),
    );

    const nameIdx = headers.findIndex((h) =>
      ['payername', 'customername', 'sendername', 'customer', 'name'].some((k) =>
        h.includes(k),
      ),
    );

    const statusIdx = headers.findIndex((h) =>
      ['status', 'transactionstatus', 'state'].some((k) =>
        h.includes(k),
      ),
    );

    if (amountIdx === -1) {
      return {
        success: false,
        transactions: [],
        totalRows: rows.length - 1,
        validCount: 0,
        totalAmountRupees: 0,
        uniqueCustomersCount: 0,
        error: 'Could not locate an "Amount" column in the uploaded PhonePe CSV.',
      };
    }

    const transactions: ParsedPhonePeRow[] = [];
    const seenUtrs = new Set<string>();
    const seenCustomers = new Set<string>();
    let totalAmount = 0;

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;

      // Extract raw amount
      const rawAmountStr = (row[amountIdx] || '').replace(/[^0-9.]/g, '');
      const amount = parseFloat(rawAmountStr);
      if (isNaN(amount) || amount <= 0) continue;

      // Check status (default to COMPLETED if missing or marked success)
      const rawStatus = (statusIdx !== -1 ? row[statusIdx] || '' : '').toLowerCase();
      let status: 'COMPLETED' | 'FAILED' | 'REFUNDED' = 'COMPLETED';
      if (rawStatus.includes('fail') || rawStatus.includes('decline')) {
        status = 'FAILED';
      } else if (rawStatus.includes('refund')) {
        status = 'REFUNDED';
      }

      // Skip failed rows for earnings calculation
      if (status !== 'COMPLETED') continue;

      // Extract UTR / Reference ID
      let utr = utrIdx !== -1 ? row[utrIdx]?.replace(/[^a-zA-Z0-9]/g, '') : '';
      const txnId = txnIdIdx !== -1 && row[txnIdIdx] ? row[txnIdIdx] : `TXN_${Date.now()}_${r}`;

      if (!utr) {
        utr = txnId; // Fallback to transaction ID if bank UTR column is missing
      }

      // Deduplicate within the file itself
      if (seenUtrs.has(utr)) continue;
      seenUtrs.add(utr);

      // Extract Payer VPA / Customer identifier
      const vpa = vpaIdx !== -1 ? row[vpaIdx] : undefined;
      const name = nameIdx !== -1 ? row[nameIdx] : undefined;
      const dateStr = dateIdx !== -1 ? row[dateIdx] : new Date().toISOString();
      const paidAt = parseDateToIso(dateStr);

      if (vpa) seenCustomers.add(vpa.toLowerCase());
      else if (name) seenCustomers.add(name.toLowerCase());

      totalAmount += amount;

      transactions.push({
        provider_reference_id: utr,
        merchant_transaction_id: txnId,
        amount_rupees: amount,
        amount_paise: Math.round(amount * 100),
        payment_mode: 'UPI',
        status,
        payer_vpa: vpa || undefined,
        payer_name: name || undefined,
        paid_at: paidAt,
      });
    }

    // Sort by paid_at desc
    transactions.sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime());

    return {
      success: true,
      transactions,
      totalRows: rows.length - 1,
      validCount: transactions.length,
      totalAmountRupees: totalAmount,
      uniqueCustomersCount: seenCustomers.size,
      startDate: transactions.length > 0 ? transactions[transactions.length - 1].paid_at.slice(0, 10) : undefined,
      endDate: transactions.length > 0 ? transactions[0].paid_at.slice(0, 10) : undefined,
    };
  } catch (err) {
    return {
      success: false,
      transactions: [],
      totalRows: 0,
      validCount: 0,
      totalAmountRupees: 0,
      uniqueCustomersCount: 0,
      error: err instanceof Error ? err.message : 'Failed to parse PhonePe CSV file.',
    };
  }
}
