import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateExpenseCategoryDto {
  @ApiProperty({ example: 'Kira' })
  @IsString()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateExpenseCategoryDto extends PartialType(
  CreateExpenseCategoryDto,
) {}
