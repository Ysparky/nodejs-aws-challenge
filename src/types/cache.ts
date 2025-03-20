import { Country } from "./country";
import { Planet } from "./planet";

export type CacheData = Planet | Country;

export interface CacheItem {
  data: CacheData;
  ttl: number;
  cacheKey: string;
}
