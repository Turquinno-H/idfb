import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsUUID, IsNumber, IsEnum, Min, Max, MaxLength } from 'class-validator';

export class CreateIncomeCategoryDto {
  @ApiProperty({ example: "Faiz Geliri" })
  @IsString()
  @MaxLength(150)
  name!: string;
}

export class UpdateIncomeCategoryDto extends PartialType(CreateIncomeCategoryDto) {}
