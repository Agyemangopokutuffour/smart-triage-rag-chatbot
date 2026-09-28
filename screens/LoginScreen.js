import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen({ navigation }) {
  const [isSignup, setIsSignup] = useState(true);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  const handleSubmit = async () => {
    if (!phone || phone.length < 9) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }
    if (isSignup && !name.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return;
    }
    if (isSignup && !age.trim()) {
      Alert.alert("Error", "Please enter your age");
      return;
    }

    try {
      const patientData = {
        patientId: "PAT-" + Math.floor(10000 + Math.random() * 90000),
        name: isSignup ? name.trim() : "Returning Patient",
        phone: phone,
        age: isSignup ? age.trim() : "--",
      };

      await AsyncStorage.setItem("patientData", JSON.stringify(patientData));
      navigation.replace("Main");
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.outer}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.card}>
          <View style={styles.logoContainer}>
            <Ionicons name="medkit" size={65} color="#007bff" />
            <Text style={styles.appName}>Smart Triage</Text>
            <Text style={styles.tagline}>Fast • Reliable • Intelligent</Text>
          </View>

          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleBtn, isSignup && styles.toggleActive]}
              onPress={() => setIsSignup(true)}
            >
              <Text
                style={[styles.toggleText, isSignup && styles.toggleTextActive]}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, !isSignup && styles.toggleActive]}
              onPress={() => setIsSignup(false)}
            >
              <Text
                style={[
                  styles.toggleText,
                  !isSignup && styles.toggleTextActive,
                ]}
              >
                Log In
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {isSignup && (
              <>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Kwame Mensah"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </>
            )}

            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="call-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="024 123 4567"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={15}
              />
            </View>

            {isSignup && (
              <>
                <Text style={styles.inputLabel}>Age</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 34"
                    keyboardType="numeric"
                    value={age}
                    onChangeText={setAge}
                    maxLength={3}
                  />
                </View>
              </>
            )}

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>
                {isSignup ? "Create Account" : "Continue"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.privacy}>
              🔒 Your information is secure and private
            </Text>

            {/* Extra space to force scrolling on laptop */}
            <View style={{ height: 400 }} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: "#f0f4f8" },
  scrollView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    maxWidth: 460,
    maxHeight: 750,
    width: "100%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  logoContainer: { alignItems: "center", marginBottom: 32 },
  appName: { fontSize: 30, fontWeight: "700", color: "#007bff", marginTop: 10 },
  tagline: { fontSize: 16, color: "#555" },

  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#e9ecef",
    borderRadius: 14,
    padding: 5,
    marginBottom: 32,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },
  toggleActive: { backgroundColor: "#fff", elevation: 3 },
  toggleText: { fontSize: 16, fontWeight: "600", color: "#777" },
  toggleTextActive: { color: "#007bff" },

  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16 },

  button: {
    backgroundColor: "#007bff",
    paddingVertical: 17,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "white", fontSize: 17.5, fontWeight: "700" },
  privacy: { textAlign: "center", marginTop: 30, color: "#777", fontSize: 14 },
});
