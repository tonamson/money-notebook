import { IsString, Length, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Mã đăng nhập tối đa 12 ký tự',
    example: 'ABC123XYZ789',
    minLength: 1,
    maxLength: 12,
  })
  @IsString()
  @MinLength(1, { message: 'Mã đăng nhập không được để trống' })
  @Length(1, 12, { message: 'Mã đăng nhập tối đa 12 ký tự' })
  code: string;
}

export class UserDto {
  @ApiProperty({ description: 'ID người dùng', example: 1 })
  id: number;

  @ApiProperty({ description: 'Mã đăng nhập', example: 'ABC123XYZ789' })
  code: string;

  @ApiProperty({ description: 'Ngày tạo', example: '2025-12-04T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({
    description: 'Lần đăng nhập cuối',
    example: '2025-12-04T10:00:00.000Z',
    nullable: true,
  })
  lastLoginAt?: Date;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'Trạng thái', example: true })
  success: boolean;

  @ApiProperty({
    description: 'Dữ liệu đăng nhập',
    type: 'object',
    properties: {
      user: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          code: { type: 'string', example: 'ABC123XYZ789' },
          createdAt: { type: 'string', example: '2025-12-04T10:00:00.000Z' },
          lastLoginAt: { type: 'string', example: '2025-12-04T10:00:00.000Z' },
        },
      },
      accessToken: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  data: {
    user: UserDto;
    accessToken: string;
  };
}

export class GenerateCodeResponseDto {
  @ApiProperty({ description: 'Trạng thái', example: true })
  success: boolean;

  @ApiProperty({
    description: 'Dữ liệu',
    type: 'object',
    properties: {
      code: { type: 'string', example: 'ABC123XYZ789' },
    },
  })
  data: {
    code: string;
  };
}
