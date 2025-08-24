import { IsEnum, IsMongoId, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { Period } from '@ds-enums/period.enum';

export class PlanDto {
  @ApiProperty({
    description: 'Unidade do período do plano, enum: ("monthly", "annually")',
    example: 'monthly',
  })
  @IsEnum(['monthly', 'annually'])
  period: Period;

  @ApiProperty({
    description: 'Quantidade do período definido em period',
    example: '3',
  })
  @IsNumber()
  periodQuantity: number;

  @ApiProperty({
    description: 'Preço do plano',
    example: '150.00',
  })
  @IsNumber()
  value: number;

  @ApiProperty({
    description: 'Referência para a modalidade à qual o plano pertence',
    example: '64f1b2a3c4d5e6f7890abc12',
  })
  @IsMongoId()
  modality: string;
}
