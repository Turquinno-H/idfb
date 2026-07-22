import { Module } from '@nestjs/common';
import { AccountingController } from './accounting.controller';
import { ChartOfAccountsService } from './accounts.service';
import { JournalEntriesService } from './journal-entries.service';

@Module({
  controllers: [AccountingController],
  providers: [ChartOfAccountsService, JournalEntriesService],
  exports: [ChartOfAccountsService, JournalEntriesService],
})
export class AccountingModule {}
