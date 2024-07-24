import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigService } from './shared/config/app-config.service';
import { DatabaseConfigService } from './shared/config/database-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({ cache: true, isGlobal: true }),

    TypeOrmModule.forRootAsync({
      extraProviders: [DatabaseConfigService],
      inject: [DatabaseConfigService],
      useFactory: (config: DatabaseConfigService) => ({
        type: config.type,
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
        database: config.database,
        autoLoadEntities: true,
      }),
    }),
  ],
  providers: [DatabaseConfigService, AppConfigService],
})
export class AppModule {}
