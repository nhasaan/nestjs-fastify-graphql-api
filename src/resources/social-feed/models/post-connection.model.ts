import { Field, ObjectType } from '@nestjs/graphql';
import { Post } from './post.model';

@ObjectType()
export class PostEdge {
  @Field(() => Post)
  node: Post;

  @Field()
  cursor: string;
}

@ObjectType()
export class PageInfo {
  @Field()
  hasNextPage: boolean;

  @Field({ nullable: true })
  endCursor?: string;
}

@ObjectType()
export class PostConnection {
  @Field(() => [PostEdge])
  edges: PostEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
