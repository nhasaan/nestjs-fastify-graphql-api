import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { CreateUserInput } from './inputs/create-user.input';
import { UpdateUserInput } from './inputs/update-user.input';
import { LoggerService } from '../../shared/services/logger.service';
import { CircuitBreakerService } from '../../core/resilience/circuit-breaker/circuit-breaker.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly logger: LoggerService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {
    this.logger.setContext('UsersService');
  }

  async create(createUserInput: CreateUserInput): Promise<User> {
    this.logger.log(`Creating user with email: ${createUserInput.email}`);
    const user = new this.userModel(createUserInput);
    return await this.circuitBreaker.executeWithCircuitBreaker(() =>
      user.save(),
    );
  }

  async findAll(): Promise<User[]> {
    this.logger.log('Finding all users');
    return await this.circuitBreaker.executeWithCircuitBreaker(() =>
      this.userModel.find({ isActive: true }).exec(),
    );
  }

  async findById(id: string): Promise<User> {
    this.logger.log(`Finding user by id: ${id}`);
    const user = await this.circuitBreaker.executeWithCircuitBreaker(() =>
      this.userModel.findById(id).exec(),
    );

    if (!user) {
      this.logger.warn(`User with id ${id} not found`);
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    this.logger.log(`Finding user by email: ${email}`);
    const user = await this.circuitBreaker.executeWithCircuitBreaker(() =>
      this.userModel.findOne({ email }).exec(),
    );

    if (!user) {
      this.logger.warn(`User with email ${email} not found`);
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async update(id: string, updateUserInput: UpdateUserInput): Promise<User> {
    this.logger.log(`Updating user with id: ${id}`);
    const user = await this.circuitBreaker.executeWithCircuitBreaker(() =>
      this.userModel
        .findByIdAndUpdate(id, updateUserInput, { new: true })
        .exec(),
    );

    if (!user) {
      this.logger.warn(`User with id ${id} not found for update`);
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async remove(id: string): Promise<boolean> {
    this.logger.log(`Removing user with id: ${id}`);
    // Soft delete by updating isActive to false
    const result = await this.circuitBreaker.executeWithCircuitBreaker(() =>
      this.userModel
        .findByIdAndUpdate(id, { isActive: false }, { new: true })
        .exec(),
    );

    if (!result) {
      this.logger.warn(`User with id ${id} not found for removal`);
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return true;
  }
}
