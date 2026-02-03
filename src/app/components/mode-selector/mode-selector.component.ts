// src/app/components/mode-selector/mode-selector.component.ts
import { Component, OnInit } from '@angular/core';
import { SelectionService } from '../../core/services/selection.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-mode-selector',
  templateUrl: './mode-selector.component.html',
  styleUrls: ['./mode-selector.component.css'],
  standalone: true,  // Add this line to make it standalone
  imports: [MatButtonModule, MatIconModule]  // Add this line
})
export class ModeSelectorComponent implements OnInit {
  currentMode: 'single' | 'multi' = 'single';
  
  constructor(private selectionService: SelectionService) {}
  
  ngOnInit(): void {
    this.selectionService.selectionMode$.subscribe(mode => {
      this.currentMode = mode;
    });
  }
  
  toggleMode(): void {
    const newMode = this.currentMode === 'single' ? 'multi' : 'single';
    this.selectionService.setSelectionMode(newMode);
  }
}