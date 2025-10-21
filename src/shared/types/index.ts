// Global types for the application
export interface User {
    id: number;
    phoneNumber: string;
    name?: string;
    avatar?: string;
    isBiometricEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface FeedItem {
    id: string;
    type: 'video' | 'image' | 'text';
    content: string;
    thumbnail?: string;
    videoUrl?: string;
    author: {
        id: string;
        name: string;
        avatar: string;
    };
    likes: number;
    comments: number;
    shares: number;
    isLiked: boolean;
    createdAt: Date;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    isRead: boolean;
    createdAt: Date;
    actionUrl?: string;
}

export interface AdItem {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    actionUrl: string;
    type: 'banner' | 'interstitial' | 'native';
}

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
    error?: string;
}

export interface PaginationParams {
    page: number;
    limit: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
