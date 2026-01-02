import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { ExamsGateway } from './exams.gateway';
import { Exam } from './exam.entity';
import { Assignment } from './assignment.entity';
import { Radiologist } from '../radiologists/radiologist.entity';
import { LocksModule } from '../locks/locks.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exam, Assignment, Radiologist]),
    LocksModule,
    AuditModule,
  ],
  controllers: [ExamsController],
  providers: [ExamsService, ExamsGateway],
  exports: [ExamsService],
})
export class ExamsModule {}
