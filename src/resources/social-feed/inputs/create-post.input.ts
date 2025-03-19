import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreatePostInput {
  @Field()
  @IsNotEmpty({ message: 'Content is required' })
  @IsString({ message: 'Content must be a string' })
  @MaxLength(500, { message: 'Content must be at most 500 characters' })
  content: string;
}
