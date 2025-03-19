import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from './entities/post.entity';
import { CreatePostInput } from './inputs/create-post.input';
import { LoggerService } from '../../shared/services/logger.service';
import { CircuitBreakerService } from '../../core/resilience/circuit-breaker/circuit-breaker.service';
import { UsersService } from '@resources/users/users.service';
import {
  PostConnection,
  PostEdge,
  PageInfo,
} from './models/post-connection.model';
import { User } from '../users/entities/user.entity';
import DataLoader from 'dataloader';

@Injectable()
export class SocialFeedService {
  private userLoader: DataLoader<string, User>;

  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    private readonly logger: LoggerService,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly usersService: UsersService,
  ) {
    this.logger.setContext('SocialFeedService');

    // Initialize DataLoader for users
    this.userLoader = new DataLoader<string, User>(
      async (userIds: string[]) => {
        this.logger.log(`Loading ${userIds.length} users with DataLoader`);
        const users = await Promise.all(
          userIds.map((id) => this.usersService.findById(id)),
        );
        return userIds.map((id) =>
          users.find((user) => user.id.toString() === id.toString()),
        );
      },
    );
  }

  async create(
    createPostInput: CreatePostInput,
    authorId: string,
  ): Promise<Post> {
    this.logger.log(`Creating post by user: ${authorId}`);
    const post = new this.postModel({
      ...createPostInput,
      author: new Types.ObjectId(authorId),
    });
    return await this.circuitBreaker.executeWithCircuitBreaker(() =>
      post.save(),
    );
  }

  async findById(id: string): Promise<Post> {
    this.logger.log(`Finding post by id: ${id}`);
    const post = await this.circuitBreaker.executeWithCircuitBreaker(() =>
      this.postModel.findById(id).exec(),
    );

    if (!post || post.isDeleted) {
      this.logger.warn(`Post with id ${id} not found or deleted`);
      throw new NotFoundException(`Post not found`);
    }

    return post;
  }

  // Implementation of cursor-based pagination for feed
  async getFeed(first: number = 10, after?: string): Promise<PostConnection> {
    this.logger.log(
      `Getting feed with first: ${first}, after: ${after || 'null'}`,
    );

    // Create base query
    const query: any = { isDeleted: false };

    // Apply cursor if provided
    if (after) {
      const decodedCursor = Buffer.from(after, 'base64').toString('ascii');
      const timestamp = new Date(decodedCursor);

      query.createdAt = { $lt: timestamp };
    }

    // Fetch posts with limit + 1 to determine if there are more results
    const posts = await this.circuitBreaker.executeWithCircuitBreaker(() =>
      this.postModel
        .find(query)
        .sort({ createdAt: -1 })
        .limit(first + 1)
        .exec(),
    );

    // Check if there are more results
    const hasNextPage = posts.length > first;
    const edges = posts.slice(0, first).map((post) => ({
      node: post,
      cursor: Buffer.from(post.createdAt.toISOString()).toString('base64'),
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      },
    };
  }

  async likePost(postId: string, userId: string): Promise<Post> {
    this.logger.log(`User ${userId} liking post ${postId}`);

    const post = await this.circuitBreaker.executeWithCircuitBreaker(() =>
      this.postModel
        .findOneAndUpdate(
          {
            _id: postId,
            likes: { $ne: new Types.ObjectId(userId) },
          },
          {
            $addToSet: { likes: new Types.ObjectId(userId) },
          },
          { new: true },
        )
        .exec(),
    );

    if (!post) {
      this.logger.warn(
        `Post with id ${postId} not found or already liked by user ${userId}`,
      );
      throw new NotFoundException(`Post not found or already liked`);
    }

    return post;
  }

  async unlikePost(postId: string, userId: string): Promise<Post> {
    this.logger.log(`User ${userId} unliking post ${postId}`);

    const post = await this.circuitBreaker.executeWithCircuitBreaker(() =>
      this.postModel
        .findOneAndUpdate(
          {
            _id: postId,
            likes: new Types.ObjectId(userId),
          },
          {
            $pull: { likes: new Types.ObjectId(userId) },
          },
          { new: true },
        )
        .exec(),
    );

    if (!post) {
      this.logger.warn(
        `Post with id ${postId} not found or not liked by user ${userId}`,
      );
      throw new NotFoundException(`Post not found or not liked`);
    }

    return post;
  }

  async deletePost(postId: string, userId: string): Promise<boolean> {
    this.logger.log(`User ${userId} deleting post ${postId}`);

    // Find post to check ownership
    const post = await this.findById(postId);

    // Check if user is author or admin
    const isAuthor = post.author.toString() === userId;

    if (!isAuthor) {
      this.logger.warn(
        `User ${userId} attempted to delete post ${postId} without permission`,
      );
      throw new Error('You are not authorized to delete this post');
    }

    // Soft delete
    await this.circuitBreaker.executeWithCircuitBreaker(() =>
      this.postModel
        .findByIdAndUpdate(postId, { isDeleted: true }, { new: true })
        .exec(),
    );

    return true;
  }

  // Method for loading author of a post using DataLoader to prevent N+1 queries
  async getAuthorByPostId(postId: string): Promise<User> {
    const post = await this.findById(postId);
    return this.userLoader.load(post.author.toString());
  }
}
