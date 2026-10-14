import { Injectable } from '@nestjs/common';
import { CacheService } from '../../infra/cache/cache.service';
import { DiseaseDictionaryRepository } from './repositories/disease-dictionary.repository';

const CACHE_TTL_SECONDS = 86400;
const CACHE_NAMESPACE = 'disease-dictionary';

@Injectable()
export class DiseaseDictionaryService {
  constructor(
    private readonly repository: DiseaseDictionaryRepository,
    private readonly cache: CacheService,
  ) {}

  async search(query?: string) {
    if (!query || query.length < 2) return [];

    const cacheKey = `search:${query.toLowerCase()}`;
    return this.cache.getOrSet(cacheKey, () => this.repository.search(query), {
      ttlSeconds: CACHE_TTL_SECONDS,
      namespace: CACHE_NAMESPACE,
    });
  }

  async findById(id: string) {
    const cacheKey = `id:${id}`;
    return this.cache.getOrSet(cacheKey, () => this.repository.findById(id), {
      ttlSeconds: CACHE_TTL_SECONDS,
      namespace: CACHE_NAMESPACE,
    });
  }
}
