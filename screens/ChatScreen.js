import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Platform,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../config";

export default function ChatScreen({ navigation }) {
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm TriageHelper 👋\n\nBefore you go through triage, I'd like to help you describe your symptoms clearly.\n\nWhat brings you to the hospital today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [readySymptoms, setReadySymptoms] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const extractSymptoms = (text) => {
    const match = text.match(/\[SYMPTOMS READY\]:\s*(.+)/i);
    return match ? match[1].trim() : null;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

       try {
         const response = await axios.post(
           `${API_URL}/chat`,
           {
             message: userText,
             conversation_history: history,
           },
           { timeout: 90000 },
         );

         const reply = response.data.reply;
         const symptoms = extractSymptoms(reply);
         if (symptoms) setReadySymptoms(symptoms);

         const displayReply = reply
           .replace(/\[SYMPTOMS READY\]:\s*.+/i, "")
           .trim();

         const botMsg = {
           id: (Date.now() + 1).toString(),
           role: "assistant",
           content: displayReply,
         };

         setMessages((prev) => [...prev, botMsg]);
         setHistory(response.data.updated_history || []);
       } catch (error) {
         console.error(error);
         setMessages((prev) => [
           ...prev,
           {
             id: (Date.now() + 1).toString(),
             role: "assistant",
             content: "Sorry, I'm having trouble responding right now.",
           },
         ]);
       } finally {
         setLoading(false);
       }
  };

  const goToTriage = () => {
    navigation.navigate("Triage", { prefillSymptoms: readySymptoms });
  };



  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.role === "user" ? styles.userBubble : styles.botBubble,
            ]}
          >
            <Text
              style={item.role === "user" ? styles.userText : styles.botText}
            >
              {item.content}
            </Text>
          </View>
        )}
      />

      {loading && (
        <View style={styles.typingContainer}>
          <ActivityIndicator size="small" color="#007bff" />
          <Text style={styles.typingText}>TriageHelper is typing...</Text>
        </View>
      )}

      {readySymptoms && (
        <TouchableOpacity style={styles.triageBtn} onPress={goToTriage}>
          <Ionicons name="pulse" size={20} color="#fff" />
          <Text style={styles.triageBtnText}>Send Symptoms to Triage</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      )}

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Describe how you feel..."
          multiline
          onKeyPress={(e) => {
            if (
              Platform.OS === "web" &&
              e.nativeEvent.key === "Enter" &&
              !e.nativeEvent.shiftKey
            ) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!input.trim() || loading) && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={loading || !input.trim()}
        >
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  messageList: { flex: 1, padding: 16 },
  messageBubble: {
    maxWidth: "80%",
    padding: 16,
    borderRadius: 18,
    marginVertical: 8,
  },
  botBubble: { alignSelf: "flex-start", backgroundColor: "#ffffff" },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#007bff" },
  botText: { fontSize: 16, color: "#333", lineHeight: 23 },
  userText: { fontSize: 16, color: "#fff", lineHeight: 23 },

  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 10,
  },
  typingText: { color: "#666" },

  triageBtn: {
    backgroundColor: "#28a745",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    margin: 12,
    padding: 16,
    borderRadius: 14,
  },
  triageBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  inputArea: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginRight: 12,
    maxHeight: 130,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#007bff",
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: { backgroundColor: "#aaa" },
});
