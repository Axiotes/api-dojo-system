import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class MercadoPagoService {
  private readonly baseUrl: string = 'https://api.mercadopago.com';
  private readonly accessToken: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.accessToken = this.configService.get<string>('MP_ACCESS_TOKEN');

    if (!this.accessToken) {
      throw new InternalServerErrorException('MP access token not found');
    }
  }

  public payment(body: any) {
    return this.httpService.post(`${this.baseUrl}/v1/payments`, body, {
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': 'axiotes',
      },
    });
  }
}
