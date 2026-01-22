import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsInt,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsArray,
  Min,
} from 'class-validator';

export enum ContestStatus {
  UPCOMING = 'UPCOMING',
  RUNNING = 'RUNNING',
  FINISHED = 'FINISHED',
}

export class CreateContestDto {
  @ApiProperty({ example: 'Weekly Contest #1' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ 
    example: 'A weekly programming contest for beginners',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ 
    example: '2025-11-01T10:00:00Z',
    description: 'Contest start time (ISO 8601)'
  })
  @IsDateString()
  startTime: string;

  @ApiProperty({ 
    example: '2025-11-01T12:00:00Z',
    description: 'Contest end time (ISO 8601)'
  })
  @IsDateString()
  endTime: string;

  @ApiProperty({ 
    example: true,
    description: 'Is this contest public?',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class UpdateContestDto {
  @ApiPropertyOptional({ example: 'Weekly Contest #1 (Updated)' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ 
    example: 'Updated contest description'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ 
    example: '2025-11-01T10:00:00Z'
  })
  @IsDateString()
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({ 
    example: '2025-11-01T12:00:00Z'
  })
  @IsDateString()
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({ 
    enum: ContestStatus
  })
  @IsEnum(ContestStatus)
  @IsOptional()
  status?: ContestStatus;

  @ApiPropertyOptional({ 
    example: true,
    description: 'Convert private contest to public'
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}