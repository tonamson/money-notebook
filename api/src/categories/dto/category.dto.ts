import {
  IsString,
  IsEnum,
  IsOptional,
  MaxLength,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryType } from '../entities/category.entity';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Tên danh mục',
    example: 'Ăn uống',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Loại danh mục',
    enum: CategoryType,
    example: CategoryType.EXPENSE,
  })
  @IsEnum(CategoryType)
  type: CategoryType;

  @ApiPropertyOptional({
    description: 'Icon danh mục',
    example: 'coffee',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiPropertyOptional({
    description: 'Màu sắc danh mục',
    example: '#FF5722',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;

  @ApiPropertyOptional({
    description: 'Thứ tự sắp xếp',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'Tên danh mục',
    example: 'Ăn uống',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Icon danh mục',
    example: 'coffee',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiPropertyOptional({
    description: 'Màu sắc danh mục',
    example: '#FF5722',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;

  @ApiPropertyOptional({
    description: 'Thứ tự sắp xếp',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class CategoryResponseDto {
  @ApiProperty({ description: 'ID danh mục', example: 1 })
  id: number;

  @ApiProperty({ description: 'Tên danh mục', example: 'Ăn uống' })
  name: string;

  @ApiProperty({
    description: 'Loại danh mục',
    enum: CategoryType,
    example: CategoryType.EXPENSE,
  })
  type: CategoryType;

  @ApiPropertyOptional({ description: 'Icon danh mục', example: 'coffee' })
  icon?: string;

  @ApiPropertyOptional({ description: 'Màu sắc danh mục', example: '#FF5722' })
  color?: string;

  @ApiProperty({ description: 'Thứ tự sắp xếp', example: 1 })
  sortOrder: number;

  @ApiProperty({ description: 'Danh mục mặc định', example: false })
  isDefault: boolean;

  @ApiProperty({ description: 'Ngày tạo', example: '2025-12-04T10:00:00.000Z' })
  createdAt: Date;
}
