import { Injectable, OnModuleInit } from '@nestjs/common';
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
    }
    const { resource } = await this.blogsContainer.items.create(newBlog);
    return resource;
  }

  async findAll() {
    const querySpec = {
      query: 'SELECT * FROM c'
    };
    const { resources } = await this.blogsContainer.items.query(querySpec).fetchAll();
    return resources;
  }

  async findOne(id: string) {
    const { resource } = await this.blogsContainer.item(id, id).read();
    return resource;
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    const { resource } = await this.blogsContainer.item(id, id).replace({
      id,
      ...updateBlogDto
    });
    return resource;
  }

  async remove(id: string) {
    await this.blogsContainer.item(id, id).delete();
    return { id };
  }

}
