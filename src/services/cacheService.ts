import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  PutCommand,
  PutCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Country } from "../types/country";
import { CacheItem, CacheData } from "../types/cache";
import { Planet } from "../types/planet";
import { BaseLogger } from "../utils/logger";

export class CacheService {
  private readonly dynamoClient: DynamoDBClient;
  private readonly documentClient: DynamoDBDocumentClient;
  private readonly tableName: string;
  private CACHE_TTL = 1800; // 30 minutes in seconds
  private readonly logger = BaseLogger.logger("cache-service");

  constructor() {
    this.dynamoClient = new DynamoDBClient();
    this.documentClient = DynamoDBDocumentClient.from(this.dynamoClient);
    this.tableName = process.env.CACHE_TABLE_NAME!;
  }

  private async getCache(key: string) {
    const params: GetCommandInput = {
      TableName: this.tableName,
      Key: { cacheKey: key },
    };

    const result = await this.documentClient.send(new GetCommand(params));
    return result.Item as CacheItem | undefined;
  }

  private async setCache(cacheKey: string, data: CacheData) {
    const params: PutCommandInput = {
      TableName: this.tableName,
      Item: {
        cacheKey,
        data,
        ttl: Math.floor(Date.now() / 1000) + this.CACHE_TTL,
      },
    };

    await this.documentClient.send(new PutCommand(params));
  }

  private isCacheValid(cached: CacheItem): boolean {
    return cached.ttl > Math.floor(Date.now() / 1000);
  }

  public async setPlanet(planetId: number, planet: Planet): Promise<void> {
    const cacheKey = `planet_${planetId}`;
    this.logger.debug("Setting planet cache", { planetId });
    await this.setCache(cacheKey, planet);
  }

  public async getPlanet(planetId: number): Promise<Planet | null> {
    const cacheKey = `planet_${planetId}`;
    const cached = await this.getCache(cacheKey);
    if (!cached || !this.isCacheValid(cached)) return null;

    this.logger.debug("Cache hit for planet", { planetId });
    return cached.data as Planet;
  }

  public async setCountry(country: Country): Promise<void> {
    const cacheKey = `country_${country.name}`;
    this.logger.debug("Setting country cache", { country: country.name });
    await this.setCache(cacheKey, country);
  }

  public async getCountry(countryName: string): Promise<Country | null> {
    const cacheKey = `country_${countryName}`;
    const cached = await this.getCache(cacheKey);
    if (!cached || !this.isCacheValid(cached)) return null;

    this.logger.debug("Cache hit for country", { country: countryName });
    return cached.data as Country;
  }
}
