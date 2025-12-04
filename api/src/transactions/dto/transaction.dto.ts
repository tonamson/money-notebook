import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryType } from '../../categories/entities/category.entity';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Loại giao dịch',
    enum: CategoryType,
    example: CategoryType.EXPENSE,
  })
  @IsEnum(CategoryType)
  type: CategoryType;

  @ApiProperty({
    description: 'Số tiền',
    example: 50000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    description: 'ID danh mục',
    example: 1,
  })
  @IsNumber()
  @Type(() => Number)
  categoryId: number;

  @ApiPropertyOptional({
    description: 'Ghi chú',
    example: 'Cà phê sáng',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiProperty({
    description: 'Ngày giao dịch',
    example: '2025-12-04',
  })
  @IsDateString()
  transactionDate: string;
}

export class UpdateTransactionDto {
  @ApiPropertyOptional({
    description: 'Loại giao dịch',
    enum: CategoryType,
    example: CategoryType.EXPENSE,
  })
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;

  @ApiPropertyOptional({
    description: 'Số tiền',
    example: 50000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount?: number;

  @ApiPropertyOptional({
    description: 'ID danh mục',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Ghi chú',
    example: 'Cà phê sáng',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiPropertyOptional({
    description: 'Ngày giao dịch',
    example: '2025-12-04',
  })
  @IsOptional()
  @IsDateString()
  transactionDate?: string;
}

export class TransactionFilterDto {
  @ApiPropertyOptional({
    description: 'Ngày bắt đầu',
    example: '2025-12-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Ngày kết thúc',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Loại giao dịch',
    enum: CategoryType,
    example: CategoryType.EXPENSE,
  })
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;

  @ApiPropertyOptional({
    description: 'ID danh mục',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Trang',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng mỗi trang',
    example: 20,
    minimum: 1,
    default: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;
}

export class TransactionResponseDto {
  @ApiProperty({ description: 'ID giao dịch', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Loại giao dịch',
    enum: CategoryType,
    example: CategoryType.EXPENSE,
  })
  type: CategoryType;

  @ApiProperty({ description: 'Số tiền', example: 50000 })
  amount: number;

  @ApiProperty({ description: 'ID danh mục', example: 1 })
  categoryId: number;

  @ApiProperty({ description: 'Tên danh mục', example: 'Ăn uống' })
  categoryName: string;

  @ApiPropertyOptional({ description: 'Ghi chú', example: 'Cà phê sáng' })
  note?: string;

  @ApiProperty({
    description: 'Ngày giao dịch',
    example: '2025-12-04T00:00:00.000Z',
  })
  transactionDate: Date;

  @ApiProperty({
    description: 'Ngày tạo',
    example: '2025-12-04T10:00:00.000Z',
  })
  createdAt: Date;
}

export class TransactionStatsDto {
  @ApiProperty({ description: 'Tổng thu nhập', example: 10000000 })
  totalIncome: number;

  @ApiProperty({ description: 'Tổng chi tiêu', example: 5000000 })
  totalExpense: number;

  @ApiProperty({ description: 'Số dư', example: 5000000 })
  balance: number;

  @ApiProperty({ description: 'Ngày bắt đầu', example: '2025-12-01' })
  startDate: string;

  @ApiProperty({ description: 'Ngày kết thúc', example: '2025-12-31' })
  endDate: string;
}
