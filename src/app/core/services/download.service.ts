// PATH: src/app\core\services\download.service.ts

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Icon } from '../models/icon.model';

@Injectable({ providedIn: 'root' })
export class DownloadService {
  private isBrowser: boolean;

  constructor(
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
      if (icon.svgContent) {
        this.downloadSvgContent(icon.svgContent, this.getFileName(icon));
      } else {
        this.downloadFromUrl(icon.path, this.getFileName(icon));
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  }

  private downloadSvgContent(svgContent: string, fileName: string): void {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 100);
  }

  private downloadFromUrl(url: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
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
}



