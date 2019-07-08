import { IsString } from 'class-validator';

import { UserRO } from '../user/user.dto';
import { CommentDTO } from 'src/comment/comment.dto';

export class IdeaDTO {
  @IsString()
  idea: string;

  @IsString()
  description: string;
}

export class IdeaRO {
  id: string;
  created: Date;
  updated: Date;
  idea: string;
  description: string;
  author?: UserRO;  // user reference
  upvotes?: Array<UserRO> | number;
  downvotes?: Array<UserRO> | number;
  comments?: Array<CommentDTO> | number;
}
