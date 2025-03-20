import { PLANETS_COUNT, AVAILABLE_COUNTRIES } from "./constants";

export const getRandomPlanetId = (): number =>
  Math.floor(Math.random() * PLANETS_COUNT) + 1;

export const getRandomCountry = (): string =>
  AVAILABLE_COUNTRIES[Math.floor(Math.random() * AVAILABLE_COUNTRIES.length)];
