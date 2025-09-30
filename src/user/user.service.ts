import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

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
          }
        }
  }
    });

    const solvedProblems = new Set(
      submissions.filter(s => s.status === 'ACCEPTED').map(s => s.problemId),
    );

    const inProgressProblems = new Set(
      submissions.filter(s => s.status !== 'ACCEPTED').map(s => s.problemId),
    );

    const langUsage: Record<string, number> = {};
    submissions.forEach(s => {
      langUsage[s.language.name] = (langUsage[s.language.name] || 0) + 1;
    });

    return {
      ...user,
      stats: {
        solved: solvedProblems.size,
        inProgress: inProgressProblems.size,
        accepted: solvedProblems.size,
    },
    languagesUsed: Object.entries(langUsage).map(([language, count]) => ({ language, count })),
    };
    
  }

}
