import { IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SubmissionLanguageDto {
  @ApiProperty({ example: 'python' })
  @IsString()
  id: string;

  @ApiProperty({ example: '3.10' })
  @IsString()
  version: string;
}

export class CreateSubmissionDto {
  @ApiProperty({ example: 'text=input()\nprint(text)' })
  @IsString()
  source_code: string;

  @ApiProperty({ example: 'hello, world!' })
  @IsString()
  stdin: string;

  @ApiProperty({ example: 'hello, world!\n' })
  @IsString()
  expected_output: string;

  @ApiPropertyOptional({ example: '2', description: 'Time limit in seconds' })
  @IsOptional()
  @IsNumber()
  cpu_time_limit: number = 2;

  @ApiPropertyOptional({ example: '0.5', description: 'Extra time in seconds' })
  @IsOptional()
  @IsNumber()
  cpu_extra_time: number = 0.5;

  @ApiPropertyOptional({ example: '128000', description: 'Memory limit in kilobytes' })
  @IsOptional()
  @IsNumber()
  memory_limit: number = 128000;

  @ApiProperty({ type: SubmissionLanguageDto })
  @ValidateNested()
  @Type(() => SubmissionLanguageDto)
  language: SubmissionLanguageDto;
}