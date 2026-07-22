import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaymentMethodType } from '@idfb/database';

export class CreatePaymentMethodDto {
  @ApiProperty({ example: 'Nakit' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({
    enum: PaymentMethodType,
    default: PaymentMethodType.CASH,
  })
  @IsOptional()
  @IsEnum(PaymentMethodType)
  type?: PaymentMethodType;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePaymentMethodDto extends PartialType(
  CreatePaymentMethodDto,
) {}
