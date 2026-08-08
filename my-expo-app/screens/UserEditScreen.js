import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

export default function UserEditScreen({ navigation, route }) {
  const userId = route?.params?.id;

  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [genre, setGenre] = useState("");
  const [occupation, setOccupation] = useState("");
  const [area, setArea] = useState("");
  const [role, setRole] = useState("employee");
  const [scheduleId, setScheduleId] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (userId) {
      api.get(`/users/${userId}`)
        .then((response) => {
          const user = response.data.user || response.data;
          setName(user.name || "");
          setLastname(user.lastname || "");
          setGenre(user.genre || "");
          setOccupation(user.occupation || "");
          setArea(user.area || "");
          setRole(user.role || "employee");
          setScheduleId(user.schedule_id?.toString() || "");
          setPin(user.pin || "");
        })
        .finally(() => setFetching(false));
    }
  }, [userId]);

  const handleSubmit = async () => {
    if (!name.trim() || !lastname.trim()) {
      Alert.alert("Campos requeridos", "Nombre y apellido son obligatorios");
      return;
    }
    setLoading(true);
    try {
      // Enviar como JSON (sin imágenes)
      const data = { name, lastname, genre, occupation, area, role };
      if (scheduleId) data.schedule_id = scheduleId;
      if (pin) data.pin = pin;
      
      await api.post(`/users/${userId}`, data);
      Alert.alert("Éxito", "Usuario actualizado");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#007AFF" /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#111827" />
      </TouchableOpacity>
      <Text style={styles.title}>Editar Usuario</Text>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Nombre *</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} />
        <Text style={styles.label}>Apellidos *</Text>
        <TextInput value={lastname} onChangeText={setLastname} style={styles.input} />
        <Text style={styles.label}>Género</Text>
        <TextInput value={genre} onChangeText={setGenre} style={styles.input} />
        <Text style={styles.label}>Ocupación</Text>
        <TextInput value={occupation} onChangeText={setOccupation} style={styles.input} />
        <Text style={styles.label}>Área</Text>
        <TextInput value={area} onChangeText={setArea} style={styles.input} />
        <Text style={styles.label}>Rol</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity style={[styles.roleButton, role === "employee" && styles.roleActive]} onPress={() => setRole("employee")}>
            <Text style={[styles.roleText, role === "employee" && styles.roleTextActive]}>Empleado</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.roleButton, role === "admin" && styles.roleActive]} onPress={() => setRole("admin")}>
            <Text style={[styles.roleText, role === "admin" && styles.roleTextActive]}>Admin</Text>
          </TouchableOpacity>
        </View>
        {role === "admin" && (
          <>
            <Text style={styles.label}>PIN</Text>
            <TextInput value={pin} onChangeText={setPin} keyboardType="numeric" maxLength={4} style={styles.input} />
          </>
        )}
        <Text style={styles.label}>ID Horario</Text>
        <TextInput value={scheduleId} onChangeText={setScheduleId} keyboardType="numeric" style={styles.input} />
      </View>
      <TouchableOpacity style={[styles.submitButton, loading && styles.disabledButton]} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Guardar Cambios</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  backButton: { marginBottom: 12, width: 40, height: 40, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", color: "#111827", marginBottom: 20 },
  formGroup: { gap: 6, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginTop: 10 },
  input: { backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: "#D1D5DB", fontSize: 15, color: "#111827" },
  roleContainer: { flexDirection: "row", gap: 10 },
  roleButton: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: "#D1D5DB", alignItems: "center", backgroundColor: "#fff" },
  roleActive: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  roleText: { fontSize: 14, fontWeight: "600", color: "#374151" },
  roleTextActive: { color: "#fff" },
  submitButton: { backgroundColor: "#007AFF", paddingVertical: 14, borderRadius: 10, alignItems: "center", marginTop: 10, marginBottom: 20 },
  disabledButton: { backgroundColor: "#9CA3AF" },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});