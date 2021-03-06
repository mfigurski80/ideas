import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from './user.entity';
import { UserDTO, UserRO } from './user.dto';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>
  ) { }


  async showAll(page: number = 0): Promise<Array<UserRO>> {
    const users = await this.userRepository.find({
      relations: ['ideas', 'bookmarks'],
      take: 25,
      skip: 25 * page
    });
    return users.map(user => user.toResponseObject());
  }

  async login(data: UserDTO): Promise<UserRO> {
    const { username, password } = data;
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user || await !user.comparePassword(password))
      throw new HttpException('Invalid username/password', HttpStatus.FORBIDDEN);
    return user.toResponseObject(true);
  }

  async register(data: UserDTO): Promise<UserRO> {
    const { username } = data;
    let user = await this.userRepository.findOne({ where: { username } });
    if (user)
      throw new HttpException('User already exists', HttpStatus.FORBIDDEN);
    user = await this.userRepository.create(data);
    await this.userRepository.save(user);
    return user.toResponseObject(true);
  }


}
