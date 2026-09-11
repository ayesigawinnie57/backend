import { useCallback, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Image, useWindowDimensions } from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg'
import { C } from '../theme'
import { DESKTOP_BREAKPOINT } from '../lib/useIsDesktop'
import { productsApi, toCardProduct } from '../lib/products'
import { products as fallbackProducts } from '../data'
import type { Product } from '../components/ProductCard'

const AD_CONFIGS = [
  {
    gradient: ['#0F172A', '#1E3A8A'],
    accent: '#BFDBFE',
  },
  {
    gradient: ['#1A0A00', '#7C2D12'],
    accent: '#FED7AA',
  },
]

function categoryLabel(product: Product) {
  return (product.categoryName || product.category || 'Featured').replace(/-/g, ' ')
}

function categoryTitle(product: Product) {
  return categoryLabel(product)
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function chooseAdPool(all: Product[]) {
  const topPick = [...all].sort((a, b) => b.rating - a.rating)[0]
  const discounted = all
    .filter(product => product.originalPrice && product.originalPrice > product.price && product.id !== topPick.id)
    .sort((a, b) => (b.originalPrice! - b.price) - (a.originalPrice! - a.price))[0]
  const firstPair = [topPick, discounted ?? all.find(product => product.id !== topPick.id) ?? all[1]]
  const available = all.filter(product => !firstPair.some(selected => selected?.id === product.id))
  const nextPick = [...available].sort((a, b) => b.rating - a.rating)[0] ?? all[2] ?? all[0]
  const nextDeal = available
    .filter(product => product.id !== nextPick?.id && product.originalPrice && product.originalPrice > product.price)
    .sort((a, b) => (b.originalPrice! - b.price) - (a.originalPrice! - a.price))[0]
  return [...firstPair, nextPick, nextDeal ?? available.find(product => product.id !== nextPick?.id) ?? all[3] ?? all[1]]
}

export default function AdSection({ isFinal = false }: { isFinal?: boolean }) {
  const { width: W } = useWindowDimensions()
  const isDesktop = W >= DESKTOP_BREAKPOINT
  const router = useRouter()
  const [adProducts, setAdProducts] = useState<Product[]>(() => {
    const pool = chooseAdPool(fallbackProducts)
    return pool.slice(isFinal ? 2 : 0, isFinal ? 4 : 2)
  })

  useFocusEffect(useCallback(() => {
    productsApi.list().then(({ data }) => {
      const all = (Array.isArray(data) ? data : data.results).map(toCardProduct)
      if (all.length >= 2) {
        const pool = chooseAdPool(all)
        setAdProducts(pool.slice(isFinal ? 2 : 0, isFinal ? 4 : 2))
      }
    }).catch(() => undefined)
  }, [isFinal]))

  const cardW = isDesktop
    ? (Math.min(W, 1200) - 64 - 12) / 2
    : (W - 32 - 10) / 2
  const cardH = isDesktop ? 260 : 180

  return (
    <View style={[styles.container, isDesktop && styles.containerDesktop]}>
      <View style={[styles.row, isDesktop && styles.rowDesktop]}>
        {AD_CONFIGS.map((cfg, i) => {
          const p = adProducts[i]
          const title = categoryTitle(p)
          const discount = p?.originalPrice && p.originalPrice > p.price
            ? Math.round((1 - p.price / p.originalPrice) * 100)
            : null
          const tag = i === 0
            ? (isFinal ? 'Fresh Category Pick' : 'Popular Category')
            : (isFinal ? 'Category Savings' : 'Limited Category Deal')
          const headline = i === 0
            ? `${title}\nFavorites` 
            : `${discount ? `${discount}% Off ` : ''}${title}\nDeals`
          const sub = i === 0
            ? `Discover customer-loved ${title.toLowerCase()} worth adding today.`
            : `Save more on ${title.toLowerCase()} while these offers last.`
          const cta = i === 0 ? 'Shop Category' : 'View Category Deals'
          return (
            <TouchableOpacity
              key={i}
              style={[styles.card, { width: cardW, height: cardH }]}
              onPress={() => router.push(`/shop?category=${p?.category ?? ''}` as any)}
              activeOpacity={0.9}
            >
              {/* Background image */}
              {p?.image && (
                <Image source={{ uri: p.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              )}

              {/* Solid dark base + gradient overlay */}
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.65)' }]} />
              <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
                <Defs>
                  <LinearGradient id={`adGrad${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#000" stopOpacity="0.2" />
                    <Stop offset="100%" stopColor="#000" stopOpacity="0.8" />
                  </LinearGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill={`url(#adGrad${i})`} />
              </Svg>

              {/* Content */}
              <View style={styles.cardContent}>
                {/* Tag */}
                <View style={[styles.tag, { borderColor: cfg.accent }]}>
                  <View style={[styles.tagDot, { backgroundColor: cfg.accent }]} />
                  <Text style={[styles.tagText, { color: cfg.accent }]}>{tag}</Text>
                </View>

                <Text style={[styles.headline, isDesktop && styles.headlineDesktop]}>{headline}</Text>
                <Text style={[styles.sub, isDesktop && styles.subDesktop]} numberOfLines={2}>{sub}</Text>

                <View style={styles.ctaBtn}>
                  <Text style={styles.ctaText}>{cta} →</Text>
                </View>
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { backgroundColor: C.bg, paddingHorizontal: 16, paddingVertical: 20 },
  containerDesktop: { paddingHorizontal: 32, paddingVertical: 32 },
  row: { flexDirection: 'row', gap: 10 },
  rowDesktop: { gap: 12, maxWidth: 1200, alignSelf: 'center', width: '100%' },
  card: { borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  cardContent: { flex: 1, padding: 14, justifyContent: 'flex-end' },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
  tagDot: { width: 5, height: 5, borderRadius: 3 },
  tagText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  headline: { color: '#fff', fontSize: 16, fontWeight: '800', lineHeight: 21, marginBottom: 5, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  headlineDesktop: { fontSize: 24, lineHeight: 30, marginBottom: 8 },
  sub: { color: 'rgba(255,255,255,0.85)', fontSize: 10, lineHeight: 14, marginBottom: 12 },
  subDesktop: { fontSize: 13, lineHeight: 18, marginBottom: 16 },
  ctaBtn: { alignSelf: 'flex-start', backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  ctaText: { color: '#0F172A', fontSize: 11, fontWeight: '800' },
})
