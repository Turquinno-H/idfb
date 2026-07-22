import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { EDocumentProfile } from '@idfb/database';

export class IssueEInvoiceDto {
  @ApiProperty()
  @IsUUID()
  salesInvoiceId!: string;

  @ApiPropertyOptional({
    enum: EDocumentProfile,
    default: EDocumentProfile.TEMEL_FATURA,
  })
  @IsOptional()
  @IsEnum(EDocumentProfile)
  profileId?: EDocumentProfile;
}

export class IssueEWaybillDto {
  @ApiProperty()
  @IsUUID()
  waybillId!: string;

  @ApiPropertyOptional({ example: '34ABC123' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  vehiclePlate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  driverName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shipmentDate?: string;
}
