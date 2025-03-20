export interface PlanetWeather {
  planetId: number;
  planetName: string;
  climate: string;
  terrain: string;
  population: string;
  weather: Weather;
}

export interface Weather {
  description: string;
  temperature: CloudCoverage;
  feelsLike: CloudCoverage;
  humidity: CloudCoverage;
  windSpeed: CloudCoverage;
  pressure: CloudCoverage;
  visibility: CloudCoverage;
  cloudCoverage: CloudCoverage;
}

export interface CloudCoverage {
  value: number;
  unit: string;
}

export interface HistoryItem extends PlanetWeather {
  id: string;
  timestamp: string;
  gsiType: string;
}

export interface GetItemsResult {
  items: PlanetWeather[];
  lastEvaluatedKey?: Record<string, any>;
}
