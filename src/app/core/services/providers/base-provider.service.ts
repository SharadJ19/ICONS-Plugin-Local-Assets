// PATH: src/app\core\services\providers\base-provider.service.ts

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IconApiResponse } from '../../models/icon.model';

@Injectable()
export abstract class BaseProviderService {
  abstract readonly name: string;
  abstract readonly displayName: string;
  abstract readonly baseUrl: string;

  protected abstract formatIconName(name: string): string;

  protected matchesSearch(fileName: string, query: string): boolean {
    if (!query.trim()) return true;
    
    const cleanName = fileName.replace('.svg', '').toLowerCase();
    const cleanQuery = query.toLowerCase().trim();
    
    return cleanName.includes(cleanQuery) || 
           cleanName.replace(/[-_]/g, ' ').includes(cleanQuery);
  }

  protected shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  protected handleError(operation: string, offset: number, error: any): Observable<IconApiResponse> {
    console.error(`${this.name} ${operation} error:`, error);
    
    return of({
      data: [],
      pagination: { 
        total: 0, 
        count: 0, 
        offset, 
        hasNext: false 
      }
    });
  }

  protected capitalizeWord(word: string): string {
    const specialCases: Record<string, string> = {
      'ai': 'AI',
      'css': 'CSS',
      'html': 'HTML',
      'svg': 'SVG',
      'ui': 'UI',
      'ux': 'UX',
      'api': 'API',
      'url': 'URL',
      '2d': '2D',
      '3d': '3D',
      'js': 'JS',
      'ts': 'TS',
      'php': 'PHP',
      'py': 'Python',
      'java': 'Java',
      'csharp': 'C#',
      'cpp': 'C++',
      'go': 'Go',
      'rust': 'Rust',
      'ios': 'iOS',
      'android': 'Android',
      'macos': 'macOS',
      'windows': 'Windows',
      'linux': 'Linux',
      'aws': 'AWS',
      'azure': 'Azure',
      'gcp': 'GCP',
      'json': 'JSON',
      'xml': 'XML',
      'db': 'DB',
      'sql': 'SQL',
      'nosql': 'NoSQL'
    };

    const lowerWord = word.toLowerCase();
    return specialCases[lowerWord] || 
           word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
}