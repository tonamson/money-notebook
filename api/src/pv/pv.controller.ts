import { Controller, Get, Query, Param } from '@nestjs/common';
import { PvService } from './pv.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('pv')
export class PvController {
  constructor(private readonly pvService: PvService) {}

  @Public()
  @Get()
  async trackParam(@Query('p') param: string) {
    return await this.pvService.saveParam(param);
  }

  @Public()
  @Get(':id')
  async getDecodedParam(@Param('id') id: number) {
    const decoded = await this.pvService.getDecodedParam(id);

    if (!decoded) {
      return { error: 'Not found' };
    }

    return { decoded };
  }
}
