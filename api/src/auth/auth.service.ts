import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

export interface JwtPayload {
  sub: number;
  code: string;
}

export interface LoginResponse {
  user: {
    id: number;
    code: string;
    createdAt: Date;
    lastLoginAt: Date | null;
  };
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(code: string): Promise<LoginResponse> {
    const user = await this.usersService.createOrLogin(code);
    const accessToken = this.generateToken(user);

    return {
      user: {
        id: user.id,
        code: user.code,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
      accessToken,
    };
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }
    return user;
  }

  generateToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      code: user.code,
    };
    return this.jwtService.sign(payload);
  }

  async generateCode(): Promise<string> {
    return this.usersService.generateCode();
  }
}
