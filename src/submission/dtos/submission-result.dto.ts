import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubmissionStatus } from '../enum/submission-status.enum';
import { IsOptional } from 'class-validator';

class ProgrammingLanguageSubmissionResult {
  @ApiProperty({ example: 'python' })
  id: string;

  @ApiProperty({ example: 'Python (3.10)' })
  name: string;

  @ApiProperty({ example: '3.10' })
  version: string;
}

export class SubmissionResultDto {
  @ApiProperty({ example: 1.23, nullable: true, description: 'Total CPU time used (seconds)' })
  time: number | null;

  @ApiProperty({ example: 12345, nullable: true, description: 'Maximum memory used (kB)' })
  memory: number | null;

  @ApiProperty({
    enum: SubmissionStatus,
    example: SubmissionStatus.Accepted,
    description: 'Final result status'
  })
  status: SubmissionStatus;

  @ApiProperty({ example: 'Hello, world!', description: 'Standard output from user code' })
  stdout: string;

  @ApiProperty({ example: '', description: 'Standard error from user code or system' })
  stderr: string;

  @ApiPropertyOptional({ example: 'Error message', description: 'Compile error message' })
  @IsOptional()
  compile_error?: string;

  @ApiPropertyOptional({ type: ProgrammingLanguageSubmissionResult, description: 'Programming language and version' })
  @IsOptional()
  language?: ProgrammingLanguageSubmissionResult
}