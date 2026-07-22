import { Module } from '@nestjs/common';
import { InventoryModule } from '../inventory/inventory.module';
import { QuotationsController } from './quotations.controller';
import { QuotationsService } from './quotations.service';
import { SalesOrdersController } from './sales-orders.controller';
import { SalesOrdersService } from './sales-orders.service';
import { SalesInvoicesController } from './sales-invoices.controller';
import { SalesInvoicesService } from './sales-invoices.service';

@Module({
  imports: [InventoryModule],
  controllers: [
    QuotationsController,
    SalesOrdersController,
    SalesInvoicesController,
  ],
  providers: [QuotationsService, SalesOrdersService, SalesInvoicesService],
  exports: [QuotationsService, SalesOrdersService, SalesInvoicesService],
})
export class SalesModule {}
