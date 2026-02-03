import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Icon } from '../models/icon.model';

@Injectable({ providedIn: 'root' })
export class SelectionService {
  private selectedIcons = new Set<string>();
  private selectedIconsSubject = new BehaviorSubject<Icon[]>([]);
  private selectionModeSubject = new BehaviorSubject<'single' | 'multi'>('single');
  
  selectedIcons$ = this.selectedIconsSubject.asObservable();
  selectionMode$ = this.selectionModeSubject.asObservable();
  
  toggleIcon(icon: Icon): void {
    if (this.selectionModeSubject.value === 'single') {
      this.selectedIcons.clear();
      this.selectedIcons.add(icon.id);
    } else {
      if (this.selectedIcons.has(icon.id)) {
        this.selectedIcons.delete(icon.id);
      } else {
        this.selectedIcons.add(icon.id);
      }
    }
    this.emitSelectedIcons();
  }
  
  isSelected(icon: Icon): boolean {
    return this.selectedIcons.has(icon.id);
  }
  
  getSelectedCount(): number {
    return this.selectedIcons.size;
  }
  
  getSelectedIcons(): Icon[] {
    return Array.from(this.selectedIcons).map(id => ({ id } as Icon));
  }
  
  clearSelection(): void {
    this.selectedIcons.clear();
    this.emitSelectedIcons();
  }
  
  setSelectionMode(mode: 'single' | 'multi'): void {
    this.selectionModeSubject.next(mode);
    if (mode === 'single') {
      // If switching to single mode, keep only the first selected icon
      const firstId = Array.from(this.selectedIcons)[0];
      this.selectedIcons.clear();
      if (firstId) {
        this.selectedIcons.add(firstId);
      }
      this.emitSelectedIcons();
    }
  }
  
  private emitSelectedIcons(): void {
    const icons = Array.from(this.selectedIcons).map(id => ({ id } as Icon));
    this.selectedIconsSubject.next(icons);
  }
}