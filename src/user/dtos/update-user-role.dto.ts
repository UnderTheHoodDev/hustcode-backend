import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({
    example: 'ADMIN',
    enum: UserRole,
    description: 'New role for the user',
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
