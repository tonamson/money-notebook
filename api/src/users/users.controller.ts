import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  LoginDto,
  UserResponseDto,
  GenerateCodeResponseDto,
} from './dto/user.dto';

@ApiTags('auth')
@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập hoặc tạo tài khoản mới' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            code: { type: 'string', example: 'ABC123XYZ789' },
            createdAt: { type: 'string', example: '2025-12-04T10:00:00.000Z' },
            lastLoginAt: {
              type: 'string',
              example: '2025-12-04T10:00:00.000Z',
            },
          },
        },
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.usersService.createOrLogin(loginDto.code);
    return {
      success: true,
      data: {
        id: user.id,
        code: user.code,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    };
  }

  @Get('generate-code')
  @ApiOperation({ summary: 'Tạo mã đăng nhập ngẫu nhiên' })
  @ApiResponse({
    status: 200,
    description: 'Mã đăng nhập được tạo thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'ABC123XYZ789' },
          },
        },
      },
    },
  })
  async generateCode() {
    const code = await this.usersService.generateCode();
    return {
      success: true,
      data: { code },
    };
  }
}
