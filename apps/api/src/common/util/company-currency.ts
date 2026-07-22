import { PrismaService } from '../../prisma/prisma.service';

/** Returns the given currency id, or falls back to the company base currency. */
export async function resolveCompanyCurrency(
  prisma: PrismaService,
  companyId: string,
  currencyId?: string,
): Promise<string> {
  if (currencyId) {
    return currencyId;
  }
  const company = await prisma.company.findUniqueOrThrow({
    where: { id: companyId },
    select: { baseCurrencyId: true },
  });
  return company.baseCurrencyId;
}
