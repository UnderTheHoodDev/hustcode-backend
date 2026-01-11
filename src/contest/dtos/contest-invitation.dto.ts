import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

export class InviteUsersDto {
  @ApiProperty({ 
    example: ['user-id-1', 'user-id-2', 'user-id-3'],
    type: [String],
    description: 'Array of user IDs to invite to private contest'
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1, { message: 'At least one user ID is required' })
  userIds: string[];
}

export class InviteSingleUserDto {
  @ApiProperty({ 
    example: 'user-id-123',
    description: 'User ID to invite'
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}