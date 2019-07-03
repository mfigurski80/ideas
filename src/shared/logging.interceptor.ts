import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// https://docs.nestjs.com/interceptors
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(
    context:ExecutionContext,
    call$:CallHandler<any>
  ):Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const now = Date.now();

    return call$.handle().pipe( // note, need to call handle first to handle route

      tap(() => Logger.log(
        `${method} ${url} [${Date.now() - now}ms]`,
        context.getClass().name
      ))

    );
  }
}
