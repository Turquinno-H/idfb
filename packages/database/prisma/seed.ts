import * as argon2 from 'argon2';
import { PrismaClient } from '../generated/client';

const prisma = new PrismaClient();

const DEMO_COMPANY_TAX_NUMBER = '1234567890';
const DEMO_USER_EMAIL = process.env.SEED_DEMO_EMAIL ?? 'demo@idfb.app';
const DEMO_USER_PASSWORD = process.env.SEED_DEMO_PASSWORD ?? 'Demo1234';

const PERMISSION_RESOURCES = [
  'company',
  'branch',
  'warehouse',
  'user',
  'role',
  'customer',
  'supplier',
  'product',
  'category',
  'brand',
  'unit',
  'price_list',
  'inventory',
  'stock_movement',
  'stock_transfer',
  'purchase_order',
  'purchase_receipt',
  'purchase_invoice',
  'quotation',
  'sales_order',
  'sales_invoice',
  'waybill',
  'cash_account',
  'bank_account',
  'collection',
  'payment',
  'expense',
  'income',
  'account',
  'cost_center',
  'journal_entry',
  'employee',
  'payroll',
  'attendance',
  'project',
  'task',
  'notification',
  'audit_log',
  'settings',
  'tax_rate',
  'pos_transaction',
  'attachment',
];

const PERMISSION_ACTIONS = ['create', 'read', 'update', 'delete', 'approve', 'export'];

const SYSTEM_ROLES: Record<string, string[] | 'ALL'> = {
  Admin: 'ALL',
  Manager: [
    'customer', 'supplier', 'product', 'category', 'brand', 'unit', 'price_list',
    'inventory', 'stock_movement', 'stock_transfer', 'purchase_order', 'purchase_receipt',
    'purchase_invoice', 'quotation', 'sales_order', 'sales_invoice', 'waybill',
    'cash_account', 'bank_account', 'collection', 'payment', 'expense', 'income',
    'project', 'task', 'notification', 'attachment',
  ],
  Accountant: [
    'cash_account', 'bank_account', 'collection', 'payment', 'expense', 'income',
    'account', 'cost_center', 'journal_entry', 'purchase_invoice', 'sales_invoice', 'tax_rate',
  ],
  Sales: ['customer', 'quotation', 'sales_order', 'sales_invoice', 'price_list', 'product', 'pos_transaction'],
  Warehouse: ['inventory', 'stock_movement', 'stock_transfer', 'purchase_receipt', 'waybill', 'product'],
  HR: ['employee', 'payroll', 'attendance', 'department' as never],
  Viewer: [],
};

async function seedCurrencies() {
  const currencies = [
    { code: 'TRY', name: 'Türk Lirası', symbol: '₺', decimalPlaces: 2 },
    { code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2 },
    { code: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2 },
    { code: 'GBP', name: 'British Pound', symbol: '£', decimalPlaces: 2 },
  ];
  await prisma.currency.createMany({ data: currencies, skipDuplicates: true });
}

async function seedPermissions() {
  // One statement rather than 252 sequential upserts. The entrypoint re-runs
  // the seed on every container start, so each round trip here is paid again
  // on every restart — and the API does not begin listening until it ends.
  // skipDuplicates keeps it idempotent while still inserting resources or
  // actions added since the last run.
  await prisma.permission.createMany({
    data: PERMISSION_RESOURCES.flatMap((resource) =>
      PERMISSION_ACTIONS.map((action) => ({
        resource,
        action,
        description: `${action} ${resource}`,
      })),
    ),
    skipDuplicates: true,
  });
}

async function seedDemoCompany() {
  const tryCurrency = await prisma.currency.findUniqueOrThrow({ where: { code: 'TRY' } });

  const company = await prisma.company.upsert({
    where: { taxNumber: DEMO_COMPANY_TAX_NUMBER },
    update: {},
    create: {
      name: 'Demo Ticaret A.Ş.',
      legalName: 'Demo Ticaret Anonim Şirketi',
      taxNumber: DEMO_COMPANY_TAX_NUMBER,
      taxOffice: 'Kadıköy',
      city: 'İstanbul',
      country: 'Türkiye',
      baseCurrencyId: tryCurrency.id,
      subscriptionPlan: 'PROFESSIONAL',
      subscriptionStatus: 'ACTIVE',
    },
  });

  const allPermissions = await prisma.permission.findMany();

  for (const [roleName, scope] of Object.entries(SYSTEM_ROLES)) {
    const role = await prisma.role.upsert({
      where: { companyId_name: { companyId: company.id, name: roleName } },
      update: {},
      create: {
        companyId: company.id,
        name: roleName,
        description: `${roleName} sistem rolü`,
        isSystem: true,
      },
    });

    const permissionsForRole =
      scope === 'ALL'
        ? allPermissions
        : allPermissions.filter((p) => (scope as string[]).includes(p.resource));

    await prisma.rolePermission.createMany({
      data: permissionsForRole.map((permission) => ({
        roleId: role.id,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    });
  }

  await prisma.branch.upsert({
    where: { companyId_code: { companyId: company.id, code: 'MERKEZ' } },
    update: {},
    create: {
      companyId: company.id,
      code: 'MERKEZ',
      name: 'Merkez Şube',
      city: 'İstanbul',
      isMain: true,
    },
  });

  await prisma.warehouse.upsert({
    where: { companyId_code: { companyId: company.id, code: 'ANA-DEPO' } },
    update: {},
    create: {
      companyId: company.id,
      code: 'ANA-DEPO',
      name: 'Ana Depo',
      type: 'MAIN',
    },
  });

  const vatRates = [
    { name: 'KDV %1', rate: 1 },
    { name: 'KDV %10', rate: 10 },
    { name: 'KDV %20', rate: 20, isDefault: true },
  ];
  for (const vat of vatRates) {
    await prisma.taxRate.upsert({
      where: { companyId_name: { companyId: company.id, name: vat.name } },
      update: {},
      create: { companyId: company.id, ...vat },
    });
  }
}

async function seedDemoUser() {
  const company = await prisma.company.findUniqueOrThrow({
    where: { taxNumber: DEMO_COMPANY_TAX_NUMBER },
  });
  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { companyId_name: { companyId: company.id, name: 'Admin' } },
  });

  // The hash is written on creation only, so a password changed from inside
  // the application survives every later seed run.
  const user = await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: {
      email: DEMO_USER_EMAIL,
      passwordHash: await argon2.hash(DEMO_USER_PASSWORD),
      firstName: 'Demo',
      lastName: 'Yönetici',
      locale: 'tr',
    },
  });

  const member = await prisma.companyMember.upsert({
    where: { companyId_userId: { companyId: company.id, userId: user.id } },
    update: { status: 'ACTIVE' },
    create: {
      companyId: company.id,
      userId: user.id,
      status: 'ACTIVE',
      joinedAt: new Date(),
    },
  });

  await prisma.memberRole.upsert({
    where: {
      companyMemberId_roleId: {
        companyMemberId: member.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: { companyMemberId: member.id, roleId: adminRole.id },
  });

  console.log(`[seed] demo admin ready: ${DEMO_USER_EMAIL}`);
}

async function main() {
  await seedCurrencies();
  await seedPermissions();
  await seedDemoCompany();
  await seedDemoUser();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
