import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BaseLogger } from "../utils/logger";

// Mock AWS X-Ray SDK
jest.mock("aws-xray-sdk", () => ({
  captureAWSv3Client: jest.fn().mockImplementation((client) => client),
  captureHTTPs: jest.fn().mockImplementation((module) => module),
  getSegment: jest.fn().mockReturnValue({
    addNewSubsegment: jest.fn().mockReturnValue({
      addAnnotation: jest.fn(),
      close: jest.fn(),
      addError: jest.fn(),
    }),
  }),
}));

// Set environment variables for testing
process.env.WEATHER_API_KEY = "test-api-key";
process.env.HISTORY_TABLE_NAME = "test-history-table";
process.env.STORE_TABLE_NAME = "test-store-table";
process.env.CACHE_TABLE_NAME = "test-cache-table";

// Mock fetch globally
global.fetch = jest.fn();

// Mock AWS SDK v3 clients and commands
jest.mock("@aws-sdk/client-dynamodb", () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
}));

// Create a mock document client
const mockDocumentClient = {
  send: jest.fn(),
};

jest.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocumentClient: {
    from: jest.fn().mockImplementation(() => mockDocumentClient),
  },
  PutCommand: jest.fn().mockImplementation((params) => ({
    input: params,
  })),
  QueryCommand: jest.fn().mockImplementation((params) => ({
    input: params,
  })),
}));

// Export mocked clients for use in tests
export const mockDynamoDBClient = new DynamoDBClient({});
export const mockDynamoDBDocumentClient = mockDocumentClient;

// Create mock logger functions
const mockLoggerFunctions = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock the BaseLogger
jest.mock("../utils/logger", () => ({
  BaseLogger: {
    logger: jest.fn().mockReturnValue(mockLoggerFunctions),
  },
}));

// Export the mock logger for use in tests
export const mockLogger = mockLoggerFunctions;
