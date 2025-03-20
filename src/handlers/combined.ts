import { APIGatewayProxyResult } from "aws-lambda";
import { DynamoService } from "../services/dynamoService";
import { SwapiService } from "../services/swapiService";
import { WeatherService } from "../services/weatherService";
import { mapToPlanetWeather } from "../utils/mappers";
import { getRandomPlanetId } from "../utils/utils";
import { BaseLogger } from "../utils/logger";

const swapiService = new SwapiService();
const weatherService = new WeatherService();
const dynamoService = new DynamoService(process.env.HISTORY_TABLE_NAME!);
const logger = BaseLogger.logger("combined-handler");

export const handler = async (): Promise<APIGatewayProxyResult> => {
  try {
    const planetId = getRandomPlanetId();
    logger.debug("Processing request", { planetId });

    const planet = await swapiService.getPlanet(planetId);
    const weather = await weatherService.getWeather();

    const combined = mapToPlanetWeather(planetId, planet, weather);
    logger.info("Data combined successfully", { planetId });

    await dynamoService.putItem(combined);

    return {
      statusCode: 200,
      body: JSON.stringify(combined),
    };
  } catch (error) {
    logger.error("Failed to process request", { error });
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
