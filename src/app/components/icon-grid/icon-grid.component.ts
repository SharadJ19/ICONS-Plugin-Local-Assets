// PATH: src/app\components\icon-grid\icon-grid.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Icon } from '../../core/models/icon.model';
import { DownloadService } from '../../core/services/download.service';
import { EnvironmentService } from '../../core/services/environment.service';
import { SelectionService } from '../../core/services/selection.service';

@Component({
  selector: 'app-icon-grid',
  templateUrl: './icon-grid.component.html',
  styleUrls: ['./icon-grid.component.css']
})
export class IconGridComponent {
  @Input() icons: Icon[] = [];
  @Input() isLoading = false;
  @Input() hasMore = false;
  @Input() currentProvider = '';
  @Input() currentMode: 'search' | 'random' = 'random';
  @Input() resultCountText = '';
  @Input() searchQuery: string | null = '';

  @Output() loadMore = new EventEmitter<void>();
  @Output() randomClick = new EventEmitter<void>();
  @Output() downloadIcon = new EventEmitter<Icon>();

  constructor(
    private downloadService: DownloadService,
    private environment: EnvironmentService,
    public selectionService: SelectionService,
  ) {}

  onDownload(icon: Icon): void {
    this.downloadService.downloadIcon(icon).catch((error) => {
      if (this.environment.enableDebugLogging) {
        console.error('Download failed:', error);
      }
    });
  }

  onRandom(): void {
    this.randomClick.emit();
  }

  onLoadMore(): void {
    this.loadMore.emit();
  }
}


