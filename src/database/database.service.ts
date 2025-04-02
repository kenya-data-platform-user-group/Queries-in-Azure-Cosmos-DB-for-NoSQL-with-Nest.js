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
  public userContainer: Container;
  public memoriesContainer: Container;

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

    const { container: userContainer } = await this.database.containers.createIfNotExists({
      id: 'users',
      partitionKey: {
        paths: ['/id'],
        version: PartitionKeyDefinitionVersion.V2,
        kind: PartitionKeyKind.Hash,
      },
    });
    const { container: memoriesContainer } = await this.database.containers.createIfNotExists({
      id: 'memories',
      partitionKey: {
        paths: ['/id'],
        version: PartitionKeyDefinitionVersion.V2,
        kind: PartitionKeyKind.Hash,
      },
    });

    this.userContainer = userContainer;
    this.memoriesContainer = memoriesContainer;
    console.log(`userContainer with id : ${userContainer.id} created`);
    console.log(`memoriesContainer with id : ${memoriesContainer.id} created`);
  }
}
