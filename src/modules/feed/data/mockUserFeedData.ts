/**
 * Mock data for user feed management feature
 * Includes various feed item states for testing edit, hide, and delete flows
 */

import { FeedItem } from '@/shared/types';

/**
 * Mock user ID (current logged-in user)
 */
export const MOCK_CURRENT_USER_ID = 'user1';

/**
 * Mock feed items created by the current user
 * Includes various states: with/without media, polls, URLs
 */
export const mockUserFeedItems: FeedItem[] = [
  // Post with multiple images
  {
    id: 'user-post-1',
    type: 'image',
    title: 'Golden Hour Over the Coast',
    content:
      'The sky exploded with color tonight—definitely worth the detour after work. Captured a few frames before the light faded.',
    mediaUris: [
      'https://images.unsplash.com/photo-1501973801540-537f08ccae7b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
    ],
    author: {
      id: 'user1',
      name: 'Sarah Johnson',
      avatar:
        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60',
    },
    likes: 245,
    downvotes: 12,
    comments: 28,
    shares: 15,
    isLiked: false,
    isSaved: true,
    isHidden: false,
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    updatedAt: new Date(Date.now() - 3600000),
  },

  // Post with video
  {
    id: 'user-post-2',
    type: 'video',
    title: 'Morning Surf Session',
    content: 'Perfect waves this morning! The water was crystal clear.',
    videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    thumbnail:
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80',
    author: {
      id: 'user1',
      name: 'Sarah Johnson',
      avatar:
        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60',
    },
    likes: 189,
    downvotes: 5,
    comments: 42,
    shares: 23,
    isLiked: true,
    isSaved: false,
    isHidden: false,
    createdAt: new Date(Date.now() - 7200000), // 2 hours ago
    updatedAt: new Date(Date.now() - 7200000),
  },

  // Text-only post with poll
  {
    id: 'user-post-3',
    type: 'text',
    content:
      'Quick question for fellow photographers: What do you prefer for landscape shots?',
    poll: {
      question: 'Preferred landscape camera format',
      options: ['Full Frame DSLR', 'Mirrorless', 'Medium Format', 'Smartphone'],
      closeHours: 24,
    },
    author: {
      id: 'user1',
      name: 'Sarah Johnson',
      avatar:
        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60',
    },
    likes: 67,
    downvotes: 3,
    comments: 18,
    shares: 5,
    isLiked: false,
    isSaved: false,
    isHidden: false,
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000),
  },

  // Post with URL preview
  {
    id: 'user-post-4',
    type: 'text',
    content:
      'Found this amazing guide on post-processing techniques. Really helped improve my workflow!',
    url: 'https://example.com/photography-guide',
    urlPreview: {
      title: 'Complete Guide to Photo Post-Processing',
      description:
        'Learn professional techniques for editing landscape and portrait photography.',
      url: 'https://example.com/photography-guide',
    },
    author: {
      id: 'user1',
      name: 'Sarah Johnson',
      avatar:
        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60',
    },
    likes: 142,
    downvotes: 8,
    comments: 31,
    shares: 19,
    isLiked: false,
    isSaved: true,
    isHidden: false,
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
    updatedAt: new Date(Date.now() - 172800000),
  },

  // Post with single image and URL
  {
    id: 'user-post-5',
    type: 'image',
    title: 'Urban Exploration',
    content: 'Discovered this hidden gem in the city. Architecture from the 1920s.',
    mediaUris: [
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1200&q=80',
    ],
    url: 'https://example.com/urban-architecture',
    urlPreview: {
      title: 'Historic Buildings of Downtown',
      description: 'A walking tour of architectural masterpieces.',
      url: 'https://example.com/urban-architecture',
    },
    author: {
      id: 'user1',
      name: 'Sarah Johnson',
      avatar:
        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60',
    },
    likes: 98,
    downvotes: 4,
    comments: 12,
    shares: 8,
    isLiked: false,
    isSaved: false,
    isHidden: false,
    createdAt: new Date(Date.now() - 259200000), // 3 days ago
    updatedAt: new Date(Date.now() - 259200000),
  },

  // Simple text post
  {
    id: 'user-post-6',
    type: 'text',
    content:
      'Sometimes the best shots come from unexpected moments. Always keep your camera ready!',
    author: {
      id: 'user1',
      name: 'Sarah Johnson',
      avatar:
        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60',
    },
    likes: 156,
    downvotes: 2,
    comments: 24,
    shares: 11,
    isLiked: true,
    isSaved: false,
    isHidden: false,
    createdAt: new Date(Date.now() - 345600000), // 4 days ago
    updatedAt: new Date(Date.now() - 345600000),
  },

  // Hidden post example
  {
    id: 'user-post-7',
    type: 'image',
    title: 'Test Post - Hidden',
    content: 'This post is hidden from the public feed.',
    mediaUris: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
    ],
    author: {
      id: 'user1',
      name: 'Sarah Johnson',
      avatar:
        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60',
    },
    likes: 23,
    downvotes: 1,
    comments: 5,
    shares: 2,
    isLiked: false,
    isSaved: false,
    isHidden: true,
    createdAt: new Date(Date.now() - 432000000), // 5 days ago
    updatedAt: new Date(Date.now() - 432000000),
  },

  // Post with closed poll
  {
    id: 'user-post-8',
    type: 'text',
    content: 'What time of day do you prefer for shooting?',
    poll: {
      question: 'Best time for photography',
      options: ['Golden Hour', 'Blue Hour', 'Midday', 'Night'],
      closeHours: 0, // Poll closed
    },
    author: {
      id: 'user1',
      name: 'Sarah Johnson',
      avatar:
        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60',
    },
    likes: 203,
    downvotes: 7,
    comments: 56,
    shares: 14,
    isLiked: false,
    isSaved: true,
    isHidden: false,
    createdAt: new Date(Date.now() - 604800000), // 7 days ago
    updatedAt: new Date(Date.now() - 604800000),
  },

  // Post with video and multiple media
  {
    id: 'user-post-9',
    type: 'video',
    title: 'Behind the Scenes',
    content: 'Setting up for a portrait shoot. Check out the setup!',
    videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    thumbnail:
      'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80',
    mediaUris: [
      'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80',
    ],
    author: {
      id: 'user1',
      name: 'Sarah Johnson',
      avatar:
        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60',
    },
    likes: 312,
    downvotes: 9,
    comments: 67,
    shares: 28,
    isLiked: true,
    isSaved: true,
    isHidden: false,
    createdAt: new Date(Date.now() - 691200000), // 8 days ago
    updatedAt: new Date(Date.now() - 691200000),
  },
];
