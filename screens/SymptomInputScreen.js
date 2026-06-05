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
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      Alert.alert("Error", "Please describe your symptoms");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(`${API_URL}/triage`, {
        symptoms: symptoms,
      });

      const data = response.data;
      setResult(data);

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

        // Navigate to ticket screen with all details
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
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerContainer}>
          <View style={styles.header}>
            <Ionicons name="medkit" size={42} color="#007bff" />
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
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  scrollContent: { flexGrow: 1, padding: 20 },
  innerContainer: { flex: 1 },

  header: { alignItems: "center", marginBottom: 30 },
  title: { fontSize: 32, fontWeight: "bold", color: "#222", marginTop: 12 },
  subtitle: { fontSize: 16, color: "#666", marginTop: 4 },

  label: { fontSize: 18, fontWeight: "600", color: "#333", marginBottom: 12 },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    minHeight: 140,
    textAlignVertical: "top",
    marginBottom: 24,
  },

  analyzeButton: {
    backgroundColor: "#007bff",
    padding: 18,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonDisabled: { backgroundColor: "#aaa" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
