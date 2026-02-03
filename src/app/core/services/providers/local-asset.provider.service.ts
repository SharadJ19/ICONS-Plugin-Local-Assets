// src/app/core/services/providers/local-asset.provider.service.ts
import { Injectable, Inject, InjectionToken } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { BaseProviderService } from './base-provider.service';
import { IconApiResponse, Icon } from '../../models/icon.model';
import { HttpClient } from '@angular/common/http';

// Create injection tokens for configuration
export interface ProviderConfig {
  name: string;
  displayName: string;
  path: string;
}

export const PROVIDER_CONFIG = new InjectionToken<ProviderConfig>('ProviderConfig');

@Injectable()
export class LocalAssetProviderService extends BaseProviderService {
  readonly name: string;
  readonly displayName: string;
  readonly baseUrl: string;
  
  private icons: Icon[] = [];
  private initialized = false;
  private iconCache = new Map<string, string>();

  constructor(
    private http: HttpClient,
    @Inject(PROVIDER_CONFIG) config: ProviderConfig
  ) {
    super();
    this.name = config.name;
    this.displayName = config.displayName;
    this.baseUrl = `/assets/icons/${config.path}`;
  }

initialize(): Observable<boolean> {
  if (this.initialized) {
    return of(true);
  }

  return this.http.get<any>(`${this.baseUrl}/manifest.json`).pipe(
    map(response => {
      // Handle both array and object responses
      const files = Array.isArray(response) 
        ? response 
        : (response.files || []);
      
      this.icons = files.map((fileName: string) => this.createIcon(fileName));
      this.initialized = true;
      console.log(`${this.displayName}: Loaded ${this.icons.length} icons from manifest`);
      return true;
    }),
    catchError(error => {
      console.warn(`Failed to load ${this.name} manifest:`, error);
      // Fallback: try to scan directory
      return this.scanDirectory().pipe(
        map(files => {
          this.icons = files.map(fileName => this.createIcon(fileName));
          this.initialized = true;
          console.log(`${this.displayName}: Scanned ${this.icons.length} icons`);
          return true;
        }),
        catchError(scanError => {
          console.error(`Failed to scan ${this.name} directory:`, scanError);
          this.icons = [];
          this.initialized = true;
          return of(true);
        })
      );
    })
  );
}

private scanDirectory(): Observable<string[]> {
  // This is a placeholder - you'll need to implement this properly
  // For now, return an empty array if manifest doesn't exist
  return of([]);
}

  private createIcon(fileName: string): Icon {
    const name = fileName.replace('.svg', '');
    return {
      id: `${this.name}_${name}_${Date.now()}`, // Add timestamp for uniqueness
      name: name,
      displayName: this.formatIconName(name),
      provider: this.name,
      path: `${this.baseUrl}/${fileName}`,
      svgContent: undefined
    };
  }

  search(query: string, limit: number = 10, offset: number = 0): Observable<IconApiResponse> {
    if (!this.initialized) {
      return this.initialize().pipe(
        map(() => this.performSearch(query, limit, offset))
      );
    }
    return of(this.performSearch(query, limit, offset));
  }

  getRandom(limit: number = 10, offset: number = 0): Observable<IconApiResponse> {
    if (!this.initialized) {
      return this.initialize().pipe(
        map(() => this.performRandom(limit, offset))
      );
    }
    return of(this.performRandom(limit, offset));
  }

  private performSearch(query: string, limit: number, offset: number): IconApiResponse {
    const filtered = query.trim() 
      ? this.icons.filter(icon => this.matchesSearch(icon.name, query))
      : [...this.icons];
    
    return this.paginate(filtered, limit, offset);
  }

  private performRandom(limit: number, offset: number): IconApiResponse {
    const shuffled = this.shuffleArray([...this.icons]);
    return this.paginate(shuffled, limit, offset);
  }

  private paginate(items: Icon[], limit: number, offset: number): IconApiResponse {
    const paginatedItems = items.slice(offset, offset + limit);
    
    return {
      data: paginatedItems,
      pagination: {
        total: items.length,
        count: paginatedItems.length,
        offset,
        hasNext: offset + paginatedItems.length < items.length
      }
    };
  }

  protected formatIconName(name: string): string {
    return name
      .split(/[-_]/)
      .map(word => this.capitalizeWord(word))
      .join(' ');
  }

  getSvgContent(icon: Icon): Observable<string> {
  const cacheKey = `${icon.provider}_${icon.name}`;
  
  if (this.iconCache.has(cacheKey)) {
    return of(this.iconCache.get(cacheKey)!);
  }

  return this.http.get(icon.path, { responseType: 'text' }).pipe(
    tap(svgContent => {
      this.iconCache.set(cacheKey, svgContent);
    }),
    catchError(error => {
      console.warn(`Failed to load SVG for ${icon.name} from ${icon.path}:`, error);
      // Try alternative paths
      const alternativePath = icon.path.replace('iconoir-regular-icons', 'iconoir');
      return this.http.get(alternativePath, { responseType: 'text' }).pipe(
        tap(svgContent => {
          this.iconCache.set(cacheKey, svgContent);
        }),
        catchError(altError => {
          console.error(`Failed to load SVG from alternative path:`, altError);
          const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff9100" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;
          this.iconCache.set(cacheKey, fallbackSvg);
          return of(fallbackSvg);
        })
      );
    })
  );
}
}