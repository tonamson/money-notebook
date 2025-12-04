import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { CategoryType } from '../../common/enums/category-type.enum';

@Entity('transactions')
@Index('idx_transactions_user_date', ['userId', 'transactionDate'])
@Index('idx_transactions_user_type_date', ['userId', 'type', 'transactionDate'])
@Index('idx_transactions_user_category', ['userId', 'categoryId'])
@Index('idx_transactions_date', ['transactionDate'])
export class Transaction {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: number;

  @Column({ name: 'category_id', type: 'bigint', unsigned: true })
  categoryId: number;

  @Column({ type: 'enum', enum: CategoryType })
  type: CategoryType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ name: 'transaction_date', type: 'datetime' })
  transactionDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Category, (category) => category.transactions, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
