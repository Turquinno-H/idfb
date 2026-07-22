import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsUUID, IsNumber, IsEnum, Min, Max, MaxLength } from 'class-validator';

export class CreateBankDto {
  @ApiProperty({ example: "Ziraat Bankası" })
  @IsString()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  swiftCode?: string;
}

export class UpdateBankDto extends PartialType(CreateBankDto) {}
