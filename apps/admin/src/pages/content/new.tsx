import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { FormEvent, useEffect, useState } from "react";
import { NavBar } from "../../components/NavBar";

export default function NewContentPage() {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [summary, setSummary] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [readingTime, setReadingTime] = useState(12);
  const [status, setStatus] = useState("draft");
  const [categories, setCategories] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const authorId = await upsertAuthor(supabase, author);
    const { data, error } = await supabase
      .from("content_items")
      .insert({
        title,
        author_id: authorId,
        cover_url: coverUrl || null,
        audio_url: audioUrl || null,
        summary_json: { sections: [{ heading: "Summary", body: summary }] },
        publish_status: status as any,
        published_at: status === "published" ? new Date().toISOString() : null,
        reading_time_minutes: readingTime,
      })
      .select("id")
      .single();

    if (error || !data) {
      alert(error?.message || "Unable to save content");
      setSaving(false);
      return;
    }

    await syncTaxonomy(supabase, data.id, categories, "categories", "content_category");
    await syncTaxonomy(supabase, data.id, tags, "tags", "content_tag");
    setSaving(false);
    router.replace(`/content/${data.id}`);
  };

  return (
    <>
      <NavBar />
      <main className="page narrow">
        <h1>Create content</h1>
        <form className="card form" onSubmit={handleSubmit}>
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          <label>Author</label>
          <input value={author} onChange={(e) => setAuthor(e.target.value)} required />
          <label>Summary (plain text)</label>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} required />
          <label>Cover image URL</label>
          <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} />
          <label>Audio URL (optional)</label>
          <input value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} />
          <label>Reading time (minutes)</label>
          <input
            type="number"
            value={readingTime}
            onChange={(e) => setReadingTime(parseInt(e.target.value || "0", 10))}
          />
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <label>Categories (comma separated)</label>
          <input value={categories} onChange={(e) => setCategories(e.target.value)} />
          <label>Tags (comma separated)</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} />
          <button className="button" type="submit" disabled={saving}>
            Save
          </button>
        </form>
      </main>
    </>
  );
}

async function upsertAuthor(supabase: any, authorName: string) {
  const trimmed = authorName.trim();
  if (!trimmed) return null;
  const { data: existing } = await supabase.from("authors").select("id").eq("name", trimmed).maybeSingle();
  if (existing) return existing.id;
  const { data } = await supabase.from("authors").insert({ name: trimmed }).select("id").single();
  return data?.id ?? null;
}

async function syncTaxonomy(supabase: any, contentId: string, list: string, table: string, joinTable: string) {
  const names = list
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  if (!names.length) return;
  const { data: existing } = await supabase.from(table).select("id,name").in("name", names);
  const existingNames = new Set((existing || []).map((c: any) => c.name));
  const inserts = names.filter((name) => !existingNames.has(name)).map((name) => ({ name }));
  const { data: newRows } = inserts.length
    ? await supabase.from(table).insert(inserts).select("id,name")
    : { data: [] };
  const all = [...(existing || []), ...(newRows || [])];
  await supabase.from(joinTable).delete().eq("content_id", contentId);
  await supabase
    .from(joinTable)
    .insert(all.map((row: any) => ({ content_id: contentId, [`${table.slice(0, -1)}_id`]: row.id })));
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createPagesServerClient(ctx);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  return { props: {} };
};
