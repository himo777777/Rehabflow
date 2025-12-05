// ============================================================================
// FORUM SERVICE
// ============================================================================
// Service for managing the provider community forum including posts, comments,
// likes, bookmarks, and search functionality.

import { supabase } from './supabaseClient';

// ============================================================================
// TYPES
// ============================================================================

export type PostType = 'discussion' | 'case_study' | 'question' | 'tip' | 'announcement';
export type PostStatus = 'draft' | 'pending' | 'published' | 'hidden' | 'deleted';
export type CommentStatus = 'published' | 'hidden' | 'deleted';

export interface CaseStudyData {
  ageRange?: string;
  gender?: string;
  diagnosis?: string;
  duration?: string;
  treatmentApproach?: string;
  outcome?: string;
  keyLearnings?: string[];
  anonymized?: boolean;
}

export interface ForumPost {
  id: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  title: string;
  content: string;
  excerpt?: string;
  postType: PostType;
  tags: string[];
  conditionTags: string[];
  caseData?: CaseStudyData;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  isPinned: boolean;
  isSolved: boolean;
  isFeatured: boolean;
  isLocked: boolean;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  isLikedByUser?: boolean;
  isBookmarkedByUser?: boolean;
}

export interface ForumComment {
  id: string;
  postId: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  parentId?: string;
  content: string;
  isSolution: boolean;
  isEdited: boolean;
  likeCount: number;
  status: CommentStatus;
  createdAt: string;
  updatedAt: string;
  isLikedByUser?: boolean;
  replies?: ForumComment[];
}

export interface ForumTag {
  id: string;
  name: string;
  category: 'general' | 'condition' | 'treatment' | 'specialty';
  description?: string;
  usageCount: number;
}

export interface ForumStats {
  totalPosts: number;
  totalComments: number;
  totalUsers: number;
  postsThisWeek: number;
  solvedQuestions: number;
  popularTags: { tag: string; count: number }[];
}

export interface CreatePostInput {
  title: string;
  content: string;
  postType: PostType;
  tags?: string[];
  conditionTags?: string[];
  caseData?: CaseStudyData;
  status?: PostStatus;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  tags?: string[];
  conditionTags?: string[];
  caseData?: CaseStudyData;
}

export interface SearchPostsParams {
  query?: string;
  postType?: PostType;
  tags?: string[];
  authorId?: string;
  isSolved?: boolean;
  limit?: number;
  offset?: number;
}

