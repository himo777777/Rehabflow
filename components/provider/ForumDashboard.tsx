// ============================================================================
// FORUM DASHBOARD
// ============================================================================
// Main forum view for providers to browse, search, and interact with
// community posts, case studies, questions, and tips.

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  FileText,
  HelpCircle,
  Lightbulb,
  Bell,
  Search,
  Filter,
  Plus,
  Heart,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  Eye,
  CheckCircle,
  Pin,
  ChevronRight,
  Clock,
  User,
  Tag,
  TrendingUp,
  Users,
  Award
} from 'lucide-react';
import type {
  ForumPost,
  PostType,
  ForumStats,
  ForumTag
} from '../../services/forumService';
import {
  POST_TYPE_LABELS,
  POST_TYPE_COLORS
} from '../../services/forumService';

// ============================================================================
// TYPES
// ============================================================================

interface ForumDashboardProps {
  onSelectPost?: (postId: string) => void;
  onCreatePost?: () => void;
}

type TabType = 'all' | 'my_posts' | 'bookmarks' | 'questions';

// ============================================================================
// DEMO DATA
// ============================================================================

const DEMO_POSTS: ForumPost[] = [
  {
    id: '1',
    authorId: 'u1',
    authorName: 'Dr. Anna Lindqvist',
    title: 'Effektiv smärthantering vid kronisk ländryggssmärta - Min erfarenhet med graded exposure',
    content: 'Jag har under det senaste året arbetat med en grupp patienter med kronisk ländryggssmärta...',
    excerpt: 'Jag har under det senaste året arbetat med en grupp patienter med kronisk ländryggssmärta och vill dela mina erfarenheter med graded exposure...',
    postType: 'discussion',
    tags: ['smarthantering', 'evidens', 'rehabilitering'],
    conditionTags: ['ryggsmarta'],
    viewCount: 234,
    likeCount: 45,
    commentCount: 12,
    bookmarkCount: 23,
    isPinned: true,
    isSolved: false,
    isFeatured: true,
    isLocked: false,
    status: 'published',
    createdAt: '2024-02-28T10:00:00Z',
    updatedAt: '2024-02-28T10:00:00Z',
    lastActivityAt: '2024-02-29T15:30:00Z',
    isLikedByUser: true,
    isBookmarkedByUser: false
  },
  {
    id: '2',
    authorId: 'u2',
    authorName: 'Erik Johansson, FT',
    title: 'Fallstudie: ACL-rekonstruktion med snabb återgång till idrott',
    content: 'Patient: Kvinna, 24 år, elitfotbollsspelare...',
    excerpt: 'Patient: Kvinna, 24 år, elitfotbollsspelare. Skada: Komplett ACL-ruptur vänster knä. Behandling: Artroskopisk rekonstruktion med hamstringsena...',
    postType: 'case_study',
    tags: ['postoperativ', 'idrottsmedicin'],
    conditionTags: ['kna'],
    caseData: {
      ageRange: '20-30',
      gender: 'kvinna',
      diagnosis: 'ACL-ruptur',
      duration: '8 månader',
      treatmentApproach: 'Postoperativ rehabilitering',
      outcome: 'Fullständig återgång till idrott',
      anonymized: true
    },
    viewCount: 189,
    likeCount: 56,
    commentCount: 8,
    bookmarkCount: 34,
    isPinned: false,
    isSolved: false,
    isFeatured: false,
    isLocked: false,
    status: 'published',
    createdAt: '2024-02-27T14:00:00Z',
    updatedAt: '2024-02-27T14:00:00Z',
    lastActivityAt: '2024-02-29T09:15:00Z',
    isLikedByUser: false,
    isBookmarkedByUser: true
  },
  {
    id: '3',
    authorId: 'u3',
    authorName: 'Maria Svensson',
    title: 'Hur hanterar ni patienter med hög rörelserädsla (TSK-11 > 40)?',
    content: 'Jag har en patient med kronisk nacksmärta som visar extremt hög rörelserädsla...',
    excerpt: 'Jag har en patient med kronisk nacksmärta som visar extremt hög rörelserädsla. Trots god smärtkontroll vågar patienten inte utföra grundläggande rörelser...',
    postType: 'question',
    tags: ['patientutbildning', 'teknik'],
    conditionTags: ['nacksmarta'],
    viewCount: 156,
    likeCount: 23,
    commentCount: 15,
    bookmarkCount: 12,
    isPinned: false,
    isSolved: true,
    isFeatured: false,
    isLocked: false,
    status: 'published',
    createdAt: '2024-02-26T09:00:00Z',
    updatedAt: '2024-02-26T09:00:00Z',
    lastActivityAt: '2024-02-28T16:45:00Z',
    isLikedByUser: false,
    isBookmarkedByUser: false
  },
  {
    id: '4',
    authorId: 'u4',
    authorName: 'Johan Bergman, MSc',
    title: 'Tips: Enkel teknik för att förbättra skapulär stabilitet',
    content: 'En enkel men effektiv teknik jag använder med mina patienter...',
    excerpt: 'En enkel men effektiv teknik jag använder med mina patienter för att förbättra skapulär stabilitet är "wall slides" med en liten modifikation...',
    postType: 'tip',
    tags: ['teknik', 'hemovningar'],
    conditionTags: ['axel'],
    viewCount: 312,
    likeCount: 89,
    commentCount: 6,
    bookmarkCount: 67,
    isPinned: false,
    isSolved: false,
    isFeatured: true,
    isLocked: false,
    status: 'published',
    createdAt: '2024-02-25T11:00:00Z',
    updatedAt: '2024-02-25T11:00:00Z',
    lastActivityAt: '2024-02-27T20:00:00Z',
    isLikedByUser: true,
    isBookmarkedByUser: true
  },
  {
    id: '5',
    authorId: 'u5',
    authorName: 'RehabFlow Team',
    title: 'Ny funktion: Prediktiv analys nu tillgänglig i vårdgivarportalen',
    content: 'Vi är glada att kunna presentera vår nya funktion för prediktiv analys...',
    excerpt: 'Vi är glada att kunna presentera vår nya funktion för prediktiv analys som hjälper er att förutspå patientutfall och planera behandling mer effektivt...',
    postType: 'announcement',
    tags: ['rehabilitering'],
    conditionTags: [],
    viewCount: 456,
    likeCount: 34,
    commentCount: 18,
    bookmarkCount: 5,
    isPinned: true,
    isSolved: false,
    isFeatured: false,
    isLocked: false,
    status: 'published',
    createdAt: '2024-02-20T08:00:00Z',
    updatedAt: '2024-02-20T08:00:00Z',
    lastActivityAt: '2024-02-29T12:00:00Z',
    isLikedByUser: false,
    isBookmarkedByUser: false
  },
  {
    id: '6',
    authorId: 'u6',
    authorName: 'Lisa Andersson',
    title: 'Erfarenheter av telerehabilitering under pandemin - vad lärde vi oss?',
    content: 'Under pandemin tvingades många av oss snabbt ställa om till telerehabilitering...',
    excerpt: 'Under pandemin tvingades många av oss snabbt ställa om till telerehabilitering. Jag vill dela vad som fungerade och inte fungerade för mig och mina patienter...',
    postType: 'discussion',
    tags: ['rehabilitering', 'patientutbildning'],
    conditionTags: [],
    viewCount: 178,
    likeCount: 41,
    commentCount: 22,
    bookmarkCount: 15,
    isPinned: false,
    isSolved: false,
    isFeatured: false,
    isLocked: false,
    status: 'published',
    createdAt: '2024-02-24T15:00:00Z',
    updatedAt: '2024-02-24T15:00:00Z',
    lastActivityAt: '2024-02-28T11:30:00Z',
    isLikedByUser: false,
    isBookmarkedByUser: false
  }
];

