import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateCostCenterDto {
  @ApiProperty({ example: 'CC-100' })
  @IsString()
  @MaxLength(50)
  code!: string;

  @ApiProperty({ example: 'Satış Departmanı' })
  @IsString()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCostCenterDto extends PartialType(CreateCostCenterDto) {}
