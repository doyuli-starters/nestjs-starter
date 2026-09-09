import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => ({
  type: 'mysql',
  url: process.env.DATABASE_URL,
  autoLoadEntities: true,
  synchronize: false,
  migrations: ['dist/database/migrations/*.js'],
  migrationsRun: false,
  extra: {
    maxIdle: 20,
    idleTimeout: 30000,
    connectTimeout: 2000,
  },
  poolSize: 20,
  maxQueryExecutionTime: 1000,
}));
