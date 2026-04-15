import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, ActivityIndicator, FlatList, Alert
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { movieService } from '../../src/services/movieService';
import { watchlistService } from '../../src/services/watchlistService';
import useAuthStore from '../../src/store/useAuthStore';

const { width } = Dimensions.get('window');

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const [movie, setMovie] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const m = await movieService.getMovie(id);
        setMovie(m);

        // Check watchlist status
        if (user) {
          try {
            const status = await watchlistService.checkInWatchlist(id);
            setInWatchlist(status.inWatchlist);
          } catch {}
        }

        const all = await movieService.getMovies(0, 20);
        const list = all.content || all || [];
        setRelated(list.filter(x => String(x.id) !== String(id)).slice(0, 8));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [id, user]);

  const toggleWatchlist = async () => {
    if (!user) {
      Alert.alert('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để thêm vào danh sách yêu thích.');
      return;
    }
    if (isWatchlistLoading) return;
    setIsWatchlistLoading(true);
    try {
      if (inWatchlist) {
        await watchlistService.removeFromWatchlist(id);
        setInWatchlist(false);
      } else {
        await watchlistService.addToWatchlist(id);
        setInWatchlist(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsWatchlistLoading(false);
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

  if (!movie) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={{ color: '#fff' }}>Không tìm thấy phim.</Text>
      </View>
    );
  }

  const m = movie;
  const durationStr = m.duration ? `${Math.floor(m.duration / 60)}h ${m.duration % 60}m` : '';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Backdrop + Back Button */}
      <View style={{ height: 300, position: 'relative' }}>
        <Image source={{ uri: m.backdropUrl || m.posterUrl }} style={styles.backdrop} resizeMode="cover" />
        <LinearGradient colors={['transparent', '#0a0a0a']} style={StyleSheet.absoluteFill} />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.ratingRow}>
          <Text style={styles.hotBadge}>⚡ ĐANG HOT</Text>
          {m.avgRating > 0 && <Text style={styles.rating}>⭐ {m.avgRating.toFixed(1)}<Text style={styles.ratingOf}> / 5 Điểm</Text></Text>}
        </View>
        <Text style={styles.title}>{m.title}</Text>
        <Text style={styles.meta}>{m.releaseYear}{durationStr ? `  •  ${durationStr}` : ''}</Text>

        {(m.genres || []).length > 0 && (
          <View style={styles.genres}>
            {m.genres.map((g, i) => (
              <View key={i} style={styles.genreTag}><Text style={styles.genreText}>{g.name || g}</Text></View>
            ))}
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.playBtn} onPress={() => router.push(`/watch/${id}`)}>
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.playBtnText}>Xem Ngay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.trailerBtn}>
            <Ionicons name="videocam-outline" size={20} color="#fff" />
            <Text style={styles.trailerBtnText}>Trailer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addBtn, inWatchlist && { borderColor: '#E50914' }]}
            onPress={toggleWatchlist}
            disabled={isWatchlistLoading}
          >
            {isWatchlistLoading ? (
              <ActivityIndicator size="small" color="#E50914" />
            ) : (
              <Ionicons name={inWatchlist ? "heart" : "heart-outline"} size={26} color={inWatchlist ? "#E50914" : "#fff"} />
            )}
          </TouchableOpacity>
        </View>

        {/* Description */}
        <Text style={styles.description}>{m.description || 'Chưa có mô tả.'}</Text>

        {/* Metadata Panel */}
        <View style={styles.metaBox}>
          <MetaRow label="Đạo Diễn" value={m.director || 'Chưa rõ'} />
          {m.cast && <MetaRow label="Diễn Viên" value={m.cast} />}
          {m.writers && <MetaRow label="Biên Kịch" value={m.writers} />}
          <View style={styles.metaDivider} />
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Phân Loại</Text>
            <View style={styles.ageBadge}><Text style={styles.ageBadgeText}>12+</Text></View>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Âm Thanh</Text>
            <Text style={styles.metaValue}>Tiếng Việt, English</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="share-social-outline" size={18} color="#aaa" />
            <Text style={styles.actionText}>Chia Sẻ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="flag-outline" size={18} color="#aaa" />
            <Text style={styles.actionText}>Báo Lỗi</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Related */}
      {related.length > 0 && (
        <View style={{ marginTop: 8, marginBottom: 32 }}>
          <Text style={styles.relatedHeader}>Phim Đề Xuất</Text>
          <FlatList
            horizontal
            data={related}
            keyExtractor={(item) => `rel-${item.id}`}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={{ width: 110 }} onPress={() => router.push(`/movie/${item.id}`)}>
                <Image source={{ uri: item.posterUrl }} style={{ width: 110, height: 160, borderRadius: 8, backgroundColor: '#1a1a1a' }} resizeMode="cover" />
                <Text style={styles.relatedTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.relatedMeta}>{item.avgRating ? `⭐ ${item.avgRating.toFixed(1)}` : ''} {item.releaseYear || ''}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </ScrollView>
  );
}

function MetaRow({ label, value }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  centered: { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center' },
  backdrop: { width: '100%', height: 300 },
  backBtn: { position: 'absolute', top: 50, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  info: { paddingHorizontal: 20, paddingTop: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  hotBadge: { fontSize: 10, color: '#E50914', fontWeight: '800', letterSpacing: 2 },
  rating: { fontSize: 13, color: '#f5a623', fontWeight: '700' },
  ratingOf: { color: '#888', fontWeight: '400', fontSize: 11 },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', lineHeight: 34, marginBottom: 8 },
  meta: { fontSize: 13, color: '#888', marginBottom: 12 },
  genres: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  genreTag: { backgroundColor: '#1e1e1e', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: '#2a2a2a' },
  genreText: { color: '#ccc', fontSize: 12, fontWeight: '600' },
  buttons: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  playBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#E50914', paddingVertical: 14, borderRadius: 12,
    shadowColor: '#E50914', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  playBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  trailerBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#1e1e1e', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#2a2a2a',
  },
  trailerBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  addBtn: { width: 52, height: 52, borderRadius: 12, backgroundColor: '#1e1e1e', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2a2a2a' },
  description: { fontSize: 14, color: '#aaa', lineHeight: 22, marginBottom: 20 },
  metaBox: { backgroundColor: '#111', borderRadius: 16, padding: 16, gap: 12, marginBottom: 16, borderWidth: 1, borderColor: '#1a1a1a' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  metaLabel: { fontSize: 10, color: '#E50914', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5 },
  metaValue: { fontSize: 13, color: '#ddd', fontWeight: '600', flex: 1, textAlign: 'right' },
  metaDivider: { height: 1, backgroundColor: '#1e1e1e', marginVertical: 4 },
  ageBadge: { backgroundColor: '#1e1e1e', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, borderWidth: 1, borderColor: '#333' },
  ageBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#2a2a2a',
  },
  actionText: { color: '#aaa', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  relatedHeader: { fontSize: 18, fontWeight: '800', color: '#fff', paddingHorizontal: 20, marginBottom: 12 },
  relatedTitle: { fontSize: 11, color: '#bbb', marginTop: 5, fontWeight: '600' },
  relatedMeta: { fontSize: 10, color: '#E50914', fontWeight: '600', marginTop: 2 },
});
