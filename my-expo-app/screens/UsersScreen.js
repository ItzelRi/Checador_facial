import React, { useState, useCallback } from "react";
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  Alert, ActivityIndicator, RefreshControl, StyleSheet, Image
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

const BASE_URL = "http://192.168.0.8:5000";

export default function UsersScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
  try {
    const response = await api.get("/users/");
    console.log("Datos recibidos:", JSON.stringify(response.data.users[0]));
    setUsers(response.data.users || []);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  useFocusEffect(useCallback(() => { fetchUsers(); }, []));

  const handleRefresh = () => { setRefreshing(true); fetchUsers(); };

  const handleToggleStatus = (userId, userName, currentStatus) => {
    if (currentStatus) {
      Alert.alert("Desactivar Usuario", `¿Desactivar a ${userName}?`, [
        { text: "Cancelar", style: "cancel" },
        { text: "Desactivar", style: "destructive", onPress: async () => {
          await api.delete(`/users/${userId}`); fetchUsers();
        }},
      ]);
    } else {
      Alert.alert("Activar Usuario", `¿Activar a ${userName}?`, [
        { text: "Cancelar", style: "cancel" },
        { text: "Activar", onPress: async () => {
          await api.put(`/users/${userId}/activate`); fetchUsers();
        }},
      ]);
    }
  };

  const stats = {
    total: users.length,
    activos: users.filter((u) => u.active).length,
    inactivos: users.filter((u) => !u.active).length,
  };

  const filteredUsers = searchQuery
    ? users.filter((item) => {
        const fullName = `${item.name} ${item.lastname}`.toLowerCase();
        const area = (item.area || "").toLowerCase();
        return fullName.includes(searchQuery.toLowerCase()) || area.includes(searchQuery.toLowerCase());
      })
    : users;

  const getFaceUrl = (item) => {
    if (!item.face_image_path) return null;
    const cleanPath = item.face_image_path.replace(/\\/g, "/");
    // Extraer solo la parte después de "uploads/"
    const parts = cleanPath.split("uploads/");
    const relativePath = parts.length > 1 ? parts[1] : cleanPath;
    return `${BASE_URL}/uploads/${relativePath}/user${item.id}_1.jpg`;
  };

  const renderUserCard = ({ item }) => {
    const faceUrl = getFaceUrl(item);
    
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => navigation.navigate("UserEdit", { id: item.id })}>
        <View style={styles.avatarContainer}>
          {faceUrl ? (
            <Image source={{ uri: faceUrl }} style={styles.avatar} />
          ) : (
            <Ionicons name="person" size={24} color={item.active ? "#007AFF" : "#999"} />
          )}
        </View>
        <View style={styles.cardCenter}>
          <Text style={styles.userName} numberOfLines={1}>{item.name} {item.lastname}</Text>
          <View style={styles.areaBadge}><Text style={styles.areaText}>{item.area || "General"}</Text></View>
        </View>
        <View style={styles.cardRight}>
          <TouchableOpacity onPress={() => handleToggleStatus(item.id, `${item.name} ${item.lastname}`, item.active)}
            style={[styles.statusBadge, { backgroundColor: item.active ? "#ECFDF5" : "#FEF2F2" }]}>
            <Text style={[styles.statusText, { color: item.active ? "#10B981" : "#EF4444" }]}>{item.active ? "Activo" : "Inactivo"}</Text>
          </TouchableOpacity>
          <Text style={styles.userId}>#{item.id}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#007AFF" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statCard}><Text style={styles.statLabel}>TOTAL</Text><Text style={styles.statValue}>{stats.total}</Text></View>
        <View style={[styles.statCard, styles.statActive]}><Text style={[styles.statLabel, { color: "#059669" }]}>ACTIVOS</Text><Text style={[styles.statValue, { color: "#059669" }]}>{stats.activos}</Text></View>
        <View style={[styles.statCard, styles.statInactive]}><Text style={[styles.statLabel, { color: "#DC2626" }]}>INACTIVOS</Text><Text style={[styles.statValue, { color: "#DC2626" }]}>{stats.inactivos}</Text></View>
      </View>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput style={styles.searchInput} placeholder="Buscar por nombre o área" placeholderTextColor="#9CA3AF" value={searchQuery} onChangeText={setSearchQuery} />
        {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery("")}><Ionicons name="close-circle" size={18} color="#9CA3AF" /></TouchableOpacity>}
      </View>
      <Text style={styles.sectionTitle}>LISTADO DE PERSONAL</Text>
      <FlatList data={filteredUsers} keyExtractor={(item) => item.id.toString()} renderItem={renderUserCard}
        contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#007AFF"]} />}
        ListEmptyComponent={<View style={styles.emptyContainer}><Ionicons name="search-outline" size={48} color="#9CA3AF" /><Text style={styles.emptyText}>No se encontraron usuarios</Text></View>}
      />
      <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => navigation.navigate("UserForm")}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", paddingHorizontal: 16, paddingTop: 8 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 8, alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB" },
  statActive: { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" },
  statInactive: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  statLabel: { fontSize: 10, fontWeight: "700", color: "#6B7280", marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 14, color: "#111827", marginLeft: 8, padding: 0 },
  sectionTitle: { fontSize: 11, fontWeight: "700", color: "#6B7280", marginBottom: 10, letterSpacing: 0.5 },
  card: { backgroundColor: "#fff", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB", elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  avatarContainer: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#F3F4F6", justifyContent: "center", alignItems: "center", marginRight: 12, overflow: "hidden" },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  cardCenter: { flex: 1, justifyContent: "center" },
  userName: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 4 },
  areaBadge: { backgroundColor: "#F3F4F6", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: "flex-start" },
  areaText: { fontSize: 10, color: "#4B5563", fontWeight: "600" },
  cardRight: { alignItems: "flex-end", gap: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: "700" },
  userId: { fontSize: 12, fontWeight: "700", color: "#6B7280" },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  emptyText: { color: "#9CA3AF", marginTop: 8, fontSize: 14 },
  fab: { position: "absolute", bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: "#007AFF", justifyContent: "center", alignItems: "center", elevation: 5, shadowColor: "#007AFF", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
});
