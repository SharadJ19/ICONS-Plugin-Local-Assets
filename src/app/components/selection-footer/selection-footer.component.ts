// PATH: src/app\components\selection-footer\selection-footer.component.ts
import { Component, OnInit } from '@angular/core';
import { SelectionService } from '../../core/services/selection.service';
import { Icon } from '../../core/models/icon.model';
import { ProviderRegistryService } from '../../core/services/providers/provider-registry.service';
import { DownloadService } from '../../core/services/download.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { QlIframeMessageService } from '../../ql-plugin/ql-default-plugin/ql-iframe-message.service';
import { environment } from '../../../environments/environment';
import { EnvironmentService } from '../../core/services/environment.service';
import JSZip from 'jszip';

@Component({
  selector: 'app-selection-footer',
  templateUrl: './selection-footer.component.html',
  styleUrls: ['./selection-footer.component.css'],
  standalone: true,
  imports: [MatButtonModule, MatIconModule, NgIf],
})
export class SelectionFooterComponent implements OnInit {
  selectedCount = 0;
  selectedIcons: Icon[] = [];
  isVisible = false;
  
  // Feature flags
  enablePluginMode: boolean;
  
  // Target origin based on environment
  private readonly targetOrigin = environment.production 
    ? 'https://beta.quarklayout.com'
    : '*';

  constructor(
    private selectionService: SelectionService,
    private providerRegistry: ProviderRegistryService,
    private downloadService: DownloadService,
    private environmentService: EnvironmentService
  ) {
    this.enablePluginMode = this.environmentService.enablePluginMode;
  }

  ngOnInit(): void {
    this.selectionService.selectedIcons$.subscribe((icons) => {
      this.selectedIcons = icons;
      this.selectedCount = icons.length;
      this.isVisible = icons.length > 0;
    });
  }

  getSelectionHint(): string {
    if (this.selectedCount === 1) {
      return 'Click to select multiple, double-click for single';
    }
    return 'Click to select multiple';
  }

  getButtonText(): string {
    if (this.enablePluginMode) {
      return 'Add to Project';
    }
    return this.selectedCount === 1 ? 'Download SVG' : 'Download as ZIP';
  }

  getButtonIcon(): string {
    if (this.enablePluginMode) {
      return 'add';
    }
    return 'download';
  }

  async onActionClick(): Promise<void> {
    if (this.selectedIcons.length === 0) return;
    
    if (this.enablePluginMode) {
      await this.onAddToProject();
    } else {
      await this.onDownload();
    }
  }

  async onDownload(): Promise<void> {
    if (this.selectedIcons.length === 1) {
      // Single icon download
      await this.downloadService.downloadIcon(this.selectedIcons[0]);
    } else if (this.selectedIcons.length > 1) {
      // Multiple icons - create ZIP
      await this.downloadIconsAsZip(this.selectedIcons);
    }
    this.selectionService.clearSelection();
  }

  private async downloadIconsAsZip(icons: Icon[]): Promise<void> {
    try {
      const zip = new JSZip();
      const folder = zip.folder('icons');
      
      if (!folder) {
        throw new Error('Failed to create ZIP folder');
      }

      // Load all SVG contents and add to zip
      for (const icon of icons) {
        const svgContent = await this.getSvgContent(icon);
        const fileName = this.getFileName(icon);
        folder.file(fileName, svgContent);
      }

      // Generate zip file
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Download zip
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `icons_${new Date().getTime()}.zip`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error('Failed to create ZIP:', error);
    }
  }

  private getFileName(icon: Icon): string {
    const cleanName = icon.name
      .replace(/[^a-z0-9\s-]/gi, '')
      .replace(/\s+/g, '_')
      .toLowerCase();
    
    const providerAbbr = icon.provider.toLowerCase().substring(0, 3);
    return `${cleanName}_${providerAbbr}.svg`;
  }

  async onAddToProject(): Promise<void> {
    if (this.selectedIcons.length === 0) return;
    
    if (this.selectedIcons.length === 1) {
      await this.processSingleIcon(this.selectedIcons[0]);
    } else {
      await this.processMultipleIcons(this.selectedIcons);
    }
  }

  private async processSingleIcon(icon: Icon): Promise<void> {
    try {
      const svgContent = await this.getSvgContent(icon);
      const base64Data = this.convertSvgToBase64(svgContent);
      
      QlIframeMessageService.sendAddObject(
        base64Data,
        {
          name: icon.displayName,
          provider: icon.provider,
          fileName: `${icon.name}_${icon.provider.toLowerCase()}.svg`,
          plugin: 'Iconografix',
          version: '1.0.0',
          timestamp: new Date().toISOString()
        },
        this.targetOrigin
      );

      console.log(`✅ Sent stickerbox: ${icon.displayName}`);
      this.selectionService.clearSelection();
      
    } catch (error: unknown) {
      console.error('❌ Error:', error);
    }
  }

  private async processMultipleIcons(icons: Icon[]): Promise<void> {
    try {
      const firstIcon = icons[0];
      const svgContent = await this.getSvgContent(firstIcon);
      const base64Data = this.convertSvgToBase64(svgContent);
      
      QlIframeMessageService.sendAddObject(
        base64Data,
        {
          name: firstIcon.displayName,
          provider: firstIcon.provider,
          fileName: `${firstIcon.name}_${firstIcon.provider.toLowerCase()}.svg`,
          plugin: 'Iconografix',
          version: '1.0.0',
          batchTotal: icons.length,
          batchIndex: 1,
          message: `Selected ${icons.length} icons - adding first one`
        },
        this.targetOrigin
      );

      console.log(`✅ Sent first stickerbox from batch of ${icons.length}`);
      this.selectionService.clearSelection();
      
    } catch (error: unknown) {
      console.error('❌ Error:', error);
    }
  }

  private async getSvgContent(icon: Icon): Promise<string> {
    if (icon.svgContent) {
      return icon.svgContent;
    }

    const svgContent = await this.providerRegistry
      .getSvgContent(icon)
      .toPromise();
      
    if (!svgContent) {
      throw new Error('No SVG content received');
    }
    return svgContent;
  }

  private convertSvgToBase64(svgContent: string): string {
    const cleanSvg = svgContent
      .replace(/[\r\n]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const base64 = btoa(unescape(encodeURIComponent(cleanSvg)));
    return `data:image/svg+xml;base64,${base64}`;
  }

  onClearSelection(): void {
    this.selectionService.clearSelection();
  }
}