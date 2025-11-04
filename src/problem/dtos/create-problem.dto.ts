import { ApiProperty } from "@nestjs/swagger";
import { ProblemDifficulty } from "../enum/problem-difficulty.enum";
import { ProblemStatus } from "../enum/problem-status.enum";
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CreateTestcaseDto {
  @ApiProperty({ example: '5 3' })
  @IsString()
  @IsNotEmpty()
  input: string;

  @ApiProperty({ example: '8' })
  @IsString()
  @IsNotEmpty()
  output: string;

  @ApiProperty({ example: true, description: 'Is this a sample testcase shown to users?' })
  @IsBoolean()
  isSample: boolean;
}


export class CreateProblemConstraintDto {
  @ApiProperty({ example: 256, description: 'Memory limit in MB' })
  @IsInt()
  @Min(1)
  memoryLimit: number;

  @ApiProperty({ example: 2000, description: 'Time limit in milliseconds' })
  @IsInt()
  @Min(1)
  timeLimit: number;
}

export class CreateSolutionDto {
  @ApiProperty({ example: 'def solve(a, b):\n    return a + b' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'python-id-here', description: 'Language ID (cuid)' })
  @IsString()
  @IsNotEmpty()
  languageId: string;
}

export class CreateProblemDto {
  @ApiProperty({ example: 'Two Sum' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ 
    example: ['array', 'hash-table'], 
    type: [String],
    description: 'Array of tag names. Tags will be created if they don\'t exist.'
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  tags: string[];

  @ApiProperty({ enum: ProblemDifficulty, example: ProblemDifficulty.EASY })
  @IsEnum(ProblemDifficulty)
  difficulty: ProblemDifficulty;

  @ApiProperty({
    example: 'You are given an array of integers and a target. Find two numbers that sum to the target.',
  })
  @IsString()
  @IsNotEmpty()
  taskDescription: string;

  @ApiProperty({
    example: 'First line: n integers\nSecond line: target integer',
  })
  @IsString()
  @IsNotEmpty()
  inputDescription: string;

  @ApiProperty({
    example: 'Two space-separated integers representing the indices',
  })
  @IsString()
  @IsNotEmpty()
  outputDescription: string;

  @ApiProperty({
    enum: ProblemStatus,
    example: ProblemStatus.PENDING,
    required: false,
    description: 'Defaults to PENDING if not provided'
  })
  @IsEnum(ProblemStatus)
  @IsOptional()
  status?: ProblemStatus;

  @ApiProperty({ type: [CreateTestcaseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTestcaseDto)
  @ArrayMinSize(1, { message: 'At least one testcase is required' })
  testcases: CreateTestcaseDto[];

  @ApiProperty({ type: CreateProblemConstraintDto })
  @ValidateNested()
  @Type(() => CreateProblemConstraintDto)
  constraint: CreateProblemConstraintDto;

  @ApiProperty({ type: CreateSolutionDto, required: false })
  @ValidateNested()
  @Type(() => CreateSolutionDto)
  @IsOptional()
  solution?: CreateSolutionDto;
}

export class UpdateProblemDto {
  @ApiProperty({ example: 'Two Sum', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Given an array of integers nums and an integer target...', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    example: ['array', 'hash-table'], 
    type: [String],
    required: false,
    description: 'Array of tag names. Tags will be created if they don\'t exist.'
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ enum: ProblemDifficulty, example: ProblemDifficulty.EASY, required: false })
  @IsEnum(ProblemDifficulty)
  @IsOptional()
  difficulty?: ProblemDifficulty;

  @ApiProperty({
    example: 'You are given an array of integers and a target. Find two numbers that sum to the target.',
    required: false
  })
  @IsString()
  @IsOptional()
  taskDescription?: string;

  @ApiProperty({
    example: 'First line: n integers\nSecond line: target integer',
    required: false
  })
  @IsString()
  @IsOptional()
  inputDescription?: string;

  @ApiProperty({
    example: 'Two space-separated integers representing the indices',
    required: false
  })
  @IsString()
  @IsOptional()
  outputDescription?: string;

  @ApiProperty({
    enum: ProblemStatus,
    example: ProblemStatus.APPROVED,
    required: false
  })
  @IsEnum(ProblemStatus)
  @IsOptional()
  status?: ProblemStatus;

  @ApiProperty({ type: [CreateTestcaseDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTestcaseDto)
  @IsOptional()
  testcases?: CreateTestcaseDto[];

  @ApiProperty({ type: CreateProblemConstraintDto, required: false })
  @ValidateNested()
  @Type(() => CreateProblemConstraintDto)
  @IsOptional()
  constraint?: CreateProblemConstraintDto;

  @ApiProperty({ type: CreateSolutionDto, required: false })
  @ValidateNested()
  @Type(() => CreateSolutionDto)
  @IsOptional()
  solution?: CreateSolutionDto;
}