import { Prop } from '@nestjs/mongoose';

export class Responsible {
  @Prop({ required: [true, 'A responsible must have a name'] })
  name: string;

  @Prop({ required: [true, 'A responsible must have a date birth'] })
  dateBirth: Date;

  @Prop({
    required: [true, 'A responsible must have a cpf'],
    unique: true,
    length: 11,
  })
  cpf: string;

  @Prop({
    required: [true, 'A responsible must have a email'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address'],
  })
  email: string;
}
