import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Admin {
  @Prop({ required: [true, 'An admin must have a name'], type: String })
  name: string;

  @Prop({
    required: [true, 'An admin must have a email'],
    type: String,
    unique: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address'],
  })
  email: string;

  @Prop({
    required: [true, 'An admin must have a password'],
    type: String,
  })
  password: string;

  @Prop({
    required: [true, 'An admin must have a status'],
    type: Boolean,
    default: true,
  })
  status: boolean;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
