import { Controller, Get, Query } from '@nestjs/common';
import { PvService } from './pv.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('pv')
export class PvController {
  constructor(private readonly pvService: PvService) {}

  @Public()
  @Get()
  async trackParam(@Query('p') param: string) {
    const result = await this.pvService.saveParam(param);

    return true;
  }
}
