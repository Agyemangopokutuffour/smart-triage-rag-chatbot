import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../config";

export default function DoctorScreen() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [calling, setCalling] = useState(false);

  const fetchQueue = async () => {
    try {
      const res = await axios.get(`${API_URL}/queue`);
      setQueue(res.data.queue || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 6000);
    return () => clearInterval(interval);
  }, []);

  const callNext = async () => {
    setCalling(true);
    try {
      const res = await axios.post(`${API_URL}/call-next`);
      if (res.data.called) {
        Alert.alert(
          "✅ Patient Called",
          `${res.data.called.name} has been called to ${res.data.doctor?.name || "the doctor"}`,
        );
        fetchQueue();
      } else {
        Alert.alert("Queue Empty", "No waiting patients.");
      }
    } catch (e) {
      Alert.alert("Error", "Could not call next patient.");
    } finally {
      setCalling(false);
    }
  };

  const waiting = queue.filter((p) => !p.status || p.status === "Waiting");
  const inConsultation = queue.filter((p) => p.status === "In Consultation");

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* In Consultation */}
      {inConsultation.length > 0 && (
        <View style={styles.consultingCard}>
          <Text style={styles.consultingTitle}>IN CONSULTATION</Text>
          <Text style={styles.consultingName}>{inConsultation[0].name}</Text>
          <Text style={styles.consultingDoctor}>
            {inConsultation[0].doctor?.name} • {inConsultation[0].doctor?.room}
          </Text>
        </View>
      )}

      <View style={styles.headerRow}>
        <Text style={styles.title}>Waiting Patients ({waiting.length})</Text>
        <TouchableOpacity
          onPress={callNext}
          disabled={calling}
          style={styles.callBtn}
        >
          {calling ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.callBtnText}>CALL NEXT</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={waiting}
        keyExtractor={(item) => item.patientId || item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchQueue} />
        }
        renderItem={({ item, index }) => (
          <View style={styles.patientCard}>
            <Text style={styles.position}>#{index + 1}</Text>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.symptoms} numberOfLines={2}>
                {item.symptoms}
              </Text>
            </View>
            <Text
              style={[
                styles.urgency,
                item.urgency === "severe" && styles.severe,
              ]}
            >
              {item.urgency?.toUpperCase()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No waiting patients at the moment.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: "bold" },

  consultingCard: {
    backgroundColor: "#e8f5e9",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#28a745",
    marginBottom: 16,
  },
  consultingTitle: { color: "#28a745", fontWeight: "bold", fontSize: 14 },
  consultingName: { fontSize: 18, fontWeight: "bold", marginTop: 4 },
  consultingDoctor: { color: "#555", marginTop: 4 },

  patientCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  position: { fontSize: 24, fontWeight: "bold", width: 50, color: "#007bff" },
  info: { flex: 1 },
  name: { fontSize: 17, fontWeight: "600" },
  symptoms: { color: "#666", marginTop: 4, fontSize: 14 },
  urgency: { fontWeight: "700", color: "#fd7e14" },
  severe: { color: "#dc3545" },

  callBtn: {
    backgroundColor: "#28a745",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  callBtnText: { color: "#fff", fontWeight: "bold" },

  empty: { textAlign: "center", marginTop: 50, color: "#666", fontSize: 16 },
});
