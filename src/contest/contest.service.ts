import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContestStatus, CreateContestDto, UpdateContestDto } from './dtos/contest.dto';
import { CreateContestProblemDto } from './dtos/contest-problem.dto';



@Injectable()
export class ContestService {
  constructor(private prisma: PrismaService) {}

  async create(createContestDto: CreateContestDto, creatorId: string) {
    const startTime = new Date(createContestDto.startTime);
    const endTime = new Date(createContestDto.endTime);

    if (startTime >= endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Calculate duration in minutes
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

    // Determine initial status
    const now = new Date();
    let status = ContestStatus.UPCOMING;
    if (now >= startTime && now < endTime) {
      status = ContestStatus.RUNNING;
    } else if (now >= endTime) {
      status = ContestStatus.FINISHED;
    }

    const contest = await this.prisma.contest.create({
      data: {
        title: createContestDto.title,
        description: createContestDto.description,
        startTime,
        endTime,
        duration,
        isPublic: createContestDto.isPublic ?? true,
        status,
        maxScore: 0,
        createdById: creatorId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            participants: true,
            problems: true,
          },
        },
      },
    });

    return contest;
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    status?: ContestStatus;
    isPublic?: boolean;
    userId?: string;
  }) {
    const where: any = {
      isDeleted: false,
    };

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.isPublic !== undefined) {
      where.isPublic = params.isPublic;
    }

    // If userId provided, include private contests user has access to
    if (params?.userId) {
      where.OR = [
        { isPublic: true },
        { createdById: params.userId },
        { invitations: { some: { userId: params.userId } } },
      ];
    } else {
      // Guest users only see public contests
      where.isPublic = true;
    }

    const [contests, total] = await Promise.all([
      this.prisma.contest.findMany({
        where,
        skip: params?.skip || 0,
        take: params?.take || 10,
        orderBy: { startTime: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              participants: true,
              problems: true,
            },
          },
        },
      }),
      this.prisma.contest.count({ where }),
    ]);

    // Auto-update status
    const now = new Date();
    const updatedContests = await Promise.all(
      contests.map(async (contest) => {
        let newStatus = contest.status;
        
        if (now < new Date(contest.startTime)) {
          newStatus = ContestStatus.UPCOMING;
        } else if (now >= new Date(contest.startTime) && now < new Date(contest.endTime)) {
          newStatus = ContestStatus.RUNNING;
        } else {
          newStatus = ContestStatus.FINISHED;
        }

        if (newStatus !== contest.status) {
          await this.prisma.contest.update({
            where: { id: contest.id },
            data: { status: newStatus },
          });
        }

        return { ...contest, status: newStatus };
      }),
    );

    return {
      data: updatedContests,
      total,
      page: Math.floor((params?.skip || 0) / (params?.take || 10)) + 1,
      pageSize: params?.take || 10,
      totalPages: Math.ceil(total / (params?.take || 10)),
    };
  }

  async findOne(id: string, userId?: string) {
    const contest = await this.prisma.contest.findUnique({
      where: { id, isDeleted: false },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        problems: {
          include: {
            problem: {
              select: {
                id: true,
                title: true,
                difficulty: true,
                tags: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            participants: true,
            submissions: true,
          },
        },
      },
    });

    if (!contest) {
      throw new NotFoundException(`Contest with ID ${id} not found`);
    }

    // Check access for private contests
    if (!contest.isPublic && userId) {
      const hasAccess = await this.checkUserAccess(contest.id, userId);
      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this private contest');
      }
    } else if (!contest.isPublic && !userId) {
      throw new ForbiddenException('This is a private contest');
    }

    // Auto-update status
    const now = new Date();
    let newStatus = contest.status;
    
    if (now < new Date(contest.startTime)) {
      newStatus = ContestStatus.UPCOMING;
    } else if (now >= new Date(contest.startTime) && now < new Date(contest.endTime)) {
      newStatus = ContestStatus.RUNNING;
    } else {
      newStatus = ContestStatus.FINISHED;
    }

    if (newStatus !== contest.status) {
      await this.prisma.contest.update({
        where: { id },
        data: { status: newStatus },
      });
      contest.status = newStatus;
    }

    return contest;
  }

  async update(id: string, updateContestDto: UpdateContestDto, userId: string) {
    const contest = await this.prisma.contest.findUnique({
      where: { id, isDeleted: false },
    });

    if (!contest) {
      throw new NotFoundException(`Contest with ID ${id} not found`);
    }

    if (contest.createdById !== userId) {
      throw new ForbiddenException('Only contest creator can update the contest');
    }

    // Validate dates if provided
    const startTime = updateContestDto.startTime 
      ? new Date(updateContestDto.startTime) 
      : new Date(contest.startTime);
    const endTime = updateContestDto.endTime 
      ? new Date(updateContestDto.endTime) 
      : new Date(contest.endTime);

    if (startTime >= endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

    // If converting to public, also update problems visibility
    if (updateContestDto.isPublic === true && !contest.isPublic) {
      await this.convertContestToPublic(id);
    }

    const updatedContest = await this.prisma.contest.update({
      where: { id },
      data: {
        ...(updateContestDto.title && { title: updateContestDto.title }),
        ...(updateContestDto.description && { description: updateContestDto.description }),
        ...(updateContestDto.startTime && { startTime }),
        ...(updateContestDto.endTime && { endTime }),
        duration,
        ...(updateContestDto.status && { status: updateContestDto.status }),
        ...(updateContestDto.isPublic !== undefined && { isPublic: updateContestDto.isPublic }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            participants: true,
            problems: true,
          },
        },
      },
    });

    return updatedContest;
  }

  async remove(id: string, userId: string) {
    const contest = await this.prisma.contest.findUnique({
      where: { id, isDeleted: false },
    });

    if (!contest) {
      throw new NotFoundException(`Contest with ID ${id} not found`);
    }

    if (contest.createdById !== userId) {
      throw new ForbiddenException('Only contest creator can delete the contest');
    }

    // Soft delete
    await this.prisma.contest.update({
      where: { id },
      data: { isDeleted: true },
    });

    return {
      message: 'Contest deleted successfully',
      id,
    };
  }

  async createContestProblem(dto: CreateContestProblemDto, userId: string) {
    // Verify contest exists and user is creator
    const contest = await this.prisma.contest.findUnique({
      where: { id: dto.contestId, isDeleted: false },
    });

    if (!contest) {
      throw new NotFoundException(`Contest with ID ${dto.contestId} not found`);
    }

    if (contest.createdById !== userId) {
      throw new ForbiddenException('Only contest creator can add problems');
    }

    // Check if order already exists
    const orderExists = await this.prisma.contestProblem.findUnique({
      where: {
        contestId_order: {
          contestId: dto.contestId,
          order: dto.order,
        },
      },
    });

    if (orderExists) {
      throw new BadRequestException(`Problem with order ${dto.order} already exists in this contest`);
    }

    // Create problem with CONTEST_ONLY visibility
    const result = await this.prisma.$transaction(async (tx) => {
      // Handle tags
      const tagRecords = await Promise.all(
        dto.tags.map(async (tagName) => {
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

      // Create problem
      const problem = await tx.problem.create({
        data: {
          title: dto.title,
          description: dto.description,
          difficulty: dto.difficulty,
          taskDescription: dto.taskDescription,
          inputDescription: dto.inputDescription,
          outputDescription: dto.outputDescription,
          visibility: 'CONTEST_ONLY', // Contest-only problem
          status: 'APPROVED',
          authorId: userId,
          tags: {
            connect: tagRecords.map((tag) => ({ id: tag.id })),
          },
          testcases: {
            create: dto.testcases.map((tc) => ({
              input: tc.input,
              output: tc.output,
              isSample: tc.isSample,
            })),
          },
          problemConstrain: {
            create: {
              memoryLimit: dto.constraint.memoryLimit,
              timeLimit: dto.constraint.timeLimit,
            },
          },
        },
      });

      // Link problem to contest
      const contestProblem = await tx.contestProblem.create({
        data: {
          contestId: dto.contestId,
          problemId: problem.id,
          order: dto.order,
          points: dto.points,
        },
        include: {
          problem: {
            include: {
              tags: true,
              testcases: true,
              problemConstrain: true,
            },
          },
        },
      });

      // Update contest maxScore
      await this.updateContestMaxScore(tx, dto.contestId);

      return contestProblem;
    });

    return result;
  }

  async removeContestProblem(contestId: string, problemId: string, userId: string) {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId, isDeleted: false },
    });

    if (!contest) {
      throw new NotFoundException(`Contest with ID ${contestId} not found`);
    }

    if (contest.createdById !== userId) {
      throw new ForbiddenException('Only contest creator can remove problems');
    }

    const contestProblem = await this.prisma.contestProblem.findUnique({
      where: {
        contestId_problemId: {
          contestId,
          problemId,
        },
      },
    });

    if (!contestProblem) {
      throw new NotFoundException('Problem not found in contest');
    }

    await this.prisma.$transaction(async (tx) => {
      // Remove from contest
      await tx.contestProblem.delete({
        where: {
          contestId_problemId: {
            contestId,
            problemId,
          },
        },
      });

      // Delete the problem (since it's contest-only)
      await tx.problem.delete({
        where: { id: problemId },
      });

      // Update contest maxScore
      await this.updateContestMaxScore(tx, contestId);
    });

    return {
      message: 'Problem removed from contest successfully',
      problemId,
    };
  }

  // Helper methods
  private async checkUserAccess(contestId: string, userId: string): Promise<boolean> {
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId },
      include: {
        invitations: {
          where: { userId },
        },
      },
    });

    return (
      contest?.isPublic ||
      contest?.createdById === userId ||
      (contest?.invitations.length ?? 0) > 0
    );
  }

  private async convertContestToPublic(contestId: string) {
    // Update all contest problems visibility to PUBLIC
    const contestProblems = await this.prisma.contestProblem.findMany({
      where: { contestId },
      select: { problemId: true },
    });

    const problemIds = contestProblems.map((cp) => cp.problemId);

    if (problemIds.length > 0) {
      await this.prisma.problem.updateMany({
        where: { id: { in: problemIds } },
        data: { visibility: 'PUBLIC' },
      });
    }
  }

  private async updateContestMaxScore(tx: any, contestId: string) {
    const problems = await tx.contestProblem.findMany({
      where: { contestId },
    });

    const maxScore = problems.reduce((sum, p) => sum + p.points, 0);

    await tx.contest.update({
      where: { id: contestId },
      data: { maxScore },
    });
  }
}