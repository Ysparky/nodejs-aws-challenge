import { CacheService } from "./cacheService";
import { Planet } from "../types/planet";
import { BaseLogger } from "../utils/logger";

export class SwapiService {
  private readonly baseUrl: string;
  private readonly cacheService: CacheService;
  private readonly logger = BaseLogger.logger("swapi-service");

  constructor() {
    this.baseUrl = "https://swapi.dev/api";
    this.cacheService = new CacheService();
  }

  async getPlanet(planetId: number): Promise<Planet> {
    try {
      const cachedData = await this.cacheService.getPlanet(planetId);

      if (cachedData) {
        this.logger.debug("Using cached planet data", { planetId });
        return cachedData;
      }

      this.logger.info("Fetching planet from SWAPI", { planetId });
      const response = await fetch(`${this.baseUrl}/planets/${planetId}/`);

      if (!response.ok) {
        this.logger.error("SWAPI request failed", {
          planetId,
          status: response.status,
          statusText: response.statusText,
        });
        throw new Error(
          `Failed to fetch planet data: ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as Planet;
      await this.cacheService.setPlanet(planetId, data);
      this.logger.info("Planet data fetched and cached", { planetId });

      return data;
    } catch (error) {
      this.logger.error("Error fetching planet data", {
        planetId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }
}
