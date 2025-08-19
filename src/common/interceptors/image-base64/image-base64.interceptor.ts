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
          const modifiedData = data.data.map((item) => {
            if (item instanceof Document) item = item.toObject();
            item.image = `data:image/jpeg;base64,${item.image.toString('base64')}`;
            return item;
          });

          return { ...data, data: modifiedData };
        }

        if (data.data.image) {
          if (data.data instanceof Document) data.data = data.data.toObject();
          data.data.image = `data:image/jpeg;base64,${data.data.image.toString('base64')}`;
          return data;
        }
      }),
    );
  }
}
