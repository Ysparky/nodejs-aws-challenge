import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "../../handlers/store";
import { beforeEach, afterEach } from "@jest/globals";
import { mockLogger } from "../setup";

describe("Store Handler", () => {
  let mockEvent: APIGatewayProxyEvent;

  const mockData = {
    name: "Test Item",
    value: 123,
    nested: {
      key: "value",
    },
  };

  beforeEach(() => {
    // Setup mock event
    mockEvent = {
      body: JSON.stringify(mockData),
      headers: {},
      httpMethod: "POST",
      isBase64Encoded: false,
      path: "/store",
      pathParameters: null,
      queryStringParameters: null,
      requestContext: {} as any,
      resource: "",
      stageVariables: null,
    } as APIGatewayProxyEvent;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully store data", async () => {
    // Call the handler
    const response = await handler(mockEvent);

    // Verify response
    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body)).toEqual({
      message: "Data stored successfully",
    });

    // Verify logging
    expect(mockLogger.info).toHaveBeenCalledWith("Received store request", {
      path: "/store",
      method: "POST",
      hasBody: true,
    });
    expect(mockLogger.debug).toHaveBeenCalledWith("Parsed request body", {
      data: mockData,
    });
  });

  it("should handle missing request body", async () => {
    // Create event without body
    const eventWithoutBody = {
      ...mockEvent,
      body: null,
    };

    // Call the handler
    const response = await handler(eventWithoutBody);

    // Verify response
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({
      error: "Request body is required",
    });

    // Verify error logging
    expect(mockLogger.warn).toHaveBeenCalledWith("Request body is missing");
  });

  it("should handle invalid JSON in request body", async () => {
    // Create event with invalid JSON
    const eventWithInvalidJson = {
      ...mockEvent,
      body: "invalid json",
    };

    // Call the handler
    const response = await handler(eventWithInvalidJson);

    // Verify response
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({
      error: "Invalid request body",
    });

    // Verify error logging
    expect(mockLogger.error).toHaveBeenCalledWith(
      "Failed to parse request body",
      {
        error: expect.any(SyntaxError),
      }
    );
  });
});
