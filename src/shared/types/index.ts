// Global types for the application
export interface User {
    id: string;
    phoneNumber: string;
    name?: string;
    avatar?: string;
    email?: string;
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
    title?: string;
    content: string;
    thumbnail?: string;
    videoUrl?: string;
    mediaUris?: string[];
    url?: string;
    urlPreview?: {
        title?: string;
        description?: string;
        url: string;
    };
    poll?: {
        question: string;
        options: string[];
        closeHours?: number;
    };
    author: {
        id: string;
        name: string;
        avatar: string;
    };
    likes: number;
    comments: number;
    shares: number;
    isLiked: boolean;
    downvotes?: number;
    isDownvoted?: boolean;
    isSaved?: boolean;
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

export interface Comment {
    id: string;
    postId: string;
    parentCommentId?: string; // For replies
    author: {
        id: string;
        name: string;
        avatar: string;
    };
    content: string;
    upvotes: number;
    downvotes: number;
    isUpvoted: boolean;
    isDownvoted: boolean;
    replyCount: number;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
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
