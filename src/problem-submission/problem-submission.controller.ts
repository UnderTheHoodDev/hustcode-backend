import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ProblemSubmissionService } from './problem-submission.service';
import { SubmitProblemDto } from './dto/submit-problem.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@Controller('problem-submission')
export class ProblemSubmissionController {
  constructor(private readonly problemSubmissionService: ProblemSubmissionService) {}

  @Post()
  @UseGuards(JwtGuard)
  @ApiOperation({
    summary: 'Submit code for a problem',
    description:
      'Submit source code to solve a problem. Code will be tested against all testcases.',
  })
  @ApiResponse({
    status: 201,
    description: 'Submission created and evaluated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or problem has no testcases',
  })
  @ApiResponse({
    status: 404,
    description: 'Problem not found',
  })
  async submitProblem(@Body() submitDto: SubmitProblemDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.problemSubmissionService.submitProblem(submitDto, userId);
  }
}
