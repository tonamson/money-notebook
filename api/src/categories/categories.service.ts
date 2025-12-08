import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Category, CategoryType } from './entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

const CACHE_TTL = 0; // 0 = never expire (permanent cache)
const CACHE_KEY_PREFIX = 'categories:user:';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  private getCacheKey(userId: number, type?: CategoryType): string {
    return type
      ? `${CACHE_KEY_PREFIX}${userId}:${type}`
      : `${CACHE_KEY_PREFIX}${userId}:all`;
  }

  private async invalidateUserCache(userId: number): Promise<void> {
    // Invalidate all category caches for this user
    const keys = [
      this.getCacheKey(userId),
      this.getCacheKey(userId, CategoryType.INCOME),
      this.getCacheKey(userId, CategoryType.EXPENSE),
    ];
    await Promise.all(keys.map((key) => this.cacheManager.del(key)));
  }

  async findAllByUser(
    userId: number,
    type?: CategoryType,
  ): Promise<Category[]> {
    const cacheKey = this.getCacheKey(userId, type);

    // Try to get from cache first
    const cached = await this.cacheManager.get<Category[]>(cacheKey);
    console.log('Cached categories:', cached, cacheKey);
    if (cached) {
      return cached;
    }

    // Query from DB
    const query = this.categoryRepository
      .createQueryBuilder('category')
      .where('category.userId = :userId', { userId })
      .orderBy('category.sortOrder', 'ASC')
      .addOrderBy('category.name', 'ASC');

    if (type) {
      query.andWhere('category.type = :type', { type });
    }

    const categories = await query.getMany();

    // Cache the result permanently
    await this.cacheManager.set(cacheKey, categories, CACHE_TTL);

    return categories;
  }

  async findOne(id: number, userId: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    return category;
  }

  async create(
    userId: number,
    createDto: CreateCategoryDto,
  ): Promise<Category> {
    // Check if category with same name and type exists
    const existing = await this.categoryRepository.findOne({
      where: {
        userId,
        name: createDto.name,
        type: createDto.type,
      },
    });

    if (existing) {
      throw new ConflictException('Danh mục đã tồn tại');
    }

    const category = this.categoryRepository.create({
      ...createDto,
      userId,
    });

    const saved = await this.categoryRepository.save(category);

    // Invalidate cache
    await this.invalidateUserCache(userId);

    return saved;
  }

  async update(
    id: number,
    userId: number,
    updateDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id, userId);

    // Check name conflict if updating name
    if (updateDto.name && updateDto.name !== category.name) {
      const existing = await this.categoryRepository.findOne({
        where: {
          userId,
          name: updateDto.name,
          type: category.type,
        },
      });

      if (existing) {
        throw new ConflictException('Tên danh mục đã tồn tại');
      }
    }

    Object.assign(category, updateDto);
    const saved = await this.categoryRepository.save(category);

    // Invalidate cache
    await this.invalidateUserCache(userId);

    return saved;
  }

  async remove(id: number, userId: number): Promise<void> {
    const category = await this.findOne(id, userId);

    // Check if category has transactions
    const transactionCount = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.transactions', 'transaction')
      .where('category.id = :id', { id })
      .andWhere('category.userId = :userId', { userId })
      .select('COUNT(transaction.id)', 'count')
      .getRawOne();

    if (parseInt(transactionCount.count) > 0) {
      throw new ConflictException(
        'Không thể xóa danh mục đã có giao dịch. Vui lòng xóa hoặc chuyển các giao dịch trước.',
      );
    }

    await this.categoryRepository.remove(category);

    // Invalidate cache
    await this.invalidateUserCache(userId);
  }

  async checkExists(
    userId: number,
    name: string,
    type: CategoryType,
  ): Promise<boolean> {
    const category = await this.categoryRepository.findOne({
      where: { userId, name, type },
    });
    return !!category;
  }
}
