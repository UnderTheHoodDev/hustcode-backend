import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Request } from 'express';

@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  async getUser(@Req() req: Request & { user?: any }) {
    const userId = req.user.id;
    return this.userService.getUser(userId);
  }

  @Get('profile/:id')
  async getUserProfile(@Param('id') id: string) {
    return this.userService.getUser(id);
  }

}
