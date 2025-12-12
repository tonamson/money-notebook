import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PvService } from './pv.service';
import { PvController } from './pv.controller';
import { Pv } from './entities/pv.entity';
import { PvNotificationService } from './pv-notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pv])],
  controllers: [PvController],
  providers: [PvService, PvNotificationService],
})
export class PvModule {}
