import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoService } from "../services/dynamoService";
import { BaseLogger } from "../utils/logger";

const dynamoService = new DynamoService(process.env.STORE_TABLE_NAME!);
const logger = BaseLogger.logger("store-handler");

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info("Received store request", {
    path: event.path,
    method: event.httpMethod,
    hasBody: !!event.body,
  });

  if (!event.body) {
    logger.warn("Request body is missing");
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Request body is required" }),
    };
  }

  let data: any;
  try {
    data = JSON.parse(event.body);
    logger.debug("Parsed request body", { data });
  } catch (error) {
    logger.error("Failed to parse request body", { error });
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request body" }),
    };
  }

  if (typeof data !== "object" || data === null) {
    logger.warn("Invalid request body format", { data });
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request body" }),
    };
  }

  try {
    await dynamoService.putItem(data, true);

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Data stored successfully",
      }),
    };
  } catch (error) {
    logger.error("Failed to store item", {
      error: error instanceof Error ? error.message : "Unknown error",
      data,
    });
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
