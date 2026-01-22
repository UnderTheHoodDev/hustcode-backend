import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateContestProblemDto,
  UpdateContestProblemDto,
} from './dtos/contest-problem.dto';
import {
  ContestStatus,
  CreateContestDto,
  UpdateContestDto,
} from './dtos/contest.dto';

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
    const duration = Math.round(
      (endTime.getTime() - startTime.getTime()) / (1000 * 60),
    );

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
        } else if (
          now >= new Date(contest.startTime) &&
          now < new Date(contest.endTime)
        ) {
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
        throw new ForbiddenException(
          'You do not have access to this private contest',
        );
      }
    } else if (!contest.isPublic && !userId) {
      throw new ForbiddenException('This is a private contest');
    }

    // Auto-update status
    const now = new Date();
    let newStatus = contest.status;

    if (now < new Date(contest.startTime)) {
      newStatus = ContestStatus.UPCOMING;
    } else if (
      now >= new Date(contest.startTime) &&
      now < new Date(contest.endTime)
    ) {
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
      throw new ForbiddenException(
        'Only contest creator can update the contest',
      );
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

    const duration = Math.round(
      (endTime.getTime() - startTime.getTime()) / (1000 * 60),
    );

    // If converting to public, also update problems visibility
    if (updateContestDto.isPublic === true && !contest.isPublic) {
      await this.convertContestToPublic(id);
    }

    const updatedContest = await this.prisma.contest.update({
      where: { id },
      data: {
        ...(updateContestDto.title && { title: updateContestDto.title }),
        ...(updateContestDto.description && {
          description: updateContestDto.description,
        }),
        ...(updateContestDto.startTime && { startTime }),
        ...(updateContestDto.endTime && { endTime }),
        duration,
        ...(updateContestDto.status && { status: updateContestDto.status }),
        ...(updateContestDto.isPublic !== undefined && {
          isPublic: updateContestDto.isPublic,
        }),
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
      throw new ForbiddenException(
        'Only contest creator can delete the contest',
      );
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
      throw new BadRequestException(
        `Problem with order ${dto.order} already exists in this contest`,
      );
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

  async updateContestProblem(
    contestId: string,
    problemId: string,
    dto: UpdateContestProblemDto,
    userId: string,
  ) {
    // Verify contest exists and user is creator
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId, isDeleted: false },
    });

    if (!contest) {
      throw new NotFoundException(`Contest with ID ${contestId} not found`);
    }

    if (contest.createdById !== userId) {
      throw new ForbiddenException('Only contest creator can update problems');
    }

    // Verify problem exists in contest
    const contestProblem = await this.prisma.contestProblem.findUnique({
      where: {
        contestId_problemId: {
          contestId,
          problemId,
        },
      },
    });

    if (!contestProblem) {
      throw new NotFoundException('Problem not found in this contest');
    }

    // If updating order, check for conflicts
    if (dto.order && dto.order !== contestProblem.order) {
      const orderExists = await this.prisma.contestProblem.findUnique({
        where: {
          contestId_order: {
            contestId,
            order: dto.order,
          },
        },
      });

      if (orderExists) {
        throw new BadRequestException(
          `Problem with order ${dto.order} already exists in this contest`,
        );
      }
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Update ContestProblem (order, points)
      const updatedContestProblem = await tx.contestProblem.update({
        where: {
          contestId_problemId: {
            contestId,
            problemId,
          },
        },
        data: {
          ...(dto.order && { order: dto.order }),
          ...(dto.points && { points: dto.points }),
        },
      });

      // Update Problem details if provided
      const problemUpdateData: any = {};

      if (dto.title) problemUpdateData.title = dto.title;
      if (dto.description) problemUpdateData.description = dto.description;
      if (dto.difficulty) problemUpdateData.difficulty = dto.difficulty;
      if (dto.taskDescription)
        problemUpdateData.taskDescription = dto.taskDescription;
      if (dto.inputDescription)
        problemUpdateData.inputDescription = dto.inputDescription;
      if (dto.outputDescription)
        problemUpdateData.outputDescription = dto.outputDescription;

      // Handle tags if provided
      if (dto.tags) {
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

        problemUpdateData.tags = {
          set: [],
          connect: tagRecords.map((tag) => ({ id: tag.id })),
        };
      }

      // Update problem if there's any data to update
      if (Object.keys(problemUpdateData).length > 0) {
        await tx.problem.update({
          where: { id: problemId },
          data: problemUpdateData,
        });
      }

      // Update testcases if provided
      if (dto.testcases) {
        await tx.testcase.deleteMany({
          where: { problemId },
        });

        await tx.testcase.createMany({
          data: dto.testcases.map((tc) => ({
            problemId,
            input: tc.input,
            output: tc.output,
            isSample: tc.isSample,
          })),
        });
      }

      // Update constraint if provided
      if (dto.constraint) {
        await tx.problemConstrain.upsert({
          where: { problemId },
          update: {
            memoryLimit: dto.constraint.memoryLimit,
            timeLimit: dto.constraint.timeLimit,
          },
          create: {
            problemId,
            memoryLimit: dto.constraint.memoryLimit,
            timeLimit: dto.constraint.timeLimit,
          },
        });
      }

      // Update contest maxScore if points changed
      if (dto.points) {
        await this.updateContestMaxScore(tx, contestId);
      }

      // Fetch and return updated problem with all relations
      const updatedProblem = await tx.contestProblem.findUnique({
        where: {
          contestId_problemId: {
            contestId,
            problemId,
          },
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

      return updatedProblem;
    });

    return result;
  }

  async removeContestProblem(
    contestId: string,
    problemId: string,
    userId: string,
  ) {
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
  private async checkUserAccess(
    contestId: string,
    userId: string,
  ): Promise<boolean> {
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

  // Contest Invitation Management
  async inviteUsers(contestId: string, userIds: string[], adminId: string) {
    // Verify contest exists and is private
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId, isDeleted: false },
    });

    if (!contest) {
      throw new NotFoundException(`Contest with ID ${contestId} not found`);
    }

    if (contest.createdById !== adminId) {
      throw new ForbiddenException('Only contest creator can invite users');
    }

    if (contest.isPublic) {
      throw new BadRequestException(
        'Cannot invite users to public contest. Public contests are open to everyone.',
      );
    }

    // Validate all user IDs exist
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
    });

    if (users.length !== userIds.length) {
      throw new BadRequestException('One or more user IDs are invalid');
    }

    // Get existing invitations
    const existingInvitations = await this.prisma.contestInvitation.findMany({
      where: {
        contestId,
        userId: { in: userIds },
      },
    });

    const existingUserIds = existingInvitations.map((inv) => inv.userId);
    const newUserIds = userIds.filter((id) => !existingUserIds.includes(id));

    // Create new invitations AND participants in transaction
    if (newUserIds.length > 0) {
      await this.prisma.$transaction(async (tx) => {
        // Create invitations
        await tx.contestInvitation.createMany({
          data: newUserIds.map((userId) => ({
            contestId,
            userId,
          })),
        });

        // Auto-create participants for invited users
        // Check which users don't have participant records yet
        const existingParticipants = await tx.contestParticipant.findMany({
          where: {
            contestId,
            userId: { in: newUserIds },
          },
        });

        const existingParticipantUserIds = existingParticipants.map(
          (p) => p.userId,
        );
        const newParticipantUserIds = newUserIds.filter(
          (id) => !existingParticipantUserIds.includes(id),
        );

        if (newParticipantUserIds.length > 0) {
          await tx.contestParticipant.createMany({
            data: newParticipantUserIds.map((userId) => ({
              contestId,
              userId,
              totalScore: 0,
            })),
          });
        }
      });
    }

    // Get all invitations for response
    const allInvitations = await this.prisma.contestInvitation.findMany({
      where: { contestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      message: `Successfully invited ${newUserIds.length} new user(s). ${existingUserIds.length} user(s) were already invited.`,
      newInvitations: newUserIds.length,
      alreadyInvited: existingUserIds.length,
      totalInvited: allInvitations.length,
      invitations: allInvitations,
    };
  }

  async removeInvitation(contestId: string, userId: string, adminId: string) {
    // Verify contest exists
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId, isDeleted: false },
    });

    if (!contest) {
      throw new NotFoundException(`Contest with ID ${contestId} not found`);
    }

    if (contest.createdById !== adminId) {
      throw new ForbiddenException(
        'Only contest creator can remove invitations',
      );
    }

    // Check if invitation exists
    const invitation = await this.prisma.contestInvitation.findUnique({
      where: {
        contestId_userId: {
          contestId,
          userId,
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Delete invitation AND participant in transaction
    await this.prisma.$transaction(async (tx) => {
      // Delete invitation
      await tx.contestInvitation.delete({
        where: {
          contestId_userId: {
            contestId,
            userId,
          },
        },
      });

      // Delete participant record
      const participant = await tx.contestParticipant.findUnique({
        where: {
          contestId_userId: {
            contestId,
            userId,
          },
        },
      });

      if (participant) {
        await tx.contestParticipant.delete({
          where: {
            contestId_userId: {
              contestId,
              userId,
            },
          },
        });
      }
    });

    return {
      message: 'Invitation removed successfully',
      userId,
    };
  }

  async getInvitations(contestId: string, adminId: string) {
    // Verify contest exists
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId, isDeleted: false },
    });

    if (!contest) {
      throw new NotFoundException(`Contest with ID ${contestId} not found`);
    }

    if (contest.createdById !== adminId) {
      throw new ForbiddenException('Only contest creator can view invitations');
    }

    const invitations = await this.prisma.contestInvitation.findMany({
      where: { contestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { invitedAt: 'desc' },
    });

    return {
      contestId,
      totalInvited: invitations.length,
      invitations,
    };
  }

  // Leaderboard
  async getLeaderboard(
    contestId: string,
    params?: {
      skip?: number;
      take?: number;
      filterUserId?: string;
    },
    userId?: string,
  ) {
    // Verify contest exists
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId, isDeleted: false },
    });

    if (!contest) {
      throw new NotFoundException(`Contest with ID ${contestId} not found`);
    }

    // Check access for private contests
    if (!contest.isPublic && userId) {
      const hasAccess = await this.checkUserAccess(contestId, userId);
      if (!hasAccess) {
        throw new ForbiddenException(
          'You do not have access to this private contest',
        );
      }
    } else if (!contest.isPublic && !userId) {
      throw new ForbiddenException('This is a private contest');
    }

    const skip = params?.skip || 0;
    const take = params?.take || 50;
    const filterUserId = params?.filterUserId;

    // Get contest problems
    const contestProblems = await this.prisma.contestProblem.findMany({
      where: { contestId },
      orderBy: { order: 'asc' },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Build problems info for response
    const problems = contestProblems.map((cp) => ({
      problemId: cp.problemId,
      title: cp.problem.title,
      order: cp.order,
      points: cp.points,
    }));

    const problemIds = contestProblems.map((cp) => cp.problemId);

    // If filterUserId is provided, get only that user's data with their rank
    if (filterUserId) {
      // First, get the user's rank by counting how many participants have higher score
      const userParticipant = await this.prisma.contestParticipant.findUnique({
        where: {
          contestId_userId: {
            contestId,
            userId: filterUserId,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!userParticipant) {
        throw new NotFoundException(
          'User is not a participant in this contest',
        );
      }

      // Calculate user's rank
      const higherRankedCount = await this.prisma.contestParticipant.count({
        where: {
          contestId,
          OR: [
            { totalScore: { gt: userParticipant.totalScore } },
            {
              totalScore: userParticipant.totalScore,
              lastSubmitTime: userParticipant.lastSubmitTime
                ? { lt: userParticipant.lastSubmitTime }
                : undefined,
            },
          ],
        },
      });

      const userRank = higherRankedCount + 1;

      // Get user's submissions for this contest
      const submissions = await this.prisma.submission.findMany({
        where: {
          contestId,
          userId: filterUserId,
          problemId: { in: problemIds },
        },
        select: {
          problemId: true,
          status: true,
        },
      });

      // Group submissions by problem
      const submissionMap = new Map<
        string,
        { count: number; isAccepted: boolean }
      >();
      for (const sub of submissions) {
        const existing = submissionMap.get(sub.problemId) || {
          count: 0,
          isAccepted: false,
        };
        existing.count++;
        if (sub.status === 'ACCEPTED') {
          existing.isAccepted = true;
        }
        submissionMap.set(sub.problemId, existing);
      }

      const problemResults = contestProblems.map((cp) => {
        const subData = submissionMap.get(cp.problemId) || {
          count: 0,
          isAccepted: false,
        };
        return {
          problemId: cp.problemId,
          order: cp.order,
          submissions: subData.count,
          isAccepted: subData.isAccepted,
          score: subData.isAccepted ? cp.points : 0,
        };
      });

      const total = await this.prisma.contestParticipant.count({
        where: { contestId },
      });

      return {
        contestId,
        contestTitle: contest.title,
        maxScore: contest.maxScore,
        status: contest.status,
        problems,
        data: [
          {
            rank: userRank,
            userId: userParticipant.userId,
            userName: userParticipant.user.name,
            userEmail: userParticipant.user.email,
            totalScore: userParticipant.totalScore,
            lastSubmitTime: userParticipant.lastSubmitTime,
            joinedAt: userParticipant.joinedAt,
            problemResults,
          },
        ],
        total,
        totalParticipants: total,
      };
    }

    // Default: Get all participants with pagination
    const [participants, total] = await Promise.all([
      this.prisma.contestParticipant.findMany({
        where: { contestId },
        orderBy: [{ totalScore: 'desc' }, { lastSubmitTime: 'asc' }],
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.contestParticipant.count({ where: { contestId } }),
    ]);

    // Get all submissions for this contest by the participants
    const participantUserIds = participants.map((p) => p.userId);

    const allSubmissions = await this.prisma.submission.findMany({
      where: {
        contestId,
        userId: { in: participantUserIds },
        problemId: { in: problemIds },
      },
      select: {
        userId: true,
        problemId: true,
        status: true,
      },
    });

    // Group submissions by user and problem
    const allSubmissionMap = new Map<
      string,
      { count: number; isAccepted: boolean }
    >();

    for (const sub of allSubmissions) {
      const key = `${sub.userId}_${sub.problemId}`;
      const existing = allSubmissionMap.get(key) || {
        count: 0,
        isAccepted: false,
      };
      existing.count++;
      if (sub.status === 'ACCEPTED') {
        existing.isAccepted = true;
      }
      allSubmissionMap.set(key, existing);
    }

    // Add rank and problem results to each participant
    const leaderboard = participants.map((participant, index) => {
      const problemResults = contestProblems.map((cp) => {
        const key = `${participant.userId}_${cp.problemId}`;
        const subData = allSubmissionMap.get(key) || {
          count: 0,
          isAccepted: false,
        };

        return {
          problemId: cp.problemId,
          order: cp.order,
          submissions: subData.count,
          isAccepted: subData.isAccepted,
          score: subData.isAccepted ? cp.points : 0,
        };
      });

      return {
        rank: skip + index + 1,
        userId: participant.userId,
        userName: participant.user.name,
        userEmail: participant.user.email,
        totalScore: participant.totalScore,
        lastSubmitTime: participant.lastSubmitTime,
        joinedAt: participant.joinedAt,
        problemResults,
      };
    });

    return {
      contestId,
      contestTitle: contest.title,
      maxScore: contest.maxScore,
      status: contest.status,
      problems,
      data: leaderboard,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      totalPages: Math.ceil(total / take),
    };
  }

  // Get contest submissions
  async getContestSubmissions(
    contestId: string,
    params?: {
      skip?: number;
      take?: number;
      problemId?: string;
      filterUserId?: string;
      status?: string;
    },
    userId?: string,
  ) {
    // Verify contest exists
    const contest = await this.prisma.contest.findUnique({
      where: { id: contestId, isDeleted: false },
    });

    if (!contest) {
      throw new NotFoundException(`Contest with ID ${contestId} not found`);
    }

    // Check access for private contests
    if (!contest.isPublic && userId) {
      const hasAccess = await this.checkUserAccess(contestId, userId);
      if (!hasAccess) {
        throw new ForbiddenException(
          'You do not have access to this private contest',
        );
      }
    } else if (!contest.isPublic && !userId) {
      throw new ForbiddenException('This is a private contest');
    }

    const skip = params?.skip || 0;
    const take = params?.take || 20;

    // Build where clause for submissions
    const where: any = {
      contestId,
    };

    // Filter by problemId if provided
    if (params?.problemId) {
      // Verify problem belongs to this contest
      const contestProblem = await this.prisma.contestProblem.findUnique({
        where: {
          contestId_problemId: {
            contestId,
            problemId: params.problemId,
          },
        },
      });

      if (!contestProblem) {
        throw new BadRequestException(
          'Problem does not belong to this contest',
        );
      }

      where.problemId = params.problemId;
    }

    // Filter by userId if provided
    if (params?.filterUserId) {
      where.userId = params.filterUserId;
    }

    // Filter by status if provided
    if (params?.status) {
      where.status = params.status;
    }

    // Get submissions with pagination
    const [submissions, total] = await Promise.all([
      this.prisma.submission.findMany({
        where,
        skip,
        take,
        orderBy: { submittedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          problem: {
            select: {
              id: true,
              title: true,
              difficulty: true,
            },
          },
          language: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.submission.count({ where }),
    ]);

    // Get contest problems info for reference
    const contestProblems = await this.prisma.contestProblem.findMany({
      where: { contestId },
      orderBy: { order: 'asc' },
      select: {
        problemId: true,
        order: true,
        points: true,
      },
    });

    const problemOrderMap = new Map(
      contestProblems.map((cp) => [cp.problemId, cp]),
    );

    // Format submissions response
    const formattedSubmissions = submissions.map((sub) => {
      const contestProblemInfo = problemOrderMap.get(sub.problemId);
      return {
        id: sub.id,
        code: sub.code,
        status: sub.status,
        consumedTime: sub.consumedTime,
        consumedMemory: sub.consumedMemory,
        submittedAt: sub.submittedAt,
        user: sub.user,
        problem: {
          ...sub.problem,
          order: contestProblemInfo?.order,
          points: contestProblemInfo?.points,
        },
        language: sub.language,
      };
    });

    return {
      contestId,
      contestTitle: contest.title,
      status: contest.status,
      data: formattedSubmissions,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      totalPages: Math.ceil(total / take),
    };
  }
}
