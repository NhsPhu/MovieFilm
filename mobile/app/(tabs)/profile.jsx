import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
  Modal, TextInput, Image, ActivityIndicator, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import useAuthStore from '../../src/store/useAuthStore';
import { historyService } from '../../src/services/historyService';
import { watchlistService } from '../../src/services/watchlistService';
import api from '../../src/services/api';

const { width } = Dimensions.get('window');
const CARD_W = (width - 42) / 2;

// ─── helpers ────────────────────────────────────────────────────────────────
function buildAvatarUrl(avatarUrl) {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('http')) return avatarUrl;
  // Use the same base as the api instance (works on emulator + real device)
  const base = api.defaults.baseURL.replace('/api', '');
  return `${base}${avatarUrl}`;
}

function getProgressPercent(item) {
  if (item.isFinished) return 100;
  const secs = item.currentTimeSec || item.currentTime || 0;
  return Math.min(Math.floor((secs / (120 * 60)) * 100) + 10, 95);
}

function RankBadge({ rank }) {
  if (rank === 'VIP') {
    return (
      <View style={[styles.rankBadge, { backgroundColor: 'rgba(234,179,8,0.15)', borderColor: '#EAB308' }]}>
        <Ionicons name="star" size={11} color="#EAB308" />
        <Text style={[styles.rankText, { color: '#EAB308' }]}>VIP</Text>
      </View>
    );
  }
  if (rank === 'CLOSE') {
    return (
      <View style={[styles.rankBadge, { backgroundColor: 'rgba(59,130,246,0.15)', borderColor: '#3B82F6' }]}>
        <Text style={[styles.rankText, { color: '#3B82F6' }]}>THÂN THIẾT</Text>
      </View>
    );
  }
  return (
    <View style={[styles.rankBadge, { backgroundColor: '#1a1a1a', borderColor: '#333' }]}>
      <Text style={[styles.rankText, { color: '#888' }]}>THÀNH VIÊN</Text>
    </View>
  );
}

