import { DynamoService } from "../../services/dynamoService";
import { PlanetWeather } from "../../types/planetWeather";
import { beforeEach, afterEach } from "@jest/globals";
import { mockDynamoDBDocumentClient, mockLogger } from "../setup";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

jest.mock("uuidv4", () => ({
  uuid: () => "test-uuid",
}));

// Mock the DynamoDB service
jest.mock("../../services/dynamoService", () => {
  const actual = jest.requireActual("../../services/dynamoService");
  return {
    ...actual,
    DynamoService: class extends actual.DynamoService {
      constructor(tableName: string) {
        super(tableName);
        this.documentClient = mockDynamoDBDocumentClient;
      }
    },
  };
});

describe("DynamoService", () => {
  let dynamoService: DynamoService;
  const tableName = "test-table";

  beforeEach(() => {
    jest.clearAllMocks();
    dynamoService = new DynamoService(tableName);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("putItem", () => {
    it("should save a PlanetWeather item successfully", async () => {
      const mockWeatherData: PlanetWeather = {
        planetId: 1,
        planetName: "Tatooine",
        climate: "arid",
        terrain: "desert",
        population: "200000",
        weather: {
          description: "sunny",
          temperature: { value: 30, unit: "°C" },
          feelsLike: { value: 35, unit: "°C" },
          humidity: { value: 40, unit: "%" },
          windSpeed: { value: 10, unit: "m/s" },
          pressure: { value: 1015, unit: "hPa" },
          visibility: { value: 10000, unit: "m" },
          cloudCoverage: { value: 0, unit: "%" },
        },
      };

      (mockDynamoDBDocumentClient.send as jest.Mock).mockResolvedValueOnce({});

      await expect(
        dynamoService.putItem(mockWeatherData)
      ).resolves.not.toThrow();
      expect(PutCommand).toHaveBeenCalledWith({
        TableName: tableName,
        Item: expect.objectContaining({
          planetId: "1",
          gsiType: "HISTORY",
          planetName: "Tatooine",
          climate: "arid",
          terrain: "desert",
          population: "200000",
          weather: expect.any(Object),
        }),
      });
      expect(mockDynamoDBDocumentClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: tableName,
            Item: expect.objectContaining({
              planetId: "1",
              gsiType: "HISTORY",
              planetName: "Tatooine",
              climate: "arid",
              terrain: "desert",
              population: "200000",
              weather: expect.any(Object),
            }),
          }),
        })
      );
    });

    it("should save a JSON item successfully", async () => {
      const mockData = { key: "value" };

      (mockDynamoDBDocumentClient.send as jest.Mock).mockResolvedValueOnce({});

      await expect(
        dynamoService.putItem(mockData, true)
      ).resolves.not.toThrow();
      expect(PutCommand).toHaveBeenCalledWith({
        TableName: tableName,
        Item: expect.objectContaining({
          id: "test-uuid",
          data: JSON.stringify(mockData),
        }),
      });
      expect(mockDynamoDBDocumentClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: tableName,
            Item: expect.objectContaining({
              id: "test-uuid",
              data: JSON.stringify(mockData),
            }),
          }),
        })
      );
    });

    it("should handle DynamoDB errors", async () => {
      const mockWeatherData: PlanetWeather = {
        planetId: 1,
        planetName: "Tatooine",
        climate: "arid",
        terrain: "desert",
        population: "200000",
        weather: {
          description: "sunny",
          temperature: { value: 30, unit: "°C" },
          feelsLike: { value: 35, unit: "°C" },
          humidity: { value: 40, unit: "%" },
          windSpeed: { value: 10, unit: "m/s" },
          pressure: { value: 1015, unit: "hPa" },
          visibility: { value: 10000, unit: "m" },
          cloudCoverage: { value: 0, unit: "%" },
        },
      };

      const mockError = new Error("DynamoDB Error");
      (mockDynamoDBDocumentClient.send as jest.Mock).mockRejectedValueOnce(
        mockError
      );

      await expect(dynamoService.putItem(mockWeatherData)).rejects.toThrow(
        "Failed to put item"
      );
      expect(mockLogger.error).toHaveBeenCalledWith("Failed to store item", {
        id: "1",
        error: mockError,
      });
    });
  });

  describe("getItems", () => {
    it("should retrieve items successfully", async () => {
      const mockItems = [
        {
          id: "HISTORY",
          planetId: "1",
          gsiType: "HISTORY",
          planetName: "Tatooine",
          climate: "arid",
          terrain: "desert",
          population: "200000",
          weather: {
            description: "sunny",
            temperature: { value: 30, unit: "°C" },
            feelsLike: { value: 35, unit: "°C" },
            humidity: { value: 40, unit: "%" },
            windSpeed: { value: 10, unit: "m/s" },
            pressure: { value: 1015, unit: "hPa" },
            visibility: { value: 10000, unit: "m" },
            cloudCoverage: { value: 0, unit: "%" },
          },
          timestamp: new Date().toISOString(),
        },
      ];

      (mockDynamoDBDocumentClient.send as jest.Mock).mockResolvedValueOnce({
        Items: mockItems,
      });

      const result = await dynamoService.getItems(10);
      expect(result.items).toEqual(mockItems);
      expect(QueryCommand).toHaveBeenCalledWith({
        TableName: tableName,
        IndexName: "HistoryByTimestampIndex",
        KeyConditionExpression: "#gsiType = :type",
        ExpressionAttributeNames: { "#gsiType": "gsiType" },
        ExpressionAttributeValues: { ":type": "HISTORY" },
        Limit: 10,
        ScanIndexForward: false,
      });
      expect(mockDynamoDBDocumentClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: tableName,
            IndexName: "HistoryByTimestampIndex",
            KeyConditionExpression: "#gsiType = :type",
            ExpressionAttributeNames: { "#gsiType": "gsiType" },
            ExpressionAttributeValues: { ":type": "HISTORY" },
            Limit: 10,
            ScanIndexForward: false,
          }),
        })
      );
    });

    it("should handle empty results", async () => {
      (mockDynamoDBDocumentClient.send as jest.Mock).mockResolvedValueOnce({
        Items: [],
      });

      const result = await dynamoService.getItems(10);
      expect(result.items).toEqual([]);
      expect(QueryCommand).toHaveBeenCalledWith({
        TableName: tableName,
        IndexName: "HistoryByTimestampIndex",
        KeyConditionExpression: "#gsiType = :type",
        ExpressionAttributeNames: { "#gsiType": "gsiType" },
        ExpressionAttributeValues: { ":type": "HISTORY" },
        Limit: 10,
        ScanIndexForward: false,
      });
    });

    it("should handle DynamoDB errors", async () => {
      const mockError = new Error("DynamoDB Error");
      (mockDynamoDBDocumentClient.send as jest.Mock).mockRejectedValueOnce(
        mockError
      );

      await expect(dynamoService.getItems(10)).rejects.toThrow(
        "Failed to get items"
      );
      expect(mockLogger.error).toHaveBeenCalledWith("Failed to get items", {
        error: mockError,
        tableName: tableName,
        pageSize: 10,
        ascending: false,
      });
    });

    it("should handle pagination with lastEvaluatedKey", async () => {
      const lastEvaluatedKey = {
        timestamp: "2024-03-20T12:00:00Z",
      };

      (mockDynamoDBDocumentClient.send as jest.Mock).mockResolvedValueOnce({
        Items: [],
        LastEvaluatedKey: lastEvaluatedKey,
      });

      const result = await dynamoService.getItems(10, false, lastEvaluatedKey);
      expect(result.lastEvaluatedKey).toEqual(lastEvaluatedKey);
      expect(QueryCommand).toHaveBeenCalledWith({
        TableName: tableName,
        IndexName: "HistoryByTimestampIndex",
        KeyConditionExpression: "#gsiType = :type",
        ExpressionAttributeNames: { "#gsiType": "gsiType" },
        ExpressionAttributeValues: { ":type": "HISTORY" },
        Limit: 10,
        ScanIndexForward: false,
        ExclusiveStartKey: {
          gsiType: "HISTORY",
          ...lastEvaluatedKey,
        },
      });
    });
  });
});
