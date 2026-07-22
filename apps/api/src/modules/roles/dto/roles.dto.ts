import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'Depo Sorumlusu' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @ApiProperty({ type: [String], description: 'Permission ids to assign' })
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds!: string[];
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}

export class InviteUserDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({ type: [String], description: 'Role ids to grant to the invited member' })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  roleIds!: string[];
}

export class AssignRolesDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  roleIds!: string[];
}
