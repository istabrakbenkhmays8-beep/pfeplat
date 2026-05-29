import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#E30613" },
          headerTintColor: "#ffffff",
          headerTitleStyle: { fontWeight: "700" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Advancia Training" }} />
        <Stack.Screen name="catalog/index" options={{ title: "Courses" }} />
        <Stack.Screen name="catalog/[code]" options={{ title: "Course" }} />
        <Stack.Screen name="login" options={{ title: "Sign in" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
