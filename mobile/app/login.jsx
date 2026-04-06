import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import useAuthStore from '../../src/store/useAuthStore';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email/SĐT và mật khẩu.');
      return;
    }
    try {
      await login(identifier, password);
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('Đăng nhập thất bại', 'Sai email/SĐT hoặc mật khẩu.');
    }
  };

  return (
    <LinearGradient colors={['#0a0a0a', '#1a0000', '#0a0a0a']} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <Text style={styles.logo}>RimCinema</Text>
          <Text style={styles.tagline}>Xem phim không giới hạn</Text>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>Email hoặc Số điện thoại</Text>
            <TextInput
              style={styles.input}
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="Nhập email hoặc SĐT..."
              placeholderTextColor="#555"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Mật khẩu</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Nhập mật khẩu..."
              placeholderTextColor="#555"
              secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Đăng Nhập</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/register')} style={styles.linkRow}>
              <Text style={styles.linkText}>Chưa có tài khoản? <Text style={styles.link}>Đăng ký ngay</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 60 },
  logo: { fontSize: 42, fontWeight: '900', color: '#E50914', letterSpacing: -1, textAlign: 'center', marginBottom: 6 },
  tagline: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 48 },
  form: { gap: 12 },
  label: { fontSize: 11, fontWeight: '700', color: '#777', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 },
  input: {
    backgroundColor: '#1c1c1c',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#E50914',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  linkRow: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#666', fontSize: 13 },
  link: { color: '#E50914', fontWeight: '700' },
});
