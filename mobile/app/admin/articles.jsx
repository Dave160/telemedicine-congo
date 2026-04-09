import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, ScrollView } from 'react-native';
import api from '../../services/api';

const CATEGORIES = ['Prévention', 'Nutrition', 'Maternité', 'Maladies', 'Conseils'];

export default function AdminArticlesScreen() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'Prévention', isPublished: true });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    api.get('/articles')
      .then(({ data }) => setArticles(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  async function save() {
    if (!form.title.trim() || !form.content.trim()) {
      Alert.alert('Erreur', 'Titre et contenu requis');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('/admin/articles', form);
      setArticles([data, ...articles]);
      setModal(false);
      setForm({ title: '', content: '', category: 'Prévention', isPublished: true });
    } catch {
      Alert.alert('Erreur', 'Impossible de créer l\'article');
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(article) {
    try {
      await api.put(`/admin/articles/${article.id}`, { ...article, isPublished: !article.isPublished });
      setArticles(articles.map((a) => a.id === article.id ? { ...a, isPublished: !a.isPublished } : a));
    } catch {
      Alert.alert('Erreur');
    }
  }

  async function deleteArticle(id) {
    Alert.alert('Supprimer', 'Confirmer la suppression ?', [
      { text: 'Annuler' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/admin/articles/${id}`);
            setArticles(articles.filter((a) => a.id !== id));
          } catch { Alert.alert('Erreur'); }
        },
      },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ height: 44, backgroundColor: '#1a73e8' }} />
      <View style={{ backgroundColor: '#1a73e8', paddingHorizontal: 16, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Articles santé</Text>
        <TouchableOpacity
          onPress={() => setModal(true)}
          style={{ backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 }}
        >
          <Text style={{ color: '#1a73e8', fontWeight: '700', fontSize: 13 }}>+ Nouveau</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#1a73e8" />
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <View style={{ backgroundColor: '#e8f0fe', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                  <Text style={{ color: '#1a73e8', fontSize: 11, fontWeight: '600' }}>{item.category}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ backgroundColor: item.isPublished ? '#f0fdf4' : '#f9fafb', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 10, color: item.isPublished ? '#16a34a' : '#9ca3af', fontWeight: '600' }}>
                      {item.isPublished ? '✓ Publié' : '○ Brouillon'}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#111', marginBottom: 4 }}>{item.title}</Text>
              <Text style={{ color: '#777', fontSize: 12, marginBottom: 12 }} numberOfLines={2}>{item.content}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => togglePublish(item)}
                  style={{ flex: 1, backgroundColor: item.isPublished ? '#fef3c7' : '#f0fdf4', borderRadius: 10, paddingVertical: 8, alignItems: 'center' }}
                >
                  <Text style={{ color: item.isPublished ? '#92400e' : '#16a34a', fontWeight: '600', fontSize: 12 }}>
                    {item.isPublished ? 'Dépublier' : 'Publier'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteArticle(item.id)}
                  style={{ flex: 1, backgroundColor: '#fee2e2', borderRadius: 10, paddingVertical: 8, alignItems: 'center' }}
                >
                  <Text style={{ color: '#ef4444', fontWeight: '600', fontSize: 12 }}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ fontSize: 40 }}>📰</Text>
              <Text style={{ color: '#777', marginTop: 8 }}>Aucun article</Text>
            </View>
          }
        />
      )}

      {/* New Article Modal */}
      <Modal visible={modal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111' }}>Nouvel article</Text>
              <TouchableOpacity onPress={() => setModal(false)}>
                <Text style={{ color: '#9ca3af', fontSize: 22 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
              <View>
                <Text style={{ fontSize: 13, fontWeight: '500', color: '#555', marginBottom: 6 }}>Titre</Text>
                <TextInput
                  style={{ borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14 }}
                  placeholder="Titre de l'article"
                  value={form.title}
                  onChangeText={(v) => setForm({ ...form, title: v })}
                />
              </View>

              <View>
                <Text style={{ fontSize: 13, fontWeight: '500', color: '#555', marginBottom: 6 }}>Catégorie</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {CATEGORIES.map((c) => (
                      <TouchableOpacity
                        key={c}
                        onPress={() => setForm({ ...form, category: c })}
                        style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: form.category === c ? '#1a73e8' : '#f3f4f6' }}
                      >
                        <Text style={{ color: form.category === c ? '#fff' : '#555', fontSize: 13, fontWeight: '500' }}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View>
                <Text style={{ fontSize: 13, fontWeight: '500', color: '#555', marginBottom: 6 }}>Contenu</Text>
                <TextInput
                  style={{ borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, minHeight: 120, textAlignVertical: 'top' }}
                  placeholder="Rédigez votre article..."
                  value={form.content}
                  onChangeText={(v) => setForm({ ...form, content: v })}
                  multiline
                />
              </View>

              <TouchableOpacity
                onPress={() => setForm({ ...form, isPublished: !form.isPublished })}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: form.isPublished ? '#f0fdf4' : '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: form.isPublished ? '#bbf7d0' : '#e5e7eb' }}
              >
                <View style={{ width: 22, height: 22, borderRadius: 4, backgroundColor: form.isPublished ? '#22c55e' : '#e5e7eb', alignItems: 'center', justifyContent: 'center' }}>
                  {form.isPublished && <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>✓</Text>}
                </View>
                <Text style={{ color: form.isPublished ? '#15803d' : '#6b7280', fontWeight: '500' }}>Publier immédiatement</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={save}
                disabled={saving}
                style={{ backgroundColor: '#1a73e8', borderRadius: 12, paddingVertical: 14, alignItems: 'center', opacity: saving ? 0.7 : 1 }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{saving ? 'Publication...' : 'Publier l\'article'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
