import { Module } from '@nestjs/common';
import { InventoryModule } from '../inventory/inventory.module';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseInvoicesController } from './purchase-invoices.controller';
import { PurchaseInvoicesService } from './purchase-invoices.service';

@Module({
  imports: [InventoryModule],
  controllers: [PurchaseOrdersController, PurchaseInvoicesController],
  providers: [PurchaseOrdersService, PurchaseInvoicesService],
  exports: [PurchaseOrdersService, PurchaseInvoicesService],
})
export class PurchasingModule {}
