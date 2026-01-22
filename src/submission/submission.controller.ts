import { Body, Controller, Post } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { CreateSubmissionDto } from './dtos/create-submission.dto';
import { SubmissionResultDto } from './dtos/submission-result.dto';

@Controller('submission')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  @ApiOperation({ summary: 'Submit code for execution and evaluation' })
  @ApiOkResponse({ type: SubmissionResultDto, description: 'The result of the code execution and evaluation' })
  async createSubmission(@Body() createSubmissionDto: CreateSubmissionDto): Promise<SubmissionResultDto> {
    return this.submissionService.runCode(createSubmissionDto);
  }
}
