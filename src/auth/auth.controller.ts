import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signUp.dto';
import { Request, Response } from 'express';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LoginDto } from './dtos/login.dto';
import { JwtGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.signup(dto);
    return this.authService.login(user, res);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
  ) {
    const user = await this.authService.validateUser(loginDto);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    await this.authService.login(user, res);
    return res.status(HttpStatus.OK).json({ message: 'Login successful' });
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Req() req: Request & { user?: any }, @Res() res: Response) {
    const user = req.user;
    await this.authService.login(user, res);
    return res.status(HttpStatus.OK).json({ message: 'Refresh successful' });
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  async logout(@Req() req: Request & { user?: any }, @Res() res: Response) {
    const userId = req.user.id;
    await this.authService.logout(userId, res);
    return res.status(HttpStatus.OK).json({ message: 'Logout successful' });
  }
}
