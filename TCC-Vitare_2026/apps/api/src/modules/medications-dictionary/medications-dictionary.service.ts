import { Injectable } from '@nestjs/common';
import { CacheService } from '../../infra/cache/cache.service';
import { MedicationsDictionaryRepository } from './repositories/medications-dictionary.repository';

const CACHE_TTL_SECONDS = 86400;
const CACHE_NAMESPACE = 'medications-dictionary';

@Injectable()
export class MedicationsDictionaryService {
  constructor(
    private readonly repository: MedicationsDictionaryRepository,
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
