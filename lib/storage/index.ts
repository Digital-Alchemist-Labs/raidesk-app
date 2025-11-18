import { IStorageAdapter } from '@/types';
import { LocalStorageAdapter } from './localStorage';
import { SQLAdapter } from './sqlAdapter';

/**
 * Storage Factory
 * Creates the appropriate storage adapter based on configuration
 */
export function createStorageAdapter(type?: string): IStorageAdapter {
  const storageType = type || process.env.NEXT_PUBLIC_STORAGE_TYPE || 'localStorage';
  
  switch (storageType) {
    case 'sql':
      return new SQLAdapter();
    case 'localStorage':
    default:
      return new LocalStorageAdapter();
  }
}

export { LocalStorageAdapter, SQLAdapter };
export type { IStorageAdapter };


