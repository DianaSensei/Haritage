/**
 * Data Service Factory
 * Provides centralized access to repositories
 * Can easily switch between mock and API implementations
 */

import { IDataRepository } from '@/shared/data/repositories/IRepository';
import { MockDataRepository } from '@/shared/data/repositories/MockRepository';

export enum DataSourceType {
  MOCK = 'mock',
  API = 'api',
}

class DataService {
  private repository: IDataRepository;
  private dataSourceType: DataSourceType;

  constructor(dataSourceType: DataSourceType = DataSourceType.MOCK) {
    this.dataSourceType = dataSourceType;
    this.repository = this.initializeRepository();
  }

  /**
   * Initialize the appropriate repository based on data source type
   */
  private initializeRepository(): IDataRepository {
    switch (this.dataSourceType) {
      case DataSourceType.MOCK:
        return new MockDataRepository();
      case DataSourceType.API:
        // TODO: Implement API repository
        // return new ApiDataRepository();
        return new MockDataRepository();
      default:
        return new MockDataRepository();
    }
  }

  /**
   * Get the current repository
   */
  getRepository(): IDataRepository {
    return this.repository;
  }

  /**
   * Switch data source at runtime
   */
  switchDataSource(dataSourceType: DataSourceType): void {
    this.dataSourceType = dataSourceType;
    this.repository = this.initializeRepository();
  }

  /**
   * Get current data source type
   */
  getCurrentDataSource(): DataSourceType {
    return this.dataSourceType;
  }
}

// Singleton instance
let dataServiceInstance: DataService | null = null;

/**
 * Get or create data service instance
 */
export function getDataService(dataSourceType?: DataSourceType): DataService {
  if (!dataServiceInstance) {
    dataServiceInstance = new DataService(dataSourceType);
  }
  return dataServiceInstance;
}

/**
 * Get repository directly
 */
export function getRepository() {
  return getDataService().getRepository();
}

/**
 * Convenience accessors for each repository
 */
export const userRepository = () => getRepository().user;
export const feedRepository = () => getRepository().feed;
export const notificationRepository = () => getRepository().notification;
