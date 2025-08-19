import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ModalityDto {
  @ApiProperty({
    description: 'Nome da modalidade',
    example: 'Judô',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Descrição da modalidade',
    example: `O Judô é uma arte marcial de origem japonesa, criada em 1882 pelo mestre Jigoro Kano.`,
  })
  @IsString()
  description: string;
}
