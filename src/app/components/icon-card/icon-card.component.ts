// src/app/components/icon-card/icon-card.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Icon } from '../../core/models/icon.model';
import { DownloadService } from '../../core/services/download.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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

  private destroy$ = new Subject<void>();

  constructor(
    private downloadService: DownloadService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.loadSvg();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDownload(): void {
    this.download.emit(this.icon);
  }

  private loadSvg(): void {
    this.downloadService
      .getSvgContent(this.icon)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (content) => {
          const cleanContent = this.sanitizeSvg(content);
          this.svgContent =
            this.sanitizer.bypassSecurityTrustHtml(cleanContent);
        },
        error: () => {
          this.setFallbackSvg();
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
  }

  private sanitizeSvg(content: string): string {
    // Only remove dangerous content, don't modify SVG attributes
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/g, '')
      .replace(/href="javascript:/gi, 'href="#')
      .replace(/xlink:href="javascript:/gi, 'xlink:href="#');
  }
}