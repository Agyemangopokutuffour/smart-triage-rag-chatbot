import React, { useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SymptomInputScreen({ navigation, route }) {
  const [symptoms, setSymptoms] = useState(
    route?.params?.prefillSymptoms || "",
  );
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      Alert.alert("Error", "Please describe your symptoms");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/triage`, { symptoms });
      const data = response.data;

      await AsyncStorage.setItem("triageResult", JSON.stringify(data));

      const patientRaw = await AsyncStorage.getItem("patientData");
      if (patientRaw) {
        const patient = JSON.parse(patientRaw);
        const queueResponse = await axios.post(`${API_URL}/join-queue`, {
          patientId: patient.patientId,
          name: patient.name,
          urgency: data.urgency,
          symptoms: symptoms,
        });

        navigation.navigate("Ticket", {
          position: queueResponse.data.position,
          urgency: data.urgency,
          patientName: patient.name,
          patientId: patient.patientId,
          estimatedWait: queueResponse.data.estimated_wait,
          doctors: queueResponse.data.doctors,
        });
      }
    } catch (error) {
      Alert.alert("Error", "Could not analyze symptoms.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.outer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Ionicons name="medkit" size={60} color="#007bff" />
            <Text style={styles.title}>Smart Triage</Text>
            <Text style={styles.subtitle}>Quick Symptom Assessment</Text>
          </View>

          <Text style={styles.label}>How are you feeling today?</Text>

          <TextInput
            style={styles.input}
            placeholder="Describe your symptoms in detail... (e.g. headache for 2 days, high fever, tired...)"
            multiline
            numberOfLines={6}
            value={symptoms}
            onChangeText={setSymptoms}
          />

          <TouchableOpacity
            style={[styles.analyzeButton, loading && styles.buttonDisabled]}
            onPress={handleAnalyze}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <>
                <Ionicons name="pulse" size={24} color="#fff" />
                <Text style={styles.buttonText}>Analyze Symptoms</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: "#f0f4f8" },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    maxWidth: 500,
    width: "100%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  header: { alignItems: "center", marginBottom: 28 },
  title: { fontSize: 30, fontWeight: "700", color: "#222", marginTop: 10 },
  subtitle: { fontSize: 16, color: "#666" },

  label: { fontSize: 18, fontWeight: "600", color: "#333", marginBottom: 12 },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: "top",
    marginBottom: 28,
  },

  analyzeButton: {
    backgroundColor: "#007bff",
    paddingVertical: 17,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonDisabled: { backgroundColor: "#aaa" },
  buttonText: { color: "#fff", fontSize: 17.5, fontWeight: "700" },
});