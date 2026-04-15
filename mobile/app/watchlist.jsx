import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Dimensions
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { watchlistService } from '../src/services/watchlistService';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - 48) / COLUMN_COUNT;

export default function WatchlistScreen() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = async () => {
    try {
      const data = await watchlistService.getWatchlist();
      setMovies(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          title: 'Phim Yêu Thích',
          headerStyle: { backgroundColor: '#0a0a0a' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }} 
      />

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color="#E50914" size="large" /></View>
      ) : movies.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-dislike-outline" size={64} color="#333" />
          <Text style={styles.emptyText}>Danh sách của bạn đang trống</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(tabs)')}>
            <Text style={styles.browseBtnText}>Khám Phá Ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => String(item.id)}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.item}
              onPress={() => router.push(`/movie/${item.movieId}`)}
            >
              <Image 
                source={{ uri: item.moviePosterUrl }} 
                style={styles.poster}
                resizeMode="cover"
              />
              <Text style={styles.title} numberOfLines={1}>{item.movieTitle}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, gap: 16 },
  columnWrapper: { justifyContent: 'space-between' },
  item: { width: ITEM_WIDTH, marginBottom: 8 },
  poster: { width: ITEM_WIDTH, height: ITEM_WIDTH * 1.5, borderRadius: 12, backgroundColor: '#1a1a1a' },
  title: { color: '#fff', fontSize: 13, fontWeight: '600', marginTop: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingBottom: 100 },
  emptyText: { color: '#666', fontSize: 16, fontWeight: '500' },
  browseBtn: { backgroundColor: '#E50914', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  browseBtnText: { color: '#fff', fontWeight: 'bold' },
});
