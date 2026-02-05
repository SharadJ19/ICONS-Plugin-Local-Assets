// src\app\core\services\selection.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Icon } from '../models/icon.model';

@Injectable({ providedIn: 'root' })
export class SelectionService {
  private selectedIcons = new BehaviorSubject<Icon[]>([]);
  private selectionModeSubject = new BehaviorSubject<'single' | 'multi'>('single');
  
  selectedIcons$ = this.selectedIcons.asObservable();
  selectionMode$ = this.selectionModeSubject.asObservable();
  
  toggleIcon(icon: Icon): void {
    const currentIcons = this.selectedIcons.value;
    
    if (this.selectionModeSubject.value === 'single') {
      // For single mode, replace with the new icon
      this.selectedIcons.next([icon]);
    } else {
      // For multi mode, toggle the icon
      const existingIndex = currentIcons.findIndex(i => i.id === icon.id);
      if (existingIndex > -1) {
        // Remove if already selected
        const newIcons = [...currentIcons];
        newIcons.splice(existingIndex, 1);
        this.selectedIcons.next(newIcons);
      } else {
        // Add if not selected
        this.selectedIcons.next([...currentIcons, icon]);
      }
    }
  }
  
  isSelected(icon: Icon): boolean {
    return this.selectedIcons.value.some(selectedIcon => selectedIcon.id === icon.id);
  }
  
  getSelectedCount(): number {
    return this.selectedIcons.value.length;
  }
  
  getSelectedIcons(): Icon[] {
    return this.selectedIcons.value;
  }
  
  clearSelection(): void {
    this.selectedIcons.next([]);
  }
  
  setSelectionMode(mode: 'single' | 'multi'): void {
    this.selectionModeSubject.next(mode);
    if (mode === 'single') {
      // If switching to single mode, keep only the first selected icon
      const currentIcons = this.selectedIcons.value;
      if (currentIcons.length > 1) {
        this.selectedIcons.next([currentIcons[0]]);
      }
    }
  }
}
