/**
 * Turkish statutory payroll deductions (2026 baseline rates).
 * These are the standard employee/employer contribution percentages used for
 * private-sector salaried employees. Cumulative income-tax bracketing and the
 * minimum-living-allowance are out of scope for this baseline calculator and
 * can be layered on top via the returned breakdown.
 */
export interface PayrollBreakdown {
  grossSalary: number;
  sgkEmployee: number;
  unemploymentInsurance: number;
  incomeTax: number;
  stampTax: number;
  sgkEmployer: number;
  otherDeductions: number;
  bonuses: number;
  totalDeductions: number;
  netSalary: number;
}

const SGK_EMPLOYEE_RATE = 0.14;
const UNEMPLOYMENT_EMPLOYEE_RATE = 0.01;
const SGK_EMPLOYER_RATE = 0.205;
const INCOME_TAX_RATE = 0.15;
const STAMP_TAX_RATE = 0.00759;

function round(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculatePayroll(input: {
  grossSalary: number;
  bonuses?: number;
  otherDeductions?: number;
}): PayrollBreakdown {
  const grossSalary = input.grossSalary;
  const bonuses = input.bonuses ?? 0;
  const otherDeductions = input.otherDeductions ?? 0;

  const taxableGross = grossSalary + bonuses;

  const sgkEmployee = round(taxableGross * SGK_EMPLOYEE_RATE);
  const unemploymentInsurance = round(
    taxableGross * UNEMPLOYMENT_EMPLOYEE_RATE,
  );
  const sgkEmployer = round(taxableGross * SGK_EMPLOYER_RATE);

  const incomeTaxBase = taxableGross - sgkEmployee - unemploymentInsurance;
  const incomeTax = round(incomeTaxBase * INCOME_TAX_RATE);
  const stampTax = round(taxableGross * STAMP_TAX_RATE);

  const totalDeductions = round(
    sgkEmployee +
      unemploymentInsurance +
      incomeTax +
      stampTax +
      otherDeductions,
  );
  const netSalary = round(taxableGross - totalDeductions);

  return {
    grossSalary,
    sgkEmployee,
    unemploymentInsurance,
    incomeTax,
    stampTax,
    sgkEmployer,
    otherDeductions,
    bonuses,
    totalDeductions,
    netSalary,
  };
}
