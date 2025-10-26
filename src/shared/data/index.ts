/**
 * Data Layer Exports
 * Central export point for all data layer components
 */

// Repository interfaces
export * from './repositories/IRepository';

// Mock implementations
export * from './repositories/MockRepository';

// Mock store
export { mockStore } from './stores/mockDataStore';

// Data service
export {
    DataSourceType, feedRepository, getDataService,
    getRepository, notificationRepository, userRepository
} from './dataService';

// Data hooks
export * from './hooks/useData';
