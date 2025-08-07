import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { Classes } from './classes.schema';

import { Athletes } from '@ds-modules/athletes/schemas/athletes.schema';
import { Visits } from '@ds-modules/visits/schemas/visits.schema';

@Schema()
export class ClassesHistory {
  @Prop({
    type: Types.ObjectId,
    ref: Classes.name,
    required: [true, 'A class history must have a class'],
  })
  class: Types.ObjectId;

  @Prop([
    {
      athlete: {
        type: Types.ObjectId,
        ref: Athletes.name,
        required: [true, 'A class history must have a athlete'],
      },
      present: {
        type: Boolean,
        required: [true, 'A class history must have a presence status'],
      },
    },
  ])
  athletes: {
    athlete: Types.ObjectId;
    present: boolean;
  }[];

  @Prop([
    {
      visit: { type: Types.ObjectId, ref: Visits.name, required: false },
      present: { type: Boolean, required: false },
    },
  ])
  visits: {
    visit: Types.ObjectId;
    present: boolean;
  }[];

  @Prop({ type: Date, required: [true, 'A class history must have a date'] })
  date: Date;
}

export const ClassesHistorySchema =
  SchemaFactory.createForClass(ClassesHistory);
