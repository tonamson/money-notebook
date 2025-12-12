import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('pv')
export class Pv {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  param: string;

  @Column({ type: 'boolean', default: false })
  notified: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
