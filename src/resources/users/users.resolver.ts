import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './models/user.model';
import { CreateUserInput } from './inputs/create-user.input';
import { UpdateUserInput } from './inputs/update-user.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '@resources/auth/decorators/current-user.decorator';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  @UseGuards(JwtAuthGuard)
  async findOne(@Args('id', { type: () => String }) id: string) {
    return this.usersService.findById(id);
  }

  @Query(() => User, { name: 'me' })
  @UseGuards(JwtAuthGuard)
  async findMe(@CurrentUser() user: any) {
    return this.usersService.findById(user.id);
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser() currentUser: any,
  ) {
    // Allow users to update only their own info unless admin
    if (currentUser.id !== updateUserInput.id && !currentUser.isAdmin) {
      throw new Error('You can only update your own profile');
    }
    return this.usersService.update(updateUserInput.id, updateUserInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async removeUser(@Args('id', { type: () => String }) id: string) {
    return this.usersService.remove(id);
  }
}
