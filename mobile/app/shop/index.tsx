import { useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native'
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft, SlidersHorizontal, Package } from 'lucide-react-native'
import ProductCard from '../components/ProductCard'
import { products as fallbackProducts } from '../data'
import { productsApi, toCardProduct, type ApiCategory } from '../lib/products'
import { C } from '../theme'
import { DESKTOP_BREAKPOINT } from '../lib/useIsDesktop'

type SortOption = 'relevance' | 'price-low' | 'price-high' | 'rating' | 'name'

const SORT_OPTIONS: Array<{ key: SortOption; label: string; buttonLabel: string }> = [
  { key: 'relevance', label: 'Recommended', buttonLabel: 'Recommended' },
  { key: 'price-low', label: 'Price: Low to High', buttonLabel: 'Low price' },
  { key: 'price-high', label: 'Price: High to Low', buttonLabel: 'High price' },
  { key: 'rating', label: 'Top Rated', buttonLabel: 'Top rated' },
  { key: 'name', label: 'Name: A to Z', buttonLabel: 'A-Z' },
]

export default function ShopPage() {
  const { category: paramCategory } = useLocalSearchParams<{ category?: string }>()
  const [active, setActive] = useState(paramCategory ?? 'all')
  const [categories, setCategories] = useState<Array<{ label: string; slug: string }>>([{ label: 'All', slug: 'all' }])
  const [products, setProducts] = useState(fallbackProducts)
  const [sortOption, setSortOption] = useState<SortOption>('relevance')
  const [sortOpen, setSortOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { width: windowWidth } = useWindowDimensions()
  const mobileCardWidth = windowWidth >= DESKTOP_BREAKPOINT ? undefined : (windowWidth - 32 - 6) / 2

  useFocusEffect(useCallback(() => {
    setActive(paramCategory ?? 'all')
    Promise.all([productsApi.categories(), productsApi.list()])
      .then(([catRes, prodRes]) => {
        const cats = (Array.isArray(catRes.data) ? catRes.data as ApiCategory[] : ((catRes.data as any)?.results ?? []) as ApiCategory[]).map(c => ({ label: c.name, slug: c.slug }))
        setCategories([{ label: 'All', slug: 'all' }, ...cats])
        const raw = prodRes.data as any
        setProducts((Array.isArray(raw) ? raw : (raw?.results ?? [])).map(toCardProduct))
      })
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [paramCategory]))

  const filtered = active === 'all' ? products : products.filter(p => p.category === active)
  const sortedProducts = [...filtered].sort((a, b) => {
    switch (sortOption) {
      case 'price-low': return a.price - b.price
      case 'price-high': return b.price - a.price
      case 'rating': return b.rating - a.rating
      case 'name': return a.name.localeCompare(b.name)
      default: return 0
    }
  })
  const activeLabel = categories.find(c => c.slug === active)?.label ?? 'All'
  const sortLabel = SORT_OPTIONS.find(option => option.key === sortOption)?.buttonLabel ?? 'Sort'

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.push('/' as any)}>
          <ArrowLeft size={20} color={C.navy} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Shop</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Category filter pills */}
      <View style={styles.filterWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.slug}
              style={[styles.pill, active === cat.slug && styles.pillActive]}
              onPress={() => setActive(cat.slug)}
            >
              <Text style={[styles.pillText, active === cat.slug && styles.pillTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>

        {/* Category header */}
        <View style={styles.catHeader}>
          <View style={styles.catHeaderLeft}>
            <View style={styles.catIconWrap}>
              <Package size={16} color={C.green} />
            </View>
            <View>
              <Text style={styles.catTitle}>{activeLabel}</Text>
              {!loading && (
                <Text style={styles.catCount}>{filtered.length} product{filtered.length !== 1 ? 's' : ''}</Text>
              )}
            </View>
          </View>
          <View style={styles.sortWrap}>
            <TouchableOpacity style={styles.sortBtn} onPress={() => setSortOpen(open => !open)}>
              <SlidersHorizontal size={15} color={C.muted} />
              <Text style={styles.sortText}>{sortLabel}</Text>
            </TouchableOpacity>
            {sortOpen && (
              <View style={styles.sortDropdown}>
                {SORT_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.key}
                    style={styles.sortOption}
                    onPress={() => { setSortOption(option.key); setSortOpen(false) }}
                  >
                    <Text style={[styles.sortOptionText, option.key === sortOption && styles.sortOptionActive]}>{option.label}</Text>
                    {option.key === sortOption && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Product grid */}
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={C.green} size="large" />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : sortedProducts.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Package size={44} color={C.border} />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptyText}>Try a different category</Text>
          </View>
        ) : (
          <View style={styles.row}>
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} cardWidth={mobileCardWidth} />
            ))}
          </View>
        )}

        <View style={{ height: insets.bottom + 88 }} />
      </ScrollView>

    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: 17, fontWeight: '800', color: C.navy },

  filterWrap: { backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  filterContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.bg },
  pillActive: { backgroundColor: C.navy, borderColor: C.navy },
  pillText: { fontSize: 12, fontWeight: '600', color: C.muted },
  pillTextActive: { color: '#fff' },

  grid: { paddingHorizontal: 16, paddingTop: 12 },

  catHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, marginBottom: 12, zIndex: 10, elevation: 2 },
  catHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
  catTitle: { fontSize: 16, fontWeight: '800', color: C.navy },
  catCount: { fontSize: 11, color: C.muted, marginTop: 1 },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: C.border, backgroundColor: C.bg },
  sortText: { fontSize: 11, fontWeight: '600', color: C.muted },

  sortWrap: { position: 'relative', zIndex: 10 },
  sortDropdown: { position: 'absolute', top: '100%', right: -16, width: 180, marginTop: 4, backgroundColor: C.card, borderRadius: 10, borderWidth: 1, borderColor: C.border, paddingHorizontal: 8, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 6 },
  sortOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  sortOptionText: { fontSize: 11, color: C.navy },
  sortOptionActive: { color: C.green, fontWeight: '800' },
  checkmark: { color: C.green, fontSize: 15, fontWeight: '800' },

  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },

  loadingWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  loadingText: { color: C.muted, fontSize: 13 },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.navy },
  emptyText: { fontSize: 13, color: C.muted },
})
