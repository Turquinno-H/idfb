import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'ayse@firma.com.tr' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'S3curePass!23' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'password must contain at least one uppercase letter, one lowercase letter and one number',
  })
  password!: string;

  @ApiProperty({ example: 'Ayşe' })
  @IsString()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Yılmaz' })
  @IsString()
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({ example: 'Demo Ticaret A.Ş.' })
  @IsString()
  @MaxLength(200)
  companyName!: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @Matches(/^\d{10,11}$/, {
    message: 'taxNumber must be a valid Turkish tax/national identity number',
  })
  taxNumber!: string;
}
