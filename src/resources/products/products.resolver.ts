import { Resolver, Query, Mutation, Args, Float } from '@nestjs/graphql';
import { ProductsService } from './products.service';
import { Product } from './models/product.model';
import { CreateProductInput } from './inputs/create-product.input';
import { UpdateProductInput } from './inputs/update-product.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Resolver(() => Product)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Mutation(() => Product)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createProduct(
    @Args('createProductInput') createProductInput: CreateProductInput,
  ) {
    return this.productsService.create(createProductInput);
  }

  @Query(() => [Product], { name: 'products' })
  async findAll() {
    return this.productsService.findAll();
  }

  @Query(() => Product, { name: 'product' })
  async findOne(@Args('id', { type: () => String }) id: string) {
    return this.productsService.findById(id);
  }

  @Query(() => [Product], { name: 'productsByCategory' })
  async findByCategory(
    @Args('category', { type: () => String }) category: string,
  ) {
    return this.productsService.findByCategory(category);
  }

  @Query(() => [Product], { name: 'productsByPriceRange' })
  async findByPriceRange(
    @Args('min', { type: () => Float }) min: number,
    @Args('max', { type: () => Float }) max: number,
  ) {
    return this.productsService.findWithPriceRange(min, max);
  }

  @Mutation(() => Product)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateProduct(
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
  ) {
    return this.productsService.update(
      updateProductInput.id,
      updateProductInput,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async removeProduct(@Args('id', { type: () => String }) id: string) {
    return this.productsService.remove(id);
  }
}
