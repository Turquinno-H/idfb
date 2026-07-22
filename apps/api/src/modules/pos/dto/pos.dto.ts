import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreatePosTerminalDto {
  @ApiProperty()
  @IsString()
  @MaxLength(50)
  code!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(150)
  name!: string;

  @ApiProperty()
  @IsUUID()
  warehouseId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePosTerminalDto extends PartialType(CreatePosTerminalDto) {}

export class PosLineDto {
  @ApiProperty()
  @IsUUID()
  productId!: string;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  quantity!: number;

  @ApiPropertyOptional({
    description: 'Override unit price; defaults to product sales price',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  unitPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  taxRateId?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(100)
  discountRate?: number;
}

export class PosPaymentDto {
  @ApiProperty()
  @IsUUID()
  paymentMethodId!: string;

  @ApiProperty({ example: 100.0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  amount!: number;
}

export class CreatePosSaleDto {
  @ApiProperty()
  @IsUUID()
  posTerminalId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ type: [PosLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PosLineDto)
  lines!: PosLineDto[];

  @ApiProperty({ type: [PosPaymentDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PosPaymentDto)
  payments!: PosPaymentDto[];
}
