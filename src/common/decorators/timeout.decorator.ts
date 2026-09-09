import { Reflector } from '@nestjs/core';

export const Timeout = Reflector.createDecorator<number>();
