import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigService } from './shared/config/app-config.service';
import { DatabaseConfigService } from './shared/config/database-config.service';
import { UsersModule } from './users/users.module';

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

        // TODO: create migrations and remove this option
        synchronize: true,
      }),
    }),

    UsersModule,
  ],
  providers: [DatabaseConfigService, AppConfigService],
})
export class AppModule {}
