<p align="left" style="margin: 0px 10px 0px 0px;">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
<img src="image/README/1743345911598.png" width="120" alt="Small Icon" />
</p>

# Queries in Azure Cosmos DB for NoSQL with NestJS

A complete REST API example demonstrating CRUD operations and advanced query capabilities using NestJS and Azure Cosmos DB for NoSQL.
[Youtube Video found here](https://youtube.com/your-workshop-video)

## Project Overview

This application demonstrates how to:

- Build a RESTful API with NestJS framework
- Connect to Azure Cosmos DB using the official SDK
- Implement CRUD operations with TypeScript
- Perform advanced queries with pagination, filtering, and sorting
- Optimize queries for performance and cost efficiency
- Handle configuration and environment variables
- Implement proper error handling and middleware

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v20 or later)
- [pnpm](https://pnpm.io/) (v9.7 or later) or npm v10 or later
- An active Azure subscription with a Cosmos DB account
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli) (optional, for resource management)
- [Postman](https://www.postman.com/downloads/) or similar tool for testing API endpoints

## Environment Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/kenya-data-platform-user-group/Queries-in-Azure-Cosmos-DB-for-NoSQL-with-Nest.js
   cd Nest-CosmosDB-Query
   ```
2. Install dependencies:

   ```bash
   pnpm install
   ```

   or

   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:

   ```
   PORT=3000
   NODE_ENV=development
   AZURE_COSMOS_DB_ENDPOINT=<your-cosmosdb-endpoint>
   AZURE_COSMOS_DB_KEY=<your-cosmosdb-key>
   COSMOSDB_DATABASE_NAME=<your-database-name>
   ```

## Project Dependencies

The project uses the following main dependencies:

```bash
pnpm add @nestjs/config @azure/cosmos uuid class-transformer class-validator @nestjs/mapped-types
```

## Database Structure

The application creates two containers in your Cosmos DB:

- `users` - Stores user information
- `blogs` - Stores blog entries with nested comments

Both containers are created automatically when the application starts for the first time.

## Running the Application

```bash
# development mode
pnpm run start

# watch mode (recommended for development)
pnpm run start:dev

# production mode
pnpm run start:prod
```

## API Endpoints

### Blogs Resource

| Method | Endpoint                           | Description                             |
| ------ | ---------------------------------- | --------------------------------------- |
| GET    | /blogs                             | Get all blogs                           |
| GET    | /blogs/:id                         | Get a specific blog by ID               |
| POST   | /blogs                             | Create a new blog                       |
| PATCH  | /blogs/:id                         | Update a specific blog by ID            |
| DELETE | /blogs/:id                         | Delete a specific blog by ID            |
| GET    | /blogs/with-comments               | Get all blogs with comments             |
| POST   | /blogs/many                        | Create multiple blogs at once           |
| GET    | /blogs/mock                        | Create mock blogs for testing           |
| DELETE | /blogs/all-blogs                   | Remove all blogs                        |
| GET    | /blogs/recent-comments             | Find blogs with recent comments         |
| GET    | /blogs/most-active-author-comments | Find most active comment authors        |
| GET    | /blogs/most-active                 | Find most active blogs by comment count |
| POST   | /blogs/:id/comments                | Add a comment to a blog                 |
| PATCH  | /blogs/:blogId/comments/:commentId | Update a comment in a blog              |
| DELETE | /blogs/:blogId/comments/:commentId | Delete a comment from a blog            |
| GET    | /blogs/:blogId/comments/:commentId | Get a specific comment from a blog      |

## Project Structure

```bash
src
├── app.module.ts             # Main application module
├── main.ts                   # Application entry point
├── http-exception.filter.ts  # Global exception filter
├── database/                 # Database connection module
│   ├── database.service.ts   # Azure Cosmos DB service
│   └── indexing-policies/    # Custom indexing policies
├── blogs/                    # Blogs module
│   ├── dto/                  # Data Transfer Objects
│   ├── entities/             # Entity definitions
│   ├── blogs.controller.ts   # REST API controller
│   └── blogs.service.ts      # Business logic with query implementations
└──
```

## Development Tools

This project includes several development tools:

* **ESLint** : Linting with TypeScript support
