import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, Modal,
  TextInput, Alert, ActivityIndicator, StyleSheet, ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

export default function SchedulesScreen() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [workedDays, setWorkedDays] = useState("Lun,Mar,Mier,Jue,Vier");
  const [lateMinutes, setLateMinutes] = useState("15");
  const [saving, setSaving] = useState(false);

  const fetchSchedules = async () => {
    try {
      const res = await api.get("/schedules/");
      setSchedules(res.data.schedules || []);
    } catch (e) {
      console.error("Error al cargar horarios:", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchSchedules(); }, []));

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setName(item.name || "");
      setCheckIn(item.check_in || "");
      setCheckOut(item.check_out || "");
      setWorkedDays(item.worked_days || "Lun,Mar,Mier,Jue,Vier");
      setLateMinutes((item.late_minutes || 15).toString());
    } else {
      setEditingId(null);
      setName("");
      setCheckIn("");
      setCheckOut("");
      setWorkedDays("Lun,Mar,Mier,Jue,Vier");
      setLateMinutes("15");
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !checkIn.trim() || !checkOut.trim()) {
      Alert.alert("Error", "Completa nombre, entrada y salida");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name, check_in: checkIn, check_out: checkOut,
        worked_days: workedDays,
        late_minutes: parseInt(lateMinutes) || 15,
      };

      if (editingId) {
        await api.put(`/schedules/${editingId}`, payload);
      } else {
        await api.post("/schedules/", payload);
      }
      setModalVisible(false);
      fetchSchedules();
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar el horario");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#007AFF" /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={schedules}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.scheduleName}>{item.name}</Text>
              <Text style={styles.scheduleTime}>🕒 {item.check_in} - {item.check_out}</Text>
              <Text style={styles.scheduleDays}>📅 {item.worked_days || "Lun-Vie"}</Text>
              <Text style={styles.scheduleTolerance}>⏳ Tolerancia: {item.late_minutes || 15} min</Text>
            </View>
            <TouchableOpacity onPress={() => openModal(item)} style={styles.editBtn}>
              <Ionicons name="pencil" size={18} color="#007AFF" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay horarios registrados</Text>}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <ScrollView contentContainerStyle={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingId ? "Editar" : "Nuevo"} Horario</Text>

            <Text style={styles.label}>Nombre *</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Ej. Matutino" style={styles.input} />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Entrada *</Text>
                <TextInput value={checkIn} onChangeText={setCheckIn} placeholder="08:00:00" style={styles.input} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Salida *</Text>
                <TextInput value={checkOut} onChangeText={setCheckOut} placeholder="16:00:00" style={styles.input} />
              </View>
            </View>

            <Text style={styles.label}>Días laborales</Text>
            <TextInput value={workedDays} onChangeText={setWorkedDays} placeholder="Lun,Mar,Mier,Jue,Vier" style={styles.input} />

            <Text style={styles.label}>Tolerancia (minutos)</Text>
            <TextInput value={lateMinutes} onChangeText={setLateMinutes} keyboardType="numeric" style={styles.input} />

            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.saveBtn} disabled={saving}>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>{saving ? "Guardando..." : "Guardar"}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", paddingHorizontal: 16, paddingTop: 8 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 10, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB" },
  scheduleName: { fontSize: 16, fontWeight: "bold", color: "#111" },
  scheduleTime: { fontSize: 13, color: "#4B5563", marginTop: 4 },
  scheduleDays: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  scheduleTolerance: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  editBtn: { backgroundColor: "#EFF6FF", padding: 10, borderRadius: 8, alignSelf: "flex-start" },
  emptyText: { textAlign: "center", color: "#9CA3AF", marginTop: 40, fontSize: 14 },
  fab: { position: "absolute", bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: "#007AFF", justifyContent: "center", alignItems: "center", elevation: 5 },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", padding: 20, borderRadius: 16 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 14 },
  label: { fontSize: 12, fontWeight: "600", color: "#374151", marginTop: 8 },
  input: { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 8, padding: 10, marginTop: 4, backgroundColor: "#fff" },
  row: { flexDirection: "row" },
  modalBtns: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 20 },
  cancelBtn: { padding: 10 },
  saveBtn: { backgroundColor: "#007AFF", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
});