import { Controller, Get, Post, Put, Delete, Body, Param, UsePipes, UseGuards, Logger } from '@nestjs/common';


import { IdeaService } from './idea.service';
import { IdeaDTO } from './idea.dto';
import { ValidationPipe } from '../shared/validation.pipe';
import { AuthGuard } from '../shared/auth.guard';
import { User } from '../user/user.decorator';

@Controller('api/idea')
export class IdeaController {
  private logger = new Logger('IdeaController');

  constructor(private ideaService: IdeaService) { }

  @Get()
  showAllIdeas() {
    return this.ideaService.showAll();
  }

  @Post()
  @UseGuards(new AuthGuard())
  @UsePipes(new ValidationPipe())
  createIdea(@User('id') user, @Body() data: IdeaDTO) {
    this.logData({ user, data });
    return this.ideaService.create(user, data);
  }

  @Get(':id')
  readIdea(@Param('id') id: string) {
    return this.ideaService.read(id);
  }

  @Put(':id')
  @UseGuards(new AuthGuard())
  @UsePipes(new ValidationPipe())
  updateIdea(@Param('id') id: string, @User('id') user: string, @Body() data: Partial<IdeaDTO>) {
    this.logData({ id, user, data });
    return this.ideaService.update(id, user, data);
  }

  @Delete(':id')
  @UseGuards(new AuthGuard())
  destroyIdea(@Param('id') id: string, @User('id') user: string) {
    this.logData({ id, user });
    return this.ideaService.destroy(id, user);
  }

  @Post(':id/upvote')
  @UseGuards(new AuthGuard())
  upvoteIdea(@Param('id') id: string, @User('id') user: string) {
    this.logData({ id, user });
    return this.ideaService.upvote(id, user);
  }

  @Post(':id/downvote')
  @UseGuards(new AuthGuard())
  downvoteIdea(@Param('id') id: string, @User('id') user: string) {
    this.logData({ id, user });
    return this.ideaService.downvote(id, user);
  }

  @Post(':id/bookmark')
  @UseGuards(new AuthGuard())
  bookmarkIdea(@Param('id') id: string, @User('id') user: string) {
    this.logData({ user, id });
    return this.ideaService.bookmark(id, user);
  }

  @Delete(':id/bookmark')
  @UseGuards(new AuthGuard())
  unbookmarkIdea(@Param('id') id: string, @User('id') user: string) {
    this.logData({ user, id });
    return this.ideaService.unbookmark(id, user);
  }


  /* UTILITY METHODS */

  private logData(options: any) {
    let toLog: string = '';
    if (options.user) toLog += `USER: ${JSON.stringify(options.user)} `;
    if (options.data) toLog += `DATA: ${JSON.stringify(options.data)} `;
    if (options.id) toLog += `ID: ${JSON.stringify(options.id)} `;
    this.logger.log(toLog);
  }

}
