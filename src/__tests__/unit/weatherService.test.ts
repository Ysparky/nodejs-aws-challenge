import { WeatherService } from "../../services/weatherService";
import { CacheService } from "../../services/cacheService";
import { Country } from "../../types/country";
import { beforeEach, afterEach } from "@jest/globals";
import { mockLogger } from "../setup";

// Mock the CacheService
jest.mock("../../services/cacheService");

// Mock getRandomCountry
jest.mock("../../utils/utils", () => ({
  getRandomCountry: jest.fn().mockReturnValue("Spain"),
}));

describe("WeatherService", () => {
  let weatherService: WeatherService;
  let mockCacheService: jest.Mocked<CacheService>;

  const mockCountry: Country = {
    name: "Spain",
    coord: { lon: -3.7, lat: 40.4 },
    weather: [
      {
        id: 800,
        main: "Clear",
        description: "sunny",
        icon: "01d",
      },
    ],
    base: "stations",
    main: {
      temp: 25,
      feels_like: 24.5,
      temp_min: 23,
      temp_max: 27,
      pressure: 1015,
      humidity: 60,
      sea_level: 1015,
      grnd_level: 1014,
    },
    visibility: 10000,
    wind: {
      speed: 10,
      deg: 250,
      gust: 12,
    },
    clouds: {
      all: 0,
    },
    dt: 1616161616,
    sys: {
      country: "ES",
      sunrise: 1616130000,
      sunset: 1616170000,
    },
    timezone: 3600,
    id: 3117735,
    cod: 200,
  };

  beforeEach(() => {
    // Setup mock cache service
    mockCacheService = {
      getCountry: jest.fn(),
      setCountry: jest.fn(),
    } as unknown as jest.Mocked<CacheService>;

    // Mock CacheService constructor
    (CacheService as jest.Mock).mockImplementation(() => mockCacheService);

    // Create new instance for each test
    weatherService = new WeatherService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return cached weather data when available", async () => {
    // Setup cache hit
    mockCacheService.getCountry.mockResolvedValueOnce(mockCountry);

    // Call the service
    const result = await weatherService.getWeather();

    // Verify the result
    expect(result).toEqual(mockCountry);

    // Verify cache was checked
    expect(mockCacheService.getCountry).toHaveBeenCalledWith("Spain");

    // Verify fetch was not called
    expect(global.fetch).not.toHaveBeenCalled();

    // Verify cache was not updated
    expect(mockCacheService.setCountry).not.toHaveBeenCalled();

    // Verify logging
    expect(mockLogger.debug).toHaveBeenCalledWith("Using cached weather data", {
      country: "Spain",
    });
  });

  it("should fetch and cache weather data when not in cache", async () => {
    // Setup cache miss
    mockCacheService.getCountry.mockResolvedValueOnce(null);

    // Mock fetch response
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCountry),
    });

    // Call the service
    const result = await weatherService.getWeather();

    // Verify the result
    expect(result).toEqual(mockCountry);

    // Verify cache was checked
    expect(mockCacheService.getCountry).toHaveBeenCalledWith("Spain");

    // Verify fetch was called with correct URL
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("q=Spain")
    );

    // Verify cache was updated
    expect(mockCacheService.setCountry).toHaveBeenCalledWith(mockCountry);

    // Verify logging
    expect(mockLogger.info).toHaveBeenCalledWith("Fetching weather from API", {
      country: "Spain",
      attempt: 1,
    });
    expect(mockLogger.info).toHaveBeenCalledWith(
      "Weather data fetched and cached",
      {
        country: "Spain",
      }
    );
  });

  it("should retry on failure up to maxRetries times", async () => {
    // Setup cache miss
    mockCacheService.getCountry.mockResolvedValueOnce(null);

    // Mock fetch error responses
    global.fetch = jest
      .fn()
      .mockRejectedValueOnce(new Error("Network error"))
      .mockRejectedValueOnce(new Error("Network error"))
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCountry),
      });

    // Call the service
    const result = await weatherService.getWeather();

    // Verify the result
    expect(result).toEqual(mockCountry);

    // Verify fetch was called 4 times (3 retries + 1 success)
    expect(global.fetch).toHaveBeenCalledTimes(4);

    // Verify logging
    expect(mockLogger.error).toHaveBeenCalledTimes(3);
    expect(mockLogger.info).toHaveBeenCalledWith("Retrying weather fetch", {
      attempt: 2,
      maxRetries: 3,
    });
    expect(mockLogger.info).toHaveBeenCalledWith("Retrying weather fetch", {
      attempt: 3,
      maxRetries: 3,
    });
    expect(mockLogger.info).toHaveBeenCalledWith("Retrying weather fetch", {
      attempt: 4,
      maxRetries: 3,
    });
  });

  it("should fail after maxRetries attempts", async () => {
    // Setup cache miss
    mockCacheService.getCountry.mockResolvedValueOnce(null);

    // Mock fetch error responses
    global.fetch = jest
      .fn()
      .mockRejectedValueOnce(new Error("Network error"))
      .mockRejectedValueOnce(new Error("Network error"))
      .mockRejectedValueOnce(new Error("Network error"))
      .mockRejectedValueOnce(new Error("Network error"));

    // Call the service and expect error
    await expect(weatherService.getWeather()).rejects.toThrow(
      "Failed to fetch weather data after 3 attempts: Network error"
    );

    // Verify fetch was called 4 times (initial + 3 retries)
    expect(global.fetch).toHaveBeenCalledTimes(4);

    // Verify logging
    expect(mockLogger.error).toHaveBeenCalledTimes(4);
    expect(mockLogger.info).toHaveBeenCalledWith("Retrying weather fetch", {
      attempt: 2,
      maxRetries: 3,
    });
    expect(mockLogger.info).toHaveBeenCalledWith("Retrying weather fetch", {
      attempt: 3,
      maxRetries: 3,
    });
  });
});
