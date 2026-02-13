// src/app/components/selection-footer/selection-footer.component.ts

import { Component, OnInit } from '@angular/core';
import { SelectionService } from '../../core/services/selection.service';
import { Icon } from '../../core/models/icon.model';
import { ProviderRegistryService } from '../../core/services/providers/provider-registry.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { QlIframeMessageService } from '../../ql-plugin/ql-default-plugin/ql-iframe-message.service';
import { environment } from '../../../environments/environment';

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
  
  // Target origin based on environment
  private readonly targetOrigin = environment.production 
    ? 'https://beta.quarklayout.com'
    : '*';

  constructor(
    private selectionService: SelectionService,
    private providerRegistry: ProviderRegistryService,
  ) {}

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
      // 1. Get SVG content
      const svgContent = await this.getSvgContent(icon);
      
      // 2. Convert to Base64 data URL
      const base64Data = this.convertSvgToBase64(svgContent);
      
      // 3. ALWAYS STICKERBOX - NO CONDITIONS, NO CHECKS
      QlIframeMessageService.sendAddObject(
        base64Data,                    // dataString: Base64 SVG
        {                              // metaData: Any additional info
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
      // alert(`Failed to add icon: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processMultipleIcons(icons: Icon[]): Promise<void> {
    try {
      // SDK currently supports one icon at a time
      const firstIcon = icons[0];
      
      const svgContent = await this.getSvgContent(firstIcon);
      const base64Data = this.convertSvgToBase64(svgContent);
      
      // ALWAYS STICKERBOX - even for multiple icons
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
      
      // alert(`✓ Added "${firstIcon.displayName}" to project as stickerbox.`);
      
    } catch (error: unknown) {
      console.error('❌ Error:', error);
      // alert(`Failed to add icons: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  /**
   * Convert SVG string to Base64 data URL
   */
  private convertSvgToBase64(svgContent: string): string {
    // Clean the SVG
    const cleanSvg = svgContent
      .replace(/[\r\n]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Encode to Base64
    const base64 = btoa(unescape(encodeURIComponent(cleanSvg)));
    
    // Return as data URL
    return `data:image/svg+xml;base64,${base64}`;
  }

  onClearSelection(): void {
    this.selectionService.clearSelection();
  }
}