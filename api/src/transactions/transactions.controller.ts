import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionFilterDto,
  TransactionResponseDto,
  TransactionStatsDto,
} from './dto/transaction.dto';

@ApiTags('transactions')
@ApiBearerAuth('bearer')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách giao dịch' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách giao dịch với phân trang',
  })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  async findAll(
    @CurrentUser() user: User,
    @Query() filter: TransactionFilterDto,
  ) {
    const { data, total } = await this.transactionsService.findAll(
      user.id,
      filter,
    );
    return {
      success: true,
      data,
      meta: {
        total,
        page: filter.page || 1,
        limit: filter.limit || 20,
      },
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê giao dịch' })
  @ApiQuery({
    name: 'startDate',
    description: 'Ngày bắt đầu (YYYY-MM-DD)',
    example: '2025-12-01',
    required: true,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Ngày kết thúc (YYYY-MM-DD)',
    example: '2025-12-31',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Thống kê thu chi',
    type: TransactionStatsDto,
  })
  async getStats(
    @CurrentUser() user: User,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const stats = await this.transactionsService.getStats(
      user.id,
      startDate,
      endDate,
    );
    return {
      success: true,
      data: stats,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết giao dịch' })
  @ApiParam({ name: 'id', description: 'ID giao dịch' })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết giao dịch',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giao dịch' })
  async findOne(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const transaction = await this.transactionsService.findOne(id, user.id);
    return {
      success: true,
      data: transaction,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Tạo giao dịch mới' })
  @ApiResponse({
    status: 201,
    description: 'Tạo giao dịch thành công',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async create(
    @CurrentUser() user: User,
    @Body() createDto: CreateTransactionDto,
  ) {
    const transaction = await this.transactionsService.create(
      user.id,
      createDto,
    );
    return {
      success: true,
      data: transaction,
      message: 'Tạo giao dịch thành công',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật giao dịch' })
  @ApiParam({ name: 'id', description: 'ID giao dịch' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giao dịch' })
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTransactionDto,
  ) {
    const transaction = await this.transactionsService.update(
      id,
      user.id,
      updateDto,
    );
    return {
      success: true,
      data: transaction,
      message: 'Cập nhật giao dịch thành công',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa giao dịch' })
  @ApiParam({ name: 'id', description: 'ID giao dịch' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giao dịch' })
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.transactionsService.remove(id, user.id);
    return {
      success: true,
      message: 'Xóa giao dịch thành công',
    };
  }
}
