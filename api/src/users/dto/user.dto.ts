import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Mã đăng nhập 12 ký tự',
    example: 'ABC123XYZ789',
    minLength: 12,
    maxLength: 12,
  })
  @IsString()
  @Length(12, 12, { message: 'Mã đăng nhập phải có đúng 12 ký tự' })
  code: string;
}

export class CreateUserDto {
  @ApiProperty({
    description: 'Mã đăng nhập 12 ký tự',
    example: 'ABC123XYZ789',
    minLength: 12,
    maxLength: 12,
  })
  @IsString()
  @Length(12, 12, { message: 'Mã đăng nhập phải có đúng 12 ký tự' })
  code: string;
}

export class UserResponseDto {
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

export class GenerateCodeResponseDto {
  @ApiProperty({
    description: 'Mã đăng nhập được tạo',
    example: 'ABC123XYZ789',
  })
  code: string;
}
