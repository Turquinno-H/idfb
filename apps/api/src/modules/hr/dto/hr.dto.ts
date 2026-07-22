import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { AttendanceStatus } from '@idfb/database';

export class CreateEmployeeDto {
  @ApiPropertyOptional({
    description: 'Auto-generated (PER-000001) when omitted',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  employeeNumber?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({ example: '12345678901' })
  @IsString()
  @Matches(/^\d{11}$/, {
    message: 'nationalId must be an 11-digit Turkish identity number',
  })
  nationalId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  positionId?: string;

  @ApiProperty({ example: '2026-01-15T00:00:00.000Z' })
  @IsString()
  hireDate!: string;

  @ApiProperty({ example: 45000 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  baseSalary!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  currencyId?: string;
}

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}

export class CreatePayrollDto {
  @ApiProperty()
  @IsUUID()
  employeeId!: string;

  @ApiProperty({
    example: '2026-07-01T00:00:00.000Z',
    description: 'Any date within the payroll month',
  })
  @IsString()
  period!: string;

  @ApiPropertyOptional({
    description: 'Override gross salary; defaults to the employee base salary',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  grossSalary?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  bonuses?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  otherDeductions?: number;
}

export class CreateAttendanceDto {
  @ApiProperty()
  @IsUUID()
  employeeId!: string;

  @ApiProperty({ example: '2026-07-22T00:00:00.000Z' })
  @IsString()
  date!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  checkIn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  checkOut?: string;

  @ApiPropertyOptional({
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}
