import React from "react";
import { Platform } from "react-native";

// Only import gesture handler on native, not web
if (Platform.OS !== "web") {
  require("react-native-gesture-handler");
}

import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./navigation/AppNavigator";

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
