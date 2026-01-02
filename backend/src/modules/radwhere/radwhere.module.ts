import { Module } from '@nestjs/common';
import { RadWhereGateway } from './radwhere.gateway';
import { RadWhereService } from './radwhere.service';
import { RadWhereController } from './radwhere.controller';
import { ExamsModule } from '../exams/exams.module';
import { LocksModule } from '../locks/locks.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [ExamsModule, LocksModule, AuditModule],
  providers: [RadWhereGateway, RadWhereService],
  controllers: [RadWhereController],
  exports: [RadWhereService],
})
export class RadWhereModule {}
