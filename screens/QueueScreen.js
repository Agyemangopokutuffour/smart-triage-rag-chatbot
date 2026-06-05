import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl } from "react-native";
import axios from "axios";
import { API_URL } from "../config";

export default function QueueScreen() {
  const [queue, setQueue] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadQueue = async () => {
    try {
      const res = await axios.get(`${API_URL}/queue`);
      setQueue(res.data.queue || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current Queue</Text>

      <FlatList
        data={queue}
        keyExtractor={(item) => item.patientId}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadQueue} />
        }
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <Text style={styles.position}>#{index + 1}</Text>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.symptoms}>{item.symptoms}</Text>
            </View>
            <Text style={styles.urgency}>{item.urgency?.toUpperCase()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f8f9fa" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  item: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  position: { fontSize: 22, fontWeight: "bold", width: 50, color: "#007bff" },
  info: { flex: 1 },
  name: { fontSize: 17, fontWeight: "600" },
  symptoms: { color: "#666", marginTop: 4 },
  urgency: { fontWeight: "700", color: "#007bff" },
});
