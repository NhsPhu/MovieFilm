import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
  ActivityIndicator, TextInput, Alert
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { movieService, ratingService } from '../../src/services/movieService';
import { historyService } from '../../src/services/historyService';
import { watchlistService } from '../../src/services/watchlistService';
import useAuthStore from '../../src/store/useAuthStore';

const { width } = Dimensions.get('window');

export default function WatchScreen() {
  const { id } = useLocalSearchParams();
  const [movie, setMovie] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [myScore, setMyScore] = useState(0);
  const [myReview, setMyReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [initialProgress, setInitialProgress] = useState(0);
  const { user } = useAuthStore();
  
  const videoRef = React.useRef(null);
  const lastSavedTime = React.useRef(0);

  const streamUrl = movieService.getStreamUrl(id);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [m, r] = await Promise.all([
          movieService.getMovie(id),
          ratingService.getMovieRatings(id)
        ]);
        setMovie(m);
        setRatings(r || []);

        if (user) {
          // Fetch watchlist status
          const wlStatus = await watchlistService.checkInWatchlist(id);
          setIsInWatchlist(wlStatus?.inWatchlist || false);

          // Fetch watch progress
          const progress = await historyService.getMovieProgress(id);
          const savedTime = progress?.currentTimeSec || progress?.currentTime || 0;
          if (savedTime > 0) {
            setInitialProgress(savedTime * 1000); // convert to ms
          }
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [id, user]);

  const handlePlaybackStatusUpdate = (status) => {
    if (status.isLoaded && status.isPlaying && user) {
      const currentTimeSeconds = Math.floor(status.positionMillis / 1000);
      // Save progress every 10 seconds or when significantly changed
      if (currentTimeSeconds - lastSavedTime.current >= 10) {
        lastSavedTime.current = currentTimeSeconds;
        historyService.updateWatchHistory(id, currentTimeSeconds, 'MOBILE').catch(console.error);
      }
    }
  };

  const toggleWatchlist = async () => {
    if (!user) return Alert.alert('Yêu cầu đăng nhập', 'Vu lòng đăng nhập để thêm vào danh sách yêu thích.');
    try {
      if (isInWatchlist) {
        await watchlistService.removeFromWatchlist(id);
        setIsInWatchlist(false);
      } else {
        await watchlistService.addToWatchlist(id);
        setIsInWatchlist(true);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật danh sách yêu thích.');
    }
  };

  const handleSubmitReview = async () => {
    if (!user) return Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập để đánh giá.');
    if (myScore === 0) return Alert.alert('Thiếu điểm', 'Vui lòng chọn điểm sao từ 1 đến 5.');
    setIsSubmitting(true);
    try {
      await ratingService.rateMovie(id, myScore, myReview);
      setMyScore(0);
      setMyReview('');
      const r = await ratingService.getMovieRatings(id);
      setRatings(r || []);
    } catch {
      Alert.alert('Lỗi', 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  const m = movie || {};

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Video Player */}
      <View style={styles.playerContainer}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Video
          ref={videoRef}
          source={{ uri: streamUrl }}
          style={styles.video}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          posterSource={{ uri: m.posterUrl || m.backdropUrl }}
          usePoster
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          positionMillis={initialProgress}
        />
      </View>

      {/* Movie Info */}
      <View style={styles.info}>
        <Text style={styles.badge}>🎬 PHIM GỐC</Text>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{m.title}</Text>
          <TouchableOpacity onPress={toggleWatchlist} style={styles.watchlistBtn}>
            <Ionicons 
              name={isInWatchlist ? "heart" : "heart-outline"} 
              size={28} 
              color={isInWatchlist ? "#E50914" : "#fff"} 
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.meta}>{m.releaseYear} • {m.duration ? `${Math.floor(m.duration / 60)}h ${m.duration % 60}m` : ''}</Text>
        <Text style={styles.description} numberOfLines={4}>{m.description || 'Chưa có mô tả.'}</Text>
      </View>

      {/* Rating Form */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bình Luận & Đánh Giá ({ratings.length})</Text>

        {user ? (
          <View style={styles.ratingForm}>
            <Text style={styles.formLabel}>Chọn điểm</Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map(s => (
                <TouchableOpacity key={s} onPress={() => setMyScore(s)}>
                  <Ionicons name={myScore >= s ? 'star' : 'star-outline'} size={32} color={myScore >= s ? '#f5a623' : '#444'} />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.reviewInput}
              value={myReview}
              onChangeText={setMyReview}
              placeholder="Viết cảm nghĩ của bạn..."
              placeholderTextColor="#555"
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity
              style={[styles.submitBtn, (isSubmitting || myScore === 0) && styles.submitBtnDisabled]}
              onPress={handleSubmitReview}
              disabled={isSubmitting || myScore === 0}
            >
              <Text style={styles.submitBtnText}>{isSubmitting ? 'Đang gửi...' : 'Đăng Đánh Giá'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.loginPromptCard} onPress={() => router.push('/login')}>
            <Text style={styles.loginPromptText}>Đăng nhập để bình luận</Text>
          </TouchableOpacity>
        )}

        {/* Ratings List */}
        {ratings.map((r, i) => (
          <View key={i} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAvatar}><Text style={styles.reviewAvatarText}>{r.userFullName?.[0]?.toUpperCase() || 'U'}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewerName}>{r.userFullName || 'Ẩn danh'}</Text>
                <View style={styles.reviewStarRow}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <Ionicons key={s} name={r.score >= s ? 'star' : 'star-outline'} size={12} color={r.score >= s ? '#f5a623' : '#444'} />
                  ))}
                  <Text style={styles.reviewScore}>{r.score}.0</Text>
                </View>
              </View>
              <Text style={styles.reviewDate}>{new Date(r.createdAt).toLocaleDateString('vi-VN')}</Text>
            </View>
            {r.review ? <Text style={styles.reviewText}>{r.review}</Text> : null}
          </View>
        ))}

        {ratings.length === 0 && (
          <View style={styles.emptyReviews}>
            <Text style={styles.emptyText}>Chưa có đánh giá. Hãy là người đầu tiên!</Text>
          </View>
        )}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  centered: { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center' },

  playerContainer: { width, aspectRatio: 16 / 9, backgroundColor: '#000', position: 'relative' },
  video: { width: '100%', height: '100%' },
  backBtn: { position: 'absolute', top: 12, left: 14, zIndex: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },

  info: { padding: 16 },
  badge: { fontSize: 10, color: '#E50914', fontWeight: '800', letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4 },
  meta: { fontSize: 12, color: '#888', marginBottom: 12 },
  description: { fontSize: 13, color: '#aaa', lineHeight: 20 },
  
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  watchlistBtn: { padding: 4 },

  section: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#1a1a1a', paddingBottom: 10 },

  ratingForm: { backgroundColor: '#111', borderRadius: 12, padding: 16, gap: 12, marginBottom: 16 },
  formLabel: { fontSize: 10, color: '#888', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5 },
  starRow: { flexDirection: 'row', gap: 8 },
  reviewInput: { backgroundColor: '#0a0a0a', borderRadius: 10, padding: 12, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#2a2a2a', minHeight: 80, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#E50914', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  loginPromptCard: { backgroundColor: '#111', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#2a1010' },
  loginPromptText: { color: '#E50914', fontWeight: '700', fontSize: 14 },

  reviewCard: { backgroundColor: '#111', borderRadius: 12, padding: 14, marginBottom: 10, gap: 8 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' },
  reviewAvatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  reviewerName: { fontSize: 13, fontWeight: '700', color: '#fff' },
  reviewStarRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  reviewScore: { fontSize: 11, color: '#f5a623', fontWeight: '700', marginLeft: 4 },
  reviewDate: { fontSize: 10, color: '#555' },
  reviewText: { fontSize: 13, color: '#aaa', lineHeight: 20, backgroundColor: '#0a0a0a', padding: 10, borderRadius: 8 },
  emptyReviews: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#555', fontSize: 13, fontStyle: 'italic' },
});
