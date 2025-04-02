import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { DatabaseService } from 'src/database/database.service';
import { Container } from '@azure/cosmos';
import { Blog } from './entities/blog.entity';

@Injectable()
export class BlogsService implements OnModuleInit {
  private blogsContainer: Container;
  constructor(private readonly databaseService: DatabaseService) {
    this.databaseService = databaseService;
  }
  onModuleInit() {
    this.blogsContainer = this.databaseService.blogsContainer;
  }

  async create(createBlogDto: CreateBlogDto) {
    const newBlog: Blog = {
      ...createBlogDto,
      id: crypto.randomUUID(),
      authorId: crypto.randomUUID(),
      isPublished: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const { resource } = await this.blogsContainer.items.create(newBlog);
    return resource;
  }

  async findAll() {
    const querySpec = {
      query: 'SELECT * FROM c',
    };
    const { resources } = await this.blogsContainer.items
      .query(querySpec)
      .fetchAll();
    return resources;
  }

  async findOne(id: string) {
    const { resource } = await this.blogsContainer.item(id, id).read();
    return resource;
  }

  async updateBlog(id: string, updateBlogDto: UpdateBlogDto) {
    const { resource } = await this.blogsContainer.item(id, id).replace({
      id,
      ...updateBlogDto,
    });
    return resource;
  }

  async addComment(
    id: string,
    comment: { authorName: string; content: string },
  ) {
    const { resource } = await this.blogsContainer.item(id, id).read();
    const blog = resource as Blog;
    if (!blog) {
      throw new NotFoundException(`Blog not found with id: ${id}`);
    }

    const newComment = {
      id: crypto.randomUUID(),
      ...comment,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!blog.comments) {
      blog.comments = [];
    }

    blog.comments.push(newComment);
    blog.updatedAt = new Date();
    const { resource: updatedBlog } = await this.blogsContainer
      .item(id, id)
      .replace(blog);
    return updatedBlog;
  }
  async removeComment(blogId: string, commentId: string) {
    const { resource } = await this.blogsContainer.item(blogId, blogId).read();
    const blog = resource as Blog;

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    if (!blog.comments) {
      throw new NotFoundException('No comments found');
    }

    blog.comments = blog.comments.filter((comment) => comment.id !== commentId);
    const { resource: updatedBlog } = await this.blogsContainer
      .item(blogId, blogId)
      .replace(blog);
    return updatedBlog;
  }

  async updateComment(blogId: string, commentId: string, content: string) {
    const { resource } = await this.blogsContainer.item(blogId, blogId).read();
    const blog = resource as Blog;

    if (!blog) {
      throw new NotFoundException(`Blog with id : ${blogId} not found`);
    }

    if (!blog.comments) {
      throw new NotFoundException('No comments found');
    }

    const comment = blog.comments.find((comment) => comment.id === commentId);

    if (!comment) {
      throw new NotFoundException(`Comment with id: ${commentId} not found`);
    }

    comment.content = content;
    comment.updatedAt = new Date();
    blog.updatedAt = new Date();
    const { resource: updatedBlog } = await this.blogsContainer
      .item(blogId, blogId)
      .replace(blog);

    return updatedBlog;
  }

  async remove(id: string) {
    await this.blogsContainer.item(id, id).delete();
    return { message: `Blog with id : ${id} deleted successfully` };
  }
}
