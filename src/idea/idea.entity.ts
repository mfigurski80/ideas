import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm'; // https://typeorm.io/#/

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
  author: UserEntity;

  @ManyToMany(type => UserEntity, { cascade: true })
  @JoinTable()
  upvotes: Array<UserEntity>;

  @ManyToMany(type => UserEntity, { cascade: true })
  @JoinTable()
  downvotes: Array<UserEntity>;




  toResponseObject(isDetailedVotes: boolean = false): IdeaRO {
    let { id, created, updated, idea, description, author, upvotes, downvotes } = this;
    const responseObject: IdeaRO = { id, created, updated, idea, description };
    if (author) responseObject.author = author.toResponseObject();
    if (upvotes) {
      if (isDetailedVotes) responseObject.upvotes = upvotes.map(user => user.toResponseObject());
      else responseObject.upvotes = upvotes.length;
    }
    if (downvotes) {
      if (isDetailedVotes) responseObject.downvotes = downvotes.map(user => user.toResponseObject());
      else responseObject.downvotes = downvotes.length;
    }
    return responseObject;
  }
}