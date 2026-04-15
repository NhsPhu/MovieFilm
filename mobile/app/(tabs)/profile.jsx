import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
  Modal, TextInput, Image, ActivityIndicator, FlatList, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import useAuthStore from '../../src/store/useAuthStore';
import { historyService } from '../../src/services/historyService';
import { watchlistService } from '../../src/services/watchlistService';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, logout, updateProfile, uploadAvatar } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState('history');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', phoneNumber: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [history, setHistory] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loadingTab, setLoadingTab] = useState(false);

  useEffect(() => {
    if (user) {
      setEditForm({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user]);

  // Load data based on active tab
  useEffect(() => {
    if (!user) return;
    setLoadingTab(true);
    
    if (activeTab === 'history') {
      historyService.getWatchHistory()
        .then(data => setHistory(data || []))
        .catch(() => setHistory([]))
        .finally(() => setLoadingTab(false));
    } else if (activeTab === 'mylist') {
      watchlistService.getWatchlist()
        .then(data => setWatchlist(data || []))
        .catch(() => setWatchlist([]))
        .finally(() => setLoadingTab(false));
    } else {
      setLoadingTab(false);
    }
  }, [activeTab, user]);

  const handleClearHistory = () => {
    Alert.alert('Xóa lịch sử', 'Bạn có chắc muốn xóa toàn bộ lịch sử xem?', [
      { text: 'Hủy', style: 'cancel' },
      { 
        text: 'Xóa', 
        style: 'destructive', 
        onPress: async () => { 
          try {
            await historyService.clearHistory();
            setHistory([]);
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa lịch sử.');
          }
        } 
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: async () => { await logout(); router.replace('/login'); } },
    ]);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh để tải avatar.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      setIsUploadingImage(true);
      try {
        await uploadAvatar(result.assets[0].uri);
        Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện mới.');
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại.');
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!editForm.fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ và tên');
      return;
    }
    
    setIsSaving(true);
    try {
      await updateProfile(editForm.fullName, editForm.phoneNumber);
      Alert.alert('Thành công', 'Cập nhật thông tin thành công');
      setIsEditModalVisible(false);
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.');
    } finally {
      setIsSaving(false);
    }
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

  const avatarInitial = user.fullName ? user.fullName[0].toUpperCase() : (user.username ? user.username[0].toUpperCase() : 'U');
  
  const avatarUri = user.avatarUrl && !user.avatarUrl.startsWith('http') 
    ? `http://10.0.2.2:8080${user.avatarUrl.replace('/api/avatars', '/avatars')}` 
    : user.avatarUrl;

  const getRankBadge = () => {
    if (user.membershipRank === 'VIP') {
      return (
        <View style={[styles.rankBadge, { backgroundColor: 'rgba(234, 179, 8, 0.2)', borderColor: 'rgba(234, 179, 8, 0.5)' }]}>
          <Ionicons name="star" size={12} color="#EAB308" />
          <Text style={[styles.rankText, { color: '#EAB308' }]}>VIP</Text>
        </View>
      );
    }
    if (user.membershipRank === 'CLOSE') {
      return (
        <View style={[styles.rankBadge, { backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgba(59, 130, 246, 0.5)' }]}>
          <Text style={[styles.rankText, { color: '#3B82F6' }]}>THÂN THIẾT</Text>
        </View>
      );
    }
    return (
      <View style={[styles.rankBadge, { backgroundColor: '#222', borderColor: '#444' }]}>
        <Text style={[styles.rankText, { color: '#aaa' }]}>THÀNH VIÊN</Text>
      </View>
    );
  };

  const joinedDate = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })
    : 'Vừa mới tham gia';

  const tabs = [
    { key: 'history', label: 'Lịch Sử', icon: 'time-outline' },
    { key: 'mylist', label: 'Danh Sách', icon: 'heart-outline' },
    { key: 'settings', label: 'Cài Đặt', icon: 'settings-outline' },
  ];

  const getProgressPercent = (item) => {
    if (item.isFinished) return 100;
    return item.currentTimeSec ? Math.min(Math.floor((item.currentTimeSec / (120 * 60)) * 100) + 10, 95) : 10;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} disabled={isUploadingImage}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{avatarInitial}</Text>
            </View>
          )}
          {isUploadingImage && (
            <View style={styles.avatarLoadingOverlay}>
              <ActivityIndicator color="#E50914" size="large" />
            </View>
          )}
          <View style={styles.cameraIconContainer}>
            <Ionicons name="camera" size={14} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <View style={styles.nameRow}>
          <Text style={styles.name}>{user.fullName || user.username || user.email}</Text>
        </View>
        
        {getRankBadge()}

        <Text style={styles.email}>{user.email || user.phoneNumber}</Text>
        <Text style={styles.joinedText}>Tham gia từ {joinedDate}</Text>

        {/* Header Buttons */}
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.manageBtn} onPress={() => setActiveTab('settings')}>
            <Text style={styles.manageBtnText}>Quản Lý Hồ Sơ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtnSmall} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="#E50914" />
          </TouchableOpacity>
        </View>
      </View>

      {/* VIP Upgrade Section */}
      {user.membershipRank !== 'VIP' && (
        <TouchableOpacity 
          style={styles.vipCard} 
          onPress={() => Alert.alert('Nâng Cấp VIP', 'Chức năng thanh toán đang được bảo trì. Vui lòng quay lại sau!')}
        >
          <LinearGradient 
            colors={['#EAB308', '#B45309']} 
            style={styles.vipGradient} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 0 }}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.vipTitle}>Nâng cấp Thành viên VIP</Text>
              <Text style={styles.vipSubtitle}>Xem phim không quảng cáo, chất lượng 4K</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Tabs Navigation — giống web */}
      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons name={tab.icon} size={16} color={activeTab === tab.key ? '#fff' : '#666'} />
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {loadingTab ? (
        <View style={styles.tabLoading}>
          <ActivityIndicator size="large" color="#E50914" />
        </View>
      ) : (
        <>
          {/* Tab: Lịch Sử Xem */}
          {activeTab === 'history' && (
            <View style={styles.tabContent}>
              <View style={styles.tabHeader}>
                <Text style={styles.tabTitle}>Đã Xem Gần Đây</Text>
                {history.length > 0 && (
                  <TouchableOpacity onPress={handleClearHistory}>
                    <Text style={styles.clearText}>Xóa Lịch Sử</Text>
                  </TouchableOpacity>
                )}
              </View>
              {history.length > 0 ? (
                history.map((item, i) => {
                  const progress = getProgressPercent(item);
                  const finished = item.isFinished || progress >= 100;
                  const timeLabel = item.lastWatchedAt ? new Date(item.lastWatchedAt).toLocaleDateString('vi-VN') : 'gần đây';
                  
                  return (
                    <TouchableOpacity 
                      key={item.id || i} 
                      style={styles.historyCard}
                      onPress={() => router.push(`/watch/${item.movieId}`)}
                    >
                      <Image 
                        source={{ uri: item.posterUrl || '' }} 
                        style={styles.historyPoster} 
                        resizeMode="cover" 
                      />
                      <View style={styles.historyInfo}>
                        <Text style={styles.historyTitle} numberOfLines={1}>{item.movieTitle}</Text>
                        <Text style={styles.historyMeta}>
                          Đã xem {timeLabel} • {finished ? 'Hoàn thành' : `${progress}% hoàn tất`}
                        </Text>
                        <View style={styles.historyProgressBg}>
                          <View style={[styles.historyProgressFill, { width: `${progress}%` }]} />
                        </View>
                      </View>
                      <View style={styles.historyAction}>
                        <Ionicons 
                          name={finished ? "reload-outline" : "play-circle"} 
                          size={28} 
                          color="#E50914" 
                        />
                        <Text style={styles.historyActionText}>{finished ? 'Xem Lại' : 'Tiếp'}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="time-outline" size={48} color="#333" />
                  <Text style={styles.emptyText}>Chưa có lịch sử xem.</Text>
                </View>
              )}
            </View>
          )}

          {/* Tab: Danh Sách Của Tôi */}
          {activeTab === 'mylist' && (
            <View style={styles.tabContent}>
              <Text style={styles.tabTitle}>Danh Sách Của Tôi</Text>
              {watchlist.length > 0 ? (
                <View style={styles.watchlistGrid}>
                  {watchlist.map((movie) => (
                    <TouchableOpacity 
                      key={movie.id} 
                      style={styles.watchlistCard}
                      onPress={() => router.push(`/movie/${movie.id}`)}
                    >
                      <Image 
                        source={{ uri: movie.posterUrl || '' }} 
                        style={styles.watchlistPoster} 
                        resizeMode="cover"
                      />
                      <View style={styles.watchlistOverlay}>
                        <Text style={styles.watchlistTitle} numberOfLines={2}>{movie.title}</Text>
                        {movie.avgRating > 0 && (
                          <Text style={styles.watchlistRating}>⭐ {movie.avgRating.toFixed(1)}</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="heart-outline" size={48} color="#333" />
                  <Text style={styles.emptyText}>Danh sách của bạn đang trống</Text>
                  <Text style={styles.emptySubtext}>Lưu phim để xem sau</Text>
                  <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(tabs)')}>
                    <Text style={styles.browseBtnText}>Khám Phá Phim</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Tab: Cài Đặt Hồ Sơ — giống web settings tab */}
          {activeTab === 'settings' && (
            <View style={styles.tabContent}>
              {/* Thông Tin Cá Nhân Card */}
              <View style={styles.settingsCard}>
                <View style={styles.settingsCardHeader}>
                  <View style={styles.settingsIconBox}>
                    <Ionicons name="person" size={20} color="#E50914" />
                  </View>
                  <Text style={styles.settingsCardTitle}>Thông Tin Cá Nhân</Text>
                </View>
                <SettingsField label="HỌ VÀ TÊN" value={user.fullName || 'Chưa cung cấp'} />
                <SettingsField label="SỐ ĐIỆN THOẠI" value={user.phoneNumber || 'Chưa cung cấp'} />
                <SettingsField label="EMAIL" value={user.email || 'Chưa liên kết'} />
                <TouchableOpacity style={styles.updateInfoBtn} onPress={() => setIsEditModalVisible(true)}>
                  <Text style={styles.updateInfoBtnText}>Cập Nhật Thông Tin</Text>
                </TouchableOpacity>
              </View>

              {/* Tùy Chỉnh Card */}
              <View style={styles.settingsCard}>
                <View style={styles.settingsCardHeader}>
                  <View style={[styles.settingsIconBox, { backgroundColor: 'rgba(139,92,246,0.1)' }]}>
                    <Ionicons name="options" size={20} color="#8B5CF6" />
                  </View>
                  <Text style={styles.settingsCardTitle}>Tùy Chỉnh</Text>
                </View>
                <SettingToggle icon="play-circle-outline" label="Tự động phát tập tiếp" value={true} />
                <SettingToggle icon="eye-outline" label="Xem trước khi chọn" value={true} />
                <View style={styles.settingRow}>
                  <Ionicons name="download-outline" size={20} color="#aaa" />
                  <Text style={styles.settingLabel}>Chất lượng mặc định</Text>
                  <Text style={styles.settingValue}>1080p HD</Text>
                </View>
              </View>

              {/* Bảo Mật Card */}
              <View style={styles.settingsCard}>
                <View style={styles.settingsCardHeader}>
                  <View style={[styles.settingsIconBox, { backgroundColor: 'rgba(34,197,94,0.1)' }]}>
                    <Ionicons name="shield-checkmark" size={20} color="#22C55E" />
                  </View>
                  <Text style={styles.settingsCardTitle}>Bảo Mật</Text>
                </View>
                <Text style={styles.securityDesc}>Đổi mật khẩu để đảm bảo an toàn tài khoản.</Text>
                <TouchableOpacity style={styles.changePasswordBtn}>
                  <Ionicons name="key-outline" size={16} color="#aaa" />
                  <Text style={styles.changePasswordText}>Đổi Mật Khẩu</Text>
                </TouchableOpacity>
              </View>

              {/* Thanh Toán & Hạng Thành Viên Card */}
              <View style={styles.settingsCard}>
                <View style={styles.settingsCardHeader}>
                  <View style={[styles.settingsIconBox, { backgroundColor: 'rgba(59,130,246,0.1)' }]}>
                    <Ionicons name="card" size={20} color="#3B82F6" />
                  </View>
                  <Text style={styles.settingsCardTitle}>Thanh Toán & Hạng</Text>
                </View>
                <View style={styles.billingRow}>
                  <View style={styles.visaBadge}>
                    <Text style={styles.visaText}>VISA</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.billingLabel}>Ngày thanh toán tiếp</Text>
                    <Text style={styles.billingValue}>
                      {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                </View>
                <View style={styles.billingActions}>
                  <TouchableOpacity style={styles.billingActionBtn}>
                    <Text style={styles.billingActionText}>Xem Hóa Đơn</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.upgradeBtn}>
                    <Text style={styles.upgradeBtnText}>Nâng Cấp Gói</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Logout */}
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="#E50914" />
                <Text style={styles.logoutText}>Đăng Xuất</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      <View style={{ height: 40 }} />

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cập Nhật Thông Tin</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>HỌ VÀ TÊN</Text>
              <TextInput
                style={styles.input}
                placeholder="Nguyễn Văn A"
                placeholderTextColor="#666"
                value={editForm.fullName}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, fullName: text }))}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>SỐ ĐIỆN THOẠI</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập số điện thoại..."
                placeholderTextColor="#666"
                keyboardType="phone-pad"
                value={editForm.phoneNumber}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, phoneNumber: text }))}
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveBtn, isSaving && { opacity: 0.7 }]} 
              onPress={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Lưu Thay Đổi</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* Sub-Components */
function SettingsField({ label, value }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function SettingToggle({ icon, label, value }) {
  const [isOn, setIsOn] = useState(value);
  return (
    <TouchableOpacity style={styles.settingRow} onPress={() => setIsOn(!isOn)}>
      <Ionicons name={icon} size={20} color="#aaa" />
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={[styles.switch, isOn && styles.switchOn]}>
        <View style={[styles.switchDot, isOn && styles.switchDotOn]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  centered: { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center', gap: 16 },
  loginPrompt: { color: '#666', fontSize: 15, textAlign: 'center', paddingHorizontal: 40 },
  loginBtn: { backgroundColor: '#E50914', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 10, marginTop: 8 },
  loginBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  // Header
  header: { alignItems: 'center', paddingTop: 56, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  avatarContainer: { width: 90, height: 90, borderRadius: 16, marginBottom: 16, position: 'relative', overflow: 'hidden', borderWidth: 1, borderColor: '#222' },
  avatarImage: { width: 90, height: 90, borderRadius: 16, resizeMode: 'cover' },
  avatarFallback: { width: 90, height: 90, borderRadius: 16, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' },
  avatarText: { fontSize: 36, fontWeight: '900', color: '#999' },
  avatarLoadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cameraIconContainer: { position: 'absolute', bottom: 4, right: 4, backgroundColor: '#E50914', width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  name: { fontSize: 24, fontWeight: '900', color: '#fff' },
  email: { fontSize: 13, color: '#888', marginTop: 10, marginBottom: 2 },
  joinedText: { fontSize: 11, color: '#555' },
  rankBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  rankText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },

  headerButtons: { flexDirection: 'row', gap: 10, marginTop: 16 },
  manageBtn: { backgroundColor: '#E50914', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  manageBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  logoutBtnSmall: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#1a0505', borderWidth: 1, borderColor: '#331111', alignItems: 'center', justifyContent: 'center' },

  // VIP Card
  vipCard: { marginHorizontal: 16, marginTop: 16, borderRadius: 16, overflow: 'hidden' },
  vipGradient: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 12 },
  vipTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 2 },
  vipSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '500' },

  // Tab Bar — giống web tabs
  tabBar: { flexDirection: 'row', marginHorizontal: 16, marginTop: 20, borderBottomWidth: 1, borderBottomColor: '#1e1e1e', gap: 0 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#E50914' },
  tabText: { fontSize: 13, fontWeight: '700', color: '#666' },
  tabTextActive: { color: '#fff' },

  tabLoading: { paddingVertical: 60, alignItems: 'center' },
  tabContent: { paddingHorizontal: 16, paddingTop: 20 },
  tabHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  tabTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 16 },
  clearText: { color: '#E50914', fontSize: 13, fontWeight: '700' },

  // History Tab
  historyCard: { flexDirection: 'row', backgroundColor: '#111', borderRadius: 12, marginBottom: 12, overflow: 'hidden', alignItems: 'center' },
  historyPoster: { width: 100, height: 65, backgroundColor: '#1a1a1a' },
  historyInfo: { flex: 1, paddingHorizontal: 12, paddingVertical: 8 },
  historyTitle: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  historyMeta: { color: '#666', fontSize: 11, marginBottom: 6 },
  historyProgressBg: { height: 3, backgroundColor: '#333', borderRadius: 2, overflow: 'hidden' },
  historyProgressFill: { height: '100%', backgroundColor: '#E50914' },
  historyAction: { alignItems: 'center', paddingRight: 12 },
  historyActionText: { color: '#E50914', fontSize: 9, fontWeight: '700', marginTop: 2 },

  // Watchlist Tab
  watchlistGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  watchlistCard: { width: (width - 42) / 2, aspectRatio: 2 / 3, borderRadius: 12, overflow: 'hidden', backgroundColor: '#111' },
  watchlistPoster: { width: '100%', height: '100%' },
  watchlistOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 10, backgroundColor: 'rgba(0,0,0,0.3)' },
  watchlistTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  watchlistRating: { color: '#f5a623', fontSize: 11, fontWeight: '600', marginTop: 4 },

  // Empty States
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { color: '#555', fontSize: 15, fontWeight: '500' },
  emptySubtext: { color: '#444', fontSize: 12 },
  browseBtn: { marginTop: 16, backgroundColor: '#E50914', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  browseBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  // Settings Tab
  settingsCard: { backgroundColor: '#111', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#1a1a1a' },
  settingsCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  settingsIconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(229,9,20,0.1)', alignItems: 'center', justifyContent: 'center' },
  settingsCardTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },

  fieldRow: { borderBottomWidth: 1, borderBottomColor: '#1e1e1e', paddingBottom: 14, marginBottom: 14 },
  fieldLabel: { fontSize: 10, fontWeight: '800', color: '#888', letterSpacing: 2, marginBottom: 4, textTransform: 'uppercase' },
  fieldValue: { fontSize: 14, color: '#ddd', fontWeight: '500' },

  updateInfoBtn: { alignSelf: 'flex-end', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#1e1e1e', borderRadius: 10 },
  updateInfoBtnText: { color: '#ddd', fontSize: 12, fontWeight: '700' },

  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  settingLabel: { flex: 1, fontSize: 14, color: '#ddd', fontWeight: '600' },
  settingValue: { color: '#E50914', fontSize: 12, fontWeight: '800' },

  switch: { width: 44, height: 24, borderRadius: 12, backgroundColor: '#333', padding: 2 },
  switchOn: { backgroundColor: '#E50914' },
  switchDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  switchDotOn: { alignSelf: 'flex-end' },

  securityDesc: { color: '#666', fontSize: 12, marginBottom: 16, lineHeight: 18 },
  changePasswordBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: '#2a2a2a', alignSelf: 'flex-start' },
  changePasswordText: { color: '#aaa', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Billing
  billingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  visaBadge: { width: 50, height: 32, backgroundColor: '#1e1e1e', borderRadius: 6, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' },
  visaText: { color: '#fff', fontWeight: '900', fontStyle: 'italic', fontSize: 12 },
  billingLabel: { color: '#888', fontSize: 11, fontWeight: '600' },
  billingValue: { color: '#ddd', fontSize: 13, fontWeight: '700', marginTop: 2 },
  billingActions: { flexDirection: 'row', gap: 10 },
  billingActionBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#2a2a2a', alignItems: 'center' },
  billingActionText: { color: '#E50914', fontSize: 12, fontWeight: '700' },
  upgradeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center' },
  upgradeBtnText: { color: '#000', fontSize: 12, fontWeight: '800' },

  // Logout
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: '#1a0505', borderWidth: 1, borderColor: '#331111' },
  logoutText: { color: '#E50914', fontSize: 15, fontWeight: '800' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#111', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { color: '#888', fontSize: 12, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
  input: { backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 10, padding: 14, fontSize: 16, borderWidth: 1, borderColor: '#333' },
  saveBtn: { backgroundColor: '#E50914', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
