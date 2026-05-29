import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Link } from "expo-router";
import { api, API_BASE } from "@/lib/api";

type Course = {
  code: string;
  title: string;
  vendor: string;
  group: string;
};

export default function Catalog() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const h = setTimeout(load, 200);
    return () => clearTimeout(h);

    async function load() {
      if (!query.trim()) {
        // Empty: load a default list (all)
        setLoading(true);
        try {
          const r = await fetch(`${API_BASE}/api/catalog/suggest?q=a`);
          const data = await r.json();
          setItems(data.items ?? []);
        } finally {
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      const r = await api<{ items: Course[] }>(`/api/catalog/suggest?q=${encodeURIComponent(query)}`);
      setLoading(false);
      if (r.ok) setItems(r.data.items);
    }
  }, [query]);

  return (
    <View style={styles.screen}>
      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search courses…"
          placeholderTextColor="#a1a1aa"
          style={styles.input}
          autoCapitalize="none"
        />
      </View>
      {loading && <ActivityIndicator color="#E30613" />}
      <FlatList
        data={items}
        keyExtractor={(c) => c.code}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>No courses to show.</Text> : null
        }
        renderItem={({ item }) => (
          <Link href={`/catalog/${item.code}`} asChild>
            <Pressable style={styles.card}>
              <Text style={styles.code}>{item.code}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>
                {item.vendor} · {item.group}
              </Text>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0a0a0b" },
  searchWrap: { padding: 16, backgroundColor: "#18181b" },
  input: {
    backgroundColor: "#27272a",
    color: "#fafafa",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    fontSize: 15,
  },
  card: {
    backgroundColor: "#18181b",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  code: { color: "#E30613", fontFamily: "Courier", fontWeight: "700", fontSize: 12 },
  title: { color: "#fafafa", fontSize: 15, fontWeight: "600", marginTop: 4 },
  meta: { color: "#a1a1aa", fontSize: 12, marginTop: 4 },
  empty: { color: "#a1a1aa", textAlign: "center", marginTop: 30 },
});
