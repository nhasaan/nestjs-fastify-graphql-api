import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { SocialFeedService } from './social-feed.service';
import { Post } from './models/post.model';
import { PostConnection } from './models/post-connection.model';
import { CreatePostInput } from './inputs/create-post.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/models/user.model';

@Resolver(() => Post)
export class SocialFeedResolver {
  constructor(private readonly socialFeedService: SocialFeedService) {}

  @Mutation(() => Post)
  @UseGuards(JwtAuthGuard)
  async createPost(
    @Args('createPostInput') createPostInput: CreatePostInput,
    @CurrentUser() user: any,
  ) {
    return this.socialFeedService.create(createPostInput, user.id);
  }

  @Query(() => PostConnection, { name: 'feed' })
  async getFeed(
    @Args('first', { type: () => Int, defaultValue: 10 }) first: number,
    @Args('after', { type: () => String, nullable: true }) after?: string,
  ) {
    return this.socialFeedService.getFeed(first, after);
  }

  @Query(() => Post, { name: 'post' })
  async findOne(@Args('id', { type: () => String }) id: string) {
    return this.socialFeedService.findById(id);
  }

  @Mutation(() => Post)
  @UseGuards(JwtAuthGuard)
  async likePost(
    @Args('postId', { type: () => String }) postId: string,
    @CurrentUser() user: any,
  ) {
    return this.socialFeedService.likePost(postId, user.id);
  }

  @Mutation(() => Post)
  @UseGuards(JwtAuthGuard)
  async unlikePost(
    @Args('postId', { type: () => String }) postId: string,
    @CurrentUser() user: any,
  ) {
    return this.socialFeedService.unlikePost(postId, user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deletePost(
    @Args('postId', { type: () => String }) postId: string,
    @CurrentUser() user: any,
  ) {
    return this.socialFeedService.deletePost(postId, user.id);
  }

  // Resolver for the author field of Post to prevent N+1 queries using DataLoader
  @ResolveField('author', () => User)
  async getAuthor(@Parent() post: Post & { author: string }) {
    return this.socialFeedService.getAuthorByPostId(post.id);
  }
}
