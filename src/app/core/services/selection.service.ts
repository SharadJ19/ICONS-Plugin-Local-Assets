// src\app\core\services\selection.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Icon } from '../models/icon.model';

@Injectable({ providedIn: 'root' })
export class SelectionService {
  private selectedIcons = new BehaviorSubject<Icon[]>([]);
  
  selectedIcons$ = this.selectedIcons.asObservable();
  
  toggleIcon(icon: Icon): void {
    const currentIcons = this.selectedIcons.value;
    const existingIndex = currentIcons.findIndex(i => i.id === icon.id);
    
    if (existingIndex > -1) {
      const newIcons = [...currentIcons];
      newIcons.splice(existingIndex, 1);
      this.selectedIcons.next(newIcons);
    } else {
      this.selectedIcons.next([...currentIcons, icon]);
    }
  }
  
  addIcon(icon: Icon): void {
    const currentIcons = this.selectedIcons.value;
    const existingIndex = currentIcons.findIndex(i => i.id === icon.id);
    
    if (existingIndex === -1) {
      this.selectedIcons.next([...currentIcons, icon]);
    }
  }
  
  removeIcon(icon: Icon): void {
    const currentIcons = this.selectedIcons.value;
    const existingIndex = currentIcons.findIndex(i => i.id === icon.id);
    
    if (existingIndex > -1) {
      const newIcons = [...currentIcons];
      newIcons.splice(existingIndex, 1);
      this.selectedIcons.next(newIcons);
    }
  }
  
  selectSingleIcon(icon: Icon): void {
    this.selectedIcons.next([icon]);
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
}