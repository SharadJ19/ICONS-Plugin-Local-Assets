// src\app\components\icon-card\icon-card.component.ts

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { Icon } from '../../core/models/icon.model';
import { DownloadService } from '../../core/services/download.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ProviderRegistryService } from '../../core/services/providers/provider-registry.service';
import { SelectionService } from '../../core/services/selection.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-icon-card',
  templateUrl: './icon-card.component.html',
  styleUrls: ['./icon-card.component.css'],
})
export class IconCardComponent implements OnInit, OnDestroy {
  @Input() icon!: Icon;
  @Output() download = new EventEmitter<Icon>();

  svgContent: SafeHtml = '';
  isLoading = true;
  isSelected = false;
  private lastClickTime = 0;
  private readonly DOUBLE_CLICK_THRESHOLD = 300; // ms

  private destroy$ = new Subject<void>();

  constructor(
    private downloadService: DownloadService,
    private sanitizer: DomSanitizer,
    private providerRegistry: ProviderRegistryService,
    private selectionService: SelectionService
  ) {}

  ngOnInit(): void {
    this.loadSvg();
    
    // Subscribe to selection changes
    this.selectionService.selectedIcons$
      .pipe(takeUntil(this.destroy$))
      .subscribe(icons => {
        this.isSelected = icons.some(selectedIcon => selectedIcon.id === this.icon.id);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCardClick(event: MouseEvent): void {
    const currentTime = Date.now();
    
    // If clicking on the checkbox, always toggle selection
    if ((event.target as HTMLElement).closest('.selection-checkbox')) {
      event.stopPropagation();
      this.toggleSelection();
      return;
    }
    
    // Check if this is a double click
    if (currentTime - this.lastClickTime < this.DOUBLE_CLICK_THRESHOLD) {
      // Double click - select single and clear others
      this.selectionService.clearSelection();
      this.selectionService.addIcon(this.icon);
      this.lastClickTime = 0; // Reset to prevent triple-click issues
    } else {
      // Single click - just add this icon to selection (multi-select)
      this.toggleSelection();
      this.lastClickTime = currentTime;
    }
  }

  toggleSelection(): void {
    if (this.isSelected) {
      this.selectionService.removeIcon(this.icon);
    } else {
      this.selectionService.addIcon(this.icon);
    }
  }

  onDownload(): void {
    this.download.emit(this.icon);
  }

  private loadSvg(): void {
    this.providerRegistry
      .getSvgContent(this.icon)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (content) => {
          const cleanContent = this.sanitizeSvg(content);
          this.svgContent =
            this.sanitizer.bypassSecurityTrustHtml(cleanContent);
          this.isLoading = false;
          // Store the SVG content for download
          this.icon.svgContent = content;
        },
        error: () => {
          this.setFallbackSvg();
          this.isLoading = false;
        },
      });
  }

  private setFallbackSvg(): void {
    const fallbackSvg = `
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ff9100" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>`;
    this.svgContent = this.sanitizer.bypassSecurityTrustHtml(fallbackSvg);
    this.icon.svgContent = fallbackSvg;
  }

  private sanitizeSvg(content: string): string {
    // Only remove dangerous content, don't modify SVG attributes
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/g, '')
      .replace(/href="javascript:/gi, 'href="#')
      .replace(/xlink:href="javascript:/gi, 'xlink:href="#');
  }

  // Add this method to the IconCardComponent class

  getTooltipText(): string {
    const baseText = this.icon.displayName;
    if (this.isSelected) {
      return `${baseText} (Selected) - Double-click to select only this icon`;
    }
    return `${baseText} - Click to select, double-click to select only this`;
  }
}