export type PublishStatus = "draft" | "published";

export interface ContentItem {
  id: string;
  title: string;
  author_id: string;
  author_name?: string;
  cover_url?: string;
  audio_url?: string | null;
  summary_json: { sections: { heading: string; body: string }[] };
  publish_status: PublishStatus;
  published_at?: string | null;
  reading_time_minutes: number;
  categories?: string[];
  tags?: string[];
  saves_count?: number;
  user_progress?: {
    reading_percent: number;
    audio_position_seconds: number;
  };
}

export interface Segment {
  id: string;
  name: string;
  type: "new" | "popular" | "continue" | "curated";
  is_active: boolean;
  order_index: number;
}

export interface SegmentWithItems extends Segment {
  items: ContentItem[];
}
