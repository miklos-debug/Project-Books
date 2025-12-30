import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Audio } from "expo-av";

interface Props {
  uri: string;
}

export default function AudioPlayer({ uri }: Props) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [status, setStatus] = useState<Audio.AVPlaybackStatus | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { sound: s } = await Audio.Sound.createAsync({ uri }, {}, (st) => mounted && setStatus(st));
      setSound(s);
    })();
    return () => {
      mounted = false;
      sound?.unloadAsync();
    };
  }, [uri]);

  const toggle = async () => {
    if (!sound || !status || !("isPlaying" in status)) return;
    if (status.isPlaying) await sound.pauseAsync();
    else await sound.playAsync();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Audio</Text>
      <Pressable style={styles.button} onPress={toggle}>
        <Text style={styles.buttonText}>{status && "isPlaying" in status && status.isPlaying ? "Pause" : "Play"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 12, gap: 8 },
  label: { fontWeight: "700" },
  button: { backgroundColor: "#2563eb", paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "700" },
});
