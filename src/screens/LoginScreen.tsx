// src/screens/LoginScreen.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "../firebase";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const validateInputs = () => {
    if (!email.trim() || !pass.trim()) {
      setError("Email dan password harus diisi");
      return false;
    }

    // Validasi email sederhana
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format email tidak valid");
      return false;
    }

    // Validasi password minimal 6 karakter
    if (pass.length < 6) {
      setError("Password minimal 6 karakter");
      return false;
    }

    return true;
  };

  const login = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // Login berhasil, akan navigasi ke ChatScreen otomatis
      // Pastikan ada navigation di props atau context
    } catch (err: any) {
      console.error("Login error:", err);

      // Error handling yang lebih baik
      if (err.code === 'auth/user-not-found') {
        setError("Email tidak ditemukan");
      } else if (err.code === 'auth/wrong-password') {
        setError("Password salah");
      } else if (err.code === 'auth/invalid-email') {
        setError("Email tidak valid");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Terlalu banyak percobaan gagal. Coba lagi nanti");
      } else {
        setError("Login gagal. Cek koneksi internet");
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    setError("");
    setIsRegistering(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      console.log("User registered successfully:", userCredential.user.email);

      // Show success message
      Alert.alert(
        "Registrasi Berhasil!",
        "Akun Anda telah berhasil dibuat. Silakan login.",
        [{ text: "OK" }]
      );

      // Clear form
      setPass("");
      setIsRegistering(false);
    } catch (err: any) {
      console.error("Registration error:", err);

      // Error handling yang lebih spesifik
      if (err.code === 'auth/email-already-in-use') {
        setError("Email sudah terdaftar");
      } else if (err.code === 'auth/invalid-email') {
        setError("Email tidak valid");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("Registrasi dinonaktifkan. Hubungi admin");
      } else if (err.code === 'auth/weak-password') {
        setError("Password terlalu lemah. Minimal 6 karakter");
      } else {
        setError("Registrasi gagal. Cek koneksi internet");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Sign in or create an account</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError(""); // Clear error when typing
          }}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#aaa"
          editable={!loading}
        />
        <TextInput
          placeholder="Password (minimal 6 karakter)"
          secureTextEntry
          value={pass}
          onChangeText={(text) => {
            setPass(text);
            setError(""); // Clear error when typing
          }}
          style={styles.input}
          placeholderTextColor="#aaa"
          editable={!loading}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={login}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading && !isRegistering ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.registerButton,
            loading && styles.buttonDisabled
          ]}
          onPress={register}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading && isRegistering ? (
            <ActivityIndicator size="small" color="#4fc3f7" />
          ) : (
            <Text style={[styles.buttonText, { color: "#4fc3f7" }]}>Register</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>© 2025 MyApp. All rights reserved.</Text>

      {/* Debug Info (Hapus di production) */}
      {__DEV__ && (
        <Text style={styles.debugText}>
          Email: {email} | Pass: {pass.length} chars | Loading: {loading.toString()}
        </Text>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#4fc3f7",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 25,
  },
  input: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 35,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    fontSize: 16,
  },
  error: {
    color: "#ff6b6b",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "600",
    fontSize: 14,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: "#4fc3f7",
    paddingVertical: 15,
    borderRadius: 35,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#4fc3f7",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    minHeight: 50,
    justifyContent: 'center',
  },
  registerButton: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#4fc3f7",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  footerText: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 12,
    marginTop: 30,
  },
  debugText: {
    textAlign: "center",
    color: "#ccc",
    fontSize: 10,
    marginTop: 10,
  },
});