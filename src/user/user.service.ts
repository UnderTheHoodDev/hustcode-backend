import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(params?: {
    skip?: number;
    take?: number;
    search?: string;
    sortBy?: 'name' | 'rating' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  }) {
    const where: any = {};

    // Search by name or email
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    const orderBy: any = {};
    const sortField = params?.sortBy || 'createdAt';
    const sortOrder = params?.sortOrder || 'desc';
    orderBy[sortField] = sortOrder;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: params?.skip || 0,
        take: params?.take || 10,
        orderBy,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          rating: true,
          contributions: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      total,
      page: Math.floor((params?.skip || 0) / (params?.take || 10)) + 1,
      pageSize: params?.take || 10,
      totalPages: Math.ceil(total / (params?.take || 10)),
    };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        rating: true,
        contributions: true,
      },
    });

    if (!user) {
      return { message: 'User not found' };
    }

    const submissions = await this.prisma.submission.findMany({
      where: { userId: id },
      select: {
        status: true,
        problemId: true,
        language: {
          select: {
            name: true,
          },
        },
      },
    });

    const solvedProblems = new Set(
      submissions
        .filter((s) => s.status === 'ACCEPTED')
        .map((s) => s.problemId),
    );

    const inProgressProblems = new Set(
      submissions
        .filter((s) => s.status !== 'ACCEPTED')
        .map((s) => s.problemId),
    );

    const langUsage: Record<string, number> = {};
    submissions.forEach((s) => {
      langUsage[s.language.name] = (langUsage[s.language.name] || 0) + 1;
    });

    return {
      ...user,
      stats: {
        solved: solvedProblems.size,
        inProgress: inProgressProblems.size,
        accepted: solvedProblems.size,
      },
      languagesUsed: Object.entries(langUsage).map(([language, count]) => ({
        language,
        count,
      })),
    };
  }

  async updateUserRole(userId: string, role: UserRole) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        rating: true,
        contributions: true,
        createdAt: true,
      },
    });

    return {
      message: `User role updated to ${role} successfully`,
      user: updatedUser,
    };
  }
}
