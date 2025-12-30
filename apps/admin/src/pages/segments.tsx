import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Segment } from "@bookpulse/shared";
import { NavBar } from "../components/NavBar";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

export default function SegmentsPage() {
  const supabase = useSupabaseClient();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("segments").select("*").order("order_index").then(({ data }) => setSegments(data || []));
  }, [supabase]);

  const updateSegment = (id: string, patch: Partial<Segment>) => {
    setSegments((current) => current.map((seg) => (seg.id === id ? { ...seg, ...patch } : seg)));
  };

  const persist = async () => {
    setSaving(true);
    const updates = segments.map(({ id, is_active, order_index }) => ({ id, is_active, order_index }));
    await supabase.from("segments").upsert(updates);
    setSaving(false);
  };

  return (
    <>
      <NavBar />
      <main className="page">
        <header className="header">
          <div>
            <p className="eyebrow">Home feed</p>
            <h1>Segments</h1>
          </div>
          <div className="actions">
            <button className="button" onClick={persist} disabled={saving}>
              Save changes
            </button>
          </div>
        </header>
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Order</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((segment) => (
                <tr key={segment.id}>
                  <td>{segment.name}</td>
                  <td>{segment.type}</td>
                  <td>
                    <input
                      type="number"
                      value={segment.order_index}
                      onChange={(e) => updateSegment(segment.id, { order_index: parseInt(e.target.value || "0", 10) })}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={segment.is_active}
                      onChange={(e) => updateSegment(segment.id, { is_active: e.target.checked })}
                    />
                  </td>
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
