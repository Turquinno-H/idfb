import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { UnitsModule } from './units/units.module';
import { TaxRatesModule } from './tax-rates/tax-rates.module';
import { CostCentersModule } from './cost-centers/cost-centers.module';
import { ExpenseCategoriesModule } from './expense-categories/expense-categories.module';
import { IncomeCategoriesModule } from './income-categories/income-categories.module';
import { DepartmentsModule } from './departments/departments.module';
import { JobPositionsModule } from './job-positions/job-positions.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { BanksModule } from './banks/banks.module';
import { ProductsModule } from './products/products.module';
import { CustomersModule } from './customers/customers.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { BranchesModule } from './branches/branches.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { InventoryModule } from './inventory/inventory.module';
import { PurchasingModule } from './purchasing/purchasing.module';
import { SalesModule } from './sales/sales.module';
import { FinanceModule } from './finance/finance.module';

@Module({
  imports: [
    // Reference data
    CategoriesModule,
    BrandsModule,
    UnitsModule,
    TaxRatesModule,
    CostCentersModule,
    ExpenseCategoriesModule,
    IncomeCategoriesModule,
    DepartmentsModule,
    JobPositionsModule,
    PaymentMethodsModule,
    BanksModule,
    // Organization
    BranchesModule,
    WarehousesModule,
    // Catalog & CRM
    ProductsModule,
    CustomersModule,
    SuppliersModule,
    // Operations
    InventoryModule,
    PurchasingModule,
    SalesModule,
    FinanceModule,
  ],
})
export class BusinessModule {}
