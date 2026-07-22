import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({ example: 'MERKEZ' })
  @IsString()
  @MaxLength(50)
  code!: string;

  @ApiProperty({ example: 'Merkez Şube' })
  @IsString()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  addressLine?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateBranchDto extends PartialType(CreateBranchDto) {}
