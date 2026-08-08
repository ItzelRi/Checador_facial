import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, TextInput,
  Alert, ActivityIndicator, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

export default function LoginScreen({ onLogin }) {
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async () => {
    if (!pin || pin.length !== 4) {
      Alert.alert("Error", "Ingresa un PIN de 4 dígitos");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/auth/login/pin", { pin });
      const user = response.data.user;
      Alert.alert("Bienvenido", `Hola ${user.name} (${user.role})`);
      onLogin(user);
    } catch (error) {
      if (error.response) {
        Alert.alert("Error", error.response.data.error || "Error del servidor");
      } else if (error.request) {
        Alert.alert("Error", "No se pudo conectar al servidor");
      } else {
        Alert.alert("Error", "Error desconocido");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeLogin = () => {
    // Pasamos un usuario temporal. El ID real se obtiene al hacer check-in
    onLogin({
      id: null,
      name: "Empleado",
      lastname: "",
      role: "employee",
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="finger-print" size={80} color="#007AFF" />
        <Text style={styles.title}>Checador Facial</Text>
        <Text style={styles.subtitle}>Sistema de Control de Asistencia</Text>
      </View>

      <View style={styles.buttonContainer}>
        {!showPinInput ? (
          <>
            <TouchableOpacity style={styles.adminButton} onPress={() => setShowPinInput(true)}>
              <Ionicons name="shield-checkmark" size={24} color="#fff" />
              <Text style={styles.buttonText}>Soy Administrador</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.employeeButton} onPress={handleEmployeeLogin}>
              <Ionicons name="camera" size={24} color="#fff" />
              <Text style={styles.buttonText}>Soy Empleado</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.pinLabel}>Ingresa tu PIN de 4 dígitos</Text>
            <TextInput style={styles.pinInput} keyboardType="numeric" maxLength={4} secureTextEntry
              value={pin} onChangeText={setPin} placeholder="• • • •" placeholderTextColor="#999" />
            <TouchableOpacity style={[styles.adminButton, loading && styles.disabledButton]}
              onPress={handleAdminLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Ingresar</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowPinInput(false)}>
              <Text style={styles.backText}>← Volver</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FF", justifyContent: "center", paddingHorizontal: 30 },
  header: { alignItems: "center", marginBottom: 60 },
  title: { fontSize: 28, fontWeight: "bold", color: "#1A1A2E", marginTop: 16 },
  subtitle: { fontSize: 14, color: "#666", marginTop: 8 },
  buttonContainer: { gap: 16, alignItems: "center" },
  adminButton: { backgroundColor: "#007AFF", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, paddingHorizontal: 30, borderRadius: 12, width: "100%", shadowColor: "#007AFF", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  employeeButton: { backgroundColor: "#34C759", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, paddingHorizontal: 30, borderRadius: 12, width: "100%", shadowColor: "#34C759", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  disabledButton: { opacity: 0.6 },
  pinLabel: { fontSize: 16, color: "#333", marginBottom: 12 },
  pinInput: { backgroundColor: "#fff", width: "60%", paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, fontSize: 24, textAlign: "center", letterSpacing: 8, borderWidth: 2, borderColor: "#007AFF", marginBottom: 16 },
  backText: { color: "#007AFF", fontSize: 16, marginTop: 12 },
});