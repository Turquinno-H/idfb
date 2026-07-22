import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SwitchCompanyDto {
  @ApiProperty()
  @IsUUID()
  companyId!: string;
}
