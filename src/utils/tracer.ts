import * as AWSXRay from "aws-xray-sdk";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Configure X-Ray for capturing HTTP calls
const http = AWSXRay.captureHTTPs(require("http"));
const https = AWSXRay.captureHTTPs(require("https"));

// Helper function to create a traced DynamoDB client
export function createTracedDynamoDBClient(): DynamoDBDocumentClient {
  const client = AWSXRay.captureAWSv3Client(new DynamoDBClient({}));
  return DynamoDBDocumentClient.from(client);
}

// Helper function to create a traced fetch function
export function tracedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const segment = AWSXRay.getSegment();
  const subsegment = segment?.addNewSubsegment("fetch");

  try {
    subsegment?.addAnnotation("url", url);
    return fetch(url, options).finally(() => {
      subsegment?.close();
    });
  } catch (error) {
    subsegment?.addError(error as Error);
    subsegment?.close();
    throw error;
  }
}

// Export the traced HTTP modules
export { http, https };
