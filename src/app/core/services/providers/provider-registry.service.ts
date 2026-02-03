// src/app/core/services/providers/provider-registry.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IconApiResponse } from '../../models/icon.model';
import { IconProvider } from './icon-provider.interface';

export interface ProviderInfo {
  name: string;
  displayName: string;
  service: IconProvider;
}

@Injectable({ providedIn: 'root' })
export class ProviderRegistryService {
  private providers = new Map<string, ProviderInfo>();
  private activeProvider: string = '';

  registerProvider(name: string, displayName: string, service: IconProvider): void {
    this.providers.set(name, { name, displayName, service });
    
    if (!this.activeProvider) {
      this.activeProvider = name;
    }
  }

  setActiveProvider(name: string): boolean {
    if (this.providers.has(name)) {
      this.activeProvider = name;
      return true;
    }
    return false;
  }

  getActiveProvider(): ProviderInfo | undefined {
    return this.providers.get(this.activeProvider);
  }

  getProviders(): ProviderInfo[] {
    return Array.from(this.providers.values());
  }

  getProvider(name: string): ProviderInfo | undefined {
    return this.providers.get(name);
  }

  search(query: string, limit: number, offset: number): Observable<IconApiResponse> {
    const provider = this.getActiveProvider();
    if (!provider) {
      throw new Error('No active provider selected');
    }
    return provider.service.search(query, limit, offset);
  }

  getRandom(limit: number, offset: number): Observable<IconApiResponse> {
    const provider = this.getActiveProvider();
    if (!provider) {
      throw new Error('No active provider selected');
    }
    return provider.service.getRandom(limit, offset);
  }
}