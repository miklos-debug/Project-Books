import "react-native-gesture-handler";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import HomeScreen from "./app/screens/HomeScreen";
import SearchScreen from "./app/screens/SearchScreen";
import LibraryScreen from "./app/screens/LibraryScreen";
import ProfileScreen from "./app/screens/ProfileScreen";
import ContentDetailScreen from "./app/screens/ContentDetailScreen";
import { queryClient } from "@bookpulse/shared";
import { SafeAreaView, useColorScheme } from "react-native";
import { AuthProvider } from "./app/providers/AuthProvider";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const Tabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Library" component={LibraryScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default function App() {
  const scheme = useColorScheme();
  const theme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: { ...DefaultTheme.colors, background: scheme === "dark" ? "#0b0c10" : "#f4f5f6" },
    }),
    [scheme]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationContainer theme={theme}>
          <StatusBar style="auto" />
          <Stack.Navigator>
            <Stack.Screen name="Root" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen name="ContentDetail" component={ContentDetailScreen} options={{ title: "Summary" }} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </QueryClientProvider>
  );
}
