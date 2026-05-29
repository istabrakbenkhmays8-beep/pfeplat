import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { API_BASE, setStoredToken } from "@/lib/api";

/**
 * Mobile sign-in flow.
 *
 * Calls the web's NextAuth credentials endpoint via the same /api/auth/callback/credentials
 * path the website uses. The session cookie is stored in SecureStore and attached on later
 * requests via the api() helper.
 */
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    setBusy(true);
    try {
      const csrfRes = await fetch(`${API_BASE}/api/auth/csrf`).then((r) => r.json());
      const csrfToken = csrfRes?.csrfToken as string | undefined;
      if (!csrfToken) throw new Error("no csrf");

      const body = new URLSearchParams();
      body.set("csrfToken", csrfToken);
      body.set("email", email);
      body.set("password", password);
      body.set("redirect", "false");
      body.set("json", "true");

      const res = await fetch(`${API_BASE}/api/auth/callback/credentials`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      // NextAuth sets the session cookie via Set-Cookie. Capture it from the response headers if possible.
      // RN's fetch doesn't expose Set-Cookie directly; rely on a follow-up /session call to detect success.
      const sessionRes = await fetch(`${API_BASE}/api/auth/session`).then((r) => r.json());
      if (sessionRes?.user?.email) {
        // Best-effort token capture from the cookie header.
        const setCookie = res.headers.get("set-cookie") ?? "";
        const match = setCookie.match(/next-auth\.session-token=([^;]+)/);
        if (match) await setStoredToken(match[1]);
        router.replace("/catalog");
        return;
      }
      Alert.alert("Sign-in failed", "Check your email and password.");
    } catch (e: any) {
      Alert.alert("Sign-in failed", e?.message ?? "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.sub}>Sign in to keep learning.</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          placeholder="you@advancia-training.com"
          placeholderTextColor="#71717a"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#71717a"
        />

        <Pressable
          onPress={onSubmit}
          disabled={busy || !email || !password}
          style={[styles.button, (busy || !email || !password) && styles.disabled]}
        >
          <Text style={styles.buttonText}>{busy ? "Signing in…" : "Sign in"}</Text>
        </Pressable>

        <Text style={styles.hint}>
          Try the demo account: learner@advancia-training.com / ChangeMe!2026
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0a0a0b", padding: 20, justifyContent: "center" },
  card: { backgroundColor: "#18181b", borderRadius: 16, padding: 22, borderColor: "#27272a", borderWidth: 1 },
  title: { color: "#fafafa", fontSize: 22, fontWeight: "800" },
  sub: { color: "#a1a1aa", marginTop: 4 },
  label: { color: "#d4d4d8", marginTop: 16, fontSize: 13 },
  input: {
    backgroundColor: "#27272a",
    color: "#fafafa",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 6,
    fontSize: 15,
  },
  button: { backgroundColor: "#E30613", marginTop: 22, padding: 14, borderRadius: 10, alignItems: "center" },
  disabled: { opacity: 0.6 },
  buttonText: { color: "#ffffff", fontWeight: "700", fontSize: 15 },
  hint: { color: "#71717a", fontSize: 11, marginTop: 16, textAlign: "center" },
});
