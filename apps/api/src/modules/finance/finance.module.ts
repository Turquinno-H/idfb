import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ExpensesIncomeController } from './expenses-income.controller';
import { ExpensesIncomeService } from './expenses-income.service';

@Module({
  controllers: [
    AccountsController,
    CollectionsController,
    PaymentsController,
    ExpensesIncomeController,
  ],
  providers: [
    AccountsService,
    CollectionsService,
    PaymentsService,
    ExpensesIncomeService,
  ],
  exports: [
    AccountsService,
    CollectionsService,
    PaymentsService,
    ExpensesIncomeService,
  ],
})
export class FinanceModule {}
