import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native'
import { useCallback, useState } from 'react'
import { useFocusEffect, useRouter } from 'expo-router'
import ProductCard from '../components/ProductCard'
import { products as fallbackProducts } from '../data'
import { productsApi, toCardProduct } from '../lib/products'
import { C } from '../theme'
import { DESKTOP_BREAKPOINT } from '../lib/useIsDesktop'

export default function Recommended() {
  const router = useRouter()
  const { width: W } = useWindowDimensions()
  const isDesktop = W >= DESKTOP_BREAKPOINT
  const [products, setProducts] = useState(fallbackProducts)

  useFocusEffect(useCallback(() => {
    productsApi.list().then(({ data }) => {
      const liveProducts = (Array.isArray(data) ? data : data.results).map(toCardProduct)
      if (liveProducts.length) setProducts(liveProducts)
    }).catch(() => undefined)
  }, []))

  const recommended = products.slice(6, isDesktop ? 16 : 12)

  return (
    <View style={[styles.container, isDesktop && styles.containerDesktop]}>
      <View style={[styles.inner, isDesktop && styles.innerDesktop]}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.heading, isDesktop && styles.headingDesktop]}>Recommended for You</Text>
            <Text style={styles.sub}>Picked based on what shoppers love</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/shop' as any)}>
            <Text style={styles.seeAll}>See All {'→'}</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.grid, isDesktop && styles.gridDesktop]}>
          {recommended.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { backgroundColor: C.card, paddingHorizontal: 12, paddingVertical: 32 },
  containerDesktop: { paddingVertical: 48, paddingHorizontal: 32 },
  inner: {},
  innerDesktop: { maxWidth: 1200, alignSelf: 'center', width: '100%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  heading: { fontSize: 20, fontWeight: '800', color: C.navy },
  headingDesktop: { fontSize: 28 },
  sub: { fontSize: 12, color: C.muted, marginTop: 2 },
  seeAll: { fontSize: 13, fontWeight: '600', color: C.green },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridDesktop: { gap: 12 },
})