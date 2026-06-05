import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Ionicons name="medkit" size={80} color="#007bff" />
          <Text style={styles.appName}>Smart Triage</Text>
          <Text style={styles.tagline}>Fast • Reliable • Intelligent</Text>
        </View>

        {/* Toggle */}
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
              style={[styles.toggleText, !isSignup && styles.toggleTextActive]}
            >
              Log In
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {isSignup && (
            <>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#aaa"
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
              color="#aaa"
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
                  color="#aaa"
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
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
  },
  logoContainer: { alignItems: "center", marginBottom: 32 },
  appName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#007bff",
    marginTop: 12,
  },
  tagline: { fontSize: 16, color: "#666", marginTop: 6 },

  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#e9ecef",
    borderRadius: 14,
    padding: 4,
    marginBottom: 28,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  toggleActive: { backgroundColor: "#fff", elevation: 2 },
  toggleText: { fontSize: 16, fontWeight: "600", color: "#999" },
  toggleTextActive: { color: "#007bff" },

  form: {},
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
    marginTop: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 16, fontSize: 16 },

  button: {
    backgroundColor: "#007bff",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "white", fontSize: 18, fontWeight: "700" },
  privacy: { textAlign: "center", marginTop: 24, color: "#777", fontSize: 14 },
});
