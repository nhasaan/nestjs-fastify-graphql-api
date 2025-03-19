import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../users/entities/user.entity';

@Schema({
  timestamps: true,
  collection: 'posts',
})
export class Post extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  author: User | mongoose.Types.ObjectId;

  @Prop({ default: [] })
  likes: mongoose.Types.ObjectId[];

  @Prop({ default: false })
  isDeleted: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);
