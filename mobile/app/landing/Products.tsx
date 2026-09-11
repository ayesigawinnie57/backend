import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native'
import { useCallback, useState } from 'react'
import { useFocusEffect, useRouter } from 'expo-router'
import ProductCard from '../components/ProductCard'
import FilterBar from '../components/FilterBar'
import { products as fallbackProducts } from '../data'
import { productsApi, toCardProduct, type ApiProduct } from '../lib/products'
import { DEFAULT_FILTER, type FilterState } from '../lib/FilterContext'
import { C } from '../theme'
import { DESKTOP_BREAKPOINT } from '../lib/useIsDesktop'
import type { Product } from '../components/ProductCard'

function applyFilter(products: Product[], raw: ApiProduct[], filter: FilterState): Product[] {
  let list = [...products]

  if (filter.type === 'category' && filter.category) {
    list = list.filter(p => p.category === filter.category)
  }
  if (filter.type === 'price') {
    const min = filter.minPrice ? Number(filter.minPrice.replace(/,/g, '')) : 0
    const max = filter.maxPrice ? Number(filter.maxPrice.replace(/,/g, '')) : Infinity
    list = list.filter(p => p.price >= min && p.price <= max)
  }
  if (filter.type === 'az') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
  if (filter.type === 'za') list = [...list].sort((a, b) => b.name.localeCompare(a.name))
  if (filter.type === 'new') {
    const newIds = new Set(raw.filter(p => p.is_new_deal).map(p => p.id))
    list = list.filter(p => newIds.has(p.id))
  }
  if (filter.type === 'featured') {
    const featIds = new Set(raw.filter(p => p.is_featured).map(p => p.id))
    list = list.filter(p => featIds.has(p.id))
  }
  if (filter.type === 'recommended') {
    list = [...list].sort((a, b) => b.rating - a.rating)
  }

  return list
}

export default function Products({ title = 'Featured Products', subtitle = 'Handpicked just for you' }: { title?: string; subtitle?: string }) {
  const router = useRouter()
  const { width: W } = useWindowDimensions()
  const isDesktop = W >= DESKTOP_BREAKPOINT
  const [allProducts, setAllProducts] = useState<Product[]>(fallbackProducts)
  const [rawProducts, setRawProducts] = useState<ApiProduct[]>([])
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER)

  useFocusEffect(useCallback(() => {
    productsApi.list().then(({ data }) => {
      const raw: ApiProduct[] = Array.isArray(data) ? data : (data as any).results ?? []
      const mapped = raw.map(toCardProduct)
      if (mapped.length) { setAllProducts(mapped); setRawProducts(raw) }
    }).catch(() => undefined)
  }, []))

  const filtered = applyFilter(allProducts, rawProducts, filter)
  const hasFilter = filter.type !== null
  const visible = hasFilter ? filtered : filtered.slice(0, isDesktop ? 10 : 6)

  return (
    <View style={[styles.container, isDesktop && styles.containerDesktop]}>
      <View style={[styles.inner, isDesktop && styles.innerDesktop]}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.heading, isDesktop && styles.headingDesktop]}>{title}</Text>
            <Text style={styles.sub}>{subtitle}</Text>
          </View>
          <View style={styles.headerRight}>
            <FilterBar value={filter} onChange={setFilter} />
            <TouchableOpacity onPress={() => router.push('/shop' as any)}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {visible.length === 0
          ? <Text style={styles.empty}>No products match this filter.</Text>
          : (
            <View style={[styles.grid, isDesktop && styles.gridDesktop]}>
              {visible.map(product => <ProductCard key={product.id} product={product} />)}
            </View>
          )
        }
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { backgroundColor: C.bg, paddingHorizontal: 12, paddingVertical: 32 },
  containerDesktop: { paddingVertical: 48, paddingHorizontal: 32 },
  inner: {},
  innerDesktop: { maxWidth: 1200, alignSelf: 'center', width: '100%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  heading: { fontSize: 20, fontWeight: '800', color: C.navy },
  headingDesktop: { fontSize: 28 },
  sub: { fontSize: 12, color: C.muted, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  seeAll: { fontSize: 13, fontWeight: '600', color: C.green },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridDesktop: { gap: 12 },
  empty: { fontSize: 13, color: C.muted, textAlign: 'center', paddingVertical: 32 },
})
