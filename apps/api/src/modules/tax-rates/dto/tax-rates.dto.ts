import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsUUID, IsNumber, IsEnum, Min, Max, MaxLength } from 'class-validator';

export class CreateTaxRateDto {
  @ApiProperty({ example: "KDV %20" })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(0)
  @Max(100)
  rate!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTaxRateDto extends PartialType(CreateTaxRateDto) {}
