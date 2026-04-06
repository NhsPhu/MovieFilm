import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, StyleSheet,
  FlatList, Dimensions, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { movieService } from '../../src/services/movieService';

const { width } = Dimensions.get('window');

const CARD_W = width * 0.38;
const TALL_W = width * 0.55;

export default function HomeScreen() {
  const [movies, setMovies] = useState([]);
  const [trending, setTrending] = useState([]);
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
  }, []);

  const hero = movies[0];

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
  heroTitle: { fontSize: 32, fontWeight: '900', color: '#fff', lineHeight: 36, marginBottom: 8 },
  heroMeta: { fontSize: 12, color: '#aaa', marginBottom: 16 },
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

  section: { marginTop: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 14, paddingHorizontal: 16 },
  card: { borderRadius: 10, backgroundColor: '#1a1a1a' },
  cardTitle: { fontSize: 12, color: '#ccc', marginTop: 6, fontWeight: '600' },
  cardRating: { fontSize: 11, color: '#f5a623', marginTop: 2 },
});
