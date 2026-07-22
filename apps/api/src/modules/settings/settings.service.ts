import { Injectable } from '@nestjs/common';
import { Prisma } from '@idfb/database';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateCompanyProfileDto, UpsertSettingDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async listSettings(
    companyId: string,
  ): Promise<Prisma.CompanySettingGetPayload<Record<string, never>>[]> {
    return this.prisma.companySetting.findMany({ where: { companyId }, orderBy: { key: 'asc' } });
  }

  async upsertSetting(
    companyId: string,
    dto: UpsertSettingDto,
  ): Promise<Prisma.CompanySettingGetPayload<Record<string, never>>> {
    return this.prisma.companySetting.upsert({
      where: { companyId_key: { companyId, key: dto.key } },
      create: { companyId, key: dto.key, value: dto.value as Prisma.InputJsonValue },
      update: { value: dto.value as Prisma.InputJsonValue },
    });
  }

  async getCompanyProfile(
    companyId: string,
  ): Promise<Prisma.CompanyGetPayload<{ include: { baseCurrency: true } }>> {
    return this.prisma.company.findUniqueOrThrow({
      where: { id: companyId },
      include: { baseCurrency: true },
    });
  }

  async updateCompanyProfile(
    companyId: string,
    dto: UpdateCompanyProfileDto,
  ): Promise<Prisma.CompanyGetPayload<{ include: { baseCurrency: true } }>> {
    await this.prisma.company.update({ where: { id: companyId }, data: dto });
    return this.getCompanyProfile(companyId);
  }

  async listCurrencies(): Promise<Prisma.CurrencyGetPayload<Record<string, never>>[]> {
    return this.prisma.currency.findMany({ orderBy: { code: 'asc' } });
  }
}
