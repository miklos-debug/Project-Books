insert into public.authors (id, name) values
  ('11111111-1111-1111-1111-111111111111', 'Avery Lane')
  on conflict do nothing;

insert into public.content_items (id, title, author_id, cover_url, summary_json, publish_status, published_at, reading_time_minutes)
values
  ('22222222-2222-2222-2222-222222222222', 'Momentum Mornings', '11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1541963463532-d68292c34b19', '{"sections": [{"heading": "Overview", "body": "A crisp three-part breakdown on building consistent morning momentum."}]}', 'published', now(), 12)
  on conflict do nothing;

insert into public.segments (id, name, type, is_active, order_index) values
  ('33333333-3333-3333-3333-333333333333', 'New releases', 'new', true, 0),
  ('44444444-4444-4444-4444-444444444444', 'Popular picks', 'popular', true, 1),
  ('55555555-5555-5555-5555-555555555555', 'Curated spotlight', 'curated', true, 2)
  on conflict do nothing;

insert into public.segment_items (segment_id, content_id, order_index) values
  ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 0)
  on conflict do nothing;
