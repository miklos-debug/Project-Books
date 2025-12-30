import { RouteProp, useRoute } from "@react-navigation/native";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { ContentItem } from "@bookpulse/shared";
import AudioPlayer from "../ui/AudioPlayer";
import { supabase } from "../supabaseClient";
import { useAuth } from "../providers/AuthProvider";

type ParamList = {
  ContentDetail: { id: string };
};

export default function ContentDetailScreen() {
  const route = useRoute<RouteProp<ParamList, "ContentDetail">>();
  const { id } = route.params;
  const [item, setItem] = useState<ContentItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    supabase
      .from("content_items_view")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => setItem(data as ContentItem));
  }, [id]);

  useEffect(() => {
    if (!session) {
      setSaved(false);
      return;
    }
    supabase
      .from("user_saves")
      .select("content_id")
      .eq("content_id", id)
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => setSaved(Boolean(data)));
  }, [id, session]);

  const toggleSave = async () => {
    if (!session) {
      Alert.alert("Sign in required", "Create an account in the Profile tab to save summaries.");
      return;
    }
    setSaving(true);
    if (saved) {
      await supabase.from("user_saves").delete().eq("content_id", id).eq("user_id", session.user.id);
      setSaved(false);
    } else {
      await supabase.from("user_saves").upsert({ content_id: id, user_id: session.user.id });
      setSaved(true);
    }
    setSaving(false);
  };

  if (!item) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.meta}>{item.author_name}</Text>
      <Text style={styles.meta}>{item.reading_time_minutes} min read</Text>
      <View style={styles.actions}>
        <Pressable style={styles.button}><Text style={styles.buttonText}>Read</Text></Pressable>
        <Pressable style={styles.button} onPress={toggleSave} disabled={saving}>
          <Text style={styles.buttonText}>{saved ? "Saved" : "Save"}</Text>
        </Pressable>
      </View>
      {item.audio_url ? (
        <AudioPlayer uri={item.audio_url} />
      ) : null}
      <View style={styles.summary}>
        {item.summary_json.sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  meta: { color: "#6b7280", marginBottom: 2 },
  actions: { flexDirection: "row", gap: 8, marginVertical: 12 },
  button: { backgroundColor: "#111827", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  buttonText: { color: "white", fontWeight: "700" },
  summary: { marginTop: 12, gap: 12 },
  section: { gap: 4 },
  sectionHeading: { fontWeight: "700" },
  sectionBody: { color: "#1f2937", lineHeight: 20 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
});
