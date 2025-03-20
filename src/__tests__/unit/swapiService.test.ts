import { SwapiService } from "../../services/swapiService";
import { CacheService } from "../../services/cacheService";
import { Planet } from "../../types/planet";
import { beforeEach, afterEach } from "@jest/globals";
import { mockLogger } from "../setup";

// Mock the CacheService
jest.mock("../../services/cacheService");

describe("SwapiService", () => {
  let swapiService: SwapiService;
  let mockCacheService: jest.Mocked<CacheService>;
  let mockPlanetId: number;

  const mockPlanet: Planet = {
    name: "Tatooine",
    rotation_period: "23",
    orbital_period: "304",
    diameter: "10465",
    climate: "arid",
    gravity: "1 standard",
    terrain: "desert",
    surface_water: "1",
    population: "200000",
    residents: [
      "https://swapi.dev/api/people/1/",
      "https://swapi.dev/api/people/2/",
      "https://swapi.dev/api/people/4/",
      "https://swapi.dev/api/people/6/",
      "https://swapi.dev/api/people/7/",
      "https://swapi.dev/api/people/8/",
      "https://swapi.dev/api/people/9/",
      "https://swapi.dev/api/people/11/",
      "https://swapi.dev/api/people/43/",
      "https://swapi.dev/api/people/62/",
    ],
    films: [
      "https://swapi.dev/api/films/1/",
      "https://swapi.dev/api/films/3/",
      "https://swapi.dev/api/films/4/",
      "https://swapi.dev/api/films/5/",
      "https://swapi.dev/api/films/6/",
    ],
    created: new Date("2014-12-09T13:50:49.641000Z"),
    edited: new Date("2014-12-20T20:58:18.411000Z"),
    url: "https://swapi.dev/api/planets/1/",
  };

  beforeEach(() => {
    // Setup mock planet ID
    mockPlanetId = 1;

    // Setup mock cache service
    mockCacheService = {
      getPlanet: jest.fn(),
      setPlanet: jest.fn(),
    } as unknown as jest.Mocked<CacheService>;

    // Mock CacheService constructor
    (CacheService as jest.Mock).mockImplementation(() => mockCacheService);

    // Create new instance for each test
    swapiService = new SwapiService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return cached planet data when available", async () => {
    // Setup cache hit
    mockCacheService.getPlanet.mockResolvedValueOnce(mockPlanet);

    // Call the service
    const result = await swapiService.getPlanet(mockPlanetId);

    // Verify the result
    expect(result).toEqual(mockPlanet);

    // Verify cache was checked
    expect(mockCacheService.getPlanet).toHaveBeenCalledWith(mockPlanetId);

    // Verify fetch was not called
    expect(global.fetch).not.toHaveBeenCalled();

    // Verify cache was not updated
    expect(mockCacheService.setPlanet).not.toHaveBeenCalled();

    // Verify logging
    expect(mockLogger.debug).toHaveBeenCalledWith("Using cached planet data", {
      planetId: mockPlanetId,
    });
  });

  it("should fetch and cache planet data when not in cache", async () => {
    // Setup cache miss
    mockCacheService.getPlanet.mockResolvedValueOnce(null);

    // Mock fetch response
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPlanet),
    });

    // Call the service
    const result = await swapiService.getPlanet(mockPlanetId);

    // Verify the result
    expect(result).toEqual(mockPlanet);

    // Verify cache was checked
    expect(mockCacheService.getPlanet).toHaveBeenCalledWith(mockPlanetId);

    // Verify fetch was called with correct URL
    expect(global.fetch).toHaveBeenCalledWith(
      `https://swapi.dev/api/planets/${mockPlanetId}/`
    );

    // Verify cache was updated
    expect(mockCacheService.setPlanet).toHaveBeenCalledWith(
      mockPlanetId,
      mockPlanet
    );

    // Verify logging
    expect(mockLogger.info).toHaveBeenCalledWith("Fetching planet from SWAPI", {
      planetId: mockPlanetId,
    });
    expect(mockLogger.info).toHaveBeenCalledWith(
      "Planet data fetched and cached",
      {
        planetId: mockPlanetId,
      }
    );
  });

  it("should handle fetch errors", async () => {
    // Setup cache miss
    mockCacheService.getPlanet.mockResolvedValueOnce(null);

    // Mock fetch error
    const mockError = new Error("Network error");
    global.fetch = jest.fn().mockRejectedValueOnce(mockError);

    // Call the service and expect error
    await expect(swapiService.getPlanet(mockPlanetId)).rejects.toThrow(
      "Network error"
    );

    // Verify cache was checked
    expect(mockCacheService.getPlanet).toHaveBeenCalledWith(mockPlanetId);

    // Verify fetch was called
    expect(global.fetch).toHaveBeenCalledWith(
      `https://swapi.dev/api/planets/${mockPlanetId}/`
    );

    // Verify cache was not updated
    expect(mockCacheService.setPlanet).not.toHaveBeenCalled();

    // Verify error logging
    expect(mockLogger.error).toHaveBeenCalledWith(
      "Error fetching planet data",
      {
        planetId: mockPlanetId,
        error: "Network error",
      }
    );
  });

  it("should handle non-OK fetch responses", async () => {
    // Setup cache miss
    mockCacheService.getPlanet.mockResolvedValueOnce(null);

    // Mock fetch error response
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: () => Promise.resolve({}),
    });

    // Call the service and expect error
    await expect(swapiService.getPlanet(mockPlanetId)).rejects.toThrow(
      "Failed to fetch planet data: 404 Not Found"
    );

    // Verify cache was checked
    expect(mockCacheService.getPlanet).toHaveBeenCalledWith(mockPlanetId);

    // Verify fetch was called
    expect(global.fetch).toHaveBeenCalledWith(
      `https://swapi.dev/api/planets/${mockPlanetId}/`
    );

    // Verify cache was not updated
    expect(mockCacheService.setPlanet).not.toHaveBeenCalled();

    // Verify error logging
    expect(mockLogger.error).toHaveBeenCalledWith("SWAPI request failed", {
      planetId: mockPlanetId,
      status: 404,
      statusText: "Not Found",
    });
  });
});
