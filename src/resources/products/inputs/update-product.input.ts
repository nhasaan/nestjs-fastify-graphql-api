import { Field, Float, ID, InputType } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class UpdateProductInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Product name must be a string' })
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price must be a positive number' })
  price?: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'Inventory must be a number' })
  @Min(0, { message: 'Inventory must be a positive number' })
  inventory?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Category must be a string' })
  category?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Manufacturer must be a string' })
  manufacturer?: string;

  @Field({ nullable: true })
  @IsOptional()
  isAvailable?: boolean;
}
