import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UserService } from './user.service.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { CurrentUser } from '#/common/decorators/current-user.decorator.js';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  getProfile(@CurrentUser('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch('password')
  changePassword(
    @CurrentUser('id') id: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(id, dto);
  }
}
