import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Schema({ timestamps: true })
export class Admin extends Document {
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
    select: false,
    minlength: [6, 'Password must be at least 6 characters long'],
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

AdminSchema.pre<Admin>('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});
