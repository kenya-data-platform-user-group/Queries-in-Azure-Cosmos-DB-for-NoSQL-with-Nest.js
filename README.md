<p align="left" style="margin: 0px 10px 0px 0px;">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
<img src="image/README/1743345911598.png" width="120" alt="Small Icon" />
</p>

# NestJS with Azure Cosmos DB CRUD Application

A complete REST API example demonstrating CRUD operations using NestJS and Azure Cosmos DB.
[Youtube Video found here](https://www.youtube.com/watch?v=r9I5BXb9mNw)

## Project Overview

This application demonstrates how to:

- Build a RESTful API with NestJS framework
- Connect to Azure Cosmos DB using the official SDK
- Implement CRUD operations with TypeScript
- Handle configuration and environment variables
- Implement proper error handling

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v20 or later)
- [pnpm](https://pnpm.io/) (v9.7 or later) or npm v10 or later
- An active Azure subscription with a Cosmos DB account

## Environment Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd Nest-CosmosDB-CRUD
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
- `memories` - Stores memory entries

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

### Memories Resource

| Method | Endpoint      | Description                    |
| ------ | ------------- | ------------------------------ |
| GET    | /memories     | Get all memories               |
| GET    | /memories/:id | Get a specific memory by ID    |
| POST   | /memories     | Create a new memory            |
| PATCH  | /memories/:id | Update a specific memory by ID |
| DELETE | /memories/:id | Delete a specific memory by ID |

## Project Structure

```bash
src
├── app.module.ts             # Main application module
├── main.ts                   # Application entry point
├── http-exception.filter.ts  # Global exception filter
├── database/                 # Database connection module
│   └── database.service.ts   # Azure Cosmos DB service
├── memories/                 # Memories module
│   ├── dto/                  # Data Transfer Objects
│   ├── memories.controller.ts # REST API controller
│   └── memories.service.ts   # Business logic
└──
```

## Development Tools

This project includes several development tools:

* **ESLint** : Linting with TypeScript support

```
pnpm run
```

* **Prettier** : Code formatting

```
pnpm run format
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
