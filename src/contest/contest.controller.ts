import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ContestService } from './contest.service';
import { ContestStatus, CreateContestDto, UpdateContestDto } from './dtos/contest.dto';
import { CreateContestProblemDto } from './dtos/contest-problem.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';



@ApiTags('contests')
@Controller('contests')
@UseGuards(JwtGuard)
export class ContestController {
  constructor(private readonly contestService: ContestService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new contest',
    description: 'Create a contest (public or private). Only authenticated users can create contests.',
  })
  @ApiResponse({
    status: 201,
    description: 'Contest created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async create(@Body() createContestDto: CreateContestDto, @Req() req: any) {
    // TODO: Get userId from JWT
    console.log('DEBUG: Request user:', req.user);
    const userId = req.user?.id;

    return this.contestService.create(createContestDto, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all contests',
    description: 'Get paginated list of contests. Users see public contests and private contests they have access to.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ContestStatus,
  })
  @ApiQuery({ name: 'isPublic', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'List of contests retrieved successfully',
  })
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: ContestStatus,
    @Query('isPublic') isPublic?: string,
    @Req() req?: any,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 10;
    const skip = (pageNum - 1) * pageSizeNum;

    const isPublicBool = isPublic === 'true' ? true : isPublic === 'false' ? false : undefined;

    const userId = req?.user?.id;

    return this.contestService.findAll({
      skip,
      take: pageSizeNum,
      status,
      isPublic: isPublicBool,
      userId,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get contest by ID',
    description: 'Get detailed information about a contest including problems',
  })
  @ApiParam({ name: 'id', type: 'string', example: 'clxxx123456789' })
  @ApiResponse({
    status: 200,
    description: 'Contest retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Contest not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied to private contest',
  })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req?.user?.id;
    return this.contestService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update contest',
    description: 'Update contest details. Only contest creator can update. Set isPublic=true to convert private contest to public.',
  })
  @ApiParam({ name: 'id', type: 'string', example: 'clxxx123456789' })
  @ApiResponse({
    status: 200,
    description: 'Contest updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Only contest creator can update',
  })
  @ApiResponse({
    status: 404,
    description: 'Contest not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateContestDto: UpdateContestDto,
    @Req() req: any,
  ) {
    // TODO: Get userId from JWT
    const userId = req.user?.id;

    return this.contestService.update(id, updateContestDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete contest',
    description: 'Soft delete a contest. Only creator can delete.',
  })
  @ApiParam({ name: 'id', type: 'string', example: 'clxxx123456789' })
  @ApiResponse({
    status: 200,
    description: 'Contest deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Only contest creator can delete',
  })
  @ApiResponse({
    status: 404,
    description: 'Contest not found',
  })
  async remove(@Param('id') id: string, @Req() req: any) {
    // TODO: Get userId from JWT
    const userId = req.user?.id;

    return this.contestService.remove(id, userId);
  }

  @Post('problems')
  @ApiOperation({
    summary: 'Create problem in contest',
    description: 'Create a new contest-only problem. The problem will have CONTEST_ONLY visibility and won\'t appear in public problem list.',
  })
  @ApiResponse({
    status: 201,
    description: 'Contest problem created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or order already exists',
  })
  @ApiResponse({
    status: 403,
    description: 'Only contest creator can add problems',
  })
  @ApiResponse({
    status: 404,
    description: 'Contest not found',
  })
  async createProblem(
    @Body() dto: CreateContestProblemDto,
    @Req() req: any,
  ) {
    // TODO: Get userId from JWT
    const userId = req.user?.id;

    return this.contestService.createContestProblem(dto, userId);
  }

  @Delete(':contestId/problems/:problemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove problem from contest',
    description: 'Remove a problem from contest and delete it (since it\'s contest-only). Only contest creator can remove problems.',
  })
  @ApiParam({ name: 'contestId', type: 'string', example: 'clxxx123456789' })
  @ApiParam({ name: 'problemId', type: 'string', example: 'clxxx987654321' })
  @ApiResponse({
    status: 200,
    description: 'Problem removed successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Only contest creator can remove problems',
  })
  @ApiResponse({
    status: 404,
    description: 'Contest or problem not found',
  })
  async removeProblem(
    @Param('contestId') contestId: string,
    @Param('problemId') problemId: string,
    @Req() req: any,
  ) {
    // TODO: Get userId from JWT
    const userId = req.user?.id;

    return this.contestService.removeContestProblem(contestId, problemId, userId);
  }
}