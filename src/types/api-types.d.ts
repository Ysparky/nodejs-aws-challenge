export interface Measurement {
  value: number;
  unit: string;
}

export interface Weather {
  description: string;
  temperature: Measurement;
  feelsLike: Measurement;
  humidity: Measurement;
  windSpeed: Measurement;
  pressure: Measurement;
  visibility: Measurement;
  cloudCoverage: Measurement;
}

// API Response types
export interface PlanetResponse {
  planetId: string;
  planetName: string;
  climate: string;
  terrain: string;
  population: string;
  weather: Weather;
}

export interface HistoryResponse {
  items: Array<PlanetResponse>;
  lastEvaluatedKey: string;
}

export interface StoreResponse {
  message: string;
}

export interface ErrorResponse {
  message: string;
  code: string;
}
