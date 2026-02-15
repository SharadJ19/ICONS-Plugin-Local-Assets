// PATH: src/app\components\icon-browser\icon-browser.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { Icon } from '../../core/models/icon.model';
import { ProviderRegistryService } from '../../core/services/providers/provider-registry.service';
import { EnvironmentService } from '../../core/services/environment.service';
import { SelectionService } from '../../core/services/selection.service';

@Component({
  selector: 'app-icon-browser',
  templateUrl: './icon-browser.component.html',
  styleUrls: ['./icon-browser.component.css']
})
export class IconBrowserComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef;

  searchControl = new FormControl('');
  currentProvider = 'Iconoir';
  currentMode: 'search' | 'random' = 'random';
  
  // Grid state
  icons: Icon[] = [];
  isLoading = false;
  hasMore = true;
  totalIcons = 0;

  private offset = 0;
  private readonly limit: number;
  private destroy$ = new Subject<void>();

  constructor(
    private providerRegistry: ProviderRegistryService,
    private environment: EnvironmentService,
    public selectionService: SelectionService,
  ) {
    this.limit = this.environment.defaultLimit;
  }

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
      .pipe(
        debounceTime(this.environment.searchDebounceTime),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      )
      .subscribe((query) => {
        if (query?.trim()) {
          this.currentMode = 'search';
          this.resetPagination();
          this.selectionService.clearSelection();
          this.loadSearchResults(query);
        } else if (query === '' || query === null) {
          this.currentMode = 'random';
          this.resetPagination();
          this.selectionService.clearSelection();
          this.loadRandomIcons();
        }
      });
  }

  private setupProvider(): void {
    const activeProvider = this.providerRegistry.getActiveProvider();
    if (activeProvider) {
      this.currentProvider = activeProvider.displayName;
    }
  }

  clearSearch(): void {
    this.searchControl.setValue('', { emitEvent: true });
  }

  onSearch(query?: string): void {
    const searchQuery = query || this.searchControl.value || '';
    if (searchQuery.trim()) {
      this.currentMode = 'search';
      this.resetPagination();
      this.selectionService.clearSelection();
      this.loadSearchResults(searchQuery);
    }
  }

  onRandom(): void {
    this.currentMode = 'random';
    this.searchControl.setValue('', { emitEvent: false });
    this.resetPagination();
    this.selectionService.clearSelection();
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
      this.selectionService.clearSelection();

      if (this.currentMode === 'search' && this.searchControl.value?.trim()) {
        this.loadSearchResults(this.searchControl.value);
      } else {
        this.loadRandomIcons();
      }
    }
  }

  handleGridLoadMore(): void {
    this.onLoadMore();
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
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.icons = [...this.icons, ...response.data];
          this.totalIcons = response.pagination.total;
          this.hasMore = response.pagination.hasNext;
          this.isLoading = false;
        },
        error: () => {
          this.hasMore = false;
          this.isLoading = false;
        },
      });
  }

  private loadRandomIcons(): void {
    this.isLoading = true;
    this.providerRegistry
      .getRandom(this.limit, this.offset)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.icons = [...this.icons, ...response.data];
          this.totalIcons = response.pagination.total;
          this.hasMore = response.pagination.hasNext;
          this.isLoading = false;
        },
        error: () => {
          this.hasMore = false;
          this.isLoading = false;
        },
      });
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



