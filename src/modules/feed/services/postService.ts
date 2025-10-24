import { FileUpload } from '@/shared/services/api/client';
import { mediaService } from './mediaService';

export interface CreatePostRequest {
  title?: string;
  content?: string;
  tags?: string[];
  media?: any[]; // FileUpload[] or MediaUploadResult[]
}

export class PostService {
  async createPost(data: CreatePostRequest) {
    // If media are FileUpload objects, upload first
    let mediaResults = data.media ?? [];

    const hasFileUploads = Array.isArray(data.media) && data.media.length > 0 && (data.media[0].uri !== undefined);

    if (hasFileUploads) {
      // Upload files first
      const files = data.media as unknown as FileUpload[];
      mediaResults = await mediaService.uploadMultipleMedia(files);
    }

    // Now create the post with the uploaded media results
    // This assumes the backend has a post creation endpoint that accepts media IDs/URLs
    const postData = {
      title: data.title,
      content: data.content,
      tags: data.tags,
      media: mediaResults, // Pass the uploaded media results
    };

    // For now, simulate post creation - replace with actual API call
    const result = await this.createPostViaApi(postData);
    return result;
  }

  private async createPostViaApi(data: any) {
    // Replace with actual API call to your backend
    // This should send title, content, tags, and media array with IDs/URLs
    return {
      postId: `post_${Date.now()}`,
      media: data.media,
    };
  }
}

export const postService = new PostService();
