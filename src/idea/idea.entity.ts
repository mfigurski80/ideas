import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

import { UserEntity } from '../user/user.entity';
import { IdeaRO } from './idea.dto';
import { UserRO } from '../user/user.dto';

@Entity('idea')
export class IdeaEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column('text')
  idea: string;

  @Column('text')
  description: string;


  @ManyToOne(type => UserEntity, author => author.ideas)
  author: UserEntity



  toResponseObject(): IdeaRO {
    let { id, created, updated, idea, description, author } = this;
    const responseObject: IdeaRO = { id, created, updated, idea, description };
    if (author) responseObject.author = author.toResponseObject();
    return responseObject;
  }
}