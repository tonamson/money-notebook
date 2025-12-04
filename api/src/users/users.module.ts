import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { DefaultCategory } from '../categories/entities/default-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Category, DefaultCategory])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
