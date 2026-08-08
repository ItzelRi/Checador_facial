import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

export default function AttendanceScreen({ onCheckOut, onUserUpdate }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);

  if (!permission) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#007AFF" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="camera-outline" size={60} color="#007AFF" />
        <Text style={styles.permTitle}>Permiso de cámara requerido</Text>
        <Text style={styles.permSubtitle}>Necesitamos acceso para el reconocimiento facial</Text>
        <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
          <Text style={styles.permButtonText}>Conceder Permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    setLoading(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });

      const formData = new FormData();
      formData.append("image", {
        uri: photo.uri,
        name: "scan.jpg",
        type: "image/jpeg",
      });

      const response = await api.post("/checks/facial", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { message, user_id, user_name } = response.data;

      // Actualizar el ID real del usuario después del check-in
      if (user_id && onUserUpdate) {
        console.log("🔄 Actualizando user_id:", user_id);
        onUserUpdate({ id: user_id, name: user_name || "Empleado", role: "employee" });
      }

      if (message.toLowerCase().includes("check-out") || message.toLowerCase().includes("salida") || message.toLowerCase().includes("hasta luego")) {
        Alert.alert("¡Hasta luego!", message, [
          { text: "OK", onPress: () => onCheckOut() }
        ]);
      } else {
        Alert.alert("¡Bienvenido!", message || "Asistencia registrada");
      }
    } catch (error) {
      const msg = error.response?.data?.error || "Error de conexión";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verificación Biométrica</Text>
      <Text style={styles.subtitle}>Alinea tu rostro en el marco</Text>

      <View style={styles.cameraWrapper}>
        <CameraView style={styles.camera} facing="front" ref={cameraRef} />
        <View style={styles.overlay}>
          <View style={styles.ovalFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.captureBtn, loading && styles.disabledBtn]}
        onPress={handleCapture}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="scan" size={24} color="#fff" />
            <Text style={styles.captureText}>Escanear Rostro</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 20, paddingHorizontal: 20 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 30 },
  permTitle: { fontSize: 20, fontWeight: "bold", color: "#111", marginTop: 20, textAlign: "center" },
  permSubtitle: { fontSize: 14, color: "#666", textAlign: "center", marginTop: 8 },
  permButton: { backgroundColor: "#007AFF", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 16 },
  permButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", color: "#111" },
  subtitle: { fontSize: 14, textAlign: "center", color: "#666", marginBottom: 20 },
  cameraWrapper: { width: "100%", aspectRatio: 3/4, borderRadius: 24, overflow: "hidden", backgroundColor: "#000" },
  camera: { flex: 1 },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center" },
  ovalFrame: { width: "75%", height: "65%", borderWidth: 2, borderColor: "rgba(255,255,255,0.7)", borderRadius: 150 },
  corner: { position: "absolute", width: 20, height: 20, borderColor: "#4EDEA3" },
  topLeft: { top: 10, left: 10, borderTopWidth: 3, borderLeftWidth: 3 },
  topRight: { top: 10, right: 10, borderTopWidth: 3, borderRightWidth: 3 },
  bottomLeft: { bottom: 10, left: 10, borderBottomWidth: 3, borderLeftWidth: 3 },
  bottomRight: { bottom: 10, right: 10, borderBottomWidth: 3, borderRightWidth: 3 },
  captureBtn: { backgroundColor: "#007AFF", padding: 16, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 20 },
  disabledBtn: { backgroundColor: "#9CA3AF" },
  captureText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});