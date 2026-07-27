import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Manager } from '../managers/manager.entity';
import { EventEntity } from '../events/entities/event.entity';
import { Ticket } from '../tickets/entities/ticket.entity';

/** Render (and most PaaS providers) expose a single connection string. */
const databaseUrlConfig = (
  config: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: config.get<string>('DATABASE_URL'),
  ssl:
    config.get<string>('DB_SSL', 'true') === 'true'
      ? { rejectUnauthorized: false }
      : false,
  entities: [Manager, EventEntity, Ticket],
  synchronize: config.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
});

const discreteFieldsConfig = (
  config: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.get<string>('DB_HOST', 'localhost'),
  port: config.get<number>('DB_PORT', 5432),
  username: config.get<string>('DB_USERNAME', 'ollytiket'),
  password: config.get<string>('DB_PASSWORD', 'ollytiket'),
  database: config.get<string>('DB_NAME', 'ollytiket'),
  entities: [Manager, EventEntity, Ticket],
  synchronize: config.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
});

export const typeOrmConfig = (config: ConfigService): TypeOrmModuleOptions =>
  config.get<string>('DATABASE_URL')
    ? databaseUrlConfig(config)
    : discreteFieldsConfig(config);
