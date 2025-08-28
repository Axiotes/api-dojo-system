import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { Modalities } from '@ds-modules/modalities/schemas/modalities.schema';
import { Teachers } from '@ds-modules/teachers/schemas/teachers.schema';
import { Age } from '@ds-types/age.type';
import { Hour } from '@ds-types/hour.type';
import { Athletes } from '@ds-modules/athletes/schemas/athletes.schema';
import { WeekDays } from '@ds-enums/week-days.enum';

@Schema({ timestamps: true })
export class Classes {
  @Prop({
    type: Types.ObjectId,
    ref: Modalities.name,
    required: [true, 'A class must have a modality'],
  })
  modality: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Teachers.name,
    required: [true, 'A class must have a teacher'],
  })
  teacher: Types.ObjectId;

  @Prop({ type: Object, required: [true, 'A class must have a hour'] })
  hour: Hour;

  @Prop({ type: Object, required: [true, 'A class must have a age'] })
  age: Age;

  @Prop({
    type: Number,
    required: [true, 'A class must have a maximum number of athletes'],
  })
  maxAthletes: number;

  @Prop({
    type: [String],
    required: [true, 'A class must have a week day'],
    enum: Object.values(WeekDays),
    validate: [
      (weekDay: string[]): boolean => weekDay.length > 0,
      'At least one week day must be provided',
    ],
  })
  weekDays: WeekDays[];

  @Prop({
    type: Buffer,
    required: [true, 'A class must have a image'],
  })
  image: Buffer;

  @Prop({
    type: [{ type: Types.ObjectId, ref: Athletes.name }],
  })
  athletes: Types.ObjectId[];

  @Prop({
    required: [true, 'A class must have a status'],
    type: Boolean,
    default: true,
  })
  status: boolean;
}

export const ClassesSchema = SchemaFactory.createForClass(Classes);
