import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Responsible } from '@ds-modules/athletes/schemas/responsible.schema';

@Schema({ timestamps: true })
export class Visits {
  @Prop({ required: [true, 'A visit must have a name'], type: String })
  name: string;

  @Prop({
    required: [true, 'A visit must have a cpf'],
    type: String,
    unique: true,
    length: 11,
  })
  cpf: string;

  @Prop({
    required: false,
    type: String,
    unique: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address'],
  })
  email?: string;

  @Prop({ required: [true, 'A visit must have a date birth'], type: Date })
  dateBirth: Date;

  @Prop({ type: [Responsible], required: false })
  responsibles?: Responsible[];

  @Prop({
    required: [true, 'A visit must have number of visits'],
    type: Number,
    max: 3,
  })
  numVisits: number;

  @Prop({
    required: [true, 'A visit must have a status'],
    type: Boolean,
    default: true,
  })
  status: boolean;
}

export const VisitsSchema = SchemaFactory.createForClass(Visits);
