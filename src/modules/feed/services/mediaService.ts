import { FileUpload, FormDataOptions, http } from '@/shared/services/api/client';

export interface MediaUploadResult {
    id: string;
    url: string;
    type: 'image' | 'video';
    thumbnail?: string;
    duration?: number; // for videos
    size: number;
}

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

export class MediaService {
    private static instance: MediaService;

    static getInstance(): MediaService {
        if (!MediaService.instance) {
            MediaService.instance = new MediaService();
        }
        return MediaService.instance;
    }

    // Upload single image
    async uploadImage(
        imageFile: FileUpload,
        caption?: string,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<MediaUploadResult> {
        const formData: FormDataOptions = {
            fields: {
                type: 'image',
                caption: caption || '',
            },
            files: {
                image: imageFile,
            },
        };

        return await http.postForm<MediaUploadResult>('/media/upload', formData, {
            timeoutMs: 30000, // 30 seconds for images
        });
    }

    // Upload single video
    async uploadVideo(
        videoFile: FileUpload,
        caption?: string,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<MediaUploadResult> {
        const formData: FormDataOptions = {
            fields: {
                type: 'video',
                caption: caption || '',
            },
            files: {
                video: videoFile,
            },
        };

        return await http.postForm<MediaUploadResult>('/media/upload', formData, {
            timeoutMs: 120000, // 2 minutes for videos
        });
    }

    // Upload multiple media files
    async uploadMultipleMedia(
        files: FileUpload[],
        caption?: string,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<MediaUploadResult[]> {
        const formData: FormDataOptions = {
            fields: {
                type: 'mixed',
                caption: caption || '',
                count: files.length.toString(),
            },
            files: {
                media: files,
            },
        };

        return await http.postForm<MediaUploadResult[]>('/media/upload-multiple', formData, {
            timeoutMs: 180000, // 3 minutes for multiple files
        });
    }

    // Create post with media
    async createPostWithMedia(
        content: string,
        mediaFiles: FileUpload[],
        options: {
            location?: { lat: number; lng: number; name: string };
            tags?: string[];
            visibility?: 'public' | 'friends' | 'private';
        } = {}
    ): Promise<{ postId: string; media: MediaUploadResult[] }> {
        const formData: FormDataOptions = {
            fields: {
                content,
                visibility: options.visibility || 'public',
                tags: options.tags?.join(',') || '',
                ...(options.location && {
                    latitude: options.location.lat.toString(),
                    longitude: options.location.lng.toString(),
                    location_name: options.location.name,
                }),
            },
            files: {
                media: mediaFiles,
            },
        };

        return await http.postForm('/posts/create-with-media', formData, {
            timeoutMs: 300000, // 5 minutes for complex posts
        });
    }

    // Update post media
    async updatePostMedia(
        postId: string,
        mediaFiles: FileUpload[],
        removeMediaIds?: string[]
    ): Promise<MediaUploadResult[]> {
        const formData: FormDataOptions = {
            fields: {
                postId,
                action: 'update',
                removeIds: removeMediaIds?.join(',') || '',
            },
            files: {
                media: mediaFiles,
            },
        };

        return await http.postForm<MediaUploadResult[]>('/posts/update-media', formData);
    }

    // Delete media
    async deleteMedia(mediaId: string): Promise<void> {
        await http.delete(`/media/${mediaId}`);
    }

    // Get media info
    async getMediaInfo(mediaId: string): Promise<MediaUploadResult> {
        return await http.get<MediaUploadResult>(`/media/${mediaId}`);
    }

    // Generate thumbnail for video
    async generateVideoThumbnail(videoId: string, timestamp: number = 0): Promise<string> {
        const result = await http.postJson<{ thumbnailUrl: string }>('/media/generate-thumbnail', {
            videoId,
            timestamp,
        });
        return result.thumbnailUrl;
    }

    // Compress image before upload
    async compressImage(
        imageFile: FileUpload,
        quality: number = 0.8,
        maxWidth: number = 1920,
        maxHeight: number = 1080
    ): Promise<FileUpload> {
        // This would typically use a library like react-native-image-resizer
        // For now, return the original file
        return imageFile;
    }

    // Validate file before upload
    validateFile(file: FileUpload, type: 'image' | 'video'): { valid: boolean; error?: string } {
        const maxSize = type === 'image' ? 10 * 1024 * 1024 : 100 * 1024 * 1024; // 10MB for images, 100MB for videos
        const allowedTypes = type === 'image'
            ? ['image/jpeg', 'image/png', 'image/webp']
            : ['video/mp4', 'video/mov', 'video/avi'];

        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
            };
        }

        // Note: In a real implementation, you'd check file size here
        // For now, we'll assume the file size is valid
        return { valid: true };
    }
}

export const mediaService = MediaService.getInstance();
