import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamsModule } from './modules/exams/exams.module';
import { RadiologistsModule } from './modules/radiologists/radiologists.module';
import { LocksModule } from './modules/locks/locks.module';
import { AuditModule } from './modules/audit/audit.module';
import { HL7Module } from './modules/hl7/hl7.module';
import { RadWhereModule } from './modules/radwhere/radwhere.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database connection
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'radiology_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // Use migrations in production
      logging: process.env.NODE_ENV === 'development',
    }),

    // Feature modules
    ExamsModule,
    RadiologistsModule,
    LocksModule,
    AuditModule,
    HL7Module,
    RadWhereModule,
  ],
})
export class AppModule {}
