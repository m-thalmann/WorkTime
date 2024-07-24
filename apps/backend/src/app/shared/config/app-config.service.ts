import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  static readonly DEFAULT_PORT: number = 3000;
  static readonly DEFAULT_PREFIX: string = 'api';

  constructor(private readonly configService: ConfigService) {}

  get port(): number {
    return this.configService.get('APP_PORT') ?? AppConfigService.DEFAULT_PORT;
  }

  get prefix(): string {
    return this.configService.get('APP_PREFIX') ?? AppConfigService.DEFAULT_PREFIX;
  }
}
