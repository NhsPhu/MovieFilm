import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, StyleSheet,
  FlatList, Dimensions, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { movieService } from '../../src/services/movieService';
import { historyService } from '../../src/services/historyService';
import useAuthStore from '../../src/store/useAuthStore';

const { width } = Dimensions.get('window');
const CARD_W = width * 0.38;
const TALL_W = width * 0.55;
const CONTINUE_W = width * 0.7;

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [movies, setMovies] = useState([]);
  const [trending, setTrending] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await movieService.getMovies(0, 30);
        const all = data.content || data || [];
        setMovies(all);
        setTrending(all.slice(0, 10));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();

    // Fetch AI recommendations in parallel
    movieService.getRecommendations(10)
      .then(data => setRecommended(Array.isArray(data) ? data : []))
      .catch(() => setRecommended([]));
  }, []);

  // Fetch continue watching when user is available
  useEffect(() => {
    if (!user) {
      setContinueWatching([]);
      return;
    }
    
    historyService.getWatchHistory()
      .then(data => {
        const inProgress = (data || [])
          .filter(item => !item.isFinished && item.currentTimeSec > 0)
          .slice(0, 5);
        setContinueWatching(inProgress);
      })
      .catch(() => setContinueWatching([]));
  }, [user]);

  const hero = movies[0];

  const getProgressPercent = (item) => {
    if (item.isFinished) return 100;
    return Math.min(Math.floor((item.currentTimeSec / (120 * 60)) * 100) + 5, 95);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Banner */}
      {hero && (
        <View style={styles.hero}>
          <Image source={{ uri: hero.backdropUrl || hero.posterUrl }} style={styles.heroImage} />
          <LinearGradient
            colors={['transparent', 'rgba(10,10,10,0.85)', '#0a0a0a']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroContent}>
            <Text style={styles.heroGenre}>⚡ ĐANG HOT</Text>
            <Text style={styles.heroTitle} numberOfLines={2}>{hero.title}</Text>
            <Text style={styles.heroDescription} numberOfLines={3}>{hero.description || ''}</Text>
            <Text style={styles.heroMeta}>{hero.releaseYear} • {hero.duration ? `${Math.floor(hero.duration / 60)}h ${hero.duration % 60}m` : ''}</Text>
            <View style={styles.heroButtons}>
              <TouchableOpacity style={styles.playBtn} onPress={() => router.push(`/watch/${hero.id}`)}>
                <Text style={styles.playBtnText}>▶  Xem Ngay</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.infoBtn} onPress={() => router.push(`/movie/${hero.id}`)}>
                <Text style={styles.infoBtnText}>Chi Tiết</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Continue Watching Section */}
      {continueWatching.length > 0 && (
        <Section title="▶ Đang Xem">
          <FlatList
            horizontal
            data={continueWatching}
            keyExtractor={(item) => `cw-${item.movieId || item.id}`}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ width: CONTINUE_W }}
                onPress={() => router.push(`/watch/${item.movieId}`)}
              >
                <View style={styles.continueCard}>
                  <Image
                    source={{ uri: item.backdropUrl || item.posterUrl || '' }}
                    style={styles.continueImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.9)']}
                    style={styles.continueGradient}
                  >
                    <Text style={styles.continueBadge}>TIẾP TỤC</Text>
                    <Text style={styles.continueTitle} numberOfLines={1}>{item.movieTitle || ''}</Text>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${getProgressPercent(item)}%` }]} />
                    </View>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            )}
          />
        </Section>
      )}

      {/* Trending Row */}
      <Section title="🔥 Phim Nổi Bật">
        <FlatList
          horizontal
          data={trending}
          keyExtractor={(item) => String(item.id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ width: CARD_W }}
              onPress={() => router.push(`/movie/${item.id}`)}
            >
              <Image
                source={{ uri: item.posterUrl || item.backdropUrl }}
                style={[styles.card, { width: CARD_W, height: CARD_W * 1.5 }]}
                resizeMode="cover"
              />
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              {item.avgRating > 0 && <Text style={styles.cardRating}>⭐ {item.avgRating.toFixed(1)}</Text>}
            </TouchableOpacity>
          )}
        />
      </Section>

      {/* AI Recommendations Section */}
      {recommended.length > 0 && (
        <Section title={user ? '✨ Dành Riêng Cho Bạn' : '✨ Có Thể Bạn Thích'}>
          <FlatList
            horizontal
            data={recommended}
            keyExtractor={(item) => `ai-${item.id}`}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ width: CARD_W }}
                onPress={() => router.push(`/movie/${item.id}`)}
              >
                <View style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: item.posterUrl || item.backdropUrl }}
                    style={[styles.card, { width: CARD_W, height: CARD_W * 1.5 }]}
                    resizeMode="cover"
                  />
                  {/* AI Badge */}
                  <View style={styles.aiBadge}>
                    <Text style={styles.aiBadgeText}>✦ AI</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                {item.avgRating > 0 && <Text style={styles.cardRating}>⭐ {item.avgRating.toFixed(1)}</Text>}
              </TouchableOpacity>
            )}
          />
        </Section>
      )}

      {/* Top Rated Row */}
      <Section title="🏆 Đánh Giá Cao">
        <FlatList
          horizontal
          data={[...movies].sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0)).slice(0, 10)}
          keyExtractor={(item) => `tr-${item.id}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ width: TALL_W }}
              onPress={() => router.push(`/movie/${item.id}`)}
            >
              <Image
                source={{ uri: item.backdropUrl || item.posterUrl }}
                style={[styles.card, { width: TALL_W, height: TALL_W * 0.56 }]}
                resizeMode="cover"
              />
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      </Section>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' },

  hero: { height: 520, position: 'relative' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 },
  heroGenre: { fontSize: 10, color: '#E50914', fontWeight: '800', letterSpacing: 2, marginBottom: 8 },
  heroTitle: { fontSize: 32, fontWeight: '900', color: '#fff', lineHeight: 36, marginBottom: 6 },
  heroDescription: { fontSize: 13, color: '#aaa', lineHeight: 18, marginBottom: 6, maxWidth: '90%' },
  heroMeta: { fontSize: 12, color: '#888', marginBottom: 16 },
  heroButtons: { flexDirection: 'row', gap: 10 },
  playBtn: {
    backgroundColor: '#E50914', paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 10, flex: 1, alignItems: 'center',
    shadowColor: '#E50914', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  playBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  infoBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 10, flex: 1, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  infoBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Continue Watching
  continueCard: { borderRadius: 12, overflow: 'hidden', height: 160, backgroundColor: '#1a1a1a' },
  continueImage: { width: '100%', height: '100%' },
  continueGradient: {
    ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 12,
  },
  continueBadge: { fontSize: 9, color: '#E50914', fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
  continueTitle: { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 8 },
  progressBarBg: { height: 3, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#E50914' },

  section: { marginTop: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 14, paddingHorizontal: 16 },
  card: { borderRadius: 10, backgroundColor: '#1a1a1a' },
  cardTitle: { fontSize: 12, color: '#ccc', marginTop: 6, fontWeight: '600' },
  cardRating: { fontSize: 11, color: '#f5a623', marginTop: 2 },

  // AI badge overlay on recommendation cards
  aiBadge: {
    position: 'absolute', top: 6, left: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.9)', paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 10,
  },
  aiBadgeText: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
});
