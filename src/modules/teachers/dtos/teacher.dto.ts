import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsMongoId,
  IsNumber,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { Types } from 'mongoose';

export class TeacherDto {
  @IsString()
  name: string;

  @IsString()
  @Length(11, 11)
  cpf: string;

  @IsEmail()
  email: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  hourPrice: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  modalities: Types.ObjectId[];
}
