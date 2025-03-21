import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { uuid } from "uuidv4";
import { GetItemsResult, PlanetWeather } from "../types/planetWeather";
import { BaseLogger } from "../utils/logger";
import { createTracedDynamoDBClient } from "../utils/tracer";

export class DynamoService {
  private readonly documentClient: DynamoDBDocumentClient;
  private readonly tableName: string;
  private readonly logger = BaseLogger.logger("dynamo-service");

  constructor(tableName: string) {
    this.documentClient = createTracedDynamoDBClient();
    this.tableName = tableName;
    this.logger.info("Initialized DynamoService", { tableName });
  }

  async putItem(payload: PlanetWeather | any, asJson: boolean = false) {
    const item = asJson
      ? {
          id: uuid(),
          timestamp: new Date().toISOString(),
          data: JSON.stringify(payload),
        }
      : {
          ...payload,
          planetId: (payload as PlanetWeather).planetId.toString(),
          gsiType: "HISTORY",
          timestamp: new Date().toISOString(),
        };

    try {
      const params = {
        TableName: this.tableName,
        Item: item,
      };

      this.logger.debug("Putting item", {
        id: asJson ? item.id : item.planetId,
        type: asJson ? "json" : "history",
      });

      await this.documentClient.send(new PutCommand(params));
      this.logger.info("Item stored", { id: asJson ? item.id : item.planetId });
    } catch (error) {
      this.logger.error("Failed to store item", {
        id: asJson ? item.id : item.planetId,
        error,
      });
      throw new Error("Failed to put item");
    }
  }

  async getItems(
    pageSize: number,
    ascending: boolean = false,
    lastEvaluatedKey?: Record<string, any>
  ): Promise<GetItemsResult> {
    try {
      const params = {
        TableName: this.tableName,
        IndexName: "HistoryByTimestampIndex",
        KeyConditionExpression: "#gsiType = :type",
        ExpressionAttributeNames: { "#gsiType": "gsiType" },
        ExpressionAttributeValues: { ":type": "HISTORY" },
        Limit: pageSize,
        ScanIndexForward: ascending,
        ...(lastEvaluatedKey && {
          ExclusiveStartKey: {
            gsiType: "HISTORY",
            ...lastEvaluatedKey,
          },
        }),
      };

      this.logger.debug("Attempting to get items", {
        tableName: this.tableName,
        pageSize,
        ascending,
        hasLastEvaluatedKey: !!lastEvaluatedKey,
      });

      const result = await this.documentClient.send(new QueryCommand(params));

      this.logger.info("Successfully retrieved items", {
        itemCount: result.Items?.length || 0,
        hasMore: !!result.LastEvaluatedKey,
      });

      return {
        items: result.Items as PlanetWeather[],
        lastEvaluatedKey: result.LastEvaluatedKey,
      };
    } catch (error) {
      this.logger.error("Failed to get items", {
        error,
        tableName: this.tableName,
        pageSize,
        ascending,
      });
      throw new Error("Failed to get items");
    }
  }
}
