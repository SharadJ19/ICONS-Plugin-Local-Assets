// PATH: src/app\components\provider-selector\provider-selector.component.ts
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  HostListener,
  Input,
} from '@angular/core';
import { ProviderRegistryService } from '../../core/services/providers/provider-registry.service';

@Component({
  selector: 'app-provider-selector',
  templateUrl: './provider-selector.component.html',
  styleUrls: ['./provider-selector.component.css'],
})
export class ProviderSelectorComponent implements OnInit {
  providers: Array<{ name: string; displayName: string }> = [];
  selectedProvider = '';
  selectedDisplayName = '';
  isDropdownOpen = false;

  @Input() compact = false;
  @Output() providerChange = new EventEmitter<string>();

  constructor(private providerRegistry: ProviderRegistryService) {}

  ngOnInit(): void {
    this.providers = this.providerRegistry.getProviders();
    const activeProvider = this.providerRegistry.getActiveProvider();

    if (activeProvider) {
      this.selectedProvider = activeProvider.name;
      this.selectedDisplayName = activeProvider.displayName;
    } else if (this.providers.length > 0) {
      this.selectedProvider = this.providers[0].name;
      this.selectedDisplayName = this.providers[0].displayName;
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectProvider(providerName: string): void {
    this.selectedProvider = providerName;
    const provider = this.providers.find((p) => p.name === providerName);
    this.selectedDisplayName = provider?.displayName || providerName;
    this.isDropdownOpen = false;
    this.providerRegistry.setActiveProvider(providerName);
    this.providerChange.emit(providerName);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.provider-selector')) {
      this.isDropdownOpen = false;
    }
  }
}