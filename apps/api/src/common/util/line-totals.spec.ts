import { computeDocumentTotals, computeLine } from './line-totals';

describe('line-totals', () => {
  describe('computeLine', () => {
    it('computes net, tax and gross for a simple line', () => {
      const result = computeLine({ quantity: 10, unitPrice: 100, taxRate: 20 });
      expect(result.netLineTotal).toBe(1000);
      expect(result.taxAmount).toBe(200);
      expect(result.grossLineTotal).toBe(1200);
    });

    it('applies a percentage discount before tax', () => {
      const result = computeLine({ quantity: 2, unitPrice: 100, discountRate: 10, taxRate: 20 });
      expect(result.netLineTotal).toBe(180);
      expect(result.taxAmount).toBe(36);
      expect(result.grossLineTotal).toBe(216);
    });

    it('treats a missing tax rate as zero', () => {
      const result = computeLine({ quantity: 3, unitPrice: 50 });
      expect(result.netLineTotal).toBe(150);
      expect(result.taxAmount).toBe(0);
      expect(result.grossLineTotal).toBe(150);
    });
  });

  describe('computeDocumentTotals', () => {
    it('aggregates multiple lines into subtotal, tax and total', () => {
      const totals = computeDocumentTotals([
        { quantity: 10, unitPrice: 100, taxRate: 20 },
        { quantity: 5, unitPrice: 40, discountRate: 25, taxRate: 10 },
      ]);
      expect(totals.subtotal).toBe(1150);
      expect(totals.taxTotal).toBe(215);
      expect(totals.total).toBe(1365);
      expect(totals.lines).toHaveLength(2);
    });
  });
});
