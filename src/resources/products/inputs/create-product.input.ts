import { Field, Float, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

@InputType()
export class CreateProductInput {
  @Field()
  @IsNotEmpty({ message: 'Product name is required' })
  @IsString({ message: 'Product name must be a string' })
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @Field(() => Float)
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price must be a positive number' })
  price: number;

  @Field(() => Number)
  @IsNumber({}, { message: 'Inventory must be a number' })
  @Min(0, { message: 'Inventory must be a positive number' })
  inventory: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Category must be a string' })
  category?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Manufacturer must be a string' })
  manufacturer?: string;
}
