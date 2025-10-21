import { FileUpload, FormDataOptions, http } from './client';

// Example usage of different POST methods and file uploads

export class ApiExamples {
    // 1. Basic JSON POST
    static async createPost(title: string, content: string) {
        return await http.postJson('/posts', {
            title,
            content,
            published: true,
        });
    }

    // 2. Form data with files
    static async uploadProfilePicture(userId: string, imageFile: FileUpload) {
        const formData: FormDataOptions = {
            fields: {
                userId,
                type: 'profile',
            },
            files: {
                image: imageFile,
            },
        };

        return await http.postForm('/users/upload-avatar', formData);
    }

    // 3. Multiple files upload
    static async uploadMultipleImages(postId: string, images: FileUpload[]) {
        const formData: FormDataOptions = {
            fields: {
                postId,
                category: 'gallery',
            },
            files: {
                images, // Array of files
            },
        };

        return await http.postForm('/posts/upload-images', formData);
    }

    // 4. Mixed form data with multiple file types
    static async createPostWithMedia(
        title: string,
        content: string,
        images: FileUpload[],
        video?: FileUpload
    ) {
        const formData: FormDataOptions = {
            fields: {
                title,
                content,
                type: 'media_post',
            },
            files: {
                images,
                ...(video && { video }),
            },
        };

        return await http.postForm('/posts/create-with-media', formData);
    }

    // 5. URL-encoded form data
    static async loginWithCredentials(email: string, password: string) {
        return await http.postUrlEncoded('/auth/login', {
            email,
            password,
            remember: 'true',
        });
    }

    // 6. Plain text POST
    static async sendRawData(data: string) {
        return await http.postText('/data/raw', data);
    }

    // 7. POST with custom headers and timeout
    static async uploadLargeFile(file: FileUpload, onProgress?: (progress: number) => void) {
        return await http.postForm('/files/upload-large', {
            files: { file },
        }, {
            timeoutMs: 60000, // 60 seconds for large files
            headers: {
                'X-Upload-Type': 'large-file',
            },
        });
    }

    // 8. POST with query parameters
    static async searchPosts(query: string, filters: Record<string, string>) {
        return await http.postJson('/posts/search', {
            query,
            filters,
        }, {
            query: {
                page: 1,
                limit: 20,
                sort: 'recent',
            },
        });
    }

    // 9. File upload with progress tracking
    static async uploadWithProgress(
        files: FileUpload[],
        onProgress: (loaded: number, total: number) => void
    ) {
        // Note: Progress tracking would need to be implemented with XMLHttpRequest
        // This is a simplified example
        return await http.postForm('/files/upload', {
            files: { files },
        });
    }

    // 10. Batch operations
    static async batchUpload(files: FileUpload[], metadata: Record<string, string>[]) {
        const formData: FormDataOptions = {
            fields: {
                batch: 'true',
                count: files.length.toString(),
            },
            files: {
                files,
            },
        };

        return await http.postForm('/files/batch-upload', formData);
    }
}

// Usage examples:

/*
// Single file upload
const result = await ApiExamples.uploadProfilePicture('user123', {
  uri: 'file://path/to/image.jpg',
  name: 'profile.jpg',
  type: 'image/jpeg',
});

// Multiple files upload
const images = [
  { uri: 'file://path/to/image1.jpg', name: 'image1.jpg', type: 'image/jpeg' },
  { uri: 'file://path/to/image2.jpg', name: 'image2.jpg', type: 'image/jpeg' },
];
const result = await ApiExamples.uploadMultipleImages('post123', images);

// Mixed content upload
const postResult = await ApiExamples.createPostWithMedia(
  'My Post',
  'Check out these photos!',
  images,
  { uri: 'file://path/to/video.mp4', name: 'video.mp4', type: 'video/mp4' }
);

// JSON POST
const newPost = await ApiExamples.createPost('Hello World', 'This is my first post');

// Form data POST
const loginResult = await ApiExamples.loginWithCredentials('user@example.com', 'password123');
*/
