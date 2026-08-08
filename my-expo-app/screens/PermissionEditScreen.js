import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import api from "../services/api";

export default function PermissionEditScreen({ navigation, route }) {
  const permissionId = route?.params?.id;

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState("");
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  useEffect(() => {
    if (permissionId) {
      api.get("/permissions/")
        .then((res) => {
          const perms = res.data.permissions || [];
          const perm = perms.find((p) => p.id === permissionId);
          if (perm) {
            setStartDate(new Date(perm.start_date));
            setEndDate(new Date(perm.end_date));
            setReason(perm.reason || "");
            setStatus(perm.status || "");
          }
        })
        .finally(() => setFetching(false));
    }
  }, [permissionId]);

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert("Error", "Ingresa un motivo");
      return;
    }
    setLoading(true);
    try {
      await api.put(`/permissions/${permissionId}`, {
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        reason: reason.trim(),
      });
      Alert.alert("Éxito", "Permiso actualizado");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#007AFF" /></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#111" />
      </TouchableOpacity>

      <Text style={styles.title}>Editar Permiso</Text>
      
      {status !== "pending" && (
        <View style={styles.warningBox}>
          <Ionicons name="warning" size={20} color="#D97706" />
          <Text style={styles.warningText}>
            Al editar, el permiso volverá a estado "Pendiente"
          </Text>
        </View>
      )}

      <Text style={styles.label}>Fecha de inicio</Text>
      <TouchableOpacity style={styles.dateBtn} onPress={() => setShowStart(true)}>
        <Ionicons name="calendar-outline" size={20} color="#007AFF" />
        <Text style={styles.dateText}>{formatDate(startDate)}</Text>
      </TouchableOpacity>
      {showStart && (
        <DateTimePicker value={startDate} mode="date"
          onChange={(e, d) => { setShowStart(false); if (d) setStartDate(d); }} />
      )}

      <Text style={styles.label}>Fecha de fin</Text>
      <TouchableOpacity style={styles.dateBtn} onPress={() => setShowEnd(true)}>
        <Ionicons name="calendar-outline" size={20} color="#007AFF" />
        <Text style={styles.dateText}>{formatDate(endDate)}</Text>
      </TouchableOpacity>
      {showEnd && (
        <DateTimePicker value={endDate} mode="date"
          onChange={(e, d) => { setShowEnd(false); if (d) setEndDate(d); }} />
      )}

      <Text style={styles.label}>Motivo</Text>
      <TextInput value={reason} onChangeText={setReason} multiline numberOfLines={3}
        style={[styles.input, { height: 80, textAlignVertical: "top" }]} />

      <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Guardar Cambios</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { padding: 20, paddingTop: 50 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  backBtn: { marginBottom: 10 },
  title: { fontSize: 22, fontWeight: "bold", color: "#111", marginBottom: 20 },
  warningBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#FEF3C7", padding: 12, borderRadius: 10, gap: 8, marginBottom: 16 },
  warningText: { flex: 1, fontSize: 12, color: "#D97706" },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginTop: 14, marginBottom: 4 },
  input: { backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#D1D5DB", fontSize: 15 },
  dateBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#D1D5DB", gap: 10 },
  dateText: { fontSize: 15, color: "#111", fontWeight: "500" },
  submitBtn: { backgroundColor: "#007AFF", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 24 },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});