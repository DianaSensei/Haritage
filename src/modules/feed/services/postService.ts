import { FileUpload } from '@/shared/services/api/client';
import { mediaService } from './mediaService';

export interface CreatePostRequest {
  title?: string;
  content?: string;
  tags?: string[];
  media?: any[]; // media upload results
}

export class PostService {
  async createPost(data: CreatePostRequest) {
    // If media are FileUpload objects, upload first
    let mediaResults = data.media ?? [];

    const hasFileUploads = Array.isArray(data.media) && data.media.length > 0 && (data.media[0].uri !== undefined);

    if (hasFileUploads) {
      // Upload files
      const files = data.media as unknown as FileUpload[];
      mediaResults = await mediaService.uploadMultipleMedia(files);
    }

    // Use mediaService.createPostWithMedia which expects files and fields, but many backends support a single endpoint
    const result = await mediaService.createPostWithMedia(data.content || '', [] ,{
      tags: data.tags,
      visibility: 'public',
    } as any);

    // The implementation depends on backend; assume it returns { postId, media }
    return result;
  }
}

export const postService = new PostService();