const DEMO_STATS: ForumStats = {
  totalPosts: 156,
  totalComments: 892,
  totalUsers: 78,
  postsThisWeek: 12,
  solvedQuestions: 45,
  popularTags: [
    { tag: 'rehabilitering', count: 45 },
    { tag: 'smarthantering', count: 38 },
    { tag: 'ryggsmarta', count: 32 },
    { tag: 'teknik', count: 28 },
    { tag: 'evidens', count: 24 }
  ]
};

const DEMO_TAGS: ForumTag[] = [
  { id: 'rehabilitering', name: 'Rehabilitering', category: 'general', usageCount: 45 },
  { id: 'smarthantering', name: 'Smärthantering', category: 'general', usageCount: 38 },
  { id: 'evidens', name: 'Evidensbaserat', category: 'general', usageCount: 24 },
  { id: 'teknik', name: 'Teknik', category: 'general', usageCount: 28 },
  { id: 'ryggsmarta', name: 'Ryggsmärta', category: 'condition', usageCount: 32 },
  { id: 'kna', name: 'Knä', category: 'condition', usageCount: 18 },
  { id: 'axel', name: 'Axel', category: 'condition', usageCount: 15 },
  { id: 'nacksmarta', name: 'Nacksmärta', category: 'condition', usageCount: 12 }
];

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const PostTypeIcon: React.FC<{ type: PostType; className?: string }> = ({ type, className = 'w-4 h-4' }) => {
  switch (type) {
    case 'discussion': return <MessageSquare className={className} />;
    case 'case_study': return <FileText className={className} />;
    case 'question': return <HelpCircle className={className} />;
    case 'tip': return <Lightbulb className={className} />;
    case 'announcement': return <Bell className={className} />;
  }
};

