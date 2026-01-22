import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LanguageService {
    constructor(private prisma: PrismaService) {}

    async findAll() {
    const languages = await this.prisma.language.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            submissions: true,
            solutions: true,
          },
        },
      },
    });

    return languages;
  }

  async findOne(id: string) {
    const language = await this.prisma.language.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            submissions: true,
            solutions: true,
          },
        },
      },
    });

    return language;
  }

  async findByName(name: string) {
    const language = await this.prisma.language.findFirst({
      where: { 
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
      include: {
        _count: {
          select: {
            submissions: true,
            solutions: true,
          },
        },
      },
    });

    return language;
  }
}
