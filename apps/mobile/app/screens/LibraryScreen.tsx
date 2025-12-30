import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { ContentItem } from "@bookpulse/shared";
import { supabase } from "../supabaseClient";
import { useAuth } from "../providers/AuthProvider";

export default function LibraryScreen() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { session, guestMode } = useAuth();

  useEffect(() => {
    if (!session) {
      setItems([]);
      setLoading(false);
      return;
    }
    supabase
      .from("user_saves_view")
      .select("id,title,cover_url,author_name")
      .eq("user_id", session.user.id)
      .then(({ data }) => setItems(data || []))
      .finally(() => setLoading(false));
  }, [session]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Saved for later</Text>
      {!session ? (
        <Text style={styles.meta}>{guestMode ? "Guest mode active. Sign in to sync your saves." : "Sign in to see your library."}</Text>
      ) : null}
      {loading ? <ActivityIndicator style={{ marginTop: 12 }} /> : null}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>{item.author_name}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  card: { paddingVertical: 12, borderBottomColor: "#eee", borderBottomWidth: 1 },
  title: { fontWeight: "600" },
  meta: { color: "#6b7280" },
});
