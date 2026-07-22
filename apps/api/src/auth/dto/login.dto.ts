import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'ayse@firma.com.tr' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'S3curePass!23' })
  @IsString()
  password!: string;

  @ApiProperty({
    required: false,
    description: 'Select a company when the account belongs to more than one.',
  })
  @IsOptional()
  @IsUUID()
  companyId?: string;
}
