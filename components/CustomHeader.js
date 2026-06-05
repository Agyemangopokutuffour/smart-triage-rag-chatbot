import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function CustomHeader({ title, icon }) {
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const loadPatient = async () => {
      const data = await AsyncStorage.getItem("patientData");
      if (data) setPatient(JSON.parse(data));
    };
    loadPatient();
  }, []);

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {icon && <Ionicons name={icon} size={24} color="#fff" />}
        <Text style={styles.title}>{title}</Text>
      </View>

      {patient && (
        <View style={styles.patientInfo}>
          <Text style={styles.patientId}>{patient.patientId}</Text>
          <Text style={styles.patientName}>{patient.name}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#007bff",
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 18, // Increased bottom padding
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 80,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  patientInfo: {
    alignItems: "flex-end",
  },
  patientId: {
    color: "#c8e0ff",
    fontSize: 13,
  },
  patientName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
