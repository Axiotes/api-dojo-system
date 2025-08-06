import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Modalities {
  @Prop({ required: [true, 'A modalitie must have a name'], type: String })
  name: string;

  @Prop({ required: [true, 'A modalitie must have a name'], type: String })
  description: string;

  @Prop({ required: [true, 'A modalitie must have a image'], type: String })
  image: string;

  @Prop({
    required: [true, 'A modalitie must have a status'],
    type: Boolean,
    default: true,
  })
  status: boolean;
}

export const ModalitiesSchema = SchemaFactory.createForClass(Modalities);
