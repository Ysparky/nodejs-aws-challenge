import { CacheService } from "./cacheService";
import { Country } from "../types/country";
import { BaseLogger } from "../utils/logger";
import { getRandomCountry } from "../utils/utils";

export class WeatherService {
  private readonly maxRetries = 3;
  private readonly baseUrl: string;
  private readonly cacheService: CacheService;
  private readonly logger = BaseLogger.logger("weather-service");

  constructor() {
    this.baseUrl = "https://api.openweathermap.org/data/2.5";
    this.cacheService = new CacheService();
  }

  async getWeather(retryCount: number = 0): Promise<Country> {
    try {
      const countryName = getRandomCountry();
      const cachedCountry = await this.cacheService.getCountry(countryName);

      if (cachedCountry) {
        this.logger.debug("Using cached weather data", {
          country: countryName,
        });
        return cachedCountry;
      }

      this.logger.info("Fetching weather from API", {
        country: countryName,
        attempt: retryCount + 1,
      });

      const response = await fetch(
        `${this.baseUrl}/weather?q=${countryName}&appid=${process.env.WEATHER_API_KEY}&units=metric`
      );

      if (response.status === 404) {
        this.logger.error("Country not found", { country: countryName });
        throw new Error(`Country ${countryName} not found`);
      }

      if (!response.ok) {
        this.logger.error("Weather API request failed", {
          country: countryName,
          status: response.status,
        });
        throw new Error(
          `Weather API responded with status: ${response.status}`
        );
      }

      const data = (await response.json()) as Country;
      await this.cacheService.setCountry(data);
      this.logger.info("Weather data fetched and cached", {
        country: countryName,
      });

      return data;
    } catch (error) {
      this.logger.error("Error fetching weather data", {
        attempt: retryCount + 1,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      if (retryCount < this.maxRetries) {
        this.logger.info("Retrying weather fetch", {
          attempt: retryCount + 2,
          maxRetries: this.maxRetries,
        });
        return this.getWeather(retryCount + 1);
      }

      throw new Error(
        `Failed to fetch weather data after ${this.maxRetries} attempts: ${error.message}`
      );
    }
  }
}
