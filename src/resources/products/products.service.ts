import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './entities/product.entity';
import { CreateProductInput } from './inputs/create-product.input';
import { UpdateProductInput } from './inputs/update-product.input';
import { LoggerService } from '../../shared/services/logger.service';
import { CircuitBreakerService } from '../../core/resilience/circuit-breaker/circuit-breaker.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    private readonly logger: LoggerService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {
    this.logger.setContext('ProductsService');
  }

  async create(createProductInput: CreateProductInput): Promise<Product> {
    this.logger.log(`Creating product: ${createProductInput.name}`);
    const product = new this.productModel(createProductInput);
    return await this.circuitBreaker.executeWithCircuitBreaker(() =>
      product.save(),
    );
  }

  async findAll(): Promise<Product[]> {
    this.logger.log('Finding all products');
    return await this.circuitBreaker.executeWithCircuitBreaker(() =>
      this.productModel.find({ isAvailable: true }).exec(),
    );
  }

  async findById(id: string): Promise<Product> {
    this.logger.log(`Finding product by id: ${id}`);
    const product = await this.circuitBreaker.executeWithCircuitBreaker(() =>
      this.productModel.findById(id).exec(),
    );

    if (!product) {
      this.logger.warn(`Product with id ${id} not found`);
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async update(
    id: string,
    updateProductInput: UpdateProductInput,
  ): Promise<Product> {
    this.logger.log(`Updating product with id: ${id}`);
    const product = await this.circuitBreaker.executeWithCircuitBreaker(() =>
      this.productModel
        .findByIdAndUpdate(id, updateProductInput, { new: true })
        .exec(),
    );

    if (!product) {
      this.logger.warn(`Product with id ${id} not found for update`);
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async remove(id: string): Promise<boolean> {
    this.logger.log(`Removing product with id: ${id}`);
    // Soft delete by updating isAvailable to false
    const result = await this.circuitBreaker.executeWithCircuitBreaker(() =>
      this.productModel
        .findByIdAndUpdate(id, { isAvailable: false }, { new: true })
        .exec(),
    );

    if (!result) {
      this.logger.warn(`Product with id ${id} not found for removal`);
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return true;
  }

  // Method for advanced query demonstration
  async findByCategory(category: string): Promise<Product[]> {
    this.logger.log(`Finding products by category: ${category}`);
    return await this.circuitBreaker.executeWithCircuitBreaker(() =>
      this.productModel
        .find({
          category,
          isAvailable: true,
        })
        .exec(),
    );
  }

  // Method with price filtering for complex query example
  async findWithPriceRange(min: number, max: number): Promise<Product[]> {
    this.logger.log(`Finding products with price between ${min} and ${max}`);
    return await this.circuitBreaker.executeWithCircuitBreaker(() =>
      this.productModel
        .find({
          price: { $gte: min, $lte: max },
          isAvailable: true,
        })
        .exec(),
    );
  }
}
