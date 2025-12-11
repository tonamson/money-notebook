import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pv } from './entities/pv.entity';

@Injectable()
export class PvService {
  constructor(
    @InjectRepository(Pv)
    private pvRepository: Repository<Pv>,
  ) {}

  async saveParam(param: string): Promise<boolean> {
    // Kiểm tra xem param đã tồn tại chưa
    const existingPv = await this.pvRepository.findOne({ where: { param } });

    if (existingPv) {
      return false;
    }

    // Nếu chưa tồn tại, tạo mới
    const pv = this.pvRepository.create({ param });
    await this.pvRepository.save(pv);
    return true;
  }

  async getDecodedParam(id: number): Promise<string | null> {
    const pv = await this.pvRepository.findOne({ where: { id } });

    if (!pv) {
      return null;
    }

    // Decode base64
    return Buffer.from(pv.param, 'base64').toString('utf-8');
  }
}
