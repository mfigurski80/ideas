import { IsString, IsDate } from "class-validator";
import { UserRO } from "../user/user.dto";
import { IdeaRO } from "../idea/idea.dto";

export class CommentDTO {
  @IsString()
  comment: string;
}

export class CommentRO {
  id: string;
  created: Date;
  comment: string;
  idea?: IdeaRO;
  author?: UserRO;
}