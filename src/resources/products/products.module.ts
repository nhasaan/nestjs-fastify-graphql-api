import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { ProductsResolver } from './products.resolver';
import { Product, ProductSchema } from './entities/product.entity';
import { LoggerService } from '../../shared/services/logger.service';
import { CircuitBreakerService } from '../../core/resilience/circuit-breaker/circuit-breaker.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    ConfigModule,
  ],
  providers: [
    ProductsResolver,
    ProductsService,
    LoggerService,
    CircuitBreakerService,
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
