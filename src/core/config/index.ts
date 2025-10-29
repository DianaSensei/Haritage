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
        LANGUAGE_PREFERENCE: 'haritage.language_preference',
        SUPPORT_FAQ_CACHE: 'haritage.support_faq_cache',
        PIN_HASH: 'haritage.pin_hash',
        PIN_SETUP_REQUIRED: 'haritage.pin_setup_required',
        APP_LOCK_ENABLED: 'haritage.app_lock_enabled',
    },

    // App Lock settings
    APP_LOCK: {
        PIN_LENGTH: 6,
        MAX_ATTEMPTS: 3,
        COOLDOWN_SECONDS: 30,
        LOCK_TIMEOUT_MS: 0, // Immediate lock
    },
    NETWORK: {
        TIMEOUT_MS: 15000,
        RETRY_COUNT: 0,
    },
    SUPPORT: {
        PHONE_NUMBER: '+1-800-555-0100',
        EMAIL: 'support@haritage.com',
        FAQ_CACHE_MS: 1000 * 60 * 60, // 1 hour
    },
    // Asset references (local requires so bundler includes them)
    ASSETS: {
        DEFAULT_AVATAR: require('../../../assets/images/icon.png'),
    },
} as const;

export type Config = typeof CONFIG;

// Re-export theme configuration
export { Colors, Fonts } from './theme';
