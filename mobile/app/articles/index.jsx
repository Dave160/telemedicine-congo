import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';

const CATEGORIES = ['Tous', 'Prévention', 'Nutrition', 'Maternité', 'Maladies', 'Conseils'];

export default function ArticlesScreen() {
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, [category]);

  async function fetchArticles() {
    setLoading(true);
    try {
      const params = category ? `?category=${category}` : '';
      const { data } = await api.get(`/articles${params}`);
      setArticles(data);
    } catch {} finally {
      setLoading(false);
    }
  }

  if (selectedArticle) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ height: 44, backgroundColor: '#2db87a' }} />
        <View style={{ backgroundColor: '#2db87a', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <TouchableOpacity onPress={() => setSelectedArticle(null)} style={{ padding: 4 }}>
            <Text style={{ color: '#fff', fontSize: 24 }}>‹</Text>
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', flex: 1 }} numberOfLines={1}>{selectedArticle.title}</Text>
        </View>
        <FlatList
          data={[selectedArticle]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ padding: 20 }}>
              <View style={{ backgroundColor: '#d1fae5', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 12 }}>
                <Text style={{ color: '#2db87a', fontSize: 12, fontWeight: '600' }}>{item.category}</Text>
              </View>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 8, lineHeight: 30 }}>{item.title}</Text>
              <Text style={{ color: '#9ca3af', fontSize: 12, marginBottom: 16 }}>
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
              </Text>
              <Text style={{ color: '#374151', fontSize: 15, lineHeight: 24 }}>{item.content}</Text>
            </View>
          )}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ height: 44, backgroundColor: '#2db87a' }} />

      {/* Header */}
      <View style={{ backgroundColor: '#2db87a', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Text style={{ color: '#fff', fontSize: 24 }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1 }}>Santé & Conseils</Text>
      </View>

      {/* Categories */}
      <View style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
          renderItem={({ item }) => {
            const val = item === 'Tous' ? '' : item;
            return (
              <TouchableOpacity
                onPress={() => setCategory(val)}
                style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: category === val ? '#2db87a' : '#f3f4f6' }}
              >
                <Text style={{ color: category === val ? '#fff' : '#555', fontSize: 13, fontWeight: '500' }}>{item}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#2db87a" />
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedArticle(item)}
              style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <View style={{ backgroundColor: '#d1fae5', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ color: '#2db87a', fontSize: 11, fontWeight: '600' }}>{item.category}</Text>
                </View>
                <Text style={{ color: '#9ca3af', fontSize: 11 }}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR') : ''}
                </Text>
              </View>
              <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#111', marginBottom: 6, lineHeight: 22 }}>{item.title}</Text>
              <Text style={{ color: '#6b7280', fontSize: 13, lineHeight: 18 }} numberOfLines={2}>{item.content}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📰</Text>
              <Text style={{ color: '#374151', fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>Aucun article</Text>
              <Text style={{ color: '#9ca3af', fontSize: 14 }}>Les articles santé apparaîtront ici</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
