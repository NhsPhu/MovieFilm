import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { historyService } from '../src/services/historyService';

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const data = await historyService.getHistory();
      setHistory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClearHistory = () => {
    Alert.alert('Xoá Lịch Sử', 'Bạn có chắc chắn muốn xoá toàn bộ lịch sử xem phim?', [
      { text: 'Hủy', style: 'cancel' },
      { 
        text: 'Xoá Hết', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await historyService.clearHistory();
            setHistory([]);
          } catch (e) { Alert.alert('Lỗi', 'Không thể xoá lịch sử.'); }
        } 
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const progress = item.duration > 0 ? (item.currentTime / item.duration) * 100 : 0;
    
    return (
      <TouchableOpacity 
        style={styles.item}
        onPress={() => router.push(`/watch/${item.movieId}`)}
      >
        <Image source={{ uri: item.moviePosterUrl }} style={styles.poster} resizeMode="cover" />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{item.movieTitle}</Text>
          <Text style={styles.date}>{new Date(item.lastWatched).toLocaleDateString('vi-VN')}</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}% hoàn thành</Text>
          </View>
        </View>
        <Ionicons name="play-circle-outline" size={32} color="#E50914" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          title: 'Lịch Sử Xem',
          headerStyle: { backgroundColor: '#0a0a0a' },
          headerTintColor: '#fff',
          headerRight: () => history.length > 0 ? (
            <TouchableOpacity onPress={handleClearHistory} style={{ marginRight: 4 }}>
              <Text style={{ color: '#E50914', fontWeight: '600' }}>Xoá Hết</Text>
            </TouchableOpacity>
          ) : null,
        }} 
      />

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color="#E50914" size="large" /></View>
      ) : history.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="time-outline" size={64} color="#333" />
          <Text style={styles.emptyText}>Chưa có lịch sử xem phim</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, gap: 16 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 12, padding: 10, gap: 12 },
  poster: { width: 70, height: 100, borderRadius: 8, backgroundColor: '#1a1a1a' },
  info: { flex: 1, gap: 4 },
  title: { color: '#fff', fontSize: 15, fontWeight: '700' },
  date: { color: '#666', fontSize: 12 },
  progressContainer: { marginTop: 6 },
  progressBarBackground: { height: 4, backgroundColor: '#333', borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  progressBarFill: { height: '100%', backgroundColor: '#E50914' },
  progressText: { color: '#888', fontSize: 10, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingBottom: 100 },
  emptyText: { color: '#666', fontSize: 16, fontWeight: '500' },
});
