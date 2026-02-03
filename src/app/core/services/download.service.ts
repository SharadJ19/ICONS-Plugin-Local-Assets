// src/app/core/services/download.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Icon } from '../models/icon.model';

@Injectable({ providedIn: 'root' })
export class DownloadService {
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async downloadIcon(icon: Icon): Promise<void> {
    if (!this.isBrowser) {
      console.warn('Download is only supported in browser environment');
      return;
    }

    try {
      const response = await fetch(icon.downloadUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const svgContent = await response.text();
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const blobUrl = URL.createObjectURL(blob);
      
      this.triggerDownload(blobUrl, this.getFileName(icon));
      
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 100);
      
    } catch (error) {
      console.error('Download failed:', error);
      this.fallbackDownload(icon);
    }
  }

  private triggerDownload(blobUrl: string, fileName: string): void {
    if (!this.isBrowser) return;

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private fallbackDownload(icon: Icon): void {
    if (!this.isBrowser) return;

    const link = document.createElement('a');
    link.href = icon.downloadUrl;
    link.download = this.getFileName(icon);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private getFileName(icon: Icon): string {
    const cleanName = icon.name
      .replace(/[^a-z0-9\s-]/gi, '')
      .replace(/\s+/g, '_')
      .toLowerCase();
    
    const providerAbbr = icon.provider.toLowerCase().substring(0, 3);
    return `${cleanName}_${providerAbbr}.svg`;
  }

  getSvgContent(icon: Icon): Observable<string> {
    return this.http.get(icon.downloadUrl, { 
      responseType: 'text',
      headers: {
        'Accept': 'image/svg+xml'
      }
    }).pipe(
      catchError(error => {
        console.error('Failed to fetch SVG content:', error);
        return throwError(() => new Error('Failed to load SVG content'));
      })
    );
  }
}