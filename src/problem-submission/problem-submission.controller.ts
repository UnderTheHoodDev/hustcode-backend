import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ProblemSubmissionService } from './problem-submission.service';
import { SubmitProblemDto } from './dto/submit-problem.dto';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { SubmissionStatus } from '@prisma/client';

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

  // Get submissions by user with pagination and optional filters
  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get all submissions for a user',
    description: 'Get paginated list of submissions by a specific user',
  })
  @ApiParam({ name: 'userId', type: 'string', example: 'clxxx123456789' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'problemId', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: SubmissionStatus,
  })
  @ApiResponse({
    status: 200,
    description: 'User submissions retrieved successfully',
  })
  async getUserSubmissions(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('problemId') problemId?: string,
    @Query('status') status?: SubmissionStatus,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 20;
    const skip = (pageNum - 1) * pageSizeNum;

    return this.problemSubmissionService.getUserSubmissions(userId, {
      skip,
      take: pageSizeNum,
      problemId,
      status,
    });
  }
}
