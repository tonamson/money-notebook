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
import { CategoriesService } from './categories.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryResponseDto,
} from './dto/category.dto';
import { CategoryType } from './entities/category.entity';

@ApiTags('categories')
@ApiBearerAuth('bearer')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách danh mục' })
  @ApiQuery({
    name: 'type',
    enum: CategoryType,
    required: false,
    description: 'Lọc theo loại danh mục',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách danh mục',
  })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  async findAll(@CurrentUser() user: User, @Query('type') type?: CategoryType) {
    const categories = await this.categoriesService.findAllByUser(
      user.id,
      type,
    );
    return {
      success: true,
      data: categories,
    };
  }

  @Get('check')
  @ApiOperation({ summary: 'Kiểm tra danh mục đã tồn tại' })
  @ApiQuery({ name: 'name', description: 'Tên danh mục', required: true })
  @ApiQuery({
    name: 'type',
    enum: CategoryType,
    description: 'Loại danh mục',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Kết quả kiểm tra' })
  async checkExists(
    @CurrentUser() user: User,
    @Query('name') name: string,
    @Query('type') type: CategoryType,
  ) {
    const exists = await this.categoriesService.checkExists(
      user.id,
      name,
      type,
    );
    return {
      success: true,
      data: { exists },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết danh mục' })
  @ApiParam({ name: 'id', description: 'ID danh mục' })
  @ApiResponse({ status: 200, description: 'Chi tiết danh mục' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
  async findOne(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const category = await this.categoriesService.findOne(id, user.id);
    return {
      success: true,
      data: category,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Tạo danh mục mới' })
  @ApiResponse({ status: 201, description: 'Tạo danh mục thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async create(
    @CurrentUser() user: User,
    @Body() createDto: CreateCategoryDto,
  ) {
    const category = await this.categoriesService.create(user.id, createDto);
    return {
      success: true,
      data: category,
      message: 'Tạo danh mục thành công',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật danh mục' })
  @ApiParam({ name: 'id', description: 'ID danh mục' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.update(
      id,
      user.id,
      updateDto,
    );
    return {
      success: true,
      data: category,
      message: 'Cập nhật danh mục thành công',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa danh mục' })
  @ApiParam({ name: 'id', description: 'ID danh mục' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.categoriesService.remove(id, user.id);
    return {
      success: true,
      message: 'Xóa danh mục thành công',
    };
  }
}
