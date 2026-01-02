import { Module } from '@nestjs/common';
import { HL7Service } from './hl7.service';
import { HL7Controller } from './hl7.controller';
import { ExamsModule } from '../exams/exams.module';

@Module({
  imports: [ExamsModule],
  controllers: [HL7Controller],
  providers: [HL7Service],
  exports: [HL7Service],
})
export class HL7Module {}
