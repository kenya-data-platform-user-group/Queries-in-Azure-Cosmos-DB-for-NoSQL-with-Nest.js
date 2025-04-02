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

  async createManyBlogs(blogDataItems: CreateBlogDto[]): Promise<Blog[]> {
    // Process in smaller batches to prevent timeout
    const batchSize = 20;
    const allBlogs: Blog[] = [];

    // Process in batches
    for (let i = 0; i < blogDataItems.length; i += batchSize) {
      const batch = blogDataItems.slice(i, i + batchSize);
      const batchBlogs = await Promise.all(
        batch.map(async (blogData) => {
          const newBlog: Blog = {
            ...blogData,
            id: crypto.randomUUID(),
            isPublished: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const { resource } = await this.blogsContainer.items.create(newBlog);
          return resource as unknown as Blog;
        })
      );

      allBlogs.push(...batchBlogs);
    }

    return allBlogs;
  }

  async createBlog(createBlogDto: CreateBlogDto) {
    const newBlog: Blog = {
      ...createBlogDto,
      id: crypto.randomUUID(),
      isPublished: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const { resource } = await this.blogsContainer.items.create(newBlog);
    return resource;
  }

  async findAllBlogs() {
    const querySpec = {
      query: 'SELECT * FROM c',
    };
    const { resources } = await this.blogsContainer.items
      .query(querySpec)
      .fetchAll();
    return resources;
  }

  async findOneBlog(id: string): Promise<Blog> {
    const { resource } = await this.blogsContainer.item(id, id).read();
    if (!resource) {
      throw new NotFoundException(`Blog with id: ${id} not found`);
    }
    return resource as unknown as Blog;
  }

  async updateBlog(id: string, updateBlogDto: UpdateBlogDto): Promise<Blog> {
    const { resource } = await this.blogsContainer.item(id, id).replace({
      id,
      updatedAt: new Date(),
      ...updateBlogDto,
    });

    if (!resource) {
      throw new NotFoundException(`Blog with id: ${id} not found`);
    }

    return resource as unknown as Blog;
  }

  async addComment(
    id: string,
    comment: { authorName: string; content: string },
  ): Promise<Blog> {
    const { resource } = await this.blogsContainer.item(id, id).read();
    const blog = resource as unknown as Blog;
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
    return updatedBlog as unknown as Blog;
  }

  async removeComment(blogId: string, commentId: string) {
    const { resource } = await this.blogsContainer.item(blogId, blogId).read();
    const blog = resource as unknown as Blog;

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

  async updateComment(blogId: string, commentId: string, content: string): Promise<Blog> {
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
    return updatedBlog as unknown as Blog;
  }

  async removeBlogViaId(id: string) {
    await this.blogsContainer.item(id, id).delete();
    return { message: `Blog with id : ${id} deleted successfully` };
  }

  async removeAllBlogs() {
    const querySpec = {
      query: 'SELECT * FROM c',
    };
    const { resources } = await this.blogsContainer.items
      .query(querySpec)
      .fetchAll();
    const deletePromises = resources.map((blog) =>
      this.blogsContainer.item(blog.id, blog.id).delete()
    );
    await Promise.all(deletePromises);
    return { message: 'All blogs deleted successfully' };
  }

  async createMockBlogs() {
    const blogs: CreateBlogDto[] = [
      {
        title: "Understanding Azure Cosmos DB - Part 1",
        content: "An introduction to the capabilities and features of Azure Cosmos DB...",
        authorId: crypto.randomUUID(),
        isPublished: true,
        tags: ["Azure", "CosmosDB", "NoSQL"]
      },
      {
        title: "Understanding Azure Cosmos DB - Part 2",
        content: "Diving deeper into partitioning and indexing strategies in Cosmos DB...",
        authorId: crypto.randomUUID(),
        isPublished: true,
        tags: ["Azure", "CosmosDB", "Database"]
      },
      {
        title: "Scaling Your Application with Cosmos DB",
        content: "Learn how to scale your applications using Azure Cosmos DB's global distribution...",
        authorId: crypto.randomUUID(),
        isPublished: false,
        tags: ["Scaling", "Cloud", "Azure"]
      },
      {
        title: "Denormalization in NoSQL Databases",
        content: "A guide to denormalization techniques including embedding related data in documents...",
        authorId: crypto.randomUUID(),
        isPublished: true,
        tags: ["NoSQL", "Denormalization", "Database Design"]
      },
      {
        title: "Cosmos DB vs. Traditional SQL Databases",
        content: "Comparing the performance and scalability of Azure Cosmos DB with SQL databases...",
        authorId: crypto.randomUUID(),
        isPublished: true,
        tags: ["Comparison", "SQL", "NoSQL"]
      },
      {
        title: "Optimizing Query Performance in Cosmos DB",
        content: "Tips and tricks for enhancing query performance in Azure Cosmos DB using proper indexing...",
        authorId: crypto.randomUUID(),
        isPublished: false,
        tags: ["Performance", "Query", "Indexing"]
      },
      {
        title: "Implementing Aggregates in Cosmos DB",
        content: "How to perform aggregate functions like COUNT, SUM, AVG, MAX, and MIN in Cosmos DB...",
        authorId: crypto.randomUUID(),
        isPublished: true,
        tags: ["Aggregates", "CosmosDB", "NoSQL"]
      },
      {
        title: "Building a Scalable Blog with Cosmos DB",
        content: "A practical example of designing a scalable blog application using Azure Cosmos DB...",
        authorId: crypto.randomUUID(),
        isPublished: true,
        tags: ["Blog", "Scalability", "Azure"]
      },
      {
        title: "Cosmos DB Data Modeling Best Practices",
        content: "Explore best practices for data modeling in Azure Cosmos DB to ensure optimal performance...",
        authorId: crypto.randomUUID(),
        isPublished: false,
        tags: ["Data Modeling", "Best Practices", "CosmosDB"]
      },
      {
        title: "Leveraging Multi-Model Capabilities in Cosmos DB",
        content: "Understanding how to use multiple data models in Azure Cosmos DB for versatile applications...",
        authorId: crypto.randomUUID(),
        isPublished: true,
        tags: ["Multi-Model", "NoSQL", "Azure"]
      },
      {
        title: "Migrating from SQL to Cosmos DB",
        content: "Step-by-step guide on how to migrate your SQL database to Azure Cosmos DB...",
        authorId: crypto.randomUUID(),
        isPublished: false,
        tags: ["Migration", "SQL", "CosmosDB"]
      },
      {
        title: "Cosmos DB Security Fundamentals",
        content: "An overview of security features in Azure Cosmos DB to protect your data...",
        authorId: crypto.randomUUID(),
        isPublished: true,
        tags: ["Security", "Data Protection", "Azure"]
      },
      {
        title: "Serverless with Cosmos DB",
        content: "Learn how to integrate Azure Functions with Cosmos DB for a serverless architecture...",
        authorId: crypto.randomUUID(),
        isPublished: true,
        tags: ["Serverless", "Azure Functions", "CosmosDB"]
      },
      {
        title: "Understanding Cosmos DB Consistency Models",
        content: "An in-depth look at the consistency models offered by Azure Cosmos DB and when to use them...",
        authorId: crypto.randomUUID(),
        isPublished: false,
        tags: ["Consistency", "Database", "CosmosDB"]
      },
      {
        title: "Real-time Analytics with Cosmos DB",
        content: "How to implement real-time analytics and reporting with Azure Cosmos DB...",
        authorId: crypto.randomUUID(),
        isPublished: true,
        tags: ["Analytics", "Real-time", "NoSQL"]
      },
      {
        title: "Using Cosmos DB with Node.js",
        content: "A tutorial on how to integrate Azure Cosmos DB into your Node.js applications...",
        authorId: crypto.randomUUID(),
        isPublished: true,
        tags: ["Node.js", "Tutorial", "CosmosDB"]
      },
      {
        title: "Performance Tuning in Cosmos DB",
        content: "Techniques and strategies to optimize the performance of your Cosmos DB instance...",
        authorId: crypto.randomUUID(),
        isPublished: false,
        tags: ["Performance", "Tuning", "Azure"]
      },
      {
        title: "Cosmos DB and IoT: A Match Made in Cloud",
        content: "Explore how Azure Cosmos DB can be used effectively in IoT scenarios...",
        authorId: crypto.randomUUID(),
        isPublished: true,
        tags: ["IoT", "Cloud", "CosmosDB"]
      },
      {
        title: "Cost Management in Cosmos DB",
        content: "Understanding pricing, cost optimization, and scaling strategies in Azure Cosmos DB...",
        authorId: crypto.randomUUID(),
        isPublished: false,
        tags: ["Cost", "Management", "Azure"]
      },
      {
        title: "Advanced Query Techniques in Cosmos DB",
        content: "Learn about advanced querying capabilities, including subqueries and joins within a single container...",
        authorId: crypto.randomUUID(),
        isPublished: true,
        tags: ["Advanced Query", "Subqueries", "CosmosDB"]
      }
    ];

    console.log("first");

    const res = this.createManyBlogs(blogs);
    if (!res) {
      throw new NotFoundException('Blogs not found');
    }
    return res as unknown as Blog[];
  }
}

