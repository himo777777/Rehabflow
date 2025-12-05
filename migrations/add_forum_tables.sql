-- ============================================================================
-- PROVIDER COMMUNITY FORUM TABLES MIGRATION
-- ============================================================================
-- Platform for healthcare providers to share cases, discuss treatment approaches,
-- ask questions, and learn from peers in a professional community setting.

-- ============================================================================
-- FORUM POSTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Post content
  title TEXT NOT NULL CHECK (length(title) >= 5 AND length(title) <= 200),
  content TEXT NOT NULL CHECK (length(content) >= 20),
  excerpt TEXT, -- Auto-generated summary for list views

  -- Post type
  post_type TEXT NOT NULL CHECK (post_type IN ('discussion', 'case_study', 'question', 'tip', 'announcement')),

  -- Tags for categorization
  tags TEXT[] DEFAULT '{}',
  -- General tags: ['rehabilitering', 'smärthantering', 'evidensbaserad', 'teknik']
  condition_tags TEXT[] DEFAULT '{}',
  -- Condition-specific: ['ryggsmärta', 'knä', 'axel', 'höft', 'nacke']

  -- Case study specific fields (when post_type = 'case_study')
  case_data JSONB DEFAULT NULL,
  -- Format: {
  --   "age_range": "40-50",
  --   "gender": "kvinna",
  --   "diagnosis": "Lumbal diskbråck",
  --   "duration": "6 månader",
  --   "treatment_approach": "Konservativ",
  --   "outcome": "Förbättrad",
  --   "key_learnings": ["..."],
  --   "anonymized": true
  -- }

  -- Engagement metrics
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,

  -- Status flags
  is_pinned BOOLEAN DEFAULT FALSE,
  is_solved BOOLEAN DEFAULT FALSE, -- For questions
  is_featured BOOLEAN DEFAULT FALSE, -- Editor's pick
  is_locked BOOLEAN DEFAULT FALSE, -- No more comments

  -- Moderation
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'pending', 'published', 'hidden', 'deleted')),
  moderation_notes TEXT,
  moderated_by UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_type ON forum_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_forum_posts_status ON forum_posts(status);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_activity ON forum_posts(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_pinned ON forum_posts(is_pinned DESC, last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_tags ON forum_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_forum_posts_condition_tags ON forum_posts USING GIN(condition_tags);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_forum_posts_search ON forum_posts
  USING GIN(to_tsvector('swedish', coalesce(title, '') || ' ' || coalesce(content, '')));

-- Enable RLS
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view published posts"
  ON forum_posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authors can view their own posts"
  ON forum_posts FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Providers can create posts"
  ON forum_posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'provider'
    )
  );

CREATE POLICY "Authors can update their own posts"
  ON forum_posts FOR UPDATE
  USING (auth.uid() = author_id AND status != 'deleted');

CREATE POLICY "Authors can delete their own posts"
  ON forum_posts FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================================================
-- FORUM COMMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS forum_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,

  -- Comment content
  content TEXT NOT NULL CHECK (length(content) >= 1),

  -- Status
  is_solution BOOLEAN DEFAULT FALSE, -- Marked as solution by post author
  is_edited BOOLEAN DEFAULT FALSE,

  -- Engagement
  like_count INTEGER DEFAULT 0,

  -- Moderation
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'deleted')),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_forum_comments_post ON forum_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_author ON forum_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_parent ON forum_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_created ON forum_comments(created_at);
CREATE INDEX IF NOT EXISTS idx_forum_comments_solution ON forum_comments(post_id, is_solution) WHERE is_solution = TRUE;

-- Enable RLS
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view published comments"
  ON forum_comments FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authors can view their own comments"
  ON forum_comments FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Providers can create comments"
  ON forum_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'provider'
    )
  );

CREATE POLICY "Authors can update their own comments"
  ON forum_comments FOR UPDATE
  USING (auth.uid() = author_id AND status != 'deleted');

CREATE POLICY "Authors can delete their own comments"
  ON forum_comments FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================================================
