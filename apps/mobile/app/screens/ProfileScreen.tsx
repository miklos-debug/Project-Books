import { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";
import { useAuth } from "../providers/AuthProvider";

export default function ProfileScreen() {
  const { session, signInWithEmail, signOut, continueAsGuest, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSendLink = async () => {
    const error = await signInWithEmail(email);
    setMessage(error ? error : "Magic link sent. Check your email.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {session ? (
        <>
          <Text style={styles.subtitle}>Signed in as {session.user.email}</Text>
          <Pressable style={styles.button} onPress={signOut}>
            <Text style={styles.buttonText}>Sign out</Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.card}>
          <Text style={styles.subtitle}>Sign in to sync saves and progress</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />
          <Pressable style={styles.button} onPress={handleSendLink} disabled={!email}>
            <Text style={styles.buttonText}>Send magic link</Text>
          </Pressable>
          <Pressable style={styles.secondary} onPress={continueAsGuest}>
            <Text style={styles.secondaryText}>Continue as guest</Text>
          </Pressable>
          {message ? <Text style={styles.muted}>{message}</Text> : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  subtitle: { color: "#6b7280", marginBottom: 12 },
  card: { backgroundColor: "white", padding: 16, borderRadius: 12, gap: 10 },
  input: { backgroundColor: "#f3f4f6", padding: 12, borderRadius: 10 },
  button: { backgroundColor: "#111827", padding: 12, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "700" },
  secondary: { padding: 10, alignItems: "center" },
  secondaryText: { color: "#111827", fontWeight: "600" },
  muted: { color: "#6b7280" },
});
