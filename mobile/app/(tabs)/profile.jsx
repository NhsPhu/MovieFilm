import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import useAuthStore from '../../src/store/useAuthStore';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: async () => { await logout(); router.replace('/login'); } },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <Ionicons name="person-circle-outline" size={80} color="#333" />
        <Text style={styles.loginPrompt}>Đăng nhập để trải nghiệm đầy đủ</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/login')}>
          <Text style={styles.loginBtnText}>Đăng Nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const avatar = user.fullName ? user.fullName[0].toUpperCase() : 'U';

  return (
    <ScrollView style={styles.container}>
      {/* Avatar Section */}
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{avatar}</Text></View>
        <Text style={styles.name}>{user.fullName || user.username}</Text>
        <Text style={styles.email}>{user.email || user.phoneNumber}</Text>
        {user.role === 'ADMIN' && <View style={styles.adminBadge}><Text style={styles.adminText}>ADMIN</Text></View>}
      </View>

      {/* Menu Items */}
      <View style={styles.menu}>
        <MenuItem icon="person-outline" label="Thông Tin Cá Nhân" onPress={() => {}} />
        <MenuItem icon="heart-outline" label="Phim Yêu Thích" onPress={() => {}} />
        <MenuItem icon="time-outline" label="Lịch Sử Xem" onPress={() => {}} />
        <MenuItem icon="settings-outline" label="Cài Đặt" onPress={() => {}} />
        <MenuItem icon="help-circle-outline" label="Trợ Giúp" onPress={() => {}} />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#E50914" />
        <Text style={styles.logoutText}>Đăng Xuất</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

function MenuItem({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon} size={22} color="#aaa" />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#444" style={{ marginLeft: 'auto' }} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  centered: { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center', gap: 16 },
  loginPrompt: { color: '#666', fontSize: 15, textAlign: 'center', paddingHorizontal: 40 },
  loginBtn: { backgroundColor: '#E50914', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 10, marginTop: 8 },
  loginBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 32, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E50914', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#fff' },
  name: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  email: { fontSize: 13, color: '#888', marginBottom: 8 },
  adminBadge: { backgroundColor: '#E50914', paddingHorizontal: 12, paddingVertical: 3, borderRadius: 20 },
  adminText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },

  menu: { padding: 16, gap: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, paddingHorizontal: 12, backgroundColor: '#111', borderRadius: 10 },
  menuLabel: { fontSize: 15, color: '#ddd', fontWeight: '600' },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginHorizontal: 16, marginTop: 20, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#2a1010' },
  logoutText: { color: '#E50914', fontSize: 15, fontWeight: '800' },
});
