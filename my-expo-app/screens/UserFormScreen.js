import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Image, Alert, ActivityIndicator, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import api from "../services/api";

export default function UserFormScreen({ navigation }) {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [genre, setGenre] = useState("");
  const [occupation, setOccupation] = useState("");
  const [area, setArea] = useState("");
  const [role, setRole] = useState("employee");
  const [scheduleId, setScheduleId] = useState("");
  const [pin, setPin] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickImages = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permiso denegado");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setImages([...images, result.assets[0]]);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim() || !lastname.trim()) {
      Alert.alert("Error", "Nombre y apellido son obligatorios");
      return;
    }
    if (images.length < 20) {
      Alert.alert("Error", `Faltan ${20 - images.length} fotos`);
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("lastname", lastname);
      formData.append("genre", genre);
      formData.append("occupation", occupation);
      formData.append("area", area || "General");
      formData.append("role", role);
      if (scheduleId) formData.append("schedule_id", scheduleId);
      if (pin && role === "admin") formData.append("pin", pin);

      images.forEach((img, i) => {
        formData.append("images", {
          uri: img.uri,
          name: `photo_${i + 1}.jpg`,
          type: "image/jpeg",
        });
      });

      await api.post("/users/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Alert.alert("Éxito", "Usuario creado");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "No se pudo crear el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#111" />
      </TouchableOpacity>
      <Text style={styles.title}>Nuevo Usuario</Text>

      <Text style={styles.sectionTitle}>Fotos ({images.length}/20)</Text>
      <View style={styles.photoGrid}>
        {images.map((img, i) => (
          <View key={i} style={styles.photoItem}>
            <Image source={{ uri: img.uri }} style={styles.photo} />
            <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(i)}>
              <Ionicons name="close-circle" size={20} color="red" />
            </TouchableOpacity>
          </View>
        ))}
        {images.length < 20 && (
          <TouchableOpacity style={styles.addBtn} onPress={pickImages}>
            <Ionicons name="camera" size={30} color="#007AFF" />
            <Text style={{ fontSize: 10, color: "#007AFF" }}>Agregar</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.label}>Nombre *</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Nombre" />
      <Text style={styles.label}>Apellidos *</Text>
      <TextInput value={lastname} onChangeText={setLastname} style={styles.input} placeholder="Apellido" />
      <Text style={styles.label}>Género</Text>
      <TextInput value={genre} onChangeText={setGenre} style={styles.input} placeholder="male/female" />
      <Text style={styles.label}>Ocupación</Text>
      <TextInput value={occupation} onChangeText={setOccupation} style={styles.input} placeholder="Puesto" />
      <Text style={styles.label}>Área</Text>
      <TextInput value={area} onChangeText={setArea} style={styles.input} placeholder="TI, RH..." />
      
      <Text style={styles.label}>Rol</Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <TouchableOpacity onPress={() => setRole("employee")} style={[styles.roleBtn, role === "employee" && styles.roleActive]}>
          <Text style={{ color: role === "employee" ? "#fff" : "#000" }}>Empleado</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setRole("admin")} style={[styles.roleBtn, role === "admin" && styles.roleActive]}>
          <Text style={{ color: role === "admin" ? "#fff" : "#000" }}>Admin</Text>
        </TouchableOpacity>
      </View>

      {role === "admin" && (
        <>
          <Text style={styles.label}>PIN (4 dígitos)</Text>
          <TextInput value={pin} onChangeText={setPin} style={styles.input} keyboardType="numeric" maxLength={4} />
        </>
      )}

      <Text style={styles.label}>ID Horario</Text>
      <TextInput value={scheduleId} onChangeText={setScheduleId} style={styles.input} keyboardType="numeric" />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "bold" }}>Registrar Usuario</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { padding: 20, paddingTop: 50 },
  backButton: { marginBottom: 10 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  sectionTitle: { fontWeight: "600", marginBottom: 10 },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  photoItem: { position: "relative" },
  photo: { width: 70, height: 70, borderRadius: 8 },
  removeBtn: { position: "absolute", top: -6, right: -6, backgroundColor: "#fff", borderRadius: 10 },
  addBtn: { width: 70, height: 70, borderRadius: 8, borderWidth: 2, borderColor: "#007AFF", borderStyle: "dashed", justifyContent: "center", alignItems: "center" },
  label: { fontWeight: "600", marginTop: 10, marginBottom: 4 },
  input: { backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#D1D5DB" },
  roleBtn: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "#D1D5DB", alignItems: "center", backgroundColor: "#fff" },
  roleActive: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  submitBtn: { backgroundColor: "#007AFF", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 20 },
});