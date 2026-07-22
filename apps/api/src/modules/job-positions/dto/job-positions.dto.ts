import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsUUID, IsNumber, IsEnum, Min, Max, MaxLength } from 'class-validator';

export class CreateJobPositionDto {
  @ApiProperty({ example: "Muhasebe Uzmanı" })
  @IsString()
  @MaxLength(150)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  departmentId?: string;
}

export class UpdateJobPositionDto extends PartialType(CreateJobPositionDto) {}
