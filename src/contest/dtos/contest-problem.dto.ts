import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export class CreateContestProblemTestcaseDto {
  @ApiProperty({ example: '5 3' })
  @IsString()
  @IsNotEmpty()
  input: string;

  @ApiProperty({ example: '8' })
  @IsString()
  @IsNotEmpty()
  output: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isSample: boolean;
}

export class CreateContestProblemConstraintDto {
  @ApiProperty({ example: 256, description: 'Memory limit in MB' })
  @IsInt()
  @Min(1)
  memoryLimit: number;

  @ApiProperty({ example: 2000, description: 'Time limit in milliseconds' })
  @IsInt()
  @Min(1)
  timeLimit: number;
}

export class CreateContestProblemDto {
  @ApiProperty({ example: 'clxxx123456789', description: 'Contest ID' })
  @IsString()
  @IsNotEmpty()
  contestId: string;

  @ApiProperty({ example: 1, description: 'Problem order (A=1, B=2, C=3...)' })
  @IsInt()
  @Min(1)
  order: number;

  @ApiProperty({ example: 100, description: 'Points for this problem' })
  @IsInt()
  @Min(1)
  points: number;

  @ApiProperty({ example: 'Two Sum' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ 
    example: 'Given an array of integers, return indices of two numbers...',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ 
    example: ['array', 'hash-table'], 
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  tags: string[];

  @ApiProperty({ enum: Difficulty, example: Difficulty.EASY })
  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @ApiProperty({
    example: 'Find two numbers that add up to target',
  })
  @IsString()
  @IsNotEmpty()
  taskDescription: string;

  @ApiProperty({
    example: 'First line: array\nSecond line: target',
  })
  @IsString()
  @IsNotEmpty()
  inputDescription: string;

  @ApiProperty({
    example: 'Two space-separated indices',
  })
  @IsString()
  @IsNotEmpty()
  outputDescription: string;

  @ApiProperty({ type: [CreateContestProblemTestcaseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContestProblemTestcaseDto)
  @ArrayMinSize(1)
  testcases: CreateContestProblemTestcaseDto[];

  @ApiProperty({ type: CreateContestProblemConstraintDto })
  @ValidateNested()
  @Type(() => CreateContestProblemConstraintDto)
  constraint: CreateContestProblemConstraintDto;
}