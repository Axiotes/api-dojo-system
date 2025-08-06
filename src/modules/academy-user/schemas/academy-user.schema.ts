import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class AcademyUser {
  @Prop({ required: [true, 'A academy user must have a name'], type: String })
  name: string;

  @Prop({
    required: [true, 'A academy user must have a email'],
    type: String,
    unique: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address'],
  })
  email: string;

  @Prop({
    required: [true, 'A academy user must have a password'],
    type: String,
  })
  password: string;

  @Prop({ required: true, type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ required: false, type: Date })
  updatedAt: Date;

  @Prop({
    required: [true, 'A academy user must have a status'],
    type: Boolean,
    default: true,
  })
  status: boolean;
}

export const AcademyUserSchema = SchemaFactory.createForClass(AcademyUser);
