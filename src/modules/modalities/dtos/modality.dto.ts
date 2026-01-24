import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ModalityDto {
  @ApiProperty({
    description: 'Nome da modalidade',
    example: 'Judô',
  })
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  name: string;

  @ApiProperty({
    description: 'Descrição da modalidade',
    example: `O Judô é uma arte marcial de origem japonesa, criada em 1882 pelo mestre Jigoro Kano.`,
  })
  @IsString({
    message: i18nValidationMessage('errors.COMMON.IS_STRING'),
  })
  description: string;
}
