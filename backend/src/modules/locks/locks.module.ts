import { Module, Global } from '@nestjs/common';
import { LocksService } from './locks.service';

@Global() // Make available globally without importing
@Module({
  providers: [LocksService],
  exports: [LocksService],
})
export class LocksModule {}
