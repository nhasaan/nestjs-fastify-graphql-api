import { Field, ID, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Product {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float)
  price: number;

  @Field(() => Number)
  inventory: number;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  manufacturer?: string;

  @Field()
  isAvailable: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
