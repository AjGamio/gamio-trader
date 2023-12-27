import { Injectable } from '@nestjs/common';
import { User } from './user';
import { EnvConfig } from 'gamio/domain/config/env.config';

@Injectable()
export class UsersService {
  async findOne(user: User): Promise<User | null> {
    return (user.account === EnvConfig.DAS.ACCOUNT ||
      user.sub === EnvConfig.DAS.ACCOUNT) &&
      user.username === EnvConfig.DAS.USERNAME
      ? user
      : null;
  }
}
