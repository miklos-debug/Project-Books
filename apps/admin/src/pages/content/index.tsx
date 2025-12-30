import { GetServerSideProps } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { ContentItem } from "@bookpulse/shared";
import { NavBar } from "../../components/NavBar";

export default function ContentPage() {
  const supabase = useSupabaseClient();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("content_items_view")
      .select("id,title,author_name,publish_status,published_at,reading_time_minutes")
      .order("published_at", { ascending: false })
      .then(({ data }) => setItems(data || []))
      .finally(() => setLoading(false));
  }, [supabase]);

  return (
    <>
      <NavBar />
      <main className="page">
        <header className="header">
          <div>
            <p className="eyebrow">Library</p>
            <h1>Content items</h1>
          </div>
          <div className="actions">
            <Link href="/content/new" className="button">
              New item
            </Link>
          </div>
        </header>
        <div className="card">
          {loading ? <p>Loading...</p> : null}
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Published</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link href={`/content/${item.id}`}>{item.title}</Link>
                  </td>
                  <td>{item.author_name}</td>
                  <td>{item.publish_status}</td>
                  <td>{item.published_at ? new Date(item.published_at).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
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
