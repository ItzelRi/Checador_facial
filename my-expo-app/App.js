import "./global.css";
import React from "react";
import { TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { UserProvider, useUser } from "./services/UserContext";

import LoginScreen from "./screens/LoginScreen";
import AttendanceScreen from "./screens/AttendanceScreen";
import UsersScreen from "./screens/UsersScreen";
import ReportsScreen from "./screens/ReportsScreen";
import SchedulesScreen from "./screens/SchedulesScreen";
import PermissionsScreen from "./screens/PermissionsScreen";
import UserFormScreen from "./screens/UserFormScreen";
import UserEditScreen from "./screens/UserEditScreen";
import PermissionFormScreen from "./screens/PermissionFormScreen";
import PermissionEditScreen from "./screens/PermissionEditScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AdminTabs() {
  const { logout } = useUser();
  return (
    <Tab.Navigator screenOptions={{
      headerRight: () => (
        <TouchableOpacity onPress={logout} style={{ marginRight: 15 }}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      ),
      tabBarActiveTintColor: "#007AFF", tabBarInactiveTintColor: "gray",
    }}>
      <Tab.Screen name="Asistencia" component={ReportsScreen} options={{ title: "Historial", tabBarIcon: ({ color, size }) => <Ionicons name="document-text" size={size} color={color} /> }} />
      <Tab.Screen name="Usuarios" component={UsersScreen} options={{ title: "Usuarios", tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} /> }} />
      <Tab.Screen name="Horarios" component={SchedulesScreen} options={{ title: "Horarios", tabBarIcon: ({ color, size }) => <Ionicons name="time" size={size} color={color} /> }} />
      <Tab.Screen name="Permisos" options={{ title: "Permisos", tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} /> }}>
        {() => <PermissionsScreen route={{ params: { role: "admin" } }} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function EmployeeTabs() {
  const { user, updateUser, logout } = useUser();
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: "#007AFF", tabBarInactiveTintColor: "gray" }}>
      <Tab.Screen name="Asistencia" options={{ title: "Asistencia", tabBarIcon: ({ color, size }) => <Ionicons name="camera" size={size} color={color} /> }}>
        {() => <AttendanceScreen onCheckOut={logout} onUserUpdate={updateUser} />}
      </Tab.Screen>
      <Tab.Screen name="Permisos" options={{ title: "Permisos", tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} /> }}>
        {() => <PermissionsScreen route={{ params: { role: "employee", userId: user?.id } }} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function MainNavigator() {
  const { user, setUser } = useUser();

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login">
          {() => <LoginScreen onLogin={setUser} />}
        </Stack.Screen>
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main">
        {() => user.role === "admin" ? <AdminTabs /> : <EmployeeTabs />}
      </Stack.Screen>
      <Stack.Screen name="UserForm" component={UserFormScreen} options={{ headerShown: false }} />
      <Stack.Screen name="UserEdit" component={UserEditScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PermissionForm" component={PermissionFormScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PermissionEdit" component={PermissionEditScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </UserProvider>
  );
}