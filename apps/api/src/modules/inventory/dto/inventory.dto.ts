import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class StockAdjustmentDto {
  @ApiProperty()
  @IsUUID()
  warehouseId!: string;

  @ApiProperty()
  @IsUUID()
  productId!: string;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  quantity!: number;

  @ApiProperty({ enum: ['IN', 'OUT'] })
  @IsIn(['IN', 'OUT'])
  direction!: 'IN' | 'OUT';

  @ApiPropertyOptional({ description: 'Unit cost for incoming adjustments (average-cost update)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  unitCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}

export class StockTransferDto {
  @ApiProperty()
  @IsUUID()
  fromWarehouseId!: string;

  @ApiProperty()
  @IsUUID()
  toWarehouseId!: string;

  @ApiProperty()
  @IsUUID()
  productId!: string;

  @ApiProperty({ example: 5 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  quantity!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}
