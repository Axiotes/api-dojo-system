import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import { LoggerService } from '@ds-services/logger/logger.service';

@Injectable()
export class CombinedLogsInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const initializeTime = new Date().getTime();

    return next.handle().pipe(
      tap(() => {
        const executionTime = new Date().getTime() - initializeTime;
        this.loggerService.logInfo({
          method: req.method,
          url: req.url,
          params: req.params,
          body: req.body,
          executionTime: `${executionTime}ms`,
          statusCode: context.switchToHttp().getResponse().statusCode,
        });
      }),
    );
  }
}
