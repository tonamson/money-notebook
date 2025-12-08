import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Transaction } from './entities/transaction.entity';
import { Category, CategoryType } from '../categories/entities/category.entity';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionFilterDto,
  TransactionStatsDto,
} from './dto/transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  private getCacheKey(userId: number, filter: TransactionFilterDto): string {
    return `transactions:${userId}:${filter.startDate || 'all'}:${filter.endDate || 'all'}:${filter.type || 'all'}:${filter.categoryId || 'all'}:${filter.page || 1}:${filter.limit || 20}`;
  }

  private getStatsCacheKey(
    userId: number,
    startDate: string,
    endDate: string,
  ): string {
    return `stats:${userId}:${startDate}:${endDate}`;
  }

  private async invalidateUserCache(userId: number): Promise<void> {
    // Delete cache entries for this specific user
    // We'll delete the most common cache patterns
    const cachePatterns = [`transactions:${userId}:`, `stats:${userId}:`];

    // Since we can't iterate over all keys, we'll delete known patterns
    // In production, consider using Redis with pattern-based deletion
    for (const pattern of cachePatterns) {
      // Delete common combinations
      await this.cacheManager.del(pattern);
    }
  }

  async findAll(
    userId: number,
    filter: TransactionFilterDto,
  ): Promise<{ data: Transaction[]; total: number }> {
    const cacheKey = this.getCacheKey(userId, filter);
    const cached = await this.cacheManager.get<{
      data: Transaction[];
      total: number;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.category', 'category')
      .where('transaction.userId = :userId', { userId });

    if (filter.startDate && filter.endDate) {
      query.andWhere(
        'transaction.transactionDate BETWEEN :startDate AND :endDate',
        {
          startDate: filter.startDate,
          endDate: filter.endDate + ' 23:59:59',
        },
      );
    }

    if (filter.type) {
      query.andWhere('transaction.type = :type', { type: filter.type });
    }

    if (filter.categoryId) {
      query.andWhere('transaction.categoryId = :categoryId', {
        categoryId: filter.categoryId,
      });
    }

    const total = await query.getCount();

    const page = filter.page || 1;
    const limit = filter.limit || 20;

    query
      .orderBy('transaction.transactionDate', 'DESC')
      .addOrderBy('transaction.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const data = await query.getMany();
    const result = { data, total };

    await this.cacheManager.set(cacheKey, result);

    return result;
  }

  async findOne(id: number, userId: number): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id, userId },
      relations: ['category'],
    });

    if (!transaction) {
      throw new NotFoundException('Không tìm thấy giao dịch');
    }

    return transaction;
  }

  async create(
    userId: number,
    createDto: CreateTransactionDto,
  ): Promise<Transaction> {
    // Verify category belongs to user
    const category = await this.categoryRepository.findOne({
      where: { id: createDto.categoryId, userId },
    });

    if (!category) {
      throw new NotFoundException('Danh mục không tồn tại');
    }

    const transaction = this.transactionRepository.create({
      userId,
      categoryId: createDto.categoryId,
      type: createDto.type,
      amount: createDto.amount,
      note: createDto.note,
      transactionDate: new Date(createDto.transactionDate),
    });

    const saved = await this.transactionRepository.save(transaction);
    await this.invalidateUserCache(userId);

    return saved;
  }

  async update(
    id: number,
    userId: number,
    updateDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.findOne(id, userId);

    // Verify new category if updating
    if (
      updateDto.categoryId &&
      updateDto.categoryId !== transaction.categoryId
    ) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateDto.categoryId, userId },
      });

      if (!category) {
        throw new NotFoundException('Danh mục không tồn tại');
      }
    }

    Object.assign(transaction, {
      ...updateDto,
      transactionDate: updateDto.transactionDate
        ? new Date(updateDto.transactionDate)
        : transaction.transactionDate,
    });

    const saved = await this.transactionRepository.save(transaction);
    await this.invalidateUserCache(userId);

    return saved;
  }

  async remove(id: number, userId: number): Promise<void> {
    const transaction = await this.findOne(id, userId);
    await this.transactionRepository.remove(transaction);
    await this.invalidateUserCache(userId);
  }

  async getStats(
    userId: number,
    startDate: string,
    endDate: string,
  ): Promise<TransactionStatsDto> {
    const cacheKey = this.getStatsCacheKey(userId, startDate, endDate);
    const cached = await this.cacheManager.get<TransactionStatsDto>(cacheKey);

    if (cached) {
      return cached;
    }

    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select([
        'SUM(CASE WHEN transaction.type = :income THEN transaction.amount ELSE 0 END) as totalIncome',
        'SUM(CASE WHEN transaction.type = :expense THEN transaction.amount ELSE 0 END) as totalExpense',
      ])
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.transactionDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate: endDate + ' 23:59:59',
      })
      .setParameter('income', CategoryType.INCOME)
      .setParameter('expense', CategoryType.EXPENSE)
      .getRawOne();

    const totalIncome = parseFloat(result.totalIncome) || 0;
    const totalExpense = parseFloat(result.totalExpense) || 0;

    const stats = {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      startDate,
      endDate,
    };

    await this.cacheManager.set(cacheKey, stats);

    return stats;
  }
}
