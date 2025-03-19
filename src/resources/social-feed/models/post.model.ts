import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

@ObjectType()
export class Post {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field(() => User)
  author: User;

  @Field(() => [String])
  likes: string[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
