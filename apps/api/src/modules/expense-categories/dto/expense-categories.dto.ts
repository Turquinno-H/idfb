import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsUUID, IsNumber, IsEnum, Min, Max, MaxLength } from 'class-validator';

export class CreateExpenseCategoryDto {
  @ApiProperty({ example: "Kira" })
  @IsString()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateExpenseCategoryDto extends PartialType(CreateExpenseCategoryDto) {}
