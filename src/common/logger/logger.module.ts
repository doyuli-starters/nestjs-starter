import { Module, Global } from '@nestjs/common';
import { LoggerService } from './logger.service.js';
import { AuditLogService } from './audit-log.service.js';

@Global()
@Module({
  providers: [LoggerService, AuditLogService],
  exports: [LoggerService, AuditLogService],
})
export class LoggerModule {}
