import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description:
      'Get paginated list of all users. Can search by name or email.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name or email',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    enum: ['name', 'rating', 'createdAt'],
    description: 'Sort field',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
  })
  async getAllUsers(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 10;
    const skip = (pageNum - 1) * pageSizeNum;

    return this.userService.getAllUsers({
      skip,
      take: pageSizeNum,
      search,
      sortBy: sortBy as 'name' | 'rating' | 'createdAt',
      sortOrder: sortOrder as 'asc' | 'desc',
    });
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get current user',
    description: 'Get details of the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User details retrieved successfully',
  })
  async getUser(@Req() req: Request & { user?: any }) {
    const userId = req.user.id;
    return this.userService.getUser(userId);
  }

  @Get('profile/:id')
  @ApiOperation({
    summary: 'Get user profile by ID',
    description: 'Get public profile of a specific user',
  })
  @ApiParam({ name: 'id', type: 'string', example: 'clxxx123456789' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserProfile(@Param('id') id: string) {
    return this.userService.getUser(id);
  }
}