function SettingsField({ label, value }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function SettingToggle({ icon, label, defaultOn }) {
  const [isOn, setIsOn] = useState(defaultOn);
  return (
    <TouchableOpacity style={styles.settingRow} onPress={() => setIsOn(!isOn)} activeOpacity={0.7}>
      <Ionicons name={icon} size={20} color="#888" />
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={[styles.switchTrack, isOn && styles.switchTrackOn]}>
        <View style={[styles.switchThumb, isOn && styles.switchThumbOn]} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { user, logout, updateProfile, uploadAvatar } = useAuthStore();

  const [activeTab, setActiveTab] = useState('history');
  const [editVisible, setEditVisible] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', phoneNumber: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [history, setHistory] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loadingTab, setLoadingTab] = useState(false);

  useEffect(() => {
    if (user) {
      setEditForm({ fullName: user.fullName || '', phoneNumber: user.phoneNumber || '' });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoadingTab(true);

    if (activeTab === 'history') {
      historyService.getWatchHistory()
        .then(data => setHistory(Array.isArray(data) ? data : []))
        .catch(() => setHistory([]))
        .finally(() => setLoadingTab(false));
    } else if (activeTab === 'mylist') {
      watchlistService.getWatchlist()
        .then(data => setWatchlist(Array.isArray(data) ? data : []))
        .catch(() => setWatchlist([]))
        .finally(() => setLoadingTab(false));
    } else {
      setLoadingTab(false);
    }
  }, [activeTab, user]);

  const handleLogout = () => {
    Alert.alert('Đăng Xuất', 'Bạn có chắc muốn đăng xuất không?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng Xuất', style: 'destructive', onPress: async () => { await logout(); router.replace('/login'); } },
    ]);
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Không Có Quyền', 'Vui lòng cấp quyền truy cập thư viện ảnh.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.6,
    });
    if (!result.canceled && result.assets[0]) {
      setIsUploadingAvatar(true);
      try {
        await uploadAvatar(result.assets[0].uri);
        Alert.alert('Thành Công', 'Ảnh đại diện đã được cập nhật!');
      } catch {
        Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại.');
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!editForm.fullName.trim()) {
      Alert.alert('Lỗi', 'Họ tên không được để trống.');
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile(editForm.fullName.trim(), editForm.phoneNumber.trim());
      Alert.alert('Thành Công', 'Cập nhật thông tin thành công.');
      setEditVisible(false);
    } catch (e) {
      Alert.alert('Lỗi', e?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearHistory = () => {
    Alert.alert('Xóa Lịch Sử', 'Toàn bộ lịch sử xem sẽ bị xóa vĩnh viễn.', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa Tất Cả', style: 'destructive',
        onPress: async () => {
          try {
            await historyService.clearHistory();
            setHistory([]);
          } catch {
            Alert.alert('Lỗi', 'Không thể xóa lịch sử.');
          }
        },
      },
    ]);
  };

  // ── Guest View ──────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <View style={styles.guestContainer}>
        <View style={styles.guestIconWrap}>
          <Ionicons name="person-circle-outline" size={72} color="#333" />
        </View>
        <Text style={styles.guestTitle}>Chưa Đăng Nhập</Text>
        <Text style={styles.guestSubtitle}>Đăng nhập để xem hồ sơ, lịch sử xem và danh sách yêu thích của bạn</Text>
        <TouchableOpacity style={styles.guestLoginBtn} onPress={() => router.push('/login')}>
          <Text style={styles.guestLoginText}>Đăng Nhập</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.guestRegisterText}>Chưa có tài khoản? Đăng ký ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayName = user.fullName || user.username || user.email || 'Người Dùng';
  const displayEmail = user.email || user.phoneNumber || '';
  const avatarUri = buildAvatarUrl(user.avatarUrl);
  const initial = displayName[0].toUpperCase();
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
    : null;

  const TABS = [
    { key: 'history', label: 'Lịch Sử', icon: 'time-outline' },
    { key: 'mylist', label: 'Yêu Thích', icon: 'heart-outline' },
    { key: 'settings', label: 'Cài Đặt', icon: 'settings-outline' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      
      {/* ── Header ── */}
      <View style={styles.header}>
        {/* Avatar */}
        <TouchableOpacity style={styles.avatarWrap} onPress={handlePickAvatar} disabled={isUploadingAvatar} activeOpacity={0.8}>
          {avatarUri
            ? <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
            : <View style={styles.avatarFallback}><Text style={styles.avatarInitial}>{initial}</Text></View>
          }
          {isUploadingAvatar
            ? <View style={styles.avatarOverlay}><ActivityIndicator color="#E50914" /></View>
            : <View style={styles.cameraChip}><Ionicons name="camera" size={13} color="#fff" /></View>
          }
        </TouchableOpacity>

        <Text style={styles.displayName}>{displayName}</Text>
        <RankBadge rank={user.membershipRank} />
        {displayEmail ? <Text style={styles.displayEmail}>{displayEmail}</Text> : null}
        {joinedDate ? <Text style={styles.joinedText}>Tham gia từ {joinedDate}</Text> : null}

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.manageBtn} onPress={() => setActiveTab('settings')} activeOpacity={0.8}>
            <Ionicons name="settings-outline" size={14} color="#fff" />
            <Text style={styles.manageBtnText}>Quản Lý Hồ Sơ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutIcon} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color="#E50914" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── VIP Banner ── */}
      {user.membershipRank !== 'VIP' && (
        <TouchableOpacity
          style={styles.vipBanner}
          activeOpacity={0.85}
          onPress={() => Alert.alert('Nâng Cấp VIP', 'Tính năng đang phát triển. Quay lại sau nhé!')}
        >
          <LinearGradient
            colors={['#CA8A04', '#92400E']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.vipGradient}
          >
            <View style={styles.vipLeft}>
              <Ionicons name="star" size={22} color="#FEF08A" />
              <View>
                <Text style={styles.vipTitle}>Nâng Cấp VIP</Text>
                <Text style={styles.vipSub}>4K · Không quảng cáo · Tải phim offline</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* ── Tab Bar ── */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={tab.icon}
              size={15}
              color={activeTab === tab.key ? '#E50914' : '#555'}
            />
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Tab Content ── */}
      {loadingTab ? (
        <View style={styles.tabSpinner}>
          <ActivityIndicator size="large" color="#E50914" />
        </View>
      ) : (
        <View style={styles.tabContent}>

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <>
              <View style={styles.tabTopRow}>
                <Text style={styles.tabHeading}>Đã Xem Gần Đây</Text>
                {history.length > 0 && (
                  <TouchableOpacity onPress={handleClearHistory}>
                    <Text style={styles.clearBtn}>Xóa Tất Cả</Text>
                  </TouchableOpacity>
                )}
              </View>

              {history.length > 0 ? history.map((item, i) => {
                const pct = getProgressPercent(item);
                const done = item.isFinished || pct >= 100;
                const dateStr = item.lastWatchedAt
                  ? new Date(item.lastWatchedAt).toLocaleDateString('vi-VN')
                  : 'gần đây';
                return (
                  <TouchableOpacity
                    key={item.id || i}
                    style={styles.histCard}
                    onPress={() => router.push(`/watch/${item.movieId}`)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: item.posterUrl || '' }}
                      style={styles.histPoster}
                      resizeMode="cover"
                    />
                    <View style={styles.histInfo}>
                      <Text style={styles.histTitle} numberOfLines={1}>{item.movieTitle || 'Không rõ'}</Text>
                      <Text style={styles.histMeta}>{dateStr} • {done ? 'Hoàn thành' : `${pct}%`}</Text>
                      <View style={styles.histBar}>
                        <View style={[styles.histBarFill, { width: `${pct}%` }]} />
                      </View>
                    </View>
                    <View style={styles.histPlay}>
                      <Ionicons name={done ? 'reload-outline' : 'play-circle'} size={30} color="#E50914" />
                      <Text style={styles.histPlayLabel}>{done ? 'Lại' : 'Tiếp'}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }) : (
                <View style={styles.emptyBox}>
                  <Ionicons name="time-outline" size={52} color="#222" />
                  <Text style={styles.emptyTitle}>Chưa xem phim nào</Text>
                  <Text style={styles.emptySub}>Phim đã xem sẽ xuất hiện ở đây</Text>
                </View>
              )}
            </>
          )}

          {/* MYLIST TAB */}
          {activeTab === 'mylist' && (
            <>
              <Text style={styles.tabHeading}>Danh Sách Của Tôi</Text>
              {watchlist.length > 0 ? (
                <View style={styles.wlGrid}>
                  {watchlist.map(movie => (
                    <TouchableOpacity
                      key={movie.id}
                      style={styles.wlCard}
                      onPress={() => router.push(`/movie/${movie.id}`)}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: movie.posterUrl || '' }}
                        style={styles.wlPoster}
                        resizeMode="cover"
                      />
                      <View style={styles.wlOverlay}>
                        <Text style={styles.wlTitle} numberOfLines={2}>{movie.title}</Text>
                        {movie.avgRating > 0 && (
                          <Text style={styles.wlRating}>⭐ {movie.avgRating.toFixed(1)}</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyBox}>
                  <Ionicons name="heart-outline" size={52} color="#222" />
                  <Text style={styles.emptyTitle}>Danh sách trống</Text>
                  <Text style={styles.emptySub}>Nhấn tim trên phim để lưu vào đây</Text>
                  <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/')}>
                    <Text style={styles.browseBtnText}>Khám Phá Phim</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <>
              {/* Thông tin cá nhân */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIcon, { backgroundColor: 'rgba(229,9,20,0.1)' }]}>
                    <Ionicons name="person" size={18} color="#E50914" />
                  </View>
                  <Text style={styles.cardTitle}>Thông Tin Cá Nhân</Text>
                </View>
                <SettingsField label="HỌ VÀ TÊN" value={user.fullName || 'Chưa cung cấp'} />
                <SettingsField label="SỐ ĐIỆN THOẠI" value={user.phoneNumber || 'Chưa cung cấp'} />
                <SettingsField label="EMAIL" value={user.email || 'Chưa liên kết'} />
                <TouchableOpacity style={styles.editInfoBtn} onPress={() => setEditVisible(true)} activeOpacity={0.8}>
                  <Ionicons name="create-outline" size={14} color="#E50914" />
                  <Text style={styles.editInfoText}>Chỉnh Sửa Thông Tin</Text>
                </TouchableOpacity>
              </View>

              {/* Tùy chỉnh phát */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIcon, { backgroundColor: 'rgba(139,92,246,0.1)' }]}>
                    <Ionicons name="options" size={18} color="#8B5CF6" />
                  </View>
                  <Text style={styles.cardTitle}>Tùy Chỉnh Phát</Text>
                </View>
                <SettingToggle icon="play-circle-outline" label="Tự động phát tiếp" defaultOn={true} />
                <SettingToggle icon="eye-outline" label="Xem trước khi chọn" defaultOn={true} />
                <View style={styles.settingRow}>
                  <Ionicons name="diamond-outline" size={20} color="#888" />
                  <Text style={styles.settingLabel}>Chất lượng mặc định</Text>
                  <Text style={styles.settingValue}>1080p</Text>
                </View>
              </View>

              {/* Bảo mật */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIcon, { backgroundColor: 'rgba(34,197,94,0.1)' }]}>
                    <Ionicons name="shield-checkmark" size={18} color="#22C55E" />
                  </View>
                  <Text style={styles.cardTitle}>Bảo Mật Tài Khoản</Text>
                </View>
                <Text style={styles.secDesc}>Bảo vệ tài khoản bằng cách đổi mật khẩu thường xuyên.</Text>
                <TouchableOpacity
                  style={styles.secBtn}
                  activeOpacity={0.8}
                  onPress={() => Alert.alert('Đổi Mật Khẩu', 'Chức năng đang phát triển!')}
                >
                  <Ionicons name="key-outline" size={15} color="#22C55E" />
                  <Text style={styles.secBtnText}>Đổi Mật Khẩu</Text>
                </TouchableOpacity>
              </View>

              {/* Thanh toán */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIcon, { backgroundColor: 'rgba(59,130,246,0.1)' }]}>
                    <Ionicons name="card" size={18} color="#3B82F6" />
                  </View>
                  <Text style={styles.cardTitle}>Gói & Thanh Toán</Text>
                </View>
                <View style={styles.billingRow}>
                  <View style={styles.visaChip}>
                    <Text style={styles.visaChipText}>VISA</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.billingMeta}>Ngày gia hạn tiếp theo</Text>
                    <Text style={styles.billingDate}>
                      {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                </View>
                <View style={styles.billingBtns}>
                  <TouchableOpacity
                    style={styles.billOutlineBtn}
                    onPress={() => Alert.alert('Hóa Đơn', 'Chức năng đang phát triển!')}
                  >
                    <Text style={styles.billOutlineBtnText}>Xem Hóa Đơn</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.billUpgradeBtn}
                    onPress={() => Alert.alert('Nâng Cấp', 'Vui lòng liên hệ hỗ trợ!')}
                  >
                    <Text style={styles.billUpgradeBtnText}>Nâng Cấp Gói</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Đăng xuất */}
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                <Ionicons name="log-out-outline" size={18} color="#E50914" />
                <Text style={styles.logoutText}>Đăng Xuất Khỏi Tài Khoản</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      <View style={{ height: 48 }} />

      {/* ── Edit Modal ── */}
      <Modal visible={editVisible} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={styles.modalBg}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh Sửa Thông Tin</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="close-circle" size={26} color="#444" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>HỌ VÀ TÊN *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập họ và tên..."
                placeholderTextColor="#444"
                value={editForm.fullName}
                onChangeText={v => setEditForm(p => ({ ...p, fullName: v }))}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>SỐ ĐIỆN THOẠI</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập số điện thoại..."
                placeholderTextColor="#444"
                value={editForm.phoneNumber}
                onChangeText={v => setEditForm(p => ({ ...p, phoneNumber: v }))}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, isSaving && { opacity: 0.65 }]}
              onPress={handleSaveProfile}
              disabled={isSaving}
              activeOpacity={0.85}
            >
              {isSaving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.saveBtnText}>Lưu Thay Đổi</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },

  // Guest
  guestContainer: { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  guestIconWrap: { marginBottom: 16 },
  guestTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 8 },
  guestSubtitle: { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  guestLoginBtn: { backgroundColor: '#E50914', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 12, marginBottom: 14 },
  guestLoginText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  guestRegisterText: { color: '#555', fontSize: 13 },

  // Header
  header: {
    alignItems: 'center', paddingTop: 52, paddingBottom: 24,
    borderBottomWidth: 1, borderBottomColor: '#161616',
  },
  avatarWrap: {
    width: 88, height: 88, borderRadius: 44,
    marginBottom: 14, overflow: 'visible',
  },
  avatarImg: { width: 88, height: 88, borderRadius: 44, borderWidth: 2, borderColor: '#222' },
  avatarFallback: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#1e1e1e', borderWidth: 2, borderColor: '#2a2a2a',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { fontSize: 34, fontWeight: '900', color: '#666' },
  avatarOverlay: {
    position: 'absolute', inset: 0, borderRadius: 44,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
  },
  cameraChip: {
    position: 'absolute', bottom: 2, right: 2,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#E50914', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#0a0a0a',
  },
  displayName: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 8 },
  rankBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1,
    marginBottom: 10,
  },
  rankText: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginLeft: 4 },
  displayEmail: { fontSize: 13, color: '#666', marginBottom: 2 },
  joinedText: { fontSize: 11, color: '#444', marginBottom: 16 },
  headerActions: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  manageBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E50914', borderRadius: 10,
    paddingHorizontal: 18, paddingVertical: 10, marginRight: 10,
  },
  manageBtnText: { color: '#fff', fontWeight: '800', fontSize: 13, marginLeft: 6 },
  logoutIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#1a0a0a', borderWidth: 1, borderColor: '#2d1010',
    alignItems: 'center', justifyContent: 'center',
  },

  // VIP Banner
  vipBanner: { marginHorizontal: 16, marginTop: 16, borderRadius: 14, overflow: 'hidden' },
  vipGradient: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 16,
  },
  vipLeft: { flexDirection: 'row', alignItems: 'center' },
  vipTitle: { color: '#fff', fontSize: 15, fontWeight: '800', marginLeft: 10, marginBottom: 2 },
  vipSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginLeft: 10 },

  // Tab Bar
  tabBar: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 18,
    borderBottomWidth: 1, borderBottomColor: '#161616',
  },
  tabItem: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 13, borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: '#E50914' },
  tabLabel: { fontSize: 12, fontWeight: '700', color: '#444', marginLeft: 5 },
  tabLabelActive: { color: '#fff' },

  tabSpinner: { paddingVertical: 56, alignItems: 'center' },
  tabContent: { paddingHorizontal: 16, paddingTop: 20 },
  tabTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  tabHeading: { fontSize: 19, fontWeight: '800', color: '#fff', marginBottom: 16 },
  clearBtn: { color: '#E50914', fontSize: 12, fontWeight: '700' },

  // History
  histCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#111', borderRadius: 12, marginBottom: 10, overflow: 'hidden',
  },
  histPoster: { width: 96, height: 62, backgroundColor: '#1a1a1a' },
  histInfo: { flex: 1, paddingHorizontal: 12, paddingVertical: 8 },
  histTitle: { color: '#fff', fontSize: 13, fontWeight: '700', marginBottom: 3 },
  histMeta: { color: '#555', fontSize: 11, marginBottom: 6 },
  histBar: { height: 3, backgroundColor: '#222', borderRadius: 2, overflow: 'hidden' },
  histBarFill: { height: '100%', backgroundColor: '#E50914' },
  histPlay: { alignItems: 'center', paddingRight: 12 },
  histPlayLabel: { color: '#E50914', fontSize: 9, fontWeight: '800', marginTop: 2, textTransform: 'uppercase' },

  // Watchlist Grid
  wlGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  wlCard: {
    width: CARD_W, aspectRatio: 0.67,
    borderRadius: 12, overflow: 'hidden',
    backgroundColor: '#111', marginBottom: 10,
  },
  wlPoster: { width: '100%', height: '100%' },
  wlOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 8, backgroundColor: 'rgba(0,0,0,0.5)',
  },
  wlTitle: { color: '#fff', fontSize: 12, fontWeight: '700' },
  wlRating: { color: '#f5a623', fontSize: 11, fontWeight: '600', marginTop: 2 },

  // Empty
  emptyBox: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { color: '#444', fontSize: 16, fontWeight: '700', marginTop: 14, marginBottom: 6 },
  emptySub: { color: '#333', fontSize: 12, textAlign: 'center', lineHeight: 18 },
  browseBtn: {
    marginTop: 18, backgroundColor: '#E50914',
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10,
  },
  browseBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },

  // Cards
  card: {
    backgroundColor: '#0f0f0f', borderRadius: 16, padding: 18,
    marginBottom: 14, borderWidth: 1, borderColor: '#1a1a1a',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },

  fieldRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#161616' },
  fieldLabel: { fontSize: 10, fontWeight: '800', color: '#555', letterSpacing: 1.5, marginBottom: 4 },
  fieldValue: { fontSize: 14, color: '#ccc', fontWeight: '500' },
  editInfoBtn: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end',
    marginTop: 14, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(229,9,20,0.3)',
  },
  editInfoText: { color: '#E50914', fontSize: 12, fontWeight: '700', marginLeft: 5 },

  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  settingLabel: { flex: 1, fontSize: 13, color: '#ccc', fontWeight: '600', marginLeft: 12 },
  settingValue: { color: '#E50914', fontSize: 12, fontWeight: '800' },
  switchTrack: { width: 42, height: 24, borderRadius: 12, backgroundColor: '#2a2a2a', padding: 2 },
  switchTrackOn: { backgroundColor: '#E50914' },
  switchThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  switchThumbOn: { alignSelf: 'flex-end' },

  secDesc: { color: '#555', fontSize: 12, lineHeight: 18, marginBottom: 14 },
  secBtn: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)',
  },
  secBtnText: { color: '#22C55E', fontSize: 12, fontWeight: '700', marginLeft: 6 },

  billingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  visaChip: {
    width: 48, height: 30, borderRadius: 6,
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  visaChipText: { color: '#aaa', fontWeight: '900', fontStyle: 'italic', fontSize: 11 },
  billingMeta: { color: '#555', fontSize: 10, fontWeight: '600' },
  billingDate: { color: '#ccc', fontSize: 13, fontWeight: '700', marginTop: 2 },
  billingBtns: { flexDirection: 'row' },
  billOutlineBtn: {
    flex: 1, marginRight: 8, paddingVertical: 10,
    borderRadius: 10, borderWidth: 1, borderColor: '#2a2a2a', alignItems: 'center',
  },
  billOutlineBtnText: { color: '#E50914', fontSize: 12, fontWeight: '700' },
  billUpgradeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center' },
  billUpgradeBtnText: { color: '#000', fontSize: 12, fontWeight: '800' },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 6, paddingVertical: 14, borderRadius: 14,
    backgroundColor: '#1a0808', borderWidth: 1, borderColor: '#2d1010',
    marginBottom: 8,
  },
  logoutText: { color: '#E50914', fontSize: 14, fontWeight: '800', marginLeft: 8 },

  // Modal
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#111', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingBottom: 44, paddingTop: 14,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#333', alignSelf: 'center', marginBottom: 18 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { color: '#666', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  input: {
    backgroundColor: '#1a1a1a', color: '#fff',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, borderWidth: 1, borderColor: '#2a2a2a',
  },
  saveBtn: {
    backgroundColor: '#E50914', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
