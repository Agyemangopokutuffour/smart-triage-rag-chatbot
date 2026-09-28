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

  const doctor = doctors?.[0] || {
    name: "Dr. Kwame Asante",
    specialty: "General Medicine",
    room: "Room 1",
  };

  return (
    <ScrollView
      style={styles.outer}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="document-text-outline" size={40} color="#007bff" />
          <Text style={styles.headerTitle}>Your Queue Ticket</Text>
          <Text style={styles.headerSub}>Smart Triage — OPD</Text>
        </View>

        <View style={[styles.ticketCard, { borderTopColor: config.border }]}>
          {/* Patient Info */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PATIENT</Text>
            <Text style={styles.patientName}>{patientName}</Text>
            <Text style={styles.patientId}>{patientId}</Text>
          </View>

          <View style={styles.divider} />

          {/* Position & Urgency */}
          <View style={styles.row}>
            <View style={styles.halfSection}>
              <Text style={styles.sectionLabel}>QUEUE POSITION</Text>
              <Text style={styles.bigNumber}>#{position}</Text>
            </View>
            <View style={styles.halfSection}>
              <Text style={styles.sectionLabel}>URGENCY LEVEL</Text>
              <View
                style={[styles.urgencyBadge, { backgroundColor: config.bg }]}
              >
                <Ionicons name={config.icon} size={18} color={config.text} />
                <Text style={[styles.urgencyText, { color: config.text }]}>
                  {config.label}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Wait Time */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ESTIMATED WAIT</Text>
            <Text style={styles.waitTime}>
              {estimatedWait === 0
                ? "You are next!"
                : `~${estimatedWait} minutes`}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Doctor */}
          <View style={styles.doctorCard}>
            <Ionicons name="person-circle" size={52} color="#007bff" />
            <View style={styles.doctorInfo}>
              <Text style={styles.sectionLabel}>YOUR ASSIGNED DOCTOR</Text>
              <Text style={styles.doctorName}>{doctor.name}</Text>
              <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
              <View style={styles.roomBadge}>
                <Ionicons name="location-outline" size={16} color="#007bff" />
                <Text style={styles.roomText}>{doctor.room}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Advice */}
          <View style={[styles.adviceBox, { backgroundColor: config.bg }]}>
            <Ionicons name="information-circle" size={22} color={config.text} />
            <Text style={[styles.adviceText, { color: config.text }]}>
              {config.advice}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.navigate("Main")}
        >
          <Ionicons name="home-outline" size={20} color="#fff" />
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    maxWidth: 560,
    maxHeight: 480,
    width: "100%",
    alignSelf: "center",
  },
  header: { alignItems: "center", marginBottom: 24 },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#222",
    marginTop: 10,
  },
  headerSub: { fontSize: 15, color: "#666" },

  ticketCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    borderTopWidth: 8,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },

  section: { marginVertical: 8 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
    marginBottom: 6,
  },
  patientName: { fontSize: 24, fontWeight: "bold", color: "#222" },
  patientId: { fontSize: 15, color: "#666" },

  row: { flexDirection: "row", marginVertical: 12 },
  halfSection: { flex: 1 },

  bigNumber: { fontSize: 52, fontWeight: "700", color: "#007bff" },

  urgencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    alignSelf: "flex-start",
  },
  urgencyText: { fontSize: 14, fontWeight: "700" },

  waitTime: { fontSize: 32, fontWeight: "700", color: "#222" },

  doctorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginVertical: 8,
  },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: 19, fontWeight: "700", color: "#222" },
  doctorSpecialty: { fontSize: 15, color: "#555" },

  roomBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  roomText: { fontSize: 15, color: "#007bff", fontWeight: "600" },

  adviceBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 18,
    borderRadius: 16,
    marginTop: 8,
  },
  adviceText: { flex: 1, fontSize: 15, lineHeight: 22 },

  divider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 20 },

  homeBtn: {
    backgroundColor: "#007bff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 32,
  },
  homeBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
