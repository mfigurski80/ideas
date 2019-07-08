import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IdeaEntity } from './idea.entity';
import { IdeaDTO, IdeaRO } from './idea.dto';
import { UserEntity } from '../user/user.entity';
import { Votes } from '../shared/votes.enum';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>
  ) { }

  async showAll(page: number = 0): Promise<Array<IdeaRO>> {
    const ideas = await this.ideaRepository.find({
      relations: ['author', 'upvotes', 'downvotes', 'comments'],
      take: 25,
      skip: 25 * page,
      order: { created: 'DESC' }
    });
    return ideas.map(idea => idea.toResponseObject());
  }

  async create(userId: string, data: IdeaDTO): Promise<IdeaRO> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const idea = await this.ideaRepository.create({ ...data, author: user });
    await this.ideaRepository.save(idea);
    return idea.toResponseObject();
  }

  async read(id: string): Promise<IdeaRO> {
    const idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author', 'upvotes', 'downvotes', 'comments', 'comments.author'] });
    if (!idea) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    return idea.toResponseObject(true);
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

  async upvote(id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({ where: { id }, relations: ['upvotes', 'downvotes'] });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return (await this.vote(idea, user, Votes.UP)).toResponseObject();
  }

  async downvote(id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({ where: { id }, relations: ['upvotes', 'downvotes'] });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return (await this.vote(idea, user, Votes.DOWN)).toResponseObject();
  }

  async bookmark(id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({ where: { id } });
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['bookmarks'] });
    if (!user.bookmarks.some(bookmark => bookmark.id === idea.id)) { // if id not in bookmarks
      user.bookmarks.push(idea);
      await this.userRepository.save(user);
    } else {
      // shame the user for not living up to standards
      throw new HttpException('Idea already bookmarked', HttpStatus.EXPECTATION_FAILED);
    }
    return user.toResponseObject();
  }

  async unbookmark(id: string, userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['bookmarks'] });
    if (user.bookmarks.some(bookmark => bookmark.id === id)) { // if id in bookmarks
      user.bookmarks = user.bookmarks.filter(bookmark => bookmark.id != id);
      await this.userRepository.save(user);
    } else {
      throw new HttpException('Idea was not bookmarked', HttpStatus.EXPECTATION_FAILED);
    }
    return user.toResponseObject();
  }


  /* UTILITY METHODS */

  private ensureOwnership(idea: IdeaEntity, userId: string): void {
    if (idea.author.id !== userId)
      throw new HttpException('Incorrect user', HttpStatus.UNAUTHORIZED);
  }

  private async vote(idea: IdeaEntity, user: UserEntity, vote: Votes) {
    const opposite = (vote === Votes.UP) ? Votes.DOWN : Votes.UP;
    if (idea[vote].some(voter => voter.id === user.id)) // if user already has this vote
      idea[vote] = idea[vote].filter(voter => voter.id !== user.id); // delete this vote
    else { // user is new voter OR user has opposite vote
      idea[opposite] = idea[opposite].filter(voter => voter.id !== user.id); // remove opposite
      idea[vote].push(user); // add new vote
    }
    await this.ideaRepository.save(idea);
    return idea;
  }

}