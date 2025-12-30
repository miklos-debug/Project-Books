import Link from "next/link";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export function NavBar() {
  const supabase = useSupabaseClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <header className="topbar">
      <Link href="/" className="brand">
        BookPulse Admin
      </Link>
      <div className="spacer" />
      <Link href="/content" className="link">
        Content
      </Link>
      <Link href="/segments" className="link">
        Feed
      </Link>
      <button className="button secondary" onClick={signOut}>
        Sign out
      </button>
    </header>
  );
}
