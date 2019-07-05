import { IsNotEmpty } from 'class-validator';
import { IdeaRO } from 'src/idea/idea.dto';

export class UserDTO { // data transfer object
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}

export class UserRO { // response object
  id: string;
  username: string;
  created: Date;
  token?: string;
  ideas?: Array<IdeaRO>
}
