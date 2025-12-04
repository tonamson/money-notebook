import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import {
  LoginDto,
  LoginResponseDto,
  GenerateCodeResponseDto,
} from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập hoặc tạo tài khoản mới' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Mã đăng nhập không hợp lệ' })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto.code);
    return {
      success: true,
      data: result,
    };
  }

  @Public()
  @Get('generate-code')
  @ApiOperation({ summary: 'Tạo mã đăng nhập ngẫu nhiên' })
  @ApiResponse({
    status: 200,
    description: 'Mã đăng nhập được tạo thành công',
    type: GenerateCodeResponseDto,
  })
  async generateCode() {
    const code = await this.authService.generateCode();
    return {
      success: true,
      data: { code },
    };
  }
}
