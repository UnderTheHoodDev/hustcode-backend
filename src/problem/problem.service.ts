import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProblemDto } from './dtos/create-problem.dto';
import { Problem, ProblemStatus } from '@prisma/client';
import { ProblemDifficulty } from './enum/problem-difficulty.enum';

@Injectable()
export class ProblemService {
    constructor(private prisma: PrismaService) {}

    async createProblem(createProblemDto: CreateProblemDto, authorId: string) {
    // Validate that language exists for solution if provided
    if (createProblemDto.solution) {
      const language = await this.prisma.language.findUnique({
        where: { id: createProblemDto.solution.languageId },
      });

      if (!language) {
        throw new BadRequestException('Solution language ID is invalid');
      }
    }

    // Create problem with nested relations using transaction
    const problem = await this.prisma.$transaction(async (tx) => {
      // Handle tags: find existing or create new ones
      const tagRecords = await Promise.all(
        createProblemDto.tags.map(async (tagName) => {
          const normalizedTagName = tagName.trim().toLowerCase();
          
          // Find or create tag
          let tag = await tx.tag.findFirst({
            where: { name: normalizedTagName },
          });

          if (!tag) {
            tag = await tx.tag.create({
              data: { name: normalizedTagName },
            });
          }

          return tag;
        }),
      );

      // Create the problem with all nested relations
      const newProblem = await tx.problem.create({
        data: {
          title: createProblemDto.title,
          description: createProblemDto.description,
          difficulty: createProblemDto.difficulty,
          taskDescription: createProblemDto.taskDescription,
          inputDescription: createProblemDto.inputDescription,
          outputDescription: createProblemDto.outputDescription,
          status: createProblemDto.status || ProblemStatus.PENDING,
          authorId: authorId,
          likeNumber: 0,
          // Connect tags
          tags: {
            connect: tagRecords.map((tag) => ({ id: tag.id })),
          },
          // Create testcases
          testcases: {
            create: createProblemDto.testcases.map((testcase) => ({
              input: testcase.input,
              output: testcase.output,
              isSample: testcase.isSample,
            })),
          },
          // Create constraint
          problemConstrain: {
            create: {
              memoryLimit: createProblemDto.constraint.memoryLimit,
              timeLimit: createProblemDto.constraint.timeLimit,
            },
          },
          // Create solution if provided
          ...(createProblemDto.solution && {
            solution: {
              create: {
                code: createProblemDto.solution.code,
                languageId: createProblemDto.solution.languageId,
              },
            },
          }),
        },
        include: {
          tags: true,
          testcases: true,
          problemConstrain: true,
          solution: {
            include: {
              language: true,
            },
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return newProblem;
    });

    return problem;
  }

  // Find all problems with pagination and filters
  async findAll(params?: {
    skip?: number;
    take?: number;
    difficulty?: ProblemDifficulty;
    tags?: string[];
    status?: ProblemStatus;
    search?: string;
    userId?: string; // Add userId to get user's solve status
  }) {
    const where: any = {
      visibility: 'PUBLIC',
      status: 'APPROVED'
    };

    if (params?.difficulty) {
      where.difficulty = params.difficulty;
    }

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.tags && params.tags.length > 0) {
      // Search for problems that have ANY of the specified tags
      where.tags = {
        some: {
          name: {
            in: params.tags.map(tag => tag.toLowerCase()),
          },
        },
      };
    }

    if (params?.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [problems, total] = await Promise.all([
      this.prisma.problem.findMany({
        where,
        skip: params?.skip || 0,
        take: params?.take || 10,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          tags: true,
          _count: {
            select: {
              submissions: true,
              comments: true,
            },
          },
        },
      }),
      this.prisma.problem.count({ where }),
    ]);

    // If userId is provided, get user's submission status for each problem
    let problemsWithStatus = problems;
    
    if (params?.userId) {
      // Get all submissions for this user for these problems
      const problemIds = problems.map(p => p.id);
      
      const userSubmissions = await this.prisma.submission.findMany({
        where: {
          userId: params.userId,
          problemId: { in: problemIds },
        },
        select: {
          problemId: true,
          status: true,
        },
      });

      // Create a map of problemId -> user's best status
      const problemStatusMap = new Map<string, 'Solved' | 'Attempted' | 'Unsolved'>();
      
      // Initialize all problems as Unsolved
      problemIds.forEach(id => problemStatusMap.set(id, 'Unsolved'));
      
      // Update status based on submissions
      userSubmissions.forEach(sub => {
        const currentStatus = problemStatusMap.get(sub.problemId);
        
        // If already Solved, keep it Solved
        if (currentStatus === 'Solved') return;
        
        // If submission is ACCEPTED, mark as Solved
        if (sub.status === 'ACCEPTED') {
          problemStatusMap.set(sub.problemId, 'Solved');
        } 
        // If not ACCEPTED but has attempted, mark as Attempted
        else if (currentStatus === 'Unsolved') {
          problemStatusMap.set(sub.problemId, 'Attempted');
        }
      });

      // Add userStatus to each problem
      problemsWithStatus = problems.map(problem => ({
        ...problem,
        userStatus: problemStatusMap.get(problem.id) || 'Unsolved',
      }));
    } else {
      // If no userId, all problems are Unsolved for this user
      problemsWithStatus = problems.map(problem => ({
        ...problem,
        userStatus: 'Unsolved' as const,
      }));
    }

    return {
      data: problemsWithStatus,
      total,
      page: Math.floor((params?.skip || 0) / (params?.take || 10)) + 1,
      pageSize: params?.take || 10,
      totalPages: Math.ceil(total / (params?.take || 10)),
    };
  }

  // Find problem by ID
  async findOne(id: string) {
    const problem = await this.prisma.problem.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            rating: true,
          },
        },
        tags: true,
        testcases: {
          orderBy: { createdAt: 'asc' },
        },
        problemConstrain: true,
        solution: {
          include: {
            language: true,
          },
        },
        _count: {
          select: {
            submissions: true,
            comments: true,
          },
        },
      },
    });

    if (!problem) {
      throw new NotFoundException(`Problem with ID ${id} not found`);
    }

    return problem;
  }


  // Update problem by ID
  async update(id: string, updateProblemDto: Partial<CreateProblemDto>) {
    const existingProblem = await this.prisma.problem.findUnique({
      where: { id },
    });

    if (!existingProblem) {
      throw new NotFoundException(`Problem with ID ${id} not found`);
    }

    // Validate solution language if provided
    if (updateProblemDto.solution) {
      const language = await this.prisma.language.findUnique({
        where: { id: updateProblemDto.solution.languageId },
      });

      if (!language) {
        throw new BadRequestException('Solution language ID is invalid');
      }
    }

    // Update using transaction
    const problem = await this.prisma.$transaction(async (tx) => {
      // Handle tags if provided
      let tagConnect: { set: any[]; connect: { id: string }[] } | undefined = undefined;
      if (updateProblemDto.tags) {
        const tagRecords = await Promise.all(
          updateProblemDto.tags.map(async (tagName) => {
            const normalizedTagName = tagName.trim().toLowerCase();
            
            let tag = await tx.tag.findFirst({
              where: { name: normalizedTagName },
            });

            if (!tag) {
              tag = await tx.tag.create({
                data: { name: normalizedTagName },
              });
            }

            return tag;
          }),
        );

        tagConnect = {
          set: [], // Disconnect all existing tags
          connect: tagRecords.map((tag) => ({ id: tag.id })),
        };
      }

      // Update basic problem fields
      const updatedProblem = await tx.problem.update({
        where: { id },
        data: {
          ...(updateProblemDto.title && { title: updateProblemDto.title }),
          ...(updateProblemDto.description && { description: updateProblemDto.description }),
          ...(updateProblemDto.difficulty && { difficulty: updateProblemDto.difficulty }),
          ...(updateProblemDto.taskDescription && { taskDescription: updateProblemDto.taskDescription }),
          ...(updateProblemDto.inputDescription && { inputDescription: updateProblemDto.inputDescription }),
          ...(updateProblemDto.outputDescription && { outputDescription: updateProblemDto.outputDescription }),
          ...(updateProblemDto.status && { status: updateProblemDto.status }),
          ...(tagConnect ? { tags: tagConnect } : {}),
        },
      });

      // Update testcases if provided
      if (updateProblemDto.testcases) {
        await tx.testcase.deleteMany({ where: { problemId: id } });
        await tx.testcase.createMany({
          data: updateProblemDto.testcases.map((testcase) => ({
            problemId: id,
            input: testcase.input,
            output: testcase.output,
            isSample: testcase.isSample,
          })),
        });
      }

      // Update constraint if provided
      if (updateProblemDto.constraint) {
        await tx.problemConstrain.upsert({
          where: { problemId: id },
          update: {
            memoryLimit: updateProblemDto.constraint.memoryLimit,
            timeLimit: updateProblemDto.constraint.timeLimit,
          },
          create: {
            problemId: id,
            memoryLimit: updateProblemDto.constraint.memoryLimit,
            timeLimit: updateProblemDto.constraint.timeLimit,
          },
        });
      }

      // Update solution if provided
      if (updateProblemDto.solution) {
        await tx.solution.upsert({
          where: { problemId: id },
          update: {
            code: updateProblemDto.solution.code,
            languageId: updateProblemDto.solution.languageId,
          },
          create: {
            problemId: id,
            code: updateProblemDto.solution.code,
            languageId: updateProblemDto.solution.languageId,
          },
        });
      }

      return updatedProblem;
    });

    return this.findOne(problem.id);
  }

  // Delete problem by ID
  async remove(id: string) {
    const existingProblem = await this.prisma.problem.findUnique({
      where: { id },
    });

    if (!existingProblem) {
      throw new NotFoundException(`Problem with ID ${id} not found`);
    }

    // Delete problem in transaction to handle cascading properly
    await this.prisma.$transaction(async (tx) => {
      // Delete related records first (if not using CASCADE in schema)
      await tx.testcase.deleteMany({ where: { problemId: id } });
      await tx.problemConstrain.deleteMany({ where: { problemId: id } });
      await tx.solution.deleteMany({ where: { problemId: id } });
      await tx.problemComment.deleteMany({ where: { problemId: id } });
      
      // Delete the problem
      await tx.problem.delete({ where: { id } });
    });

    return { message: 'Problem deleted successfully', id };
  }




}
