import { Comment } from '@/shared/types';
import { create } from 'zustand';

interface CommentState {
  commentsByPost: Record<string, Comment[]>;
  isLoading: boolean;
  error: string | null;
}

interface CommentActions {
  setComments: (postId: string, comments: Comment[]) => void;
  addComment: (comment: Comment) => void;
  updateComment: (commentId: string, updates: Partial<Comment>) => void;
  deleteComment: (commentId: string) => void;
  getCommentsForPost: (postId: string) => Comment[];
  getRepliesForComment: (postId: string, parentCommentId: string) => Comment[];
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearCommentsForPost: (postId: string) => void;
}

type CommentStore = CommentState & CommentActions;

export const useCommentStore = create<CommentStore>((set, get) => ({
  // Initial state
  commentsByPost: {},
  isLoading: false,
  error: null,

  // Actions
  setComments: (postId, comments) => {
    set((state) => ({
      commentsByPost: {
        ...state.commentsByPost,
        [postId]: comments,
      },
    }));
  },

  addComment: (comment) => {
    set((state) => {
      const postComments = state.commentsByPost[comment.postId] || [];
      return {
        commentsByPost: {
          ...state.commentsByPost,
          [comment.postId]: [comment, ...postComments],
        },
      };
    });
  },

  updateComment: (commentId, updates) => {
    set((state) => {
      const updatedCommentsByPost = { ...state.commentsByPost };
      
      for (const postId in updatedCommentsByPost) {
        const comments = updatedCommentsByPost[postId];
        const index = comments.findIndex((c) => c.id === commentId);
        
        if (index !== -1) {
          const updatedComments = [...comments];
          updatedComments[index] = {
            ...updatedComments[index],
            ...updates,
            updatedAt: new Date(),
          };
          updatedCommentsByPost[postId] = updatedComments;
          break;
        }
      }
      
      return { commentsByPost: updatedCommentsByPost };
    });
  },

  deleteComment: (commentId) => {
    set((state) => {
      const updatedCommentsByPost = { ...state.commentsByPost };
      
      for (const postId in updatedCommentsByPost) {
        const comments = updatedCommentsByPost[postId];
        const index = comments.findIndex((c) => c.id === commentId);
        
        if (index !== -1) {
          const updatedComments = [...comments];
          updatedComments[index] = {
            ...updatedComments[index],
            isDeleted: true,
            content: '[deleted]',
            updatedAt: new Date(),
          };
          updatedCommentsByPost[postId] = updatedComments;
          break;
        }
      }
      
      return { commentsByPost: updatedCommentsByPost };
    });
  },

  getCommentsForPost: (postId) => {
    const comments = get().commentsByPost[postId] || [];
    return comments.filter((c) => !c.parentCommentId);
  },

  getRepliesForComment: (postId, parentCommentId) => {
    const comments = get().commentsByPost[postId] || [];
    return comments.filter((c) => c.parentCommentId === parentCommentId);
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearCommentsForPost: (postId) => {
    set((state) => {
      const updatedCommentsByPost = { ...state.commentsByPost };
      delete updatedCommentsByPost[postId];
      return { commentsByPost: updatedCommentsByPost };
    });
  },
}));
