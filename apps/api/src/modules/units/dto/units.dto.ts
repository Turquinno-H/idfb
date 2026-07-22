import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateUnitDto {
  @ApiProperty({ example: 'Adet' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'ADET' })
  @IsString()
  @MaxLength(20)
  code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUnitDto extends PartialType(CreateUnitDto) {}
