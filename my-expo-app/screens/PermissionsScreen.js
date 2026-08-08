import React, { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, Alert,
  ActivityIndicator, RefreshControl, StyleSheet,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { useUser } from "../services/UserContext";

export default function PermissionsScreen({ route }) {
  const navigation = useNavigation();
  const { user } = useUser();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const isAdmin = route?.params?.role === "admin";
  const userId = route?.params?.userId || user?.id;

  const fetchPermissions = async () => {
    try {
      const res = await api.get("/permissions/");
      const data = res.data.permissions || [];
      setPermissions(isAdmin ? data : data.filter((p) => p.user_id === userId));
    } catch (e) {
      console.error("Error al cargar permisos:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchPermissions(); }, [userId]));

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPermissions();
  };

  const handleStatusChange = (id, status, userName) => {
    const action = status === "approved" ? "Aprobar" : "Rechazar";
    Alert.alert(action, `¿${action} solicitud de ${userName}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: action,
        onPress: async () => {
          try {
            // ✅ Enviar requester_id para que el backend sepa que es admin
            await api.put(`/permissions/${id}?requester_id=${user?.id}`, { status });
            Alert.alert("Éxito", `Solicitud ${status === "approved" ? "aprobada" : "rechazada"}`);
            fetchPermissions();
          } catch (e) {
            Alert.alert("Error", "No se pudo actualizar");
          }
        },
      },
    ]);
  };

  const filteredPermissions = activeTab === "all"
    ? permissions
    : permissions.filter((p) => p.status === activeTab);

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved": return { bg: "#ECFDF5", text: "#10B981", label: "Aprobado" };
      case "rejected": return { bg: "#FEF2F2", text: "#EF4444", label: "Rechazado" };
      default: return { bg: "#FEF3C7", text: "#D97706", label: "Pendiente" };
    }
  };

  const TABS = [
    { key: "all", label: "Todos" },
    { key: "pending", label: "Pendientes" },
    { key: "approved", label: "Aprobados" },
    { key: "rejected", label: "Rechazados" },
  ];

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#007AFF" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredPermissions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const badge = getStatusBadge(item.status);
          return (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{item.user_name || `Usuario #${item.user_id}`}</Text>
                <Text style={styles.reason}>{item.reason || "Sin motivo"}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                  <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                  <Text style={styles.dateText}>{item.start_date} → {item.end_date}</Text>
                </View>
              </View>
              <View style={{ alignItems: "flex-end", gap: 8 }}>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                </View>

                {!isAdmin && item.status !== "approved" && (
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => navigation.navigate("PermissionEdit", { id: item.id })}
                  >
                    <Ionicons name="pencil" size={16} color="#007AFF" />
                  </TouchableOpacity>
                )}

                {isAdmin && item.status === "pending" && (
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    <TouchableOpacity style={styles.rejectBtn} onPress={() => handleStatusChange(item.id, "rejected", item.user_name)}>
                      <Ionicons name="close" size={14} color="#EF4444" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.approveBtn} onPress={() => handleStatusChange(item.id, "approved", item.user_name)}>
                      <Ionicons name="checkmark" size={14} color="#10B981" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#007AFF"]} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No hay solicitudes</Text>
          </View>
        }
      />

      {!isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("PermissionForm", { userId })}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", paddingHorizontal: 16, paddingTop: 8 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabRow: { flexDirection: "row", backgroundColor: "#E5E7EB", borderRadius: 10, padding: 3, marginBottom: 14 },
  tab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  tabActive: { backgroundColor: "#fff", elevation: 2 },
  tabText: { fontSize: 11, fontWeight: "600", color: "#6B7280" },
  tabTextActive: { color: "#007AFF" },
  card: { backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 8, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB" },
  userName: { fontSize: 14, fontWeight: "700", color: "#111" },
  reason: { fontSize: 12, color: "#4B5563", marginTop: 2 },
  dateText: { fontSize: 11, color: "#6B7280", marginLeft: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  editBtn: { backgroundColor: "#EFF6FF", padding: 6, borderRadius: 6, marginTop: 4 },
  rejectBtn: { backgroundColor: "#FEF2F2", padding: 8, borderRadius: 8 },
  approveBtn: { backgroundColor: "#ECFDF5", padding: 8, borderRadius: 8 },
  emptyContainer: { alignItems: "center", paddingVertical: 40 },
  emptyText: { color: "#9CA3AF", marginTop: 8, fontSize: 14 },
  fab: { position: "absolute", bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: "#007AFF", justifyContent: "center", alignItems: "center", elevation: 5 },
});