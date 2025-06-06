import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { DatabaseService } from 'src/database/database.service';
import { Container, SqlQuerySpec } from '@azure/cosmos';
import { Blog, TComments } from './entities/blog.entity';

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
    const { resource } = await this.blogsContainer.item(id, id).read<Blog>();
    const blog = resource as Blog;
    if (!blog) {
      throw new NotFoundException(`Blog not found with id: ${id}`);
    }

    const newComment: TComments = {
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
      .replace<Blog>(blog);
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

    const blogsToDelete = resources.filter((blog) => blog.id);
    if (blogsToDelete.length === 0) {
      return { message: 'No blogs found to delete' };
    }
    const blogResource = blogsToDelete.map((blog) => ({
      id: blog.id,
      partitionKey: blog.id,
    }));
    console.log(blogResource);

    // Use Promise.allSettled to handle multiple deletions    
    // Handle each deletion individually to prevent complete failure
    const results = await Promise.allSettled(
      blogResource.map(async (blog) => {
        try {
          await this.blogsContainer.item(blog.id, blog.partitionKey).delete();
          return { id: blog.id, success: true };
        } catch (error) {
          console.error(`Failed to delete blog ${blog.id}:`, error.message);
          return { id: blog.id, success: false, error: error.message };
        }
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    return {
      message: `${successCount} of ${resources.length} blogs deleted successfully`,
      details: results.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: r.reason })
    };
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

  // // get one comment in a blog
  async getCommentById(blogId: string, commentId: string) {
    const querySpec: SqlQuerySpec = {
      query: `
      SELECT
        b.id AS blogId,
        c AS comment
      FROM 
        blogs b 
      JOIN 
        c IN b.comments 
      WHERE 
        b.id = @blogId  AND c.id = @commentId`,
      parameters: [
        { name: '@blogId', value: blogId },
        { name: '@commentId', value: commentId }
      ],
    };
    const { resources } = await this.blogsContainer.items
      .query(querySpec)
      .fetchAll();
    return resources;
  }

  //Search Comments Across All Blogs [USE FULL-TEXT SEARCH INSTEAD]
  // async searchAllComments(keyword: string) {
  //   const querySpec: SqlQuerySpec = {
  //     query: `
  //     SELECT 
  //       b.id AS blogId,
  //       b.title AS blogTitle,
  //       c.id AS commentId,
  //       c.authorName,
  //       c.content,
  //       c.createdAt
  //     FROM blogs b
  //     JOIN c IN b.comments
  //     WHERE CONTAINS(c.content, @keyword, true)
  //     ORDER BY c.createdAt DESC
  //     `,
  //     parameters: [
  //       { name: '@keyword', value: keyword }
  //     ]
  //   };
  //   const { resources } = await this.blogsContainer.items.query(querySpec).fetchAll();
  //   return resources;
  // }


  // get all blogs with comments
  async getAllBlogsWithComments() {
    const querySpec: SqlQuerySpec = {
      query: `
      SELECT 
        b.id AS blogId,
        b.title AS blogTitle,
        b.content AS blogContent,
        b.authorId AS blogAuthorId,
        b.isPublished AS blogIsPublished,
        b.publishedAt AS blogPublishedAt,
        b.createdAt AS blogCreatedAt,
        b.updatedAt AS blogUpdatedAt,
        b.tags AS blogTags,
        b.comments 
      FROM 
        blogs b 
      WHERE
        IS_DEFINED(b.comments) AND ARRAY_LENGTH(b.comments) > 0
      `,
    };
    const { resources } = await this.blogsContainer.items
      .query(querySpec)
      .fetchAll();
    return resources;
  }

  //Find Blogs with Recent Comments
  async getBlogsWithRecentComments(daysAgo: number = 7) {
    // 1. Uses the ARRAY() constructor with a subquery to collect only the recent comments
    // 2. Returns a single row per blog with all matching comments in a recentComments array
    // 3. Uses ARRAY_LENGTH() to filter out blogs with no recent comments
    // 4. Properly names the returned field as recentComments (plural) to indicate it's an array

    const cutOffDate = new Date();
    cutOffDate.setDate(cutOffDate.getDate() - daysAgo || 7);
    const cutoffDateString = cutOffDate.toISOString();

    const querySpec: SqlQuerySpec = {
      query: `
     SELECT 
      b.id AS blogId,
      b.title,
      b.content,
      ARRAY(
        SELECT c
        FROM c IN b.comments
        WHERE c.createdAt >= @cutoffDate
      ) AS recentComments
      FROM blogs b
      WHERE ARRAY_LENGTH(
      ARRAY(
        SELECT c
        FROM c IN b.comments
        WHERE c.createdAt >= @cutoffDate
      )
    ) > 0
      `,
      parameters: [
        { name: '@cutoffDate', value: cutoffDateString }
      ]
    };
    const { resources } = await this.blogsContainer.items.query(querySpec).fetchAll();
    return resources;
  }

  //Find Most Active Blog Posts (By Comment Count)
  async getMostActiveBlogs(limit: number = 5) {
    const querySpec: SqlQuerySpec = {
      query: `
      SELECT 
        b.id,
        b.title,
      ARRAY_LENGTH(b.comments) AS commentCount
      FROM blogs b
      WHERE IS_DEFINED(b.comments) AND ARRAY_LENGTH(b.comments) > 0
      OFFSET 0 LIMIT @limit
      `,
      parameters: [
        { name: '@limit', value: limit }
      ]
    };
    const { resources } = await this.blogsContainer.items.query(querySpec).fetchAll();
    return resources;
  }

  // // Get Comment Activity Timeline
  // async getCommentTimeline(days: number = 30) {
  //   const querySpec: SqlQuerySpec = {
  //     query: `
  //     SELECT 
  //       DATE_TRUNC('day', c.createdAt) AS commentDate,
  //       COUNT(1) AS commentCount
  //     FROM blogs b
  //     JOIN c IN b.comments
  //     WHERE c.createdAt >= GetCurrentDateTime() - ${days * 24 * 60 * 60}
  //     GROUP BY DATE_TRUNC('day', c.createdAt)
  //     ORDER BY commentDate
  //     `
  //   };
  //   const { resources } = await this.blogsContainer.items.query(querySpec).fetchAll();
  //   return resources;
  // }

  //Find Most Active Commenters
  async getMostActiveAuthorComments(limit: number = 10) {
    const querySpec: SqlQuerySpec = {
      query: `
      SELECT 
        c.authorName,
        COUNT(1) AS commentCount
      FROM blogs b
      JOIN c IN b.comments
      GROUP BY c.authorName
      OFFSET 0 LIMIT @limit
      `,
      parameters: [
        { name: '@limit', value: limit }
      ]
    };
    const { resources } = await this.blogsContainer.items.query(querySpec).fetchAll();
    return resources;
  }


}

