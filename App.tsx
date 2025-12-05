// App.tsx (di root folder ChatApp/App.tsx)
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./src/screens/LoginScreen"; // ✅ Path dari root
import ChatScreen from "./src/screens/ChatScreen";   // ✅ Path dari root
import { auth, onAuthStateChanged } from "./src/firebase"; // ✅ Path dari root
import type { User } from "firebase/auth";

export type RootStackParamList = {
  Login: undefined;
  Chat: { email: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      console.log("Auth state changed:", u?.email);
      setUser(u);
      if (initializing) setInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  if (initializing) {
    return null; //  loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            initialParams={{ email: user.email || "" }}
          />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}