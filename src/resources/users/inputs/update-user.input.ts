import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

@InputType()
export class UpdateUserInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string;
}
