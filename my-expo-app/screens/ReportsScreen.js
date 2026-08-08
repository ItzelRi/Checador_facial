import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator,
  RefreshControl, StyleSheet, Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

const BASE_URL = "http://192.168.0.8:5000";

const PERIODS = [
  { key: "day", label: "Hoy" },
  { key: "week", label: "Semana" },
  { key: "month", label: "Mes" },
  { key: "year", label: "Año" },
];

export default function ReportsScreen() {
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState("day");

  const fetchChecks = async () => {
    try {
      const res = await api.get(`/checks/today?period=${period}`);
      const data = res.data.checks || res.data || [];
      setChecks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error al cargar asistencias:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchChecks(); }, [period]));

  const handleRefresh = () => {
    setRefreshing(true);
    fetchChecks();
  };

  const formatTime = (isoString) => {
    if (!isoString) return "--:--";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getFaceUrl = (userId) => {
    return `${BASE_URL}/api/users/${userId}`;
  };

  const [faceUrls, setFaceUrls] = useState({});

  const loadFaceUrl = async (userId) => {
    if (faceUrls[userId]) return faceUrls[userId];
    try {
      const res = await api.get(`/users/${userId}`);
      const user = res.data.user || res.data;
      if (user.face_image_path) {
        const cleanPath = user.face_image_path.replace(/\\/g, "/");
        const parts = cleanPath.split("uploads/");
        const relativePath = parts.length > 1 ? parts[1] : cleanPath;
        const url = `${BASE_URL}/uploads/${relativePath}/user${userId}_1.jpg`;
        setFaceUrls((prev) => ({ ...prev, [userId]: url }));
        return url;
      }
    } catch (e) {
      // silencioso
    }
    return null;
  };

  const renderAvatar = (userId) => {
    const url = faceUrls[userId];
    if (url) {
      return <Image source={{ uri: url }} style={styles.avatar} />;
    }
    // Cargar la URL
    loadFaceUrl(userId);
    return <Ionicons name="person" size={22} color="#007AFF" />;
  };

  const stats = {
    total: checks.length,
    onTime: checks.filter((c) => c.status === "on_time").length,
    late: checks.filter((c) => c.status === "late").length,
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#007AFF" /></View>;
  }

  return (
    <View style={styles.container}>
      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time" size={20} color="#F59E0B" />
          <Text style={styles.statValue}>{stats.onTime}</Text>
          <Text style={styles.statLabel}>A tiempo</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="warning" size={20} color="#EF4444" />
          <Text style={styles.statValue}>{stats.late}</Text>
          <Text style={styles.statLabel}>Retardos</Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filterRow}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[styles.filterBtn, period === p.key && styles.filterActive]}
            onPress={() => setPeriod(p.key)}
          >
            <Text style={[styles.filterText, period === p.key && styles.filterTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      <FlatList
        data={checks}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <View style={[styles.card, item.status === "late" && styles.cardLate]}>
            <View style={styles.avatarContainer}>
              {renderAvatar(item.user_id)}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{item.user_name || `Usuario #${item.user_id}`}</Text>
              <Text style={styles.area}>{item.user_area || "General"}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.timeText}>{formatTime(item.check_in)}</Text>
              <Text style={styles.timeText}>{formatTime(item.check_out)}</Text>
              <View style={[styles.badge, item.status === "late" ? styles.badgeLate : styles.badgeOk]}>
                <Text style={[styles.badgeText, item.status === "late" ? styles.badgeTextLate : styles.badgeTextOk]}>
                  {item.status === "late" ? "Retardo" : "A tiempo"}
                </Text>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#007AFF"]} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No hay asistencias en este período</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", paddingHorizontal: 16, paddingTop: 8 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 12, alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB" },
  statValue: { fontSize: 20, fontWeight: "bold", color: "#111", marginTop: 4 },
  statLabel: { fontSize: 10, color: "#6B7280", marginTop: 2 },
  filterRow: { flexDirection: "row", backgroundColor: "#E5E7EB", borderRadius: 10, padding: 3, marginBottom: 16 },
  filterBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  filterActive: { backgroundColor: "#fff", elevation: 2 },
  filterText: { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  filterTextActive: { color: "#007AFF" },
  card: { backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 8, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB" },
  cardLate: { borderLeftWidth: 4, borderLeftColor: "#F59E0B" },
  avatarContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center", marginRight: 12, overflow: "hidden" },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  userName: { fontSize: 14, fontWeight: "700", color: "#111" },
  area: { fontSize: 11, color: "#6B7280" },
  timeText: { fontSize: 12, color: "#4B5563" },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4 },
  badgeOk: { backgroundColor: "#ECFDF5" },
  badgeLate: { backgroundColor: "#FEF3C7" },
  badgeText: { fontSize: 10, fontWeight: "700" },
  badgeTextOk: { color: "#10B981" },
  badgeTextLate: { color: "#D97706" },
  emptyContainer: { alignItems: "center", paddingVertical: 40 },
  emptyText: { color: "#9CA3AF", marginTop: 8, fontSize: 14 },
});