import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwtRefresh.strategy';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtGuard } from './guards/jwt.guard';

@Module({
  imports: [JwtModule.register({})],
  providers: [
    AuthService,
    PrismaService,
    JwtRefreshStrategy,
    JwtRefreshGuard,
    JwtStrategy,
    JwtGuard,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
