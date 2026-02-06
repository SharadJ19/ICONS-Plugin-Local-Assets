// src\app\components\selection-footer\selection-footer.component.ts

import { Component, OnInit } from '@angular/core';
import { SelectionService } from '../../core/services/selection.service';
import { Icon } from '../../core/models/icon.model';
import { ProviderRegistryService } from '../../core/services/providers/provider-registry.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-selection-footer',
  templateUrl: './selection-footer.component.html',
  styleUrls: ['./selection-footer.component.css'],
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
})
export class SelectionFooterComponent implements OnInit {
  selectedCount = 0;
  selectedIcons: Icon[] = [];
  isVisible = false;

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

  async onAddToProject(): Promise<void> {
    if (this.selectedIcons.length === 1) {
      await this.processSingleIcon(this.selectedIcons[0]);
    } else {
      alert(
        `${this.selectedIcons.length} icons selected - currently only single selection is supported`,
      );
    }
  }

  private async processSingleIcon(icon: Icon): Promise<void> {
    try {
      // Get SVG content
      const svgContent = await this.getSvgContent(icon);

      // Convert to base64
      const base64Data = this.convertSvgToBase64(svgContent);

      // Log base64 data to console
      console.log(base64Data);

      // Send to parent
      await this.sendToParent(base64Data, icon);

      // Clear selection
      this.selectionService.clearSelection();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to process icon';
      alert(`Error: ${message}`);
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

    const base64 = btoa(cleanSvg);
    return `data:image/svg+xml;base64,${base64}`;
  }

  private async sendToParent(base64Data: string, icon: Icon): Promise<void> {
    const metaData = {
      name: icon.displayName,
      provider: icon.provider,
      fileName: `${icon.name}_${icon.provider.toLowerCase()}.svg`,
    };

    if (window.parent !== window) {
      try {
        const { QlIframeMessageService } =
          await import('../../ql-plugin/ql-default-plugin/ql-iframe-message.service');
        QlIframeMessageService.sendMessageToParent({
          type: 'ADD_OBJECT',
          payload: {
            dataString: base64Data,
            type: 'stickerbox',
            metaData: metaData,
          },
        });
      } catch (error) {
        window.parent.postMessage(
          {
            type: 'ADD_OBJECT',
            payload: {
              dataString: base64Data,
              type: 'stickerbox',
              metaData: metaData,
            },
          },
          '*',
        );
      }
    } else {
      console.log(`Icon "${icon.displayName}" processed`);
    }
  }

  onClearSelection(): void {
    this.selectionService.clearSelection();
  }
}