export interface ForumListResponse {
  posts: ForumPost[];
  totalCount: number;
  hasMore: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function mapPostFromDB(data: Record<string, unknown>, userId?: string): ForumPost {
  return {
    id: data.id as string,
    authorId: data.author_id as string,
    authorName: data.author_name as string | undefined,
    authorAvatar: data.author_avatar as string | undefined,
    title: data.title as string,
    content: data.content as string,
    excerpt: data.excerpt as string | undefined,
    postType: data.post_type as PostType,
    tags: (data.tags as string[]) || [],
    conditionTags: (data.condition_tags as string[]) || [],
    caseData: data.case_data as CaseStudyData | undefined,
    viewCount: (data.view_count as number) || 0,
    likeCount: (data.like_count as number) || 0,
    commentCount: (data.comment_count as number) || 0,
    bookmarkCount: (data.bookmark_count as number) || 0,
    isPinned: (data.is_pinned as boolean) || false,
    isSolved: (data.is_solved as boolean) || false,
    isFeatured: (data.is_featured as boolean) || false,
    isLocked: (data.is_locked as boolean) || false,
    status: (data.status as PostStatus) || 'published',
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    lastActivityAt: data.last_activity_at as string,
    isLikedByUser: data.is_liked_by_user as boolean | undefined,
    isBookmarkedByUser: data.is_bookmarked_by_user as boolean | undefined
  };
}

function mapCommentFromDB(data: Record<string, unknown>): ForumComment {
  return {
    id: data.id as string,
    postId: data.post_id as string,
    authorId: data.author_id as string,
    authorName: data.author_name as string | undefined,
    authorAvatar: data.author_avatar as string | undefined,
    parentId: data.parent_id as string | undefined,
    content: data.content as string,
    isSolution: (data.is_solution as boolean) || false,
    isEdited: (data.is_edited as boolean) || false,
    likeCount: (data.like_count as number) || 0,
    status: (data.status as CommentStatus) || 'published',
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    isLikedByUser: data.is_liked_by_user as boolean | undefined,
    replies: []
  };
}

// ============================================================================
// POST OPERATIONS
// ============================================================================

/**
 * Get a single post by ID
 */
export async function getPost(postId: string, userId?: string): Promise<ForumPost | null> {
  const { data, error } = await supabase
    .from('forum_posts')
    .select(`
      *,
      profiles:author_id (display_name, avatar_url)
    `)
    .eq('id', postId)
    .single();

  if (error || !data) return null;

  // Increment view count
  await supabase.rpc('increment_post_views', { p_post_id: postId });

  // Check if user liked/bookmarked
  let isLikedByUser = false;
  let isBookmarkedByUser = false;

  if (userId) {
    const { data: likeData } = await supabase
      .from('forum_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();
    isLikedByUser = !!likeData;

    const { data: bookmarkData } = await supabase
      .from('forum_bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();
    isBookmarkedByUser = !!bookmarkData;
  }

  const profile = data.profiles as { display_name?: string; avatar_url?: string } | null;

  return {
    ...mapPostFromDB(data),
    authorName: profile?.display_name,
    authorAvatar: profile?.avatar_url,
    isLikedByUser,
    isBookmarkedByUser
  };
}

/**
 * Get posts with filters and pagination
 */
export async function getPosts(params: SearchPostsParams = {}): Promise<ForumListResponse> {
  const { query, postType, tags, authorId, isSolved, limit = 20, offset = 0 } = params;

  let queryBuilder = supabase
    .from('forum_posts')
    .select(`
      *,
      profiles:author_id (display_name, avatar_url)
    `, { count: 'exact' })
    .eq('status', 'published')
    .order('is_pinned', { ascending: false })
    .order('last_activity_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (postType) {
    queryBuilder = queryBuilder.eq('post_type', postType);
  }

  if (authorId) {
    queryBuilder = queryBuilder.eq('author_id', authorId);
  }

  if (isSolved !== undefined) {
    queryBuilder = queryBuilder.eq('is_solved', isSolved);
  }

  if (tags && tags.length > 0) {
    queryBuilder = queryBuilder.or(`tags.cs.{${tags.join(',')}},condition_tags.cs.{${tags.join(',')}}`);
  }

  if (query) {
    queryBuilder = queryBuilder.textSearch('title', query, { type: 'websearch', config: 'swedish' });
  }

  const { data, error, count } = await queryBuilder;

  if (error) {
    console.error('Error fetching posts:', error);
    return { posts: [], totalCount: 0, hasMore: false };
  }

  const posts = (data || []).map(post => {
    const profile = post.profiles as { display_name?: string; avatar_url?: string } | null;
    return {
      ...mapPostFromDB(post),
      authorName: profile?.display_name,
      authorAvatar: profile?.avatar_url
    };
  });

  return {
    posts,
    totalCount: count || 0,
    hasMore: (count || 0) > offset + limit
  };
}

/**
 * Search posts using full-text search
 */
export async function searchPosts(
  query: string,
  postType?: PostType,
  tags?: string[],
  limit = 20,
  offset = 0
): Promise<ForumListResponse> {
  const { data, error } = await supabase.rpc('search_forum_posts', {
    p_query: query,
    p_post_type: postType || null,
    p_tags: tags || null,
    p_limit: limit,
    p_offset: offset
  });

  if (error) {
    console.error('Error searching posts:', error);
    return { posts: [], totalCount: 0, hasMore: false };
  }

  const posts = (data || []).map((post: Record<string, unknown>) => mapPostFromDB(post));

  return {
    posts,
    totalCount: posts.length,
    hasMore: posts.length === limit
  };
}

/**
 * Create a new post
 */
export async function createPost(input: CreatePostInput): Promise<ForumPost> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('forum_posts')
    .insert({
      author_id: userData.user.id,
      title: input.title,
      content: input.content,
      post_type: input.postType,
      tags: input.tags || [],
      condition_tags: input.conditionTags || [],
      case_data: input.caseData || null,
      status: input.status || 'published'
    })
    .select()
    .single();

  if (error) throw error;
  return mapPostFromDB(data);
}

/**
 * Update a post
 */
export async function updatePost(postId: string, input: UpdatePostInput): Promise<ForumPost> {
  const updateData: Record<string, unknown> = {};

  if (input.title !== undefined) updateData.title = input.title;
  if (input.content !== undefined) updateData.content = input.content;
  if (input.tags !== undefined) updateData.tags = input.tags;
  if (input.conditionTags !== undefined) updateData.condition_tags = input.conditionTags;
  if (input.caseData !== undefined) updateData.case_data = input.caseData;

  const { data, error } = await supabase
    .from('forum_posts')
    .update(updateData)
    .eq('id', postId)
    .select()
    .single();

  if (error) throw error;
  return mapPostFromDB(data);
}

/**
 * Delete a post (soft delete)
 */
export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase
    .from('forum_posts')
    .update({ status: 'deleted' })
    .eq('id', postId);

  if (error) throw error;
}

/**
 * Toggle like on a post
 */
export async function togglePostLike(postId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('toggle_post_like', { p_post_id: postId });
  if (error) throw error;
  return data as boolean;
}

/**
 * Toggle bookmark on a post
 */
export async function togglePostBookmark(postId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('toggle_bookmark', { p_post_id: postId });
  if (error) throw error;
  return data as boolean;
}

/**
 * Get user's bookmarked posts
 */
export async function getBookmarkedPosts(limit = 20, offset = 0): Promise<ForumListResponse> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { posts: [], totalCount: 0, hasMore: false };

