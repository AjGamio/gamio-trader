import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/user';
import { JwtService } from '@nestjs/jwt';
import { EnvConfig } from 'gamio/domain/config/env.config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(payload: User): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(payload);
    if (user?.password !== EnvConfig.DAS.PASSWORD) {
      throw new UnauthorizedException();
    }
    const tokenPayload = {
      sub: user.account,
      username: user.username,
    };
    return {
      access_token: await this.jwtService.signAsync(
        JSON.stringify(tokenPayload),
        { secret: EnvConfig.JWT_SECRET },
      ),
    };
  }
}
