import { useState, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator,
} from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Cpu, Dumbbell, Sparkles, BookOpen, Sofa, ShoppingBag, Grid2X2 } from 'lucide-react-native'
import { C } from './theme'
import { productsApi, type ApiCategory, type ApiProduct } from './lib/products'

const CATEGORY_META: Record<string, { icon: any; color: string; bg: string }> = {
  electronics: { icon: Cpu,         color: '#6366F1', bg: '#EEF2FF' },
  sports:      { icon: Dumbbell,    color: '#F59E0B', bg: '#FEF3C7' },
  beauty:      { icon: Sparkles,    color: '#EC4899', bg: '#FDF2F8' },
  books:       { icon: BookOpen,    color: '#8B5CF6', bg: '#F5F3FF' },
  home:        { icon: Sofa,        color: '#14B8A6', bg: '#F0FDFA' },
  fashion:     { icon: ShoppingBag, color: '#F97316', bg: '#FFF7ED' },
}

function getMeta(slug: string) {
  const key = Object.keys(CATEGORY_META).find(k => slug.toLowerCase().includes(k))
  return key ? CATEGORY_META[key] : { icon: Grid2X2, color: C.green, bg: '#DCFCE7' }
}

type CategoryWithCount = ApiCategory & { count: number }

export default function CategoryPage() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useFocusEffect(useCallback(() => {
    let active = true
    setLoading(true)
    setError(false)

    Promise.all([productsApi.categories(), productsApi.list()])
      .then(([catRes, prodRes]) => {
        if (!active) return
        const cats = Array.isArray(catRes.data) ? catRes.data as ApiCategory[] : ((catRes.data as any)?.results ?? []) as ApiCategory[]
        const raw = prodRes.data as any
        const prods: ApiProduct[] = Array.isArray(raw) ? raw : (raw?.results ?? [])
        const countMap: Record<string, number> = {}
        prods.forEach(p => {
          const slug = p.category?.slug
          if (slug) countMap[slug] = (countMap[slug] ?? 0) + 1
        })
        setCategories(cats.map(c => ({ ...c, count: countMap[c.slug] ?? 0 })))
      })
      .catch(() => { if (active) setError(true) })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, []))

  const categoryRows = categories.reduce<CategoryWithCount[][]>((rows, category, index) => {
    if (index % 2 === 0) rows.push([category])
    else rows[rows.length - 1].push(category)
    return rows
  }, [])

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Categories</Text>
          <Text style={styles.headerSub}>
            {loading ? 'Loading...' : `${categories.length} categories`}
          </Text>
        </View>
        <View style={styles.headerBadge}>
          <Grid2X2 size={18} color={C.green} />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.green} />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Grid2X2 size={44} color={C.border} />
          <Text style={styles.emptyTitle}>Could not load categories</Text>
          <Text style={styles.emptyText}>Check your connection and try again.</Text>
        </View>
      ) : categories.length === 0 ? (
        <View style={styles.center}>
          <Grid2X2 size={44} color={C.border} />
          <Text style={styles.emptyTitle}>No categories yet</Text>
          <Text style={styles.emptyText}>Categories will appear here once added.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
          {categoryRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
            {row.map(cat => {
              const meta = getMeta(cat.slug)
              const Icon = meta.icon
              return (
                <TouchableOpacity
                  key={cat.uuid}
                  style={styles.card}
                  onPress={() => router.push(`/shop?category=${cat.slug}` as any)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.imageWrap, { backgroundColor: meta.bg }]}> 
                    {cat.image
                      ? <Image source={{ uri: cat.image }} style={styles.image} resizeMode="cover" />
                      : <Icon size={32} color={meta.color} />
                    }
                    {cat.count > 0 && (
                      <View style={styles.countPill}>
                        <Text style={styles.countPillText}>{cat.count}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardName} numberOfLines={1}>{cat.name}</Text>
                    <Text style={styles.cardCount}>{cat.count} items</Text>
                  </View>
                </TouchableOpacity>
              )
            })}
            {row.length === 1 && <View style={styles.cardSlot} />}
            </View>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.navy },
  headerSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  headerBadge: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: C.muted, fontSize: 13, marginTop: 8 },
  emptyTitle: { color: C.navy, fontSize: 18, fontWeight: '800' },
  emptyText: { color: C.muted, fontSize: 13 },
  grid: { padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  card: { width: '48%', backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 10 },
  cardSlot: { width: '48%' },
  imageWrap: { width: '100%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  countPill: { position: 'absolute', top: 6, right: 6, backgroundColor: C.green, borderRadius: 20, paddingHorizontal: 6, paddingVertical: 2 },
  countPillText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  cardBody: { padding: 8 },
  cardName: { fontSize: 12, fontWeight: '700', color: C.navy },
  cardCount: { fontSize: 10, color: C.muted, marginTop: 2 },
})
