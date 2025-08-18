import { IsString } from 'class-validator';

export class ModalityDto {
  @IsString()
  name: string;

  @IsString()
  description: string;
}
