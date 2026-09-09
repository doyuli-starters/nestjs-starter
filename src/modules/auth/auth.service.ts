import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { QueryFailedError, Repository } from 'typeorm';
import {
  EmailExistsException,
  InvalidCredentialsException,
} from '#/common/exceptions/index.js';
import { AuditLogService, AuditAction } from '#/common/logger/index.js';
import { UserRegisteredEvent } from '#/common/events/events/index.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { User } from '../user/entities/user.entity.js';
import { hashPassword, comparePassword } from '#/common/utils/index.js';
import { EmitEvent } from '#/common/enums/index.js';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private auditLogService: AuditLogService,
    private eventEmitter: EventEmitter2,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async register({ email, password }: RegisterDto, name?: string) {
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new EmailExistsException();
    }

    const hashedPassword = await hashPassword(password);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
    });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      if (this.isDuplicateEmailError(error)) {
        throw new EmailExistsException();
      }
      throw error;
    }

    this.auditLogService.log({
      action: AuditAction.USER_REGISTER,
      userId: user.id,
      metadata: { email },
    });

    this.eventEmitter.emit(
      EmitEvent.USER_REGISTERED,
      new UserRegisteredEvent(user.id, user.email),
    );

    return this.generateToken(user);
  }

  async login({ email, password }: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user?.password || !(await comparePassword(password, user.password))) {
      throw new InvalidCredentialsException();
    }

    this.auditLogService.log({
      action: AuditAction.USER_LOGIN,
      userId: user.id,
      metadata: { email },
    });

    return this.generateToken(user);
  }

  private generateToken(user: User) {
    const payload = { sub: user.id, email: user.email };
    return { access_token: this.jwtService.sign(payload), userId: user.id };
  }

  private isDuplicateEmailError(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const driverError = error.driverError as { code?: string; errno?: number };
    return driverError?.code === 'ER_DUP_ENTRY' || driverError?.errno === 1062;
  }
}
