import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Query, Types } from 'mongoose';

import { Modalities } from '@ds-modules/modalities/schemas/modalities.schema';
import { Period } from '@ds-enums/period.enum';

@Schema({ timestamps: true })
export class Plans {
  @Prop({
    type: String,
    required: [true, 'A plan must have a period'],
    enum: Period,
  })
  period: Period;

  @Prop({ required: [true, 'A plan must have a period'], type: Number })
  periodQuantity: number;

  @Prop({ required: [true, 'A plan must have a value'], type: Number })
  value: number;

  @Prop({
    type: Types.ObjectId,
    ref: Modalities.name,
    required: [true, 'A plan must have a modality'],
  })
  modality: Types.ObjectId;

  @Prop({
    required: [true, 'A plan must have a status'],
    type: Boolean,
    default: true,
  })
  status: boolean;
}

export const PlansSchema = SchemaFactory.createForClass(Plans);

PlansSchema.pre<Query<Plans[], Plans>>(/^find/, function (next) {
  this.populate({
    path: 'modality',
    select: '-createdAt -updatedAt -image',
  });

  next();
});
