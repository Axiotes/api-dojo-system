import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Modalities {
  @Prop({ required: [true, 'A modalitie must have a name'], type: String })
  name: string;

  @Prop({ required: [true, 'A modalitie must have a name'], type: String })
  description: string;

  @Prop({ required: [true, 'A modalitie must have a image'], type: String })
  image: string;

  @Prop({ required: true, type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ required: false, type: Date })
  updatedAt: Date;

  @Prop({
    required: [true, 'A modalitie must have a status'],
    type: Boolean,
    default: true,
  })
  status: boolean;
}

export const ModalitiesSchema = SchemaFactory.createForClass(Modalities);
