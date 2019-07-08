import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CommentEntity } from './comment.entity';
import { IdeaEntity } from '../idea/idea.entity';
import { UserEntity } from '../user/user.entity';
import { CommentDTO } from '../comment/comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity) private commentRepository: Repository<CommentEntity>,
    @InjectRepository(IdeaEntity) private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>
  ) { }


  async show(id: string) {
    const comment = await this.commentRepository.findOne({ where: { id }, relations: ['author', 'idea'] });
    return comment.toResponseObject();
  }

  async create(ideaId: string, userId: string, data: CommentDTO) {
    const idea = await this.ideaRepository.findOne({ where: { id: ideaId } });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const comment = await this.commentRepository.create({
      ...data,
      idea,
      author: user
    });
    await this.commentRepository.save(comment);
    return comment.toResponseObject();
  }

  async destroy(id: string, userId: string) {
    const comment = await this.commentRepository.findOne({ where: { id }, relations: ['idea'] });
    if (comment.author.id !== userId)
      throw new HttpException('User does not own this comment', HttpStatus.UNAUTHORIZED);
    await this.commentRepository.remove(comment);
    return comment.toResponseObject();
  }

  async showByIdea(id: string) {
    const comments = await this.commentRepository.find({
      where: { idea: { id } },
      relations: ['author']
    });
    return comments.map(comment => comment.toResponseObject());
  }

  async showByUser(id: string) {
    const comments = await this.commentRepository.find({
      where: { author: { id } },
      relations: ['idea']
    });
    return comments.map(comment => comment.toResponseObject());
  }
}
