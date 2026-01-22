import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { LanguageService } from './language.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@Controller('language')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all programming languages',
    description: 'Get list of all supported programming languages with submission and solution counts',
  })
  @ApiResponse({
    status: 200,
    description: 'List of languages retrieved successfully',
    schema: {
      example: [
        {
          id: 'clxxx123',
          name: 'python',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
          _count: {
            submissions: 1250,
            solutions: 45,
          },
        },
        {
          id: 'clxxx456',
          name: 'javascript',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
          _count: {
            submissions: 980,
            solutions: 38,
          },
        },
      ],
    },
  })
  async findAll() {
    return this.languageService.findAll();
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search language by name',
    description: 'Find a language by its name (case insensitive)',
  })
  @ApiQuery({
    name: 'name',
    required: true,
    type: String,
    example: 'python',
    description: 'Language name to search for',
  })
  @ApiResponse({
    status: 200,
    description: 'Language found',
  })
  @ApiResponse({
    status: 404,
    description: 'Language not found',
  })
  async findByName(@Query('name') name: string) {
    if (!name) {
      throw new NotFoundException('Language name is required');
    }

    const language = await this.languageService.findByName(name);
    
    if (!language) {
      throw new NotFoundException(`Language '${name}' not found`);
    }

    return language;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get language by ID',
    description: 'Get detailed information about a specific programming language',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    example: 'clxxx123456789',
    description: 'Language ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Language retrieved successfully',
    schema: {
      example: {
        id: 'clxxx123',
        name: 'python',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        _count: {
          submissions: 1250,
          solutions: 45,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Language not found',
  })
  async findOne(@Param('id') id: string) {
    const language = await this.languageService.findOne(id);
    
    if (!language) {
      throw new NotFoundException(`Language with ID ${id} not found`);
    }

    return language;
  }


}
