import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import { DynamoService } from "../services/dynamoService";
import { BaseLogger } from "../utils/logger";

const dynamoService = new DynamoService(process.env.HISTORY_TABLE_NAME!);
const logger = BaseLogger.logger("history-handler");

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

const querySchema = z
  .object({
    pageSize: z
      .string()
      .regex(/^[0-9]+$/, "Page size must be a number")
      .transform((val) => parseInt(val, 10))
      .refine(
        (val) => val >= 1 && val <= MAX_PAGE_SIZE,
        `Page size must be between 1 and ${MAX_PAGE_SIZE}`
      )
      .default(DEFAULT_PAGE_SIZE.toString()),
    sort: z.enum(["ASC", "DESC"]).default("DESC"),
    lastEvaluatedKey: z.string().optional(),
  })
  .strict();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const queryParams = event.queryStringParameters || {};
    const result = querySchema.safeParse(queryParams);

    if (!result.success) {
      logger.error("Invalid query parameters", { errors: result.error.errors });
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Invalid query parameters",
          details: result.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        }),
      };
    }

    const { pageSize, sort, lastEvaluatedKey } = result.data;
    logger.debug("Processing request", { pageSize, sort });

    let decodedKey: { timestamp: string; planetId: string } | undefined;
    if (lastEvaluatedKey) {
      try {
        decodedKey = JSON.parse(decodeURIComponent(lastEvaluatedKey));
      } catch (error) {
        logger.error("Invalid lastEvaluatedKey", { error });
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: "Invalid lastEvaluatedKey format",
          }),
        };
      }
    }

    const { items, lastEvaluatedKey: lastEvaluatedKeyFromDynamo } =
      await dynamoService.getItems(pageSize, sort === "ASC", decodedKey);

    logger.info("Retrieved history items", { count: items.length });
    return {
      statusCode: 200,
      body: JSON.stringify({
        items,
        lastEvaluatedKey: lastEvaluatedKeyFromDynamo
          ? encodeURIComponent(
              JSON.stringify({
                timestamp: lastEvaluatedKeyFromDynamo.timestamp,
                planetId: lastEvaluatedKeyFromDynamo.planetId,
              })
            )
          : undefined,
      }),
    };
  } catch (error) {
    logger.error("Failed to process request", { error });
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
