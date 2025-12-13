import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import configuration from 'config/configuration';
import { validationSchema } from 'config/validation';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProblemModule } from './problem/problem.module';
import { SubmissionModule } from './submission/submission.module';
import { ProblemSubmissionModule } from './problem-submission/problem-submission.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    ProblemModule,
    SubmissionModule,
    ProblemSubmissionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
