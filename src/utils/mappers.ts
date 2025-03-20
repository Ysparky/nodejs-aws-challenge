import { Planet } from "../types/planet";
import { Country } from "../types/country";
import { PlanetWeather } from "../types/planetWeather";
import {
  TEMPERATURE_UNIT,
  HUMIDITY_UNIT,
  WIND_SPEED_UNIT,
  PRESSURE_UNIT,
  VISIBILITY_UNIT,
  CLOUD_COVERAGE_UNIT,
} from "./constants";

export const mapToPlanetWeather = (
  planetId: number,
  { name: planetName, climate, terrain, population }: Planet,
  { weather, main, wind, visibility, clouds }: Country
): PlanetWeather => ({
  planetId,
  planetName,
  climate,
  terrain,
  population,
  weather: {
    description: weather[0].description,
    temperature: {
      value: main.temp,
      unit: TEMPERATURE_UNIT,
    },
    feelsLike: {
      value: main.feels_like,
      unit: TEMPERATURE_UNIT,
    },
    humidity: {
      value: main.humidity,
      unit: HUMIDITY_UNIT,
    },
    windSpeed: {
      value: wind.speed,
      unit: WIND_SPEED_UNIT,
    },
    pressure: {
      value: main.pressure,
      unit: PRESSURE_UNIT,
    },
    visibility: {
      value: visibility,
      unit: VISIBILITY_UNIT,
    },
    cloudCoverage: {
      value: clouds.all,
      unit: CLOUD_COVERAGE_UNIT,
    },
  },
});
