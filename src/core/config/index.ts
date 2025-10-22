// Application configuration
export const CONFIG = {
    API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.haritage.com',
    APP_NAME: 'Haritage',
    VERSION: '1.0.0',

    // Authentication
    AUTH: {
        OTP_EXPIRY_MINUTES: 5,
        MAX_LOGIN_ATTEMPTS: 3,
        BIOMETRIC_TIMEOUT: 30000, // 30 seconds
    },

    // Video settings
    VIDEO: {
        AUTO_PLAY: true,
        MUTED_BY_DEFAULT: true,
        QUALITY: 'auto' as const,
    },

    // Feed settings
    FEED: {
        ITEMS_PER_PAGE: 10,
        REFRESH_INTERVAL: 30000, // 30 seconds
        CACHE_DURATION: 300000, // 5 minutes
    },

    // Notifications
    NOTIFICATIONS: {
        MAX_UNREAD: 50,
        AUTO_MARK_READ_DELAY: 5000, // 5 seconds
    },

    // Storage keys
    STORAGE_KEYS: {
        USER_TOKEN: 'haritage.user_token',
        USER_DATA: 'haritage.user_data',
        BIOMETRIC_ENABLED: 'haritage.biometric_enabled',
        THEME_PREFERENCE: 'haritage.theme_preference',
    },

    // Network
    NETWORK: {
        TIMEOUT_MS: 15000,
        RETRY_COUNT: 0,
    },
    // Asset references (local requires so bundler includes them)
    ASSETS: {
        DEFAULT_AVATAR: require('../../../assets/images/icon.png'),
    },
} as const;

export type Config = typeof CONFIG;

// Re-export theme configuration
export { Colors, Fonts } from './theme';
