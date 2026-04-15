import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
  ActivityIndicator, Dimensions, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { movieService } from '../../src/services/movieService';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_GAP = 12;
const ITEM_WIDTH = (width - 32 - ITEM_GAP) / COLUMN_COUNT;

const SORT_OPTIONS = [
  { key: 'newest', label: 'Mới nhất' },
  { key: 'oldest', label: 'Cũ nhất' },
  { key: 'rating', label: 'Đánh giá cao' },
  { key: 'views', label: 'Lượt xem' },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [
  { key: '', label: 'Tất cả' },
  ...Array.from({ length: 10 }, (_, i) => ({
    key: String(currentYear - i),
    label: String(currentYear - i)
  })),
];

export default function BrowseScreen() {
  const [genres, setGenres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    movieService.getGenres()
      .then(data => setGenres(Array.isArray(data) ? data : []))
      .catch(() => setGenres([]));
  }, []);

  const fetchMovies = useCallback(async (pageNum = 0, append = false) => {
    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);
    
    try {
      const params = { sortBy, page: pageNum, size: 20 };
      if (selectedGenre) params.genreId = selectedGenre;
      if (selectedYear) params.year = selectedYear;
      
      const data = await movieService.filterMovies(params);
      const content = data.content || [];
      
      if (append) {
        setMovies(prev => [...prev, ...content]);
      } else {
        setMovies(content);
      }
      setTotalPages(data.totalPages || 0);
    } catch (e) {
      console.error(e);
      // Fallback: try basic getMovies
      if (!append) {
        try {
          const fallback = await movieService.getMovies(pageNum, 20);
          setMovies(fallback.content || fallback || []);
          setTotalPages(fallback.totalPages || 0);
        } catch {
          setMovies([]);
        }
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedGenre, selectedYear, sortBy]);

  useEffect(() => {
    setPage(0);
    fetchMovies(0);
  }, [fetchMovies]);

  const loadMore = () => {
    if (loadingMore || page + 1 >= totalPages) return;
    const next = page + 1;
    setPage(next);
    fetchMovies(next, true);
  };

  const renderHeader = () => (
    <View style={styles.filterSection}>
      {/* Genre Filter */}
      <View style={styles.filterBlock}>
        <Text style={styles.filterLabel}>THỂ LOẠI</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          <TouchableOpacity
            style={[styles.chip, !selectedGenre && styles.chipActive]}
            onPress={() => setSelectedGenre('')}
          >
            <Text style={[styles.chipText, !selectedGenre && styles.chipTextActive]}>Tất cả</Text>
          </TouchableOpacity>
          {genres.map(g => (
            <TouchableOpacity
              key={g.id}
              style={[styles.chip, String(selectedGenre) === String(g.id) && styles.chipActive]}
              onPress={() => setSelectedGenre(String(selectedGenre) === String(g.id) ? '' : g.id)}
            >
              <Text style={[styles.chipText, String(selectedGenre) === String(g.id) && styles.chipTextActive]}>
                {g.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Sort & Year */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.sortChip, sortBy === opt.key && styles.sortChipActive]}
              onPress={() => setSortBy(opt.key)}
            >
              <Text style={[styles.sortChipText, sortBy === opt.key && styles.sortChipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Year pills */}
      <View style={styles.filterBlock}>
        <Text style={styles.filterLabel}>NĂM</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {YEAR_OPTIONS.map(y => (
            <TouchableOpacity
              key={y.key}
              style={[styles.yearPill, selectedYear === y.key && styles.yearPillActive]}
              onPress={() => setSelectedYear(selectedYear === y.key ? '' : y.key)}
            >
              <Text style={[styles.yearPillText, selectedYear === y.key && styles.yearPillTextActive]}>
                {y.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Result Count */}
      <View style={styles.resultCount}>
        <Text style={styles.resultCountText}>
          {movies.length} phim {selectedGenre && genres.find(g => String(g.id) === String(selectedGenre))
            ? `trong ${genres.find(g => String(g.id) === String(selectedGenre)).name}`
            : ''}
        </Text>
      </View>
    </View>
  );

  const renderMovie = ({ item }) => (
    <TouchableOpacity
      style={styles.movieCard}
      onPress={() => router.push(`/movie/${item.id}`)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.posterUrl || item.backdropUrl || '' }}
        style={styles.moviePoster}
        resizeMode="cover"
      />
      {item.avgRating > 0 && (
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>⭐ {item.avgRating.toFixed(1)}</Text>
        </View>
      )}
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.movieMeta}>{item.releaseYear || ''}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>KHÁM PHÁ</Text>
        <Text style={styles.headerTitle}>Duyệt Phim</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={styles.loadingText}>Đang tải phim...</Text>
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => String(item.id)}
          numColumns={COLUMN_COUNT}
          ListHeaderComponent={renderHeader}
          renderItem={renderMovie}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color="#E50914" style={{ marginVertical: 20 }} />
            ) : movies.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="film-outline" size={64} color="#333" />
                <Text style={styles.emptyText}>Không tìm thấy phim nào</Text>
                <TouchableOpacity
                  style={styles.clearFilterBtn}
                  onPress={() => { setSelectedGenre(''); setSelectedYear(''); setSortBy('newest'); }}
                >
                  <Text style={styles.clearFilterText}>Xóa bộ lọc</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  
  header: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 8 },
  headerLabel: { fontSize: 10, fontWeight: '900', color: '#E50914', letterSpacing: 3, marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#666', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2 },
  
  filterSection: { paddingBottom: 8 },
  filterBlock: { marginBottom: 12 },
  filterLabel: { fontSize: 10, fontWeight: '800', color: '#888', letterSpacing: 2, marginBottom: 8, paddingHorizontal: 16 },
  filterRow: { marginBottom: 12 },
  chipRow: { paddingHorizontal: 12, gap: 8 },
  
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a',
  },
  chipActive: { backgroundColor: '#E50914', borderColor: '#E50914' },
  chipText: { color: '#888', fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  
  sortChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8,
    backgroundColor: '#111', borderWidth: 1, borderColor: '#222',
  },
  sortChipActive: { backgroundColor: '#1e1e1e', borderColor: '#E50914' },
  sortChipText: { color: '#666', fontSize: 12, fontWeight: '700' },
  sortChipTextActive: { color: '#E50914' },
  
  yearPill: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8,
    backgroundColor: '#111', borderWidth: 1, borderColor: '#1e1e1e',
  },
  yearPillActive: { borderColor: '#E50914', backgroundColor: 'rgba(229,9,20,0.1)' },
  yearPillText: { color: '#666', fontSize: 12, fontWeight: '600' },
  yearPillTextActive: { color: '#E50914' },
  
  resultCount: { paddingHorizontal: 16, paddingBottom: 8 },
  resultCountText: { color: '#555', fontSize: 12, fontWeight: '500' },
  
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  row: { justifyContent: 'space-between', marginBottom: ITEM_GAP },
  
  movieCard: { width: ITEM_WIDTH, borderRadius: 12, overflow: 'hidden', backgroundColor: '#111' },
  moviePoster: { width: '100%', height: ITEM_WIDTH * 1.5, backgroundColor: '#1a1a1a' },
  ratingBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(229,9,20,0.9)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  ratingText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  movieInfo: { padding: 10 },
  movieTitle: { color: '#fff', fontSize: 13, fontWeight: '700', lineHeight: 18, marginBottom: 4 },
  movieMeta: { color: '#666', fontSize: 11, fontWeight: '500' },
  
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { color: '#666', fontSize: 15, fontWeight: '500' },
  clearFilterBtn: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333' },
  clearFilterText: { color: '#E50914', fontSize: 13, fontWeight: '700' },
});
