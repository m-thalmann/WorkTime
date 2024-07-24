import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type DatabaseType = 'mariadb' | 'mysql' | 'postgres' | 'sqlite';

@Injectable()
export class DatabaseConfigService {
  static readonly DEFAULT_TYPE: DatabaseType = 'mysql';
  static readonly DEFAULT_HOST: string = 'localhost';
  static readonly DEFAULT_USERNAME: string = 'worktime';
  static readonly DEFAULT_PASSWORD: string = 'password';
  static readonly DEFAULT_DATABASE: string = 'worktime';

  constructor(private readonly configService: ConfigService) {}

  get type(): DatabaseType {
    return this.configService.get('DATABASE_TYPE') ?? DatabaseConfigService.DEFAULT_TYPE;
  }

  get host(): string {
    return this.configService.get('DATABASE_HOST') ?? DatabaseConfigService.DEFAULT_HOST;
  }

  get port(): number | undefined {
    return this.configService.get('DATABASE_PORT');
  }

  get username(): string {
    return this.configService.get('DATABASE_USERNAME') ?? DatabaseConfigService.DEFAULT_USERNAME;
  }

  get password(): string {
    return this.configService.get('DATABASE_PASSWORD') ?? DatabaseConfigService.DEFAULT_PASSWORD;
  }

  get database(): string {
    return this.configService.get('DATABASE_DATABASE') ?? DatabaseConfigService.DEFAULT_DATABASE;
  }
}