interface ForumPostCardProps {
  post: ForumPost;
  onClick?: () => void;
  onLike?: () => void;
  onBookmark?: () => void;
}

const ForumPostCard: React.FC<ForumPostCardProps> = ({
  post,
  onClick,
  onLike,
  onBookmark
}) => {
  const typeColor = POST_TYPE_COLORS[post.postType];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just nu';
    if (diffHours < 24) return `${diffHours}h sedan`;
    if (diffDays < 7) return `${diffDays}d sedan`;
    return date.toLocaleDateString('sv-SE');
  };

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all cursor-pointer ${
        post.isPinned ? 'ring-2 ring-amber-200' : ''
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Author avatar */}
        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
          {post.authorName?.charAt(0) || 'U'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* Post type badge */}
            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${typeColor.bg} ${typeColor.text}`}>
              <PostTypeIcon type={post.postType} className="w-3 h-3" />
              {POST_TYPE_LABELS[post.postType]}
            </span>

            {/* Pinned indicator */}
            {post.isPinned && (
              <span className="flex items-center gap-1 text-xs text-amber-600">
                <Pin className="w-3 h-3" />
              </span>
            )}

            {/* Solved indicator */}
            {post.isSolved && (
              <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3" />
                Löst
              </span>
            )}

            {/* Featured indicator */}
            {post.isFeatured && (
              <span className="flex items-center gap-1 text-xs text-purple-600">
                <Award className="w-3 h-3" />
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-800 line-clamp-2 mb-1">{post.title}</h3>

          {/* Author and time */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{post.authorName}</span>
            <span>•</span>
            <span>{formatDate(post.lastActivityAt)}</span>
          </div>
        </div>
      </div>

      {/* Excerpt */}
      <p className="text-sm text-slate-600 line-clamp-2 mb-3">{post.excerpt}</p>

      {/* Tags */}
      {(post.tags.length > 0 || post.conditionTags.length > 0) && (
        <div className="flex flex-wrap gap-1 mb-3">
          {post.conditionTags.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
              {tag}
            </span>
          ))}
          {post.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer - engagement stats and actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {post.viewCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            {post.commentCount}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike?.();
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm transition-colors ${
              post.isLikedByUser
                ? 'text-red-500 bg-red-50'
                : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${post.isLikedByUser ? 'fill-current' : ''}`} />
            {post.likeCount}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmark?.();
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              post.isBookmarkedByUser
                ? 'text-primary-500 bg-primary-50'
                : 'text-slate-400 hover:text-primary-500 hover:bg-primary-50'
            }`}
          >
            {post.isBookmarkedByUser ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ForumDashboard: React.FC<ForumDashboardProps> = ({
  onSelectPost,
  onCreatePost
}) => {
  const [posts, setPosts] = useState<ForumPost[]>(DEMO_POSTS);
  const [stats, setStats] = useState<ForumStats>(DEMO_STATS);
  const [tags, setTags] = useState<ForumTag[]>(DEMO_TAGS);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PostType | 'all'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filter posts
  const filteredPosts = posts.filter(post => {
    // Tab filter
    if (activeTab === 'my_posts' && post.authorId !== 'current_user') return false; // Demo: would use actual user ID
    if (activeTab === 'bookmarks' && !post.isBookmarkedByUser) return false;
    if (activeTab === 'questions' && post.postType !== 'question') return false;

    // Type filter
    if (selectedType !== 'all' && post.postType !== selectedType) return false;

    // Tag filter
    if (selectedTags.length > 0) {
      const postTags = [...post.tags, ...post.conditionTags];
      if (!selectedTags.some(tag => postTags.includes(tag))) return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!post.title.toLowerCase().includes(query) &&
          !post.excerpt?.toLowerCase().includes(query) &&
          !post.authorName?.toLowerCase().includes(query)) {
        return false;
      }
    }

    return true;
  });

  // Sort: pinned first, then by activity
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
  });

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? {
            ...p,
            isLikedByUser: !p.isLikedByUser,
            likeCount: p.isLikedByUser ? p.likeCount - 1 : p.likeCount + 1
          }
        : p
    ));
  };

  const handleBookmark = (postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? {
            ...p,
            isBookmarkedByUser: !p.isBookmarkedByUser,
            bookmarkCount: p.isBookmarkedByUser ? p.bookmarkCount - 1 : p.bookmarkCount + 1
          }
        : p
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Community Forum</h1>
              <p className="text-sm text-slate-500">Dela kunskap och diskutera med kollegor</p>
            </div>
            <button
              onClick={onCreatePost}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nytt inlägg
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-white rounded-xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-slate-500">Inlägg</span>
                </div>
                <p className="text-xl font-bold text-slate-800">{stats.totalPosts}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <MessageCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-slate-500">Kommentarer</span>
                </div>
                <p className="text-xl font-bold text-slate-800">{stats.totalComments}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-slate-500">Medlemmar</span>
                </div>
                <p className="text-xl font-bold text-slate-800">{stats.totalUsers}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-slate-500">Denna vecka</span>
                </div>
                <p className="text-xl font-bold text-slate-800">{stats.postsThisWeek}</p>
              </div>
            </div>

            {/* Tabs and search */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
              {/* Tabs */}
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-4">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'all'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Alla inlägg
                </button>
                <button
                  onClick={() => setActiveTab('questions')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'questions'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <HelpCircle className="w-4 h-4" />
                    Frågor
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('my_posts')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'my_posts'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Mina inlägg
                </button>
                <button
                  onClick={() => setActiveTab('bookmarks')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'bookmarks'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Bookmark className="w-4 h-4" />
                    Sparade
                  </span>
                </button>
              </div>

              {/* Search and filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Sök inlägg..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as PostType | 'all')}
                  className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm"
                >
                  <option value="all">Alla typer</option>
                  <option value="discussion">Diskussion</option>
                  <option value="case_study">Fallstudie</option>
                  <option value="question">Fråga</option>
                  <option value="tip">Tips</option>
                  <option value="announcement">Meddelande</option>
                </select>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
                    selectedTags.length > 0
                      ? 'bg-primary-50 border-primary-200 text-primary-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Taggar
                  {selectedTags.length > 0 && (
                    <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                      {selectedTags.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Tag filters */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm font-medium text-slate-700 mb-2">Filtrera på taggar:</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          selectedTags.includes(tag.id)
                            ? 'bg-primary-500 text-white'
                            : tag.category === 'condition'
                            ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {tag.name}
                        <span className="ml-1 opacity-60">({tag.usageCount})</span>
                      </button>
                    ))}
                  </div>
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => setSelectedTags([])}
                      className="mt-2 text-sm text-slate-500 hover:text-slate-700"
                    >
                      Rensa filter
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Posts list */}
            <div className="space-y-4">
              {sortedPosts.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">Inga inlägg matchar dina filter</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedType('all');
                      setSelectedTags([]);
                    }}
                    className="mt-3 text-sm text-primary-600 hover:text-primary-700"
                  >
                    Rensa filter
                  </button>
                </div>
              ) : (
                sortedPosts.map(post => (
                  <ForumPostCard
                    key={post.id}
                    post={post}
                    onClick={() => onSelectPost?.(post.id)}
                    onLike={() => handleLike(post.id)}
                    onBookmark={() => handleBookmark(post.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Popular tags */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary-500" />
                Populära taggar
              </h3>
              <div className="space-y-2">
                {stats.popularTags.slice(0, 8).map(tag => (
                  <button
                    key={tag.tag}
                    onClick={() => toggleTag(tag.tag)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedTags.includes(tag.tag)
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{tag.tag}</span>
                    <span className="text-xs opacity-60">{tag.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-500" />
                Senaste aktivitet
              </h3>
              <div className="space-y-3">
                {posts.slice(0, 4).map(post => (
                  <button
                    key={post.id}
                    onClick={() => onSelectPost?.(post.id)}
                    className="w-full text-left hover:bg-slate-50 p-2 rounded-lg transition-colors"
                  >
                    <p className="text-sm text-slate-700 line-clamp-2">{post.title}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {post.commentCount} kommentarer
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick create */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 text-white">
              <h3 className="font-semibold mb-2">Dela din kunskap</h3>
              <p className="text-sm opacity-90 mb-4">
                Hjälp kollegor genom att dela dina erfarenheter och tips.
              </p>
              <button
                onClick={onCreatePost}
                className="w-full px-4 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Skapa inlägg
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumDashboard;
