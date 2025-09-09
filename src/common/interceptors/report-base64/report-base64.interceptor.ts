import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

import { ApiResponse } from '@ds-types/api-response.type';
import { Report } from '@ds-types/report.type';

@Injectable()
export class ReportBase64Interceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<Report>> {
    return next.handle().pipe(
      map((data: ApiResponse<Report>) => {
        const base64 = `data:${data.data.mimeType};base64,${data.data.file.toString('base64')}`;

        data.data.file = base64;

        return data;
      }),
    );
  }
}
