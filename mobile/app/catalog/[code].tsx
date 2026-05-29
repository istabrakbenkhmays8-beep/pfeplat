import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { API_BASE } from "@/lib/api";

type Course = {
  code: string;
  title: string;
  durationDays: number;
  priceTnd: number;
  coinReward: number;
  category: { vendor: string; group: string; name: string };
  nextSession?: { startsAt: string; endsAt: string };
};

export default function CourseDetail() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // We don't have a dedicated single-course public endpoint — pull the suggest list
      // and pluck the matching record. Good enough for the mobile MVP; the web /catalog/[code]
      // is the source of truth.
      try {
        const r = await fetch(`${API_BASE}/api/catalog/suggest?q=${encodeURIComponent(String(code))}`);
        const data = await r.json();
        const match = (data.items ?? []).find((c: any) => c.code === code);
        setCourse(match ? ({ ...match, durationDays: 0, priceTnd: 0, coinReward: 0, category: { vendor: match.vendor, group: match.group, name: "" } } as Course) : null);
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

  if (loading) return <ActivityIndicator color="#E30613" style={{ marginTop: 40 }} />;
  if (!course) {
    return (
      <View style={styles.screen}>
        <Text style={styles.empty}>Course not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.code}>{course.code}</Text>
      <Text style={styles.title}>{course.title}</Text>
      <Text style={styles.vendor}>
        {course.category.vendor} · {course.category.group}
      </Text>

      <View style={styles.card}>
        <Text style={styles.kicker}>Why this matters</Text>
        <Text style={styles.body}>
          Official {course.category.vendor} training delivered by certified instructors. Pair the
          mobile app with the web catalog at advancia-training.com to enroll and track progress.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0a0a0b" },
  code: { color: "#E30613", fontFamily: "Courier", fontWeight: "700", fontSize: 13 },
  title: { color: "#fafafa", fontSize: 24, fontWeight: "800", marginTop: 6 },
  vendor: { color: "#a1a1aa", marginTop: 4 },
  card: {
    backgroundColor: "#18181b",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#27272a",
    marginTop: 20,
  },
  kicker: { color: "#a1a1aa", fontSize: 11, letterSpacing: 1, textTransform: "uppercase" },
  body: { color: "#d4d4d8", marginTop: 8, fontSize: 14, lineHeight: 21 },
  empty: { color: "#a1a1aa", textAlign: "center", marginTop: 40 },
});
