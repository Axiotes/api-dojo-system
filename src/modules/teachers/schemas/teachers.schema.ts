import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Query, Types } from 'mongoose';

import { Modalities } from '@ds-modules/modalities/schemas/modalities.schema';

@Schema({ timestamps: true })
export class Teachers {
  @Prop({ required: [true, 'A teacher must have a name'], type: String })
  name: string;

  @Prop({
    required: [true, 'A teacher must have a cpf'],
    type: String,
    unique: true,
    length: 11,
  })
  cpf: string;

  @Prop({
    required: [true, 'A teacher must have a email'],
    type: String,
    unique: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address'],
  })
  email: string;

  @Prop({ required: [true, 'A teacher must have a description'], type: String })
  description: string;

  @Prop({ required: [true, 'A teacher must have a image'], type: Buffer })
  image: Buffer;

  @Prop({ required: [true, 'A teacher must have a hour price'], type: Number })
  hourPrice: number;

  @Prop({
    type: [{ type: Types.ObjectId, ref: Modalities.name }],
    validate: [
      (modalities: Types.ObjectId[]): boolean => modalities.length > 0,
    ],
  })
  modalities: Types.ObjectId[];

  @Prop({
    required: [true, 'A teacher must have a status'],
    type: Boolean,
    default: true,
  })
  status: boolean;
}

export const TeachersSchema = SchemaFactory.createForClass(Teachers);

TeachersSchema.pre<Query<Teachers[], Teachers>>(/^find/, function (next) {
  this.populate({
    path: 'modalities',
    select: '-createdAt -updatedAt -image',
  });

  next();
});
