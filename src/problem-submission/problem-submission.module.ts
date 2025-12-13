import { Module } from '@nestjs/common';
import { ProblemSubmissionService } from './problem-submission.service';
import { ProblemSubmissionController } from './problem-submission.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SubmissionModule } from 'src/submission/submission.module';

@Module({
  imports: [PrismaModule, SubmissionModule],
  controllers: [ProblemSubmissionController],
  providers: [ProblemSubmissionService],
})
export class ProblemSubmissionModule {}
