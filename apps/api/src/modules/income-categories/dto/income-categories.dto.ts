import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateIncomeCategoryDto {
  @ApiProperty({ example: 'Faiz Geliri' })
  @IsString()
  @MaxLength(150)
  name!: string;
}

export class UpdateIncomeCategoryDto extends PartialType(
  CreateIncomeCategoryDto,
) {}
