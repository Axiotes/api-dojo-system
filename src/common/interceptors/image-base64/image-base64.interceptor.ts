import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Document } from 'mongoose';

import { ApiResponse } from '@ds-types/api-response.type';

@Injectable()
export class ImageBase64Interceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<unknown>> {
    return next.handle().pipe(
      map((data) => {
        if (Array.isArray(data.data)) {
          data.data = data.data.map((item) => this.convertImage(item));
        } else {
          data.data = this.convertImage(data.data);
        }

        return data;
      }),
    );
  }

  private convertImage(res: unknown): unknown {
    if (!res || typeof res !== 'object') return res;

    if (res instanceof Document) res = res.toObject();

    for (const key of Object.keys(res)) {
      if (key === 'image' && res[key]) {
        res[key] = `data:image/jpeg;base64,${res[key].toString('base64')}`;
      } else if (typeof res[key] === 'object') {
        res[key] = this.convertImage(res[key]);
      }
    }

    return res;
  }
}
