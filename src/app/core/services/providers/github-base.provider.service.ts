// src/app/core/services/providers/github-base.provider.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';
import { BaseProviderService } from './base-provider.service';
import { IconApiResponse, Icon } from '../../models/icon.model';
import { GitHubApiResponse } from '../../models/api-response.model';
import { EnvironmentService } from '../environment.service';

@Injectable()
export abstract class GithubBaseProviderService extends BaseProviderService {
  protected abstract readonly repositoryPath: string;
  
  constructor(
    protected http: HttpClient,
    protected environment: EnvironmentService
  ) {
    super();
  }

  get baseUrl(): string {
    return `https://api.github.com/repos/${this.repositoryPath}`;
  }

  search(query: string, limit: number = 10, offset: number = 0): Observable<IconApiResponse> {
    return this.fetchIcons().pipe(
      map(response => this.filterAndPaginate(response, query, limit, offset)),
      catchError(error => this.handleError('search', offset, error))
    );
  }

  getRandom(limit: number = 10, offset: number = 0): Observable<IconApiResponse> {
    return this.fetchIcons().pipe(
      map(response => {
        const svgFiles = response.filter(item => 
          item.type === 'file' && item.name.endsWith('.svg')
        );
        const shuffled = this.shuffleArray(svgFiles);
        return this.paginate(shuffled, limit, offset);
      }),
      catchError(error => this.handleError('getRandom', offset, error))
    );
  }

  private fetchIcons(): Observable<GitHubApiResponse[]> {
    const headers = this.createHeaders();
    
    return this.http.get<GitHubApiResponse[]>(this.baseUrl, { headers }).pipe(
      timeout(this.environment.apiConfig.timeout),
      map(response => response.filter(item => item.type === 'file' && item.name.endsWith('.svg')))
    );
  }

  private filterAndPaginate(
    items: GitHubApiResponse[],
    query: string,
    limit: number,
    offset: number
  ): IconApiResponse {
    const filtered = query.trim() 
      ? items.filter(item => this.matchesSearch(item.name, query))
      : items;
    
    return this.paginate(filtered, limit, offset);
  }

  private paginate(
    items: GitHubApiResponse[],
    limit: number,
    offset: number
  ): IconApiResponse {
    const paginatedItems = items.slice(offset, offset + limit);
    
    return {
      data: paginatedItems.map(item => this.mapToIcon(item)),
      pagination: {
        total: items.length,
        count: paginatedItems.length,
        offset,
        hasNext: offset + paginatedItems.length < items.length
      }
    };
  }

  protected createHeaders(): HttpHeaders {
    const token = this.environment.githubToken;
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json'
    };
    
    if (token && token.trim()) {
      headers['Authorization'] = `token ${token}`;
    }
    
    return new HttpHeaders(headers);
  }

  protected mapToIcon(item: GitHubApiResponse): Icon {
    return {
      id: item.sha,
      name: item.name.replace('.svg', ''),
      displayName: this.formatIconName(item.name.replace('.svg', '')),
      url: item.html_url,
      downloadUrl: item.download_url,
      provider: this.name,
      size: item.size,
      path: item.path,
      svgContent: undefined
    };
  }
}