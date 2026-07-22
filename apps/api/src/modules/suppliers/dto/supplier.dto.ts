import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { PartyType } from '@idfb/database';

export class CreateSupplierDto {
  @ApiPropertyOptional({
    description: 'Optional; auto-generated (TED-000001) when omitted',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @ApiProperty({ example: 'Anadolu Toptan A.Ş.' })
  @IsString()
  @MaxLength(250)
  name!: string;

  @ApiPropertyOptional({ enum: PartyType, default: PartyType.CORPORATE })
  @IsOptional()
  @IsEnum(PartyType)
  type?: PartyType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(11)
  taxNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  taxOffice?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  website?: string;

  @ApiPropertyOptional({
    description: 'Currency id; defaults to company base currency',
  })
  @IsOptional()
  @IsUUID()
  currencyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  defaultWarehouseId?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  paymentTermDays?: number;
}

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {}
