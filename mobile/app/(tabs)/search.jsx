import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { movieService } from '../../src/services/movieService';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await movieService.searchMovies(query);
      setResults(data.content || data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#666" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Tìm kiếm phim, diễn viên..."
          placeholderTextColor="#555"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color="#E50914" style={{ marginTop: 40 }} size="large" />
      ) : searched && results.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎬</Text>
          <Text style={styles.emptyText}>Không tìm thấy kết quả</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultItem} onPress={() => router.push(`/movie/${item.id}`)}>
              <Image
                source={{ uri: item.posterUrl || item.backdropUrl || '' }}
                style={styles.resultPoster}
                resizeMode="cover"
              />
              <View style={styles.resultInfo}>
                <Text style={styles.resultTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.resultMeta}>{item.releaseYear || ''}{item.duration ? `  •  ${Math.floor(item.duration / 60)}h ${item.duration % 60}m` : ''}</Text>
                {(item.genres || []).length > 0 && (
                  <Text style={styles.resultGenre} numberOfLines={1}>{item.genres.map(g => g.name || g).join(' • ')}</Text>
                )}
                {item.avgRating > 0 && <Text style={styles.resultRating}>⭐ {item.avgRating.toFixed(1)}</Text>}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', paddingTop: 56 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1a1a1a', marginHorizontal: 16, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#2a2a2a', marginBottom: 8,
  },
  input: { flex: 1, color: '#fff', fontSize: 15 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingBottom: 80 },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: '#555', fontSize: 14 },
  resultItem: { flexDirection: 'row', gap: 12 },
  resultPoster: { width: 70, height: 100, borderRadius: 8, backgroundColor: '#1a1a1a' },
  resultInfo: { flex: 1, justifyContent: 'center', gap: 4 },
  resultTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  resultMeta: { fontSize: 12, color: '#888' },
  resultGenre: { fontSize: 11, color: '#E50914', fontWeight: '600' },
  resultRating: { fontSize: 12, color: '#f5a623', fontWeight: '700' },
});
