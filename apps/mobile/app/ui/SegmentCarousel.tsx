import { View, Text, StyleSheet, FlatList, Image, Pressable } from "react-native";
import { SegmentWithItems } from "@bookpulse/shared";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

interface Props {
  segment: SegmentWithItems;
}

export default function SegmentCarousel({ segment }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{segment.name}</Text>
      <FlatList
        data={segment.items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate("ContentDetail", { id: item.id })}>
            {item.cover_url ? <Image source={{ uri: item.cover_url }} style={styles.cover} /> : null}
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.cardMeta}>{item.author_name}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  title: { fontSize: 18, fontWeight: "700" },
  card: {
    width: 160,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 12,
    marginRight: 12,
  },
  cover: { width: "100%", height: 120, borderRadius: 10, marginBottom: 8 },
  cardTitle: { fontWeight: "700" },
  cardMeta: { color: "#6b7280" },
});