  const { data, error, count } = await supabase
    .from('forum_bookmarks')
    .select(`
      forum_posts (
        *,
        profiles:author_id (display_name, avatar_url)
      )
    `, { count: 'exact' })
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching bookmarked posts:', error);
    return { posts: [], totalCount: 0, hasMore: false };
  }

  const posts = (data || [])
    .filter(item => item.forum_posts)
    .map(item => {
      const post = item.forum_posts as unknown as Record<string, unknown>;
      const profile = (post.profiles as { display_name?: string; avatar_url?: string }) || {};
      return {
        ...mapPostFromDB(post),
        authorName: profile.display_name,
        authorAvatar: profile.avatar_url,
        isBookmarkedByUser: true
      };
    });

  return {
    posts,
    totalCount: count || 0,
    hasMore: (count || 0) > offset + limit
  };
}

/**
 * Get user's own posts
 */
export async function getMyPosts(limit = 20, offset = 0): Promise<ForumListResponse> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { posts: [], totalCount: 0, hasMore: false };

  const { data, error, count } = await supabase
    .from('forum_posts')
    .select(`
      *,
      profiles:author_id (display_name, avatar_url)
    `, { count: 'exact' })
    .eq('author_id', userData.user.id)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching my posts:', error);
    return { posts: [], totalCount: 0, hasMore: false };
  }

  const posts = (data || []).map(post => {
    const profile = post.profiles as { display_name?: string; avatar_url?: string } | null;
    return {
      ...mapPostFromDB(post),
      authorName: profile?.display_name,
      authorAvatar: profile?.avatar_url
    };
  });

  return {
    posts,
    totalCount: count || 0,
    hasMore: (count || 0) > offset + limit
  };
}

// ============================================================================
// COMMENT OPERATIONS
// ============================================================================

/**
 * Get comments for a post
 */
export async function getPostComments(postId: string, userId?: string): Promise<ForumComment[]> {
  const { data, error } = await supabase
    .from('forum_comments')
    .select(`
      *,
      profiles:author_id (display_name, avatar_url)
    `)
    .eq('post_id', postId)
    .eq('status', 'published')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }

  // Get user's likes if logged in
  let userLikes: string[] = [];
  if (userId) {
    const { data: likesData } = await supabase
      .from('forum_likes')
      .select('comment_id')
      .eq('user_id', userId)
      .not('comment_id', 'is', null);

    userLikes = (likesData || []).map(l => l.comment_id).filter(Boolean) as string[];
  }

  // Map and organize into thread structure
  const commentsMap = new Map<string, ForumComment>();
  const rootComments: ForumComment[] = [];

  for (const comment of data || []) {
    const profile = comment.profiles as { display_name?: string; avatar_url?: string } | null;
    const mappedComment: ForumComment = {
      ...mapCommentFromDB(comment),
      authorName: profile?.display_name,
      authorAvatar: profile?.avatar_url,
      isLikedByUser: userLikes.includes(comment.id),
      replies: []
    };
    commentsMap.set(comment.id, mappedComment);
  }

  // Organize into tree structure
  for (const comment of commentsMap.values()) {
    if (comment.parentId) {
      const parent = commentsMap.get(comment.parentId);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(comment);
      }
    } else {
      rootComments.push(comment);
    }
  }

  return rootComments;
}

