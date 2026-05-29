import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function Home() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.brand}>ADVANCIA</Text>
        <Text style={styles.tagline}>TRAINING</Text>
        <Text style={styles.headline}>Boost your career.{"\n"}Get certified.</Text>
        <Text style={styles.subhead}>
          Authorized training from Microsoft, Cisco, Fortinet, EC-Council, PMI, and more.
          Learn online or on-site.
        </Text>
        <Link href="/catalog" style={styles.primaryCta}>
          Browse all courses
        </Link>
        <Link href="/login" style={styles.secondaryCta}>
          Sign in
        </Link>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What you can do here</Text>
        <Bullet text="Browse the full catalog of authorized certifications." />
        <Bullet text="Enroll, learn, and track your progress on the go." />
        <Bullet text="Earn coins, redeem them on future courses." />
        <Bullet text="Download your certificates once you pass." />
      </View>

      <Text style={styles.footer}>Tunis · Casablanca · Aix-en-Provence · Abidjan</Text>
    </ScrollView>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bullet}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0a0a0b" },
  content: { padding: 20, paddingBottom: 60 },
  hero: {
    backgroundColor: "#E30613",
    padding: 24,
    borderRadius: 18,
  },
  brand: { color: "#ffffff", fontSize: 22, fontWeight: "900", letterSpacing: 2 },
  tagline: { color: "#ffffff", fontSize: 10, letterSpacing: 6, opacity: 0.85 },
  headline: { color: "#ffffff", fontSize: 28, fontWeight: "800", marginTop: 16, lineHeight: 32 },
  subhead: { color: "#ffffff", opacity: 0.92, marginTop: 10, fontSize: 14, lineHeight: 20 },
  primaryCta: {
    backgroundColor: "#ffffff",
    color: "#E30613",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  secondaryCta: {
    backgroundColor: "transparent",
    color: "#ffffff",
    borderColor: "rgba(255,255,255,0.5)",
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 10,
    fontWeight: "700",
    textAlign: "center",
  },
  section: { marginTop: 24 },
  sectionTitle: { color: "#ffffff", fontSize: 18, fontWeight: "700", marginBottom: 12 },
  bullet: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 10 },
  bulletDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#E30613", marginTop: 6 },
  bulletText: { color: "#d4d4d8", flex: 1, fontSize: 14, lineHeight: 20 },
  footer: { color: "#a1a1aa", textAlign: "center", marginTop: 30, fontSize: 12 },
});
