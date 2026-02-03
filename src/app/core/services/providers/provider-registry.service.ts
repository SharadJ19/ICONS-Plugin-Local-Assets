// src/app/core/services/providers/provider-registry.service.ts
import { Injectable, Injector, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, forkJoin, of, BehaviorSubject } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { IconApiResponse } from '../../models/icon.model';
import { IconProvider } from './icon-provider.interface';
import { LocalAssetProviderService, PROVIDER_CONFIG } from './local-asset.provider.service';
import { HttpClient } from '@angular/common/http';

interface ProviderInfo {
  name: string;
  displayName: string;
  path: string;
  service: LocalAssetProviderService;
}

@Injectable({ providedIn: 'root' })
export class ProviderRegistryService {
  private providers = new Map<string, ProviderInfo>();
  private activeProvider: string = 'ICONOIR';
  private providersSubject = new BehaviorSubject<ProviderInfo[]>([]);
  private initialized = false;
  private isBrowser: boolean;

  constructor(
    private injector: Injector,
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Define all providers
    const providersConfig = [
    { name: 'BOOTSTRAP', displayName: 'Bootstrap', path: 'bootstrap' },
    { name: 'FEATHER', displayName: 'Feather', path: 'feather' },
    { name: 'GILBARBARA', displayName: 'Gilbarbara', path: 'gilbarbara' },
    { name: 'HEROICONS', displayName: 'Heroicons', path: 'heroicons-24-solid' },
    { name: 'ICONOIR', displayName: 'Iconoir', path: 'iconoir' }, // Changed
    { name: 'SIMPLE_ICONS', displayName: 'Simple Icons', path: 'simple-icons' },
    { name: 'BRAND_LOGOS', displayName: 'Brand Logos', path: 'simple-svg-brand-logos' }, // Changed
    { name: 'TABLER', displayName: 'Tabler', path: 'tabler' } // Changed
  ];

    // Create instances for each provider
    providersConfig.forEach(config => {
      const provider = this.createProviderInstance(config);
      this.providers.set(config.name, {
        name: config.name,
        displayName: config.displayName,
        path: config.path,
        service: provider
      });
    });

    // Initialize all providers
    this.initializeAllProviders().subscribe({
      next: () => {
        this.initialized = true;
        console.log('All providers initialized');
        this.providersSubject.next(this.getProvidersList());
      },
      error: (error) => {
        console.error('Failed to initialize providers:', error);
      }
    });
  }

  private createProviderInstance(config: { name: string; displayName: string; path: string }): LocalAssetProviderService {
    // Create a factory for the provider with its config
    return new LocalAssetProviderService(
      this.http,
      { name: config.name, displayName: config.displayName, path: config.path }
    );
  }

  private initializeAllProviders(): Observable<void[]> {
    const initializationObservables: Observable<void>[] = [];
    
    this.providers.forEach(providerInfo => {
      const initObs = providerInfo.service.initialize().pipe(
        map(() => void 0),
        catchError(error => {
          console.error(`Failed to initialize ${providerInfo.name}:`, error);
          return of(void 0);
        })
      );
      initializationObservables.push(initObs);
    });

    return forkJoin(initializationObservables);
  }

  getProviders(): Array<{ name: string; displayName: string }> {
    return Array.from(this.providers.values()).map(provider => ({
      name: provider.name,
      displayName: provider.displayName
    }));
  }

  private getProvidersList(): ProviderInfo[] {
    return Array.from(this.providers.values());
  }

  getActiveProvider(): ProviderInfo | undefined {
    return this.providers.get(this.activeProvider);
  }

  setActiveProvider(name: string): boolean {
    if (this.providers.has(name)) {
      this.activeProvider = name;
      return true;
    }
    return false;
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

  getSvgContent(icon: any): Observable<string> {
    const provider = this.providers.get(icon.provider);
    if (!provider) {
      console.error(`Provider not found: ${icon.provider}`);
      return of('');
    }
    return provider.service.getSvgContent(icon);
  }

  getProviderStats(): Array<{ name: string; displayName: string; count: number }> {
    const stats: Array<{ name: string; displayName: string; count: number }> = [];
    
    this.providers.forEach(providerInfo => {
      // Access the internal icons array (you might need to expose this)
      const iconCount = (providerInfo.service as any).icons?.length || 0;
      stats.push({
        name: providerInfo.name,
        displayName: providerInfo.displayName,
        count: iconCount
      });
    });
    
    return stats;
  }
}