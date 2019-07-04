import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';


@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context:ExecutionContext):Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.headers.authorization) return false;
    request.user = await this.validateToken(request.headers.authorization);
    
    return true;
  }

  async validateToken(auth:string) {
    // auth === 'Bearer <token>'
    if (auth.split(' ')[0] !== 'Bearer')
      throw new HttpException('Invalid token format', HttpStatus.FORBIDDEN);
    const token = auth.split(' ')[1];

    try {
      const decode = await jwt.verify(token, process.env.SECRET);
      return decode;
    } catch (err) {
      throw new HttpException('Token Error: ' + (err.message || err.name), HttpStatus.FORBIDDEN);
    }

  }
}
