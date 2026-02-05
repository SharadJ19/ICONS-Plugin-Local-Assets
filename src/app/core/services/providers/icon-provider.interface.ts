// src\app\core\services\providers\icon-provider.interface.ts

import { Observable } from 'rxjs';
import { IconApiResponse } from '../../models/icon.model';

export interface IconProvider {
  readonly name: string;
  readonly displayName: string;
  readonly baseUrl: string;

  search(
    query: string,
    limit: number,
    offset: number,
  ): Observable<IconApiResponse>;
  
  getRandom(
    limit: number,
    offset: number,
  ): Observable<IconApiResponse>;
}
