import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Muhasebe' })
  @IsString()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}
