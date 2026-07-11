export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  socials: Record<string, string>;
  role: 'reader' | 'admin';
  is_banned: boolean;
  banned_until: string | null;
  banned_reason: string | null;
  created_at: string;
};

export type Book = {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  status: 'draft' | 'published';
  writing_status: 'in_progress' | 'completed';
  is_featured: boolean;
  word_count: number;
  views_count: number;
  likes_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
  genres?: { id: string; name: string; slug: string }[];
  avg_rating?: number;
};

export type Chapter = {
  id: string;
  book_id: string;
  title: string;
  content: string;
  order_index: number;
  status: 'draft' | 'published';
  scheduled_at: string | null;
  views_count: number;
  likes_count: number;
  word_count: number;
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  book_id: string;
  chapter_id: string | null;
  paragraph_index: number | null;
  user_id: string;
  content: string;
  created_at: string;
  author?: Profile;
};

export type Quote = {
  id: string;
  user_id: string;
  chapter_id: string;
  book_id: string;
  text_snippet: string;
  created_at: string;
};

export type Report = {
  id: string;
  reporter_id: string;
  content_type: 'book' | 'comment' | 'chapter';
  content_id: string;
  reason: 'plagiarism' | 'profanity' | 'spam' | 'other';
  details: string | null;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
};

export type SupportTicket = {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'open' | 'answered' | 'closed';
  admin_reply: string | null;
  created_at: string;
  updated_at: string;
};
