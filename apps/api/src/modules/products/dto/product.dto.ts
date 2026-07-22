import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ProductType } from '@idfb/database';

export class CreateProductDto {
  @ApiProperty({ example: 'PRD-0001' })
  @IsString()
  @MaxLength(64)
  sku!: string;

  @ApiProperty({ example: 'Kablosuz Klavye' })
  @IsString()
  @MaxLength(250)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ enum: ProductType, default: ProductType.STOCKABLE })
  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiProperty()
  @IsUUID()
  unitId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  taxRateId?: string;

  @ApiPropertyOptional({
    description:
      'Currency id; defaults to the company base currency when omitted',
  })
  @IsOptional()
  @IsUUID()
  currencyId?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  purchasePrice?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  salesPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  minStockLevel?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  trackBatch?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  trackSerial?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
