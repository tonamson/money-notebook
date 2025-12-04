import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { DefaultCategory } from '../categories/entities/default-category.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(DefaultCategory)
    private readonly defaultCategoryRepository: Repository<DefaultCategory>,
  ) {}

  async findByCode(code: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { code } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async createOrLogin(code: string): Promise<User> {
    let user = await this.findByCode(code);

    if (!user) {
      // Create new user
      user = this.userRepository.create({ code });
      user = await this.userRepository.save(user);

      // Copy default categories for new user
      await this.createDefaultCategories(user.id);
    } else {
      // Update last login
      user.lastLoginAt = new Date();
      await this.userRepository.save(user);
    }

    return user;
  }

  private async createDefaultCategories(userId: number): Promise<void> {
    const defaultCategories = await this.defaultCategoryRepository.find();

    const categories = defaultCategories.map((dc) => {
      return this.categoryRepository.create({
        userId,
        name: dc.name,
        type: dc.type,
        icon: dc.icon,
        color: dc.color,
        sortOrder: dc.sortOrder,
        isDefault: true,
      });
    });

    await this.categoryRepository.save(categories);
  }

  async generateCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let exists = true;

    while (exists) {
      code = '';
      for (let i = 0; i < 12; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const user = await this.findByCode(code);
      exists = !!user;
    }

    return code;
  }
}
