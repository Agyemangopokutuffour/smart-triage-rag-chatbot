import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

import LoginScreen from "../screens/LoginScreen";
import SymptomInputScreen from "../screens/SymptomInputScreen";
import ChatScreen from "../screens/ChatScreen";
import QueueScreen from "../screens/QueueScreen";
import DoctorScreen from "../screens/DoctorScreen";
import TicketScreen from "../screens/TicketScreen";
import CustomHeader from "../components/CustomHeader";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Triage"
      screenOptions={{
        header: ({ route }) => {
          let title = "Smart Triage";
          let icon = "medkit";
          if (route.name === "Chat") {
            title = "HealthBot";
            icon = "chatbubble-ellipses";
          } else if (route.name === "Queue") {
            title = "Live Queue";
            icon = "list-circle";
          } else if (route.name === "Doctor") {
            title = "Doctor View";
            icon = "person-circle";
          }
          return <CustomHeader title={title} icon={icon} />;
        },
        tabBarActiveTintColor: "#007bff",
        tabBarInactiveTintColor: "#777",
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: "#fff",
        },
      }}
    >
      <Tab.Screen
        name="Triage"
        component={SymptomInputScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medkit-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Queue"
        component={QueueScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Doctor"
        component={DoctorScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Ticket" component={TicketScreen} />
    </Stack.Navigator>
  );
}
