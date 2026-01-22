import { Module } from '@nestjs/common';
import { ProblemService } from './problem.service';
import { ProblemController } from './problem.controller';
import { PrismaService } from 'src/prisma/prisma.service';


@Module({
  controllers: [ProblemController],
  providers: [ProblemService, PrismaService],
})
export class ProblemModule {}
