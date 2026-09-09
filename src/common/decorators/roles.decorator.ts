import { Reflector } from '@nestjs/core';
import { Role } from '../enums/index.js';

export const Roles = Reflector.createDecorator<Role[]>();
