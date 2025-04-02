import {
  Container,
  CosmosClient,
  Database,
  CosmosDbDiagnosticLevel,
  PartitionKeyDefinitionVersion,
  PartitionKeyKind,
} from '@azure/cosmos';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly client: CosmosClient;
  private database: Database;
  public blogsContainer: Container;

  constructor(private configSerVice: ConfigService) {
    this.client = new CosmosClient({
      endpoint: configSerVice.getOrThrow<string>('AZURE_COSMOS_DB_ENDPOINT'),
      key: configSerVice.getOrThrow<string>('AZURE_COSMOS_DB_KEY'),
      diagnosticLevel:
        configSerVice.getOrThrow<string>('NODE_ENV') != 'production'
          ? CosmosDbDiagnosticLevel.debug
          : CosmosDbDiagnosticLevel.info,
    });
  }

  async onModuleInit() {
    await this.initDatabase();
    await this.initContainers();
  }

  private async initDatabase() {
    const dbName = this.configSerVice.getOrThrow<string>(
      'AZURE_COSMOS_DB_NAME',
    );
    const { database } = await this.client.databases.createIfNotExists({
      id: dbName,
    });
    this.database = database;
    console.log(`Database with id : ${database.id} created`);
  }

  private async initContainers() {

    const { container: blogsContainer } = await this.database.containers.createIfNotExists({
      id: 'blogs',
      partitionKey: {
        paths: ['/id'],
        version: PartitionKeyDefinitionVersion.V2,
        kind: PartitionKeyKind.Hash,
      },
    });

    this.blogsContainer = blogsContainer;
    console.log(`userContainer with id : ${blogsContainer.id} created`);
  }
}
