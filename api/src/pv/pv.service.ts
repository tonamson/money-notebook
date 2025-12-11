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

  async saveParam(param: string): Promise<Pv> {
    const pv = this.pvRepository.create({ param });
    return await this.pvRepository.save(pv);
  }

  async findAll(): Promise<Pv[]> {
    return await this.pvRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
}
