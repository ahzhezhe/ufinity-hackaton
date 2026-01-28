import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string; user: any }> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.passwordHash')
      .getOne();

    console.log('User found:', user);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    console.log('Comparing password with hash:', user.passwordHash);
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
