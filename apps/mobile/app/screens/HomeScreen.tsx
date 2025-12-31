import { ScrollView, StyleSheet, View, Text, ActivityIndicator, RefreshControl } from "react-native";
import { SegmentWithItems } from "@bookpulse/shared";
import SegmentCarousel from "../ui/SegmentCarousel";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabaseClient";

export default function HomeScreen() {
  const { data, isLoading, error, refetch, isRefetching } = useQuery<SegmentWithItems[]>({
    queryKey: ["segments"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_active_segments");
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Unable to load feed: {String(error)}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      {data?.map((segment) => (
        <SegmentCarousel key={segment.id} segment={segment} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  error: {
    color: "#c1121f",
    textAlign: "center",
  },
});
