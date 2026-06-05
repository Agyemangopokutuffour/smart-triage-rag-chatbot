import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const URGENCY_CONFIG = {
  severe: {
    bg: "#f8d7da",
    text: "#dc3545",
    border: "#dc3545",
    icon: "alert-circle",
    label: "SEVERE",
    advice: "Please stay seated. You will be seen immediately.",
  },
  moderate: {
    bg: "#fff3cd",
    text: "#fd7e14",
    border: "#fd7e14",
    icon: "warning-outline",
    label: "MODERATE",
    advice: "Please remain in the waiting area. You will be seen shortly.",
  },
  minor: {
    bg: "#d4edda",
    text: "#28a745",
    border: "#28a745",
    icon: "checkmark-circle-outline",
    label: "MINOR",
    advice: "Please wait comfortably. A nurse will call your name.",
  },
};

export default function TicketScreen({ route, navigation }) {
  const { position, urgency, patientName, patientId, estimatedWait, doctors } =
    route.params;

  const config = URGENCY_CONFIG[urgency] || URGENCY_CONFIG.minor;

  // Assign first doctor for display (in a real app this would come from backend)
  const doctor = doctors?.[0] || {
    name: "Dr. Kwame Asante",
    specialty: "General Medicine",
    room: "Room 1",
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="document-text-outline" size={36} color="#007bff" />
        <Text style={styles.headerTitle}>Your Queue Ticket</Text>
        <Text style={styles.headerSub}>Smart Triage — OPD</Text>
      </View>

      {/* Ticket card */}
      <View style={[styles.ticketCard, { borderTopColor: config.border }]}>
        {/* Patient info */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PATIENT</Text>
          <Text style={styles.patientName}>{patientName}</Text>
          <Text style={styles.patientId}>{patientId}</Text>
        </View>

        <View style={styles.divider} />

        {/* Position + urgency */}
        <View style={styles.row}>
          <View style={styles.halfSection}>
            <Text style={styles.sectionLabel}>QUEUE POSITION</Text>
            <Text style={styles.bigNumber}>#{position}</Text>
          </View>
          <View style={styles.halfSection}>
            <Text style={styles.sectionLabel}>URGENCY LEVEL</Text>
            <View style={[styles.urgencyBadge, { backgroundColor: config.bg }]}>
              <Ionicons name={config.icon} size={16} color={config.text} />
              <Text style={[styles.urgencyText, { color: config.text }]}>
                {config.label}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Estimated wait */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ESTIMATED WAIT</Text>
          <Text style={styles.waitTime}>
            {estimatedWait === 0
              ? "You are next!"
              : `~${estimatedWait} minutes`}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Doctor info */}
        <View style={styles.doctorCard}>
          <View style={styles.doctorIcon}>
            <Ionicons name="person-circle" size={48} color="#007bff" />
          </View>
          <View style={styles.doctorInfo}>
            <Text style={styles.sectionLabel}>YOUR ASSIGNED DOCTOR</Text>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
            <View style={styles.roomBadge}>
              <Ionicons name="location-outline" size={14} color="#007bff" />
              <Text style={styles.roomText}>{doctor.room}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Advice */}
        <View style={[styles.adviceBox, { backgroundColor: config.bg }]}>
          <Ionicons name="information-circle" size={20} color={config.text} />
          <Text style={[styles.adviceText, { color: config.text }]}>
            {config.advice}
          </Text>
        </View>
      </View>

      {/* Back to home */}
      <TouchableOpacity
        style={styles.homeBtn}
        onPress={() => navigation.navigate("Main")}
      >
        <Ionicons name="home-outline" size={20} color="#fff" />
        <Text style={styles.homeBtnText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  content: { padding: 20, paddingBottom: 40 },

  header: { alignItems: "center", marginBottom: 24 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    marginTop: 10,
  },
  headerSub: { fontSize: 14, color: "#888", marginTop: 4 },

  ticketCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    borderTopWidth: 6,
    padding: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },

  section: { marginVertical: 4 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#aaa",
    letterSpacing: 1,
    marginBottom: 6,
  },

  patientName: { fontSize: 22, fontWeight: "bold", color: "#222" },
  patientId: { fontSize: 14, color: "#888", marginTop: 2 },

  row: { flexDirection: "row", marginVertical: 4 },
  halfSection: { flex: 1 },

  bigNumber: { fontSize: 48, fontWeight: "bold", color: "#007bff" },

  urgencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  urgencyText: { fontSize: 13, fontWeight: "700" },

  waitTime: { fontSize: 28, fontWeight: "bold", color: "#333" },

  doctorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginVertical: 4,
  },
  doctorIcon: {},
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: 18, fontWeight: "700", color: "#222" },
  doctorSpecialty: { fontSize: 14, color: "#666", marginTop: 2 },
  roomBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  roomText: { fontSize: 14, color: "#007bff", fontWeight: "600" },

  adviceBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  adviceText: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: "500" },

  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 16,
  },

  homeBtn: {
    backgroundColor: "#007bff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 18,
    borderRadius: 16,
    marginTop: 24,
  },
  homeBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
