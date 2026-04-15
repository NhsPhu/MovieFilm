import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { authService } from '../src/services/movieService';

export default function RegisterScreen() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    const { username, email, fullName, phoneNumber, password, confirmPassword } = form;
    
    if (!username || !email || !password || !fullName) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({
        username,
        email,
        fullName,
        phoneNumber,
        password
      });
      Alert.alert('Thành công', 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.', [
        { text: 'OK', onPress: () => router.replace('/login') }
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0a0a0a', '#1a0000', '#0a0a0a']} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>RimCinema</Text>
          <Text style={styles.tagline}>Tham gia cộng đồng yêu điện ảnh</Text>

          <View style={styles.form}>
            <Input label="Tên đăng nhập *" value={form.username} onChange={(v) => setForm({...form, username: v})} placeholder="User123" />
            <Input label="Họ và tên *" value={form.fullName} onChange={(v) => setForm({...form, fullName: v})} placeholder="Nguyễn Văn A" />
            <Input label="Email *" value={form.email} onChange={(v) => setForm({...form, email: v})} placeholder="example@gmail.com" keyboardType="email-address" />
            <Input label="Số điện thoại" value={form.phoneNumber} onChange={(v) => setForm({...form, phoneNumber: v})} placeholder="0987xxxxxx" keyboardType="phone-pad" />
            <Input label="Mật khẩu *" value={form.password} onChange={(v) => setForm({...form, password: v})} placeholder="********" secure />
            <Input label="Xác nhận mật khẩu *" value={form.confirmPassword} onChange={(v) => setForm({...form, confirmPassword: v})} placeholder="********" secure />

            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Đăng Ký</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/login')} style={styles.linkRow}>
              <Text style={styles.linkText}>Đã có tài khoản? <Text style={styles.link}>Đăng nhập</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function Input({ label, value, onChange, placeholder, keyboardType = 'default', secure = false }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#555"
        keyboardType={keyboardType}
        secureTextEntry={secure}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: 28, paddingVertical: 60 },
  logo: { fontSize: 36, fontWeight: '900', color: '#E50914', textAlign: 'center', marginBottom: 6 },
  tagline: { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 40 },
  form: { gap: 4 },
  label: { fontSize: 11, fontWeight: '700', color: '#777', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  input: {
    backgroundColor: '#1c1c1c',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  button: {
    backgroundColor: '#E50914',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  linkRow: { marginTop: 20, alignItems: 'center', paddingBottom: 20 },
  linkText: { color: '#666', fontSize: 13 },
  link: { color: '#E50914', fontWeight: '700' },
});
