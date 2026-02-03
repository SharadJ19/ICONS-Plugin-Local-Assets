// src/app/core/services/providers/iconoir.provider.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GithubBaseProviderService } from './github-base.provider.service';
import { EnvironmentService } from '../environment.service';

@Injectable({ providedIn: 'root' })
export class IconoirProviderService extends GithubBaseProviderService {
  readonly name = 'ICONOIR';
  readonly displayName = 'Iconoir';
  protected readonly repositoryPath = 'SharadJ19/free-svg-icons/contents/iconoir-regular-icons';

  constructor(
    http: HttpClient,
    environment: EnvironmentService
  ) {
    super(http, environment);
  }

  protected formatIconName(name: string): string {
    return name
      .split('-')
      .map(word => this.capitalizeWord(word))
      .join(' ');
  }
}