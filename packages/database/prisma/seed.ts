import { PrismaClient } from '../generated/client';

const prisma = new PrismaClient();

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
  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: {},
      create: currency,
    });
  }
}

async function seedPermissions() {
  for (const resource of PERMISSION_RESOURCES) {
    for (const action of PERMISSION_ACTIONS) {
      await prisma.permission.upsert({
        where: { resource_action: { resource, action } },
        update: {},
        create: { resource, action, description: `${action} ${resource}` },
      });
    }
  }
}

async function seedDemoCompany() {
  const tryCurrency = await prisma.currency.findUniqueOrThrow({ where: { code: 'TRY' } });

  const company = await prisma.company.upsert({
    where: { taxNumber: '1234567890' },
    update: {},
    create: {
      name: 'Demo Ticaret A.Ş.',
      legalName: 'Demo Ticaret Anonim Şirketi',
      taxNumber: '1234567890',
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

    for (const permission of permissionsForRole) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
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

async function main() {
  await seedCurrencies();
  await seedPermissions();
  await seedDemoCompany();
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
