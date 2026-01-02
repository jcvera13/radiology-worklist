import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RadiologistsController } from './radiologists.controller';
import { RadiologistsService } from './radiologists.service';
import { Radiologist } from './radiologist.entity';
import { Exam } from '../exams/exam.entity';
import { LocksModule } from '../locks/locks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Radiologist, Exam]),
    LocksModule,
  ],
  controllers: [RadiologistsController],
  providers: [RadiologistsService],
  exports: [RadiologistsService],
})
export class RadiologistsModule {}
