import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll() {
    return this.usersRepository.find();
  }

  async findOne(id: number) {
    return this.usersRepository.findOneBy({ id });
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOneBy({ email });
  }
}
