// src/app/components/selection-footer/selection-footer.component.ts
import { Component, OnInit } from '@angular/core';
import { SelectionService } from '../../core/services/selection.service';
import { Icon } from '../../core/models/icon.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-selection-footer',
  templateUrl: './selection-footer.component.html',
  styleUrls: ['./selection-footer.component.css'],
  standalone: true,  // Add this line
  imports: [MatButtonModule, MatIconModule]  // Add this line
})
export class SelectionFooterComponent implements OnInit {
  selectedCount = 0;
  selectedIcons: Icon[] = [];
  isVisible = false;
  
  constructor(private selectionService: SelectionService) {}
  
  ngOnInit(): void {
    this.selectionService.selectedIcons$.subscribe(icons => {
      this.selectedIcons = icons;
      this.selectedCount = icons.length;
      this.isVisible = icons.length > 0;
    });
  }
  
  onAddToProject(): void {
    const icons = this.selectedIcons;
    console.log('Add to project:', icons);
    // TODO: Implement project addition logic
    alert(`${icons.length} icon(s) added to project!`);
    this.selectionService.clearSelection();
  }
  
  onClearSelection(): void {
    this.selectionService.clearSelection();
  }
}