import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { FormEvent, useEffect, useState } from "react";
import { NavBar } from "../../components/NavBar";
import { ContentItem } from "@bookpulse/shared";

interface Props {
  id: string;
}

export default function EditContentPage({ id }: Props) {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [categories, setCategories] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("content_items")
      .select("id,title,author_id,cover_url,audio_url,summary_json,publish_status,published_at,reading_time_minutes")
      .eq("id", id)
      .single()
      .then(({ data }) => setItem(data as ContentItem));
    supabase
      .from("content_category")
      .select("category_id, categories(name)")
      .eq("content_id", id)
      .then(({ data }) => setCategories((data || []).map((row: any) => row.categories?.name).filter(Boolean).join(", ")));
    supabase
      .from("content_tag")
      .select("tag_id, tags(name)")
      .eq("content_id", id)
      .then(({ data }) => setTags((data || []).map((row: any) => row.tags?.name).filter(Boolean).join(", ")));
  }, [id, supabase]);

  if (!item) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data, error } = await supabase
      .from("content_items")
      .update({
        title: item.title,
        cover_url: item.cover_url,
        audio_url: item.audio_url,
        summary_json: item.summary_json,
        publish_status: item.publish_status,
        published_at: item.publish_status === "published" ? item.published_at || new Date().toISOString() : null,
        reading_time_minutes: item.reading_time_minutes,
      })
      .eq("id", id)
      .select("id")
      .single();

    if (error || !data) {
      alert(error?.message || "Unable to update content");
      setSaving(false);
      return;
    }

    await syncTaxonomy(supabase, id, categories, "categories", "content_category");
    await syncTaxonomy(supabase, id, tags, "tags", "content_tag");
    setSaving(false);
    router.replace("/content");
  };

  return (
    <>
      <NavBar />
      <main className="page narrow">
        <h1>Edit content</h1>
        <form className="card form" onSubmit={handleSubmit}>
          <label>Title</label>
          <input value={item.title} onChange={(e) => setItem({ ...item, title: e.target.value })} />
          <label>Summary</label>
          <textarea
            value={item.summary_json.sections?.[0]?.body || ""}
            onChange={(e) => setItem({ ...item, summary_json: { sections: [{ heading: "Summary", body: e.target.value }] } })}
          />
          <label>Cover URL</label>
          <input value={item.cover_url || ""} onChange={(e) => setItem({ ...item, cover_url: e.target.value })} />
          <label>Audio URL</label>
          <input value={item.audio_url || ""} onChange={(e) => setItem({ ...item, audio_url: e.target.value })} />
          <label>Reading time (minutes)</label>
          <input
            type="number"
            value={item.reading_time_minutes}
            onChange={(e) => setItem({ ...item, reading_time_minutes: parseInt(e.target.value || "0", 10) })}
          />
          <label>Status</label>
          <select
            value={item.publish_status}
            onChange={(e) => setItem({ ...item, publish_status: e.target.value as any })}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <label>Categories (comma separated)</label>
          <input value={categories} onChange={(e) => setCategories(e.target.value)} />
          <label>Tags (comma separated)</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} />
          <button className="button" type="submit" disabled={saving}>
            Save changes
          </button>
        </form>
      </main>
    </>
  );
}

async function syncTaxonomy(supabase: any, contentId: string, list: string, table: string, joinTable: string) {
  const names = list
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const { data: existing } = await supabase.from(table).select("id,name").in("name", names);
  const existingNames = new Set((existing || []).map((c: any) => c.name));
  const inserts = names.filter((name) => !existingNames.has(name)).map((name) => ({ name }));
  const { data: newRows } = inserts.length
    ? await supabase.from(table).insert(inserts).select("id,name")
    : { data: [] };
  const all = [...(existing || []), ...(newRows || [])];
  await supabase.from(joinTable).delete().eq("content_id", contentId);
  if (all.length) {
    await supabase
      .from(joinTable)
      .insert(all.map((row: any) => ({ content_id: contentId, [`${table.slice(0, -1)}_id`]: row.id })));
  }
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createPagesServerClient(ctx);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  return { props: { id: ctx.params?.id } };
};
