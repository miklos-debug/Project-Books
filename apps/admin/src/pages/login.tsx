import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { FormEvent, useState } from "react";
import { GetServerSideProps } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

export default function LoginPage() {
  const supabase = useSupabaseClient();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({ email });
    setMessage(error ? error.message : "Check your email for a magic link.");
  };

  return (
    <main className="page narrow">
      <h1>Admin login</h1>
      <p>Use the email associated with your admin role.</p>
      <form onSubmit={onSubmit} className="card form">
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <button type="submit" className="button">Send magic link</button>
        {message && <p className="muted">{message}</p>}
      </form>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createPagesServerClient(ctx);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: {} };
};
