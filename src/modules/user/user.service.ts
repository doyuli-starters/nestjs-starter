import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ERROR_CODES } from '#/common/constants/index.js';
import { Cacheable } from '#/common/decorators/index.js';
import { BusinessException } from '#/common/exceptions/index.js';
import { AuditAction, AuditLogService } from '#/common/logger/index.js';
import { comparePassword, hashPassword } from '#/common/utils/index.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { User } from './entities/user.entity.js';

export type UserProfile = Omit<User, 'password' | 'deletedAt'>;

const USER_CACHE_PREFIX = 'user:profile';
const USER_CACHE_TTL = 300;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Cacheable({
    prefix: USER_CACHE_PREFIX,
    ttl: USER_CACHE_TTL,
  })
  async findOne(id: string): Promise<UserProfile> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BusinessException(
        ERROR_CODES.USER.NOT_FOUND.code,
        ERROR_CODES.USER.NOT_FOUND.message,
      );
    }
    return this.toProfile(user);
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BusinessException(
        ERROR_CODES.USER.NOT_FOUND.code,
        ERROR_CODES.USER.NOT_FOUND.message,
      );
    }

    if (
      !user.password ||
      !(await comparePassword(dto.oldPassword, user.password))
    ) {
      throw new BusinessException(
        ERROR_CODES.AUTH.INVALID_CREDENTIALS.code,
        ERROR_CODES.AUTH.INVALID_CREDENTIALS.message,
      );
    }

    user.password = await hashPassword(dto.newPassword);
    await this.userRepository.save(user);

    this.auditLogService.log({
      action: AuditAction.PASSWORD_CHANGE,
      userId: id,
    });
  }

  private toProfile(user: User): UserProfile {
    const { password: _, deletedAt: __, ...profile } = user;
    return profile;
  }
}
