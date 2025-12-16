import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ProblemService } from './problem.service';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateProblemDto, UpdateProblemDto } from './dtos/create-problem.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Difficulty, ProblemStatus, UserRole } from '@prisma/client';
import { ProblemDifficulty } from './enum/problem-difficulty.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('problem')
@Controller('problem')
@UseGuards(JwtGuard, RolesGuard)
export class ProblemController {
  constructor(private readonly problemService: ProblemService) {}

  // Create a new problem
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new problem' })
  @ApiResponse({ 
    status: 201, 
    description: 'The problem has been successfully created.' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request. Invalid input data.'
  })
  async create(@Body() createProblemDto: CreateProblemDto, @Req() req: any) {
    const authorId = req.user?.id 
    return this.problemService.createProblem(createProblemDto, authorId);
  }


  // Get all problems with pagination and filters
  @Get()
  @ApiOperation({ summary: 'Get all problems with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({ 
    name: 'difficulty', 
    required: false, 
    enum: Difficulty,
    example: Difficulty.EASY 
  })
  @ApiQuery({ 
    name: 'tags', 
    required: false, 
    type: String, 
    isArray: true,
    example: ['array', 'hash-table']
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ProblemStatus,
    example: ProblemStatus.APPROVED
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'two sum'
  })
  @ApiResponse({
    status: 200,
    description: 'List of problems retrieved successfully. Each problem includes userStatus: Solved (user has ACCEPTED submission), Attempted (user has submissions but none ACCEPTED), or Unsolved (no submissions)',
  })
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('difficulty') difficulty?: ProblemDifficulty,
    @Query('tags') tags?: string | string[],
    @Query('status') status?: ProblemStatus,
    @Query('search') search?: string,
    @Req() req?: any,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 10;
    const skip = (pageNum - 1) * pageSizeNum;

    // Handle tags parameter
    let tagsArray: string[] | undefined;
    if (tags) {
      tagsArray = Array.isArray(tags) ? tags : [tags];
    }

    // Get userId from JWT token
    const userId = req?.user?.id;

    return this.problemService.findAll({
      skip,
      take: pageSizeNum,
      difficulty,
      tags: tagsArray,
      status,
      search,
      userId,
    });
  }

  // Get a problem by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get a problem by ID' })
  @ApiParam({ name: 'id', type: 'string', example: 'clxxx123456789' })
  @ApiResponse({
    status: 200,
    description: 'Problem retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Problem not found',
  })
  async findOne(@Param('id') id: string) {
    return this.problemService.findOne(id);
  }


  // Update a problem
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a problem' })
  @ApiParam({ name: 'id', type: 'string', example: 'clxxx123456789' })
  @ApiResponse({
    status: 200,
    description: 'Problem updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Problem not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateProblemDto: UpdateProblemDto,
  ) {
    return this.problemService.update(id, updateProblemDto);
  }


  // Delete a problem 
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a problem' })
  @ApiParam({ name: 'id', type: 'string', example: 'clxxx123456789' })
  @ApiResponse({
    status: 200,
    description: 'Problem deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Problem not found',
  })
  async remove(@Param('id') id: string) {
    return this.problemService.remove(id);
  }




}
