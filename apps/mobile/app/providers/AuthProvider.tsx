import { Session } from "@supabase/supabase-js";
import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  guestMode: boolean;
  signInWithEmail: (email: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [guestMode, setGuestMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setGuestMode(false);
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: "https://localhost" } });
    return error ? error.message : null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setGuestMode(false);
  };

  const continueAsGuest = () => setGuestMode(true);

  return (
    <AuthContext.Provider value={{ session, loading, guestMode, signInWithEmail, signOut, continueAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
