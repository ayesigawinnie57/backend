import { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import { Pencil, Trash2, Plus } from 'lucide-react-native'
import { C } from '../../theme'
import { productsApi, type ApiProduct } from '../../lib/products'

export default function AdminProducts() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = async () => {
    try {
      const { data } = await productsApi.list()
      setProducts(data.results ?? (data as any))
    } catch {
      Alert.alert('Error', 'Failed to load products.')
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(useCallback(() => { fetchProducts() }, []))

  const handleDelete = (id: number, name: string) => {
    Alert.alert('Delete Product', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await productsApi.delete(id)
            setProducts((prev) => prev.filter((p) => p.id !== id))
          } catch {
            Alert.alert('Error', 'Failed to delete product.')
          }
        },
      },
    ])
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={C.green} size="large" /></View>
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Products ({products.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/admin/products/add' as any)}>
          <Plus size={18} color="#fff" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {item.image
              ? <Image key={item.image} source={{ uri: item.image }} style={styles.thumb} resizeMode="cover" />
              : <View style={[styles.thumb, styles.thumbPlaceholder]} />
            }
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.price}>UGX {Number(item.price).toLocaleString()}</Text>
              <Text style={styles.category}>{item.category?.name ?? '—'}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#6366f118' }]}
                onPress={() => router.push(`/admin/products/${item.id}` as any)}
              >
                <Pencil size={15} color="#6366f1" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#ef444418' }]}
                onPress={() => handleDelete(item.id, item.name)}
              >
                <Trash2 size={15} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  title: { fontSize: 20, fontWeight: '800', color: C.navy },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.green, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 12, gap: 12 },
  thumb: { width: 60, height: 60, borderRadius: 10 },
  thumbPlaceholder: { backgroundColor: C.bg },
  info: { flex: 1, gap: 3 },
  name: { fontSize: 14, fontWeight: '700', color: C.navy },
  price: { fontSize: 13, fontWeight: '700', color: C.green },
  category: { fontSize: 11, color: C.muted, textTransform: 'capitalize' },
  actions: { gap: 8 },
  actionBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
})
