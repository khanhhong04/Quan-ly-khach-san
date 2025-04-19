import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="auth/dangki" options={{ headerShown: false }} />
      <Stack.Screen name="home/trangchu" options={{ headerShown: false }} />
      <Stack.Screen name="profile/hoso" options={{ headerShown: false }} />
      <Stack.Screen name="home/lich" options={{ headerShown: false }} />
      <Stack.Screen name="home/datphong" options={{ headerShown: false }} />
      <Stack.Screen name="home/timkiem" options={{ headerShown: false }} />
      <Stack.Screen name="home/spsn" options={{ headerShown: false }} />
      <Stack.Screen name="home/ttphong" options={{ headerShown: false }} />
      <Stack.Screen name="home/datngay" options={{ headerShown: false }} />
      <Stack.Screen name="auth/quenmk.tsx" options={{ headerShown: false }} />
      <Stack.Screen name="home/huyphong" options={{ headerShown: false }} />
    </Stack>
  );
}
