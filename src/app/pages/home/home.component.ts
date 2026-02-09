// src\app\pages\home\home.component.ts

import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  finalize,
} from 'rxjs';
import { Icon } from '../../core/models/icon.model';
import { IconApiResponse } from '../../core/models/icon.model';
import { ProviderRegistryService } from '../../core/services/providers/provider-registry.service';
import { DownloadService } from '../../core/services/download.service';
import { EnvironmentService } from '../../core/services/environment.service';
import { SelectionService } from '../../core/services/selection.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef;

  icons: Icon[] = [];
  searchControl = new FormControl('');
  isLoading = false;
  currentProvider = 'Iconoir';

  private offset = 0;
  private readonly limit = 30;
  hasMore = true;
  currentMode: 'search' | 'random' = 'random';
  private totalIcons = 0;

  private destroy$ = new Subject<void>();

  // Make selectionService public for template access
  constructor(
    private providerRegistry: ProviderRegistryService,
    private downloadService: DownloadService,
    private environment: EnvironmentService,
    public selectionService: SelectionService  // Changed to public
  ) {}

  ngOnInit(): void {
    this.setupSearch();
    this.setupProvider();
    this.loadRandomIcons();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        if (query && query.trim()) {
          this.onSearch(query);
        }
      });
  }

  private setupProvider(): void {
    const activeProvider = this.providerRegistry.getActiveProvider();
    if (activeProvider) {
      this.currentProvider = activeProvider.displayName;
    }
  }

  onSearch(query?: string): void {
    const searchQuery = query || this.searchControl.value || '';
    if (searchQuery.trim()) {
      this.currentMode = 'search';
      this.resetPagination();
      this.selectionService.clearSelection(); // Clear selection on new search
      this.loadSearchResults(searchQuery);
    }
  }

  onRandom(): void {
    this.currentMode = 'random';
    this.searchControl.setValue('');
    this.resetPagination();
    this.selectionService.clearSelection(); // Clear selection on random load
    this.loadRandomIcons();
  }

  onLoadMore(): void {
    if (this.hasMore && !this.isLoading) {
      this.offset += this.limit;

      if (this.currentMode === 'search') {
        this.loadSearchResults(this.searchControl.value || '');
      } else {
        this.loadRandomIcons();
      }
    }
  }

  onProviderChange(providerName: string): void {
    if (this.providerRegistry.setActiveProvider(providerName)) {
      const provider = this.providerRegistry.getActiveProvider();
      this.currentProvider = provider?.displayName || providerName;
      this.resetPagination();
      this.selectionService.clearSelection(); // Clear selection on provider change

      if (this.currentMode === 'search' && this.searchControl.value?.trim()) {
        this.loadSearchResults(this.searchControl.value);
      } else {
        this.loadRandomIcons();
      }
    }
  }

  onDownload(icon: Icon): void {
    this.downloadService.downloadIcon(icon).catch((error) => {
      console.error('Download failed:', error);
    });
  }

  private resetPagination(): void {
    this.offset = 0;
    this.icons = [];
    this.hasMore = true;
  }

  private loadSearchResults(query: string): void {
    this.isLoading = true;
    this.providerRegistry
      .search(query, this.limit, this.offset)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (response) => this.handleResponse(response),
        error: (error) => this.handleError(error),
      });
  }

  private loadRandomIcons(): void {
    this.isLoading = true;
    this.providerRegistry
      .getRandom(this.limit, this.offset)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (response) => this.handleResponse(response),
        error: (error) => this.handleError(error),
      });
  }

  private handleResponse(response: IconApiResponse): void {
    this.icons = [...this.icons, ...response.data];
    this.totalIcons = response.pagination.total;
    this.hasMore = response.pagination.hasNext;
  }

  private handleError(error: any): void {
    console.error('API Error:', error);
    this.hasMore = false;
  }

  getResultCountText(): string {
    if (this.isLoading) return 'Loading...';
    if (this.icons.length === 0) return 'No icons found';

    if (this.totalIcons > 0) {
      return `Showing ${this.icons.length} of ${this.totalIcons} icons`;
    }
    return `Showing ${this.icons.length} icons`;
  }
}