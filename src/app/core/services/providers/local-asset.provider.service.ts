// PATH: src/app\core\services\providers\local-asset.provider.service.ts

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { BaseProviderService } from './base-provider.service';
import { IconApiResponse, Icon } from '../../models/icon.model';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from '../environment.service';

export interface ProviderConfig {
  name: string;
  displayName: string;
  path: string;
}

export class LocalAssetProviderService extends BaseProviderService {
  readonly name: string;
  readonly displayName: string;
  readonly baseUrl: string;
  
  private icons: Icon[] = [];
  private initialized = false;
  private iconCache = new Map<string, { content: string; timestamp: number }>();

  constructor(
    private http: HttpClient,
    private environment: EnvironmentService,
    config: ProviderConfig 
  ) {
    super();
    this.name = config.name;
    this.displayName = config.displayName;
    this.baseUrl = `${this.environment.assetsPath}/${config.path}`;
  }

  initialize(): Observable<boolean> {
    if (this.initialized) {
      return of(true);
    }

    return this.http.get<any>(`${this.baseUrl}/manifest.json`).pipe(
      map(response => {
        const files = Array.isArray(response) 
          ? response 
          : (response.files || []);
        
        this.icons = files.map((fileName: string) => this.createIcon(fileName));
        this.initialized = true;
        return true;
      }),
      catchError(error => {
        if (this.environment.enableDebugLogging) {
          console.warn(`Failed to load ${this.name} manifest:`, error);
        }
        return this.scanDirectory().pipe(
          map(files => {
            this.icons = files.map(fileName => this.createIcon(fileName));
            this.initialized = true;
            return true;
          }),
          catchError(scanError => {
            if (this.environment.enableDebugLogging) {
              console.error(`Failed to scan ${this.name} directory:`, scanError);
            }
            this.icons = [];
            this.initialized = true;
            return of(true);
          })
        );
      })
    );
  }

  private scanDirectory(): Observable<string[]> {
    return of([]);
  }

  private createIcon(fileName: string): Icon {
    const name = fileName.replace('.svg', '');
    return {
      id: `${this.name}_${name}_${Date.now()}`,
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
    const now = Date.now();
    
    if (this.iconCache.has(cacheKey)) {
      const cached = this.iconCache.get(cacheKey)!;
      if (now - cached.timestamp < this.environment.svgCacheTimeout) {
        return of(cached.content);
      }
    }

    return this.http.get(icon.path, { responseType: 'text' }).pipe(
      tap(svgContent => {
        this.iconCache.set(cacheKey, {
          content: svgContent,
          timestamp: now
        });
      }),
      catchError(error => {
        if (this.environment.enableDebugLogging) {
          console.warn(`Failed to load SVG for ${icon.name} from ${icon.path}:`, error);
        }
        const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff9100" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;
        this.iconCache.set(cacheKey, {
          content: fallbackSvg,
          timestamp: now
        });
        return of(fallbackSvg);
      })
    );
  }
}



