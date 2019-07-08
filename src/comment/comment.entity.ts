import { Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, ManyToOne, JoinTable } from 'typeorm';

import { UserEntity } from '../user/user.entity';
import { IdeaEntity } from '../idea/idea.entity';
import { CommentRO } from './comment.dto';

@Entity('comment')
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created: Date;

  @Column('text')
  comment: string;


  @ManyToOne(type => UserEntity)
  @JoinTable()
  author: UserEntity;

  @ManyToOne(type => IdeaEntity, idea => idea.comments)
  idea: IdeaEntity;


  toResponseObject(): CommentRO {
    const { id, created, comment, author, idea } = this;
    let responseObject: CommentRO = { id, created, comment };
    if (author) responseObject.author = author.toResponseObject();
    if (idea) responseObject.idea = idea.toResponseObject();
    return responseObject;
  }
}