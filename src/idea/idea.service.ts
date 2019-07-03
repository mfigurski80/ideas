import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IdeaEntity } from './idea.entity';
import { IdeaDTO } from './idea.dto';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository:Repository<IdeaEntity>
  ) {}

  async showAll() {
    return await this.ideaRepository.find();
  }

  async create(data:IdeaDTO) {
    data = this.pick(data, Object.keys(IdeaDTO));
    const idea = await this.ideaRepository.create(data);
    await this.ideaRepository.save(idea);
    return idea;
  }

  async read(id:string) {
    const idea = await this.ideaRepository.findOne({ where: { id } });
    if (!idea) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    return idea;
  }

  async update(id:string, data:Partial<IdeaDTO>) {
    data = this.pick(data, Object.keys(IdeaDTO));
    let idea = await this.ideaRepository.findOne({ where: { id } });
    if (!idea) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    idea = await this.ideaRepository.save({...idea, ...data});
    return idea;
  }

  async destroy(id:string) {
    const idea = await this.ideaRepository.findOne({ where: { id } });
    if (!idea) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    await this.ideaRepository.delete({ id });
    return idea;
  }



  /* Utility Methods */

  /**
   * Picks specific paths from object
   * @param  obj   Object to pick from
   * @param  paths Paths picked
   * @return       Cleaned object
   */
  private pick(obj, paths) {
    Object.keys(obj)
      .filter(key => !paths.includes(key))
      .forEach(key => delete obj[key]);
    return obj;
  }

}
