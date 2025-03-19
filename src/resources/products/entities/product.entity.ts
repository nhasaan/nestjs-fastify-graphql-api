import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'products',
})
export class Product extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0, default: 0 })
  inventory: number;

  @Prop()
  category: string;

  @Prop()
  manufacturer: string;

  @Prop({ default: true })
  isAvailable: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