-- FORUM LIKES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS forum_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Either post_id or comment_id must be set, not both
  CONSTRAINT like_target_check CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  ),

  -- One like per user per target
  CONSTRAINT unique_post_like UNIQUE (user_id, post_id),
  CONSTRAINT unique_comment_like UNIQUE (user_id, comment_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_forum_likes_user ON forum_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_post ON forum_likes(post_id) WHERE post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_forum_likes_comment ON forum_likes(comment_id) WHERE comment_id IS NOT NULL;

-- Enable RLS
ALTER TABLE forum_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view likes"
  ON forum_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own likes"
  ON forum_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON forum_likes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FORUM BOOKMARKS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS forum_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_bookmark UNIQUE (user_id, post_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_forum_bookmarks_user ON forum_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_bookmarks_post ON forum_bookmarks(post_id);

-- Enable RLS
ALTER TABLE forum_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks"
  ON forum_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
  ON forum_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON forum_bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FORUM TAGS TABLE (predefined tags)
-- ============================================================================

CREATE TABLE IF NOT EXISTS forum_tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('general', 'condition', 'treatment', 'specialty')),
  description TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE forum_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tags"
  ON forum_tags FOR SELECT
  USING (true);

-- Insert default tags
INSERT INTO forum_tags (id, name, category, description) VALUES
  -- General tags
  ('rehabilitering', 'Rehabilitering', 'general', 'Allmän rehabilitering'),
  ('smarthantering', 'Smärthantering', 'general', 'Strategier för smärthantering'),
  ('evidens', 'Evidensbaserat', 'general', 'Evidensbaserad praktik'),
  ('teknik', 'Teknik', 'general', 'Behandlingstekniker'),
  ('patientutbildning', 'Patientutbildning', 'general', 'Utbildning av patienter'),
  ('hemovningar', 'Hemövningar', 'general', 'Program för hemmaträning'),
  ('motorisk-kontroll', 'Motorisk kontroll', 'general', 'Motorisk kontrollträning'),
  ('manuell-terapi', 'Manuell terapi', 'general', 'Manuella behandlingstekniker'),

  -- Condition tags
  ('ryggsmarta', 'Ryggsmärta', 'condition', 'Ländryggsbesvär'),
  ('nacksmarta', 'Nacksmärta', 'condition', 'Nackbesvär och whiplash'),
  ('kna', 'Knä', 'condition', 'Knäskador och artros'),
  ('axel', 'Axel', 'condition', 'Axelbesvär'),
  ('hoft', 'Höft', 'condition', 'Höftbesvär'),
  ('fotled', 'Fotled', 'condition', 'Fotleds- och fotbesvär'),
  ('armbåge', 'Armbåge', 'condition', 'Armbågsbesvär'),
  ('handled', 'Handled', 'condition', 'Handledsbesvär'),

  -- Treatment tags
  ('postoperativ', 'Postoperativ', 'treatment', 'Vård efter operation'),
  ('konservativ', 'Konservativ', 'treatment', 'Icke-kirurgisk behandling'),
  ('akut', 'Akut', 'treatment', 'Akuta tillstånd'),
  ('kronisk', 'Kronisk', 'treatment', 'Kroniska tillstånd'),
  ('idrottsmedicin', 'Idrottsmedicin', 'treatment', 'Idrottsrelaterade skador'),
  ('geriatrik', 'Geriatrik', 'treatment', 'Äldres rehabilitering'),
  ('pediatrik', 'Pediatrik', 'treatment', 'Barns rehabilitering'),

  -- Specialty tags
  ('ortopedi', 'Ortopedi', 'specialty', 'Ortopedisk fysioterapi'),
  ('neurologi', 'Neurologi', 'specialty', 'Neurologisk rehabilitering'),
  ('reumatologi', 'Reumatologi', 'specialty', 'Reumatologiska tillstånd'),
  ('kardiologi', 'Kardiologi', 'specialty', 'Hjärtrehabilitering')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_post_views(p_post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE forum_posts
  SET view_count = view_count + 1
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to toggle like on post
CREATE OR REPLACE FUNCTION toggle_post_like(p_post_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  -- Check if like exists
  SELECT EXISTS(
    SELECT 1 FROM forum_likes
    WHERE user_id = auth.uid() AND post_id = p_post_id
  ) INTO v_exists;

  IF v_exists THEN
    -- Remove like
    DELETE FROM forum_likes WHERE user_id = auth.uid() AND post_id = p_post_id;
    UPDATE forum_posts SET like_count = like_count - 1 WHERE id = p_post_id;
    RETURN FALSE;
  ELSE
    -- Add like
    INSERT INTO forum_likes (user_id, post_id) VALUES (auth.uid(), p_post_id);
    UPDATE forum_posts SET like_count = like_count + 1 WHERE id = p_post_id;
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to toggle like on comment
CREATE OR REPLACE FUNCTION toggle_comment_like(p_comment_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM forum_likes
    WHERE user_id = auth.uid() AND comment_id = p_comment_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM forum_likes WHERE user_id = auth.uid() AND comment_id = p_comment_id;
    UPDATE forum_comments SET like_count = like_count - 1 WHERE id = p_comment_id;
    RETURN FALSE;
  ELSE
    INSERT INTO forum_likes (user_id, comment_id) VALUES (auth.uid(), p_comment_id);
    UPDATE forum_comments SET like_count = like_count + 1 WHERE id = p_comment_id;
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to toggle bookmark
CREATE OR REPLACE FUNCTION toggle_bookmark(p_post_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM forum_bookmarks
    WHERE user_id = auth.uid() AND post_id = p_post_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM forum_bookmarks WHERE user_id = auth.uid() AND post_id = p_post_id;
    UPDATE forum_posts SET bookmark_count = bookmark_count - 1 WHERE id = p_post_id;
    RETURN FALSE;
  ELSE
    INSERT INTO forum_bookmarks (user_id, post_id) VALUES (auth.uid(), p_post_id);
    UPDATE forum_posts SET bookmark_count = bookmark_count + 1 WHERE id = p_post_id;
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark comment as solution
CREATE OR REPLACE FUNCTION mark_as_solution(p_comment_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_post_id UUID;
  v_post_author_id UUID;
BEGIN
  -- Get post info
  SELECT c.post_id, p.author_id INTO v_post_id, v_post_author_id
  FROM forum_comments c
  JOIN forum_posts p ON p.id = c.post_id
  WHERE c.id = p_comment_id;

  -- Only post author can mark solution
  IF v_post_author_id != auth.uid() THEN
    RAISE EXCEPTION 'Only post author can mark solution';
  END IF;

  -- Clear existing solution
  UPDATE forum_comments
  SET is_solution = FALSE
  WHERE post_id = v_post_id AND is_solution = TRUE;

  -- Mark new solution
  UPDATE forum_comments
  SET is_solution = TRUE
  WHERE id = p_comment_id;

  -- Mark post as solved
  UPDATE forum_posts
  SET is_solved = TRUE
  WHERE id = v_post_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search posts
CREATE OR REPLACE FUNCTION search_forum_posts(
  p_query TEXT,
  p_post_type TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  author_id UUID,
  author_name TEXT,
  title TEXT,
  excerpt TEXT,
  post_type TEXT,
  tags TEXT[],
  condition_tags TEXT[],
  view_count INTEGER,
  like_count INTEGER,
  comment_count INTEGER,
  is_pinned BOOLEAN,
  is_solved BOOLEAN,
  created_at TIMESTAMPTZ,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    fp.id,
    fp.author_id,
    pr.display_name as author_name,
    fp.title,
    fp.excerpt,
    fp.post_type,
    fp.tags,
    fp.condition_tags,
    fp.view_count,
    fp.like_count,
    fp.comment_count,
    fp.is_pinned,
    fp.is_solved,
    fp.created_at,
    ts_rank(
      to_tsvector('swedish', coalesce(fp.title, '') || ' ' || coalesce(fp.content, '')),
      plainto_tsquery('swedish', p_query)
    ) as relevance
  FROM forum_posts fp
  LEFT JOIN profiles pr ON pr.id = fp.author_id
  WHERE fp.status = 'published'
    AND (p_query IS NULL OR p_query = '' OR
         to_tsvector('swedish', coalesce(fp.title, '') || ' ' || coalesce(fp.content, ''))
         @@ plainto_tsquery('swedish', p_query))
    AND (p_post_type IS NULL OR fp.post_type = p_post_type)
    AND (p_tags IS NULL OR fp.tags && p_tags OR fp.condition_tags && p_tags)
  ORDER BY
    fp.is_pinned DESC,
    CASE WHEN p_query IS NOT NULL AND p_query != '' THEN
      ts_rank(
        to_tsvector('swedish', coalesce(fp.title, '') || ' ' || coalesce(fp.content, '')),
        plainto_tsquery('swedish', p_query)
      )
    ELSE 0 END DESC,
    fp.last_activity_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get forum statistics
CREATE OR REPLACE FUNCTION get_forum_stats()
RETURNS TABLE(
  total_posts INTEGER,
  total_comments INTEGER,
  total_users INTEGER,
  posts_this_week INTEGER,
  solved_questions INTEGER,
  popular_tags JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INTEGER FROM forum_posts WHERE status = 'published'),
    (SELECT COUNT(*)::INTEGER FROM forum_comments WHERE status = 'published'),
    (SELECT COUNT(DISTINCT author_id)::INTEGER FROM forum_posts WHERE status = 'published'),
    (SELECT COUNT(*)::INTEGER FROM forum_posts
     WHERE status = 'published' AND created_at >= NOW() - INTERVAL '7 days'),
    (SELECT COUNT(*)::INTEGER FROM forum_posts
     WHERE status = 'published' AND post_type = 'question' AND is_solved = TRUE),
    (SELECT jsonb_agg(tag_info) FROM (
      SELECT jsonb_build_object('tag', tag, 'count', count) as tag_info
      FROM (
        SELECT unnest(tags) as tag, COUNT(*) as count
        FROM forum_posts WHERE status = 'published'
        GROUP BY tag ORDER BY count DESC LIMIT 10
      ) t
    ) t2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_post_views TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_post_like TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_comment_like TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_bookmark TO authenticated;
GRANT EXECUTE ON FUNCTION mark_as_solution TO authenticated;
GRANT EXECUTE ON FUNCTION search_forum_posts TO authenticated;
GRANT EXECUTE ON FUNCTION get_forum_stats TO authenticated;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update post timestamp on edit
CREATE OR REPLACE FUNCTION update_forum_post_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_forum_posts_timestamp
  BEFORE UPDATE ON forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_forum_post_timestamp();

-- Update post activity when comment added
CREATE OR REPLACE FUNCTION update_post_activity_on_comment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_posts
  SET
    last_activity_at = NOW(),
    comment_count = (
      SELECT COUNT(*) FROM forum_comments
      WHERE post_id = NEW.post_id AND status = 'published'
    )
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_on_comment
  AFTER INSERT ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_activity_on_comment();

-- Generate excerpt on post insert/update
CREATE OR REPLACE FUNCTION generate_post_excerpt()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.excerpt IS NULL OR NEW.excerpt = '' THEN
    NEW.excerpt = LEFT(regexp_replace(NEW.content, '<[^>]*>', '', 'g'), 200);
    IF length(NEW.content) > 200 THEN
      NEW.excerpt = NEW.excerpt || '...';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_excerpt_trigger
  BEFORE INSERT OR UPDATE ON forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION generate_post_excerpt();

-- Update tag usage counts
CREATE OR REPLACE FUNCTION update_tag_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrement old tag counts
  IF TG_OP = 'UPDATE' AND OLD.tags IS NOT NULL THEN
    UPDATE forum_tags SET usage_count = usage_count - 1
    WHERE id = ANY(OLD.tags);
  END IF;

  -- Increment new tag counts
  IF NEW.tags IS NOT NULL THEN
    UPDATE forum_tags SET usage_count = usage_count + 1
    WHERE id = ANY(NEW.tags);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tags_on_post
  AFTER INSERT OR UPDATE ON forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_counts();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for posts with author info
CREATE OR REPLACE VIEW forum_posts_with_author AS
SELECT
  fp.*,
  pr.display_name as author_name,
  pr.avatar_url as author_avatar
FROM forum_posts fp
LEFT JOIN profiles pr ON pr.id = fp.author_id
WHERE fp.status = 'published';

-- Grant access to views
GRANT SELECT ON forum_posts_with_author TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE forum_posts IS 'Provider community forum posts including discussions, case studies, questions, tips, and announcements';
COMMENT ON TABLE forum_comments IS 'Comments and replies on forum posts with threading support';
COMMENT ON TABLE forum_likes IS 'User likes on posts and comments';
COMMENT ON TABLE forum_bookmarks IS 'User bookmarks for saving posts';
COMMENT ON TABLE forum_tags IS 'Predefined tags for categorizing forum content';
COMMENT ON FUNCTION increment_post_views IS 'Increment view count when post is viewed';
COMMENT ON FUNCTION toggle_post_like IS 'Toggle like on a post, returns true if liked, false if unliked';
COMMENT ON FUNCTION toggle_comment_like IS 'Toggle like on a comment';
COMMENT ON FUNCTION toggle_bookmark IS 'Toggle bookmark on a post';
COMMENT ON FUNCTION mark_as_solution IS 'Mark a comment as the solution to a question post';
COMMENT ON FUNCTION search_forum_posts IS 'Full-text search across forum posts with filters';
COMMENT ON FUNCTION get_forum_stats IS 'Get aggregate forum statistics';