/**
 * Create a comment
 */
export async function createComment(
  postId: string,
  content: string,
  parentId?: string
): Promise<ForumComment> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('forum_comments')
    .insert({
      post_id: postId,
      author_id: userData.user.id,
      parent_id: parentId || null,
      content
    })
    .select(`
      *,
      profiles:author_id (display_name, avatar_url)
    `)
    .single();

  if (error) throw error;

  const profile = data.profiles as { display_name?: string; avatar_url?: string } | null;
  return {
    ...mapCommentFromDB(data),
    authorName: profile?.display_name,
    authorAvatar: profile?.avatar_url
  };
}

/**
 * Update a comment
 */
export async function updateComment(commentId: string, content: string): Promise<ForumComment> {
  const { data, error } = await supabase
    .from('forum_comments')
    .update({ content, is_edited: true })
    .eq('id', commentId)
    .select()
    .single();

  if (error) throw error;
  return mapCommentFromDB(data);
}

/**
 * Delete a comment (soft delete)
 */
export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase
    .from('forum_comments')
    .update({ status: 'deleted' })
    .eq('id', commentId);

  if (error) throw error;
}

/**
 * Toggle like on a comment
 */
export async function toggleCommentLike(commentId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('toggle_comment_like', { p_comment_id: commentId });
  if (error) throw error;
  return data as boolean;
}

/**
 * Mark comment as solution
 */
export async function markAsSolution(commentId: string): Promise<void> {
  const { error } = await supabase.rpc('mark_as_solution', { p_comment_id: commentId });
  if (error) throw error;
}

// ============================================================================
// TAG OPERATIONS
// ============================================================================

/**
 * Get all tags
 */
export async function getTags(): Promise<ForumTag[]> {
  const { data, error } = await supabase
    .from('forum_tags')
    .select('*')
    .order('usage_count', { ascending: false });

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  return (data || []).map(tag => ({
    id: tag.id,
    name: tag.name,
    category: tag.category,
    description: tag.description,
    usageCount: tag.usage_count
  }));
}

/**
 * Get popular tags
 */
export async function getPopularTags(limit = 10): Promise<ForumTag[]> {
  const { data, error } = await supabase
    .from('forum_tags')
    .select('*')
    .order('usage_count', { ascending: false })
    .limit(limit);

  if (error) return [];

  return (data || []).map(tag => ({
    id: tag.id,
    name: tag.name,
    category: tag.category,
    description: tag.description,
    usageCount: tag.usage_count
  }));
}

// ============================================================================
// STATS
// ============================================================================

/**
 * Get forum statistics
 */
export async function getForumStats(): Promise<ForumStats> {
  const { data, error } = await supabase.rpc('get_forum_stats');

  if (error || !data || data.length === 0) {
    return {
      totalPosts: 0,
      totalComments: 0,
      totalUsers: 0,
      postsThisWeek: 0,
      solvedQuestions: 0,
      popularTags: []
    };
  }

  const stats = data[0];
  return {
    totalPosts: stats.total_posts || 0,
    totalComments: stats.total_comments || 0,
    totalUsers: stats.total_users || 0,
    postsThisWeek: stats.posts_this_week || 0,
    solvedQuestions: stats.solved_questions || 0,
    popularTags: stats.popular_tags || []
  };
}

// ============================================================================
// POST TYPE HELPERS
// ============================================================================

export const POST_TYPE_LABELS: Record<PostType, string> = {
  discussion: 'Diskussion',
  case_study: 'Fallstudie',
  question: 'Fråga',
  tip: 'Tips',
  announcement: 'Meddelande'
};

export const POST_TYPE_ICONS: Record<PostType, string> = {
  discussion: 'MessageSquare',
  case_study: 'FileText',
  question: 'HelpCircle',
  tip: 'Lightbulb',
  announcement: 'Bell'
};

export const POST_TYPE_COLORS: Record<PostType, { bg: string; text: string }> = {
  discussion: { bg: 'bg-blue-100', text: 'text-blue-700' },
  case_study: { bg: 'bg-purple-100', text: 'text-purple-700' },
  question: { bg: 'bg-orange-100', text: 'text-orange-700' },
  tip: { bg: 'bg-green-100', text: 'text-green-700' },
  announcement: { bg: 'bg-red-100', text: 'text-red-700' }
};
