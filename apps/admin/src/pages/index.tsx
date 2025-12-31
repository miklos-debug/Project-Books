import { GetServerSideProps } from "next";
import Link from "next/link";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { NavBar } from "../components/NavBar";

export default function Home() {
  return (
    <>
      <NavBar />
      <main className="page">
        <header className="header">
          <div>
            <p className="eyebrow">BookPulse Admin</p>
            <h1>Dashboard</h1>
          </div>
          <div className="actions">
            <Link href="/segments" className="button secondary">Manage feed</Link>
            <Link href="/content/new" className="button">New item</Link>
          </div>
        </header>
        <p>Welcome back. Use the quick links above to keep the library fresh.</p>
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
