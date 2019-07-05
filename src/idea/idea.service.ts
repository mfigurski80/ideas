import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IdeaEntity } from './idea.entity';
import { IdeaDTO, IdeaRO } from './idea.dto';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>
  ) { }

  async showAll(): Promise<Array<IdeaRO>> {
    const ideas = await this.ideaRepository.find({ relations: ['author'] });
    return ideas.map(idea => idea.toResponseObject());
  }

  async create(userId: string, data: IdeaDTO): Promise<IdeaRO> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const idea = await this.ideaRepository.create({ ...data, author: user });
    await this.ideaRepository.save(idea);
    return idea.toResponseObject();
  }

  async read(id: string): Promise<IdeaRO> {
    const idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author'] });
    if (!idea) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    return idea.toResponseObject();
  }

  async update(id: string, userId: string, data: Partial<IdeaDTO>): Promise<IdeaRO> {
    let idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author'] });
    if (!idea) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    this.ensureOwnership(idea, userId);
    idea = await this.ideaRepository.save({ ...idea, ...data });
    return idea.toResponseObject();
  }

  async destroy(id: string, userId: string): Promise<IdeaRO> {
    const idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author'] });
    if (!idea) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    this.ensureOwnership(idea, userId);
    await this.ideaRepository.delete({ id });
    return idea.toResponseObject();
  }


  /* UTILITY METHODS */

  private ensureOwnership(idea: IdeaEntity, userId: string): void {
    if (idea.author.id !== userId)
      throw new HttpException('Incorrect user', HttpStatus.UNAUTHORIZED);
  }

}