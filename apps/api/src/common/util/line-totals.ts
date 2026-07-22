export interface DocumentLineInput {
  quantity: number;
  unitPrice: number;
  discountRate?: number;
  taxRate?: number;
}

export interface LineComputation {
  netLineTotal: number;
  taxAmount: number;
  grossLineTotal: number;
}

export interface DocumentTotals {
  subtotal: number;
  taxTotal: number;
  total: number;
  lines: LineComputation[];
}

function round(value: number): number {
  return Math.round((value + Number.EPSILON) * 10000) / 10000;
}

/** Computes a single line's net (after discount), tax and gross amounts. */
export function computeLine(line: DocumentLineInput): LineComputation {
  const discountRate = line.discountRate ?? 0;
  const taxRate = line.taxRate ?? 0;
  const gross = line.quantity * line.unitPrice;
  const netLineTotal = round(gross * (1 - discountRate / 100));
  const taxAmount = round(netLineTotal * (taxRate / 100));
  return {
    netLineTotal,
    taxAmount,
    grossLineTotal: round(netLineTotal + taxAmount),
  };
}

/** Aggregates a document's lines into subtotal, tax total and grand total. */
export function computeDocumentTotals(lines: DocumentLineInput[]): DocumentTotals {
  const computedLines = lines.map(computeLine);
  const subtotal = round(computedLines.reduce((sum, line) => sum + line.netLineTotal, 0));
  const taxTotal = round(computedLines.reduce((sum, line) => sum + line.taxAmount, 0));
  return {
    subtotal,
    taxTotal,
    total: round(subtotal + taxTotal),
    lines: computedLines,
  };
}
