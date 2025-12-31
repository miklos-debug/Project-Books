import { useEffect, useState } from "react";
import { View, TextInput, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from "react-native";
import { ContentItem } from "@bookpulse/shared";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { supabase } from "../supabaseClient";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  useEffect(() => {
    const run = setTimeout(async () => {
      if (!query) {
        setResults([]);
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from("content_items_view")
        .select("id,title,author_name,cover_url,reading_time_minutes")
        .ilike("title", `%${query}%`);
      setResults(data || []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(run);
  }, [query]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search titles or authors"
        value={query}
        onChangeText={setQuery}
      />
      {loading ? <ActivityIndicator style={{ marginBottom: 12 }} /> : null}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.result} onPress={() => navigation.navigate("ContentDetail", { id: item.id })}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>{item.author_name}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: "white",
    marginBottom: 16,
  },
  result: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
  },
  title: { fontWeight: "600" },
  meta: { color: "#666" },
});
