import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { Modalities } from '@ds-modules/modalities/schemas/modalities.schema';

@Schema({ timestamps: true })
export class Plans {
  @Prop({ required: [true, 'A plan must have a period'], type: String })
  period: string;

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
