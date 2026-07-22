import { calculatePayroll } from './payroll-calculator';

describe('calculatePayroll', () => {
  it('applies Turkish statutory deductions to a gross salary', () => {
    const result = calculatePayroll({ grossSalary: 30000 });

    // SGK employee 14%, unemployment 1%
    expect(result.sgkEmployee).toBeCloseTo(4200, 2);
    expect(result.unemploymentInsurance).toBeCloseTo(300, 2);
    // Employer SGK 20.5%
    expect(result.sgkEmployer).toBeCloseTo(6150, 2);

    // Income tax base = gross - sgk - unemployment, taxed at 15%
    const incomeTaxBase = 30000 - 4200 - 300;
    expect(result.incomeTax).toBeCloseTo(incomeTaxBase * 0.15, 2);

    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
  });

  it('includes bonuses in the taxable base and other deductions in the net', () => {
    const withBonus = calculatePayroll({ grossSalary: 20000, bonuses: 5000 });
    const withoutBonus = calculatePayroll({ grossSalary: 20000 });
    expect(withBonus.sgkEmployee).toBeGreaterThan(withoutBonus.sgkEmployee);

    const withDeduction = calculatePayroll({ grossSalary: 20000, otherDeductions: 1000 });
    expect(withDeduction.netSalary).toBeCloseTo(withoutBonus.netSalary - 1000, 2);
  });

  it('never produces a negative net salary for a positive gross', () => {
    const result = calculatePayroll({ grossSalary: 1 });
    expect(result.netSalary).toBeGreaterThanOrEqual(0);
  });
});
