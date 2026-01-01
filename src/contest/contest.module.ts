import { Module } from '@nestjs/common';
import { ContestService } from './contest.service';
import { ContestController } from './contest.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ContestController],
  providers: [ContestService],
  exports: [ContestService]
})
export class ContestModule {}
