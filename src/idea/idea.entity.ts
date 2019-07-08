import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm'; // https://typeorm.io/#/

import { UserEntity } from '../user/user.entity';
import { IdeaRO } from './idea.dto';
import { CommentEntity } from '../comment/comment.entity';

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

  @OneToMany(type => CommentEntity, comment => comment.idea, { cascade: true })
  comments: Array<CommentEntity>



  toResponseObject(isDetailed: boolean = false): IdeaRO {
    let { id, created, updated, idea, description, author, upvotes, downvotes, comments } = this;
    const responseObject: IdeaRO = { id, created, updated, idea, description };
    if (author) responseObject.author = author.toResponseObject();
    if (upvotes) {
      if (isDetailed) responseObject.upvotes = upvotes.map(user => user.toResponseObject());
      else responseObject.upvotes = upvotes.length;
    }
    if (downvotes) {
      if (isDetailed) responseObject.downvotes = downvotes.map(user => user.toResponseObject());
      else responseObject.downvotes = downvotes.length;
    }
    if (comments) {
      if (isDetailed) responseObject.comments = comments.map(comment => comment.toResponseObject());
      else responseObject.comments = comments.length;
    }
    return responseObject;
  }
}