import { useCallback, useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, Image, Animated, Easing, TouchableOpacity, useWindowDimensions } from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg'
import { C } from '../theme'
import { products as fallbackProducts } from '../data'
import { productsApi, toCardProduct } from '../lib/products'
import { DESKTOP_BREAKPOINT } from '../lib/useIsDesktop'

const messages = [
  'Crystal-clear sound for every moment.',
  'Stay ahead with smart features on your wrist.',
  'Protect your phone with standout style.',
  'Move further with comfort built into every step.',
  'Make every workout feel better and stronger.',
  'Hydration made easy wherever the day takes you.',
]

const withMessages = (products: typeof fallbackProducts) =>
  products.slice(0, 6).map((p, i) => ({ ...p, message: messages[i % messages.length] }))

export default function Hero() {
  const { width: W } = useWindowDimensions()
  const isDesktop = W >= DESKTOP_BREAKPOINT
  const BANNER_WIDTH = isDesktop ? Math.min(W, 1200) - 64 : W
  const BANNER_HEIGHT = isDesktop ? 380 : 240
  const router = useRouter()

  const [activeIndex, setActiveIndex] = useState(0)
  const [products, setProducts] = useState(() => withMessages(fallbackProducts))
  const slide = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(1)).current

  const safeIndex = Math.min(activeIndex, Math.max(products.length - 1, 0))
  const product = products[safeIndex]
  const nextProduct = products.length > 1 ? products[(safeIndex + 1) % products.length] : product

  useFocusEffect(useCallback(() => {
    productsApi.list().then(({ data }) => {
      const live = (Array.isArray(data) ? data : data.results).map(toCardProduct)
      if (live.length) { setProducts(withMessages(live)); setActiveIndex(0); slide.setValue(0) }
    }).catch(() => undefined)
  }, [slide]))

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(slide, {
        toValue: -BANNER_WIDTH,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.cubic),
      }).start(() => {
        setActiveIndex(cur => products.length ? (cur + 1) % products.length : 0)
        slide.setValue(0)
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [products.length, BANNER_WIDTH])

  const renderSlide = (p: typeof product, w: number, h: number) => (
    <View style={{ width: w, height: h }}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: C.navy }]} />

      {/* Product image */}
      {p.image
        ? <View style={styles.imageSide}>
            <Image source={{ uri: p.image }} style={styles.sideImage} resizeMode="contain" />
            <Svg pointerEvents="none" style={styles.imageEdgeFade} width="42%" height="100%">
              <Defs>
                <LinearGradient id="heroImageEdge" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor={C.navy} stopOpacity="1" />
                  <Stop offset="100%" stopColor={C.navy} stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#heroImageEdge)" />
            </Svg>
          </View>
        : null
      }

      {/* Badge top-left */}
      <View style={styles.badge}>
        <View style={styles.badgeDot} />
        <Text style={styles.badgeText}>{p.originalPrice ? 'LIMITED OFFER' : 'NEW ARRIVAL'}</Text>
      </View>

      {/* Content — bottom anchored */}
      <View style={[styles.content, isDesktop && styles.contentDesktop]}>
        <Text style={[styles.eyebrow, isDesktop && styles.eyebrowDesktop]}>
          {(p.categoryName || p.category).replace(/-/g, ' ').toUpperCase()}
        </Text>
        <Text style={[styles.name, isDesktop && styles.nameDesktop]} numberOfLines={2}>{p.name}</Text>
        <Text style={[styles.message, isDesktop && styles.messageDesktop]} numberOfLines={2}>{p.message}</Text>

        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.priceLabel}>From</Text>
            <Text style={[styles.price, isDesktop && styles.priceDesktop]}>UGX {p.price.toLocaleString()}</Text>
          </View>
          <TouchableOpacity
            style={[styles.shopBtn, isDesktop && styles.shopBtnDesktop]}
            onPress={() => router.push(`/shop/${p.slug ?? p.id}` as any)}
            activeOpacity={0.85}
          >
            <Text style={[styles.shopBtnText, isDesktop && styles.shopBtnTextDesktop]}>Shop Now →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  if (!product || !nextProduct) return null

  return (
    <View style={[styles.container, isDesktop && styles.containerDesktop]}>
      <View style={[styles.viewport, { width: BANNER_WIDTH, height: BANNER_HEIGHT }]}>
        <Animated.View style={[styles.track, { transform: [{ translateX: slide }] }]}>
          {renderSlide(product, BANNER_WIDTH, BANNER_HEIGHT)}
          {renderSlide(nextProduct, BANNER_WIDTH, BANNER_HEIGHT)}
        </Animated.View>
      </View>

      {/* Dots */}
      <View style={styles.dots}>
        {products.map((_, i) => (
          <View key={i} style={[styles.dot, i === safeIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { backgroundColor: C.bg, paddingHorizontal: 0, paddingTop: 20, paddingBottom: 8, alignItems: 'center' },
  containerDesktop: { paddingHorizontal: 0, paddingTop: 32 },

  viewport: { borderRadius: 0, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  track: { flexDirection: 'row' },

  badge: { position: 'absolute', top: 14, left: 14, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 1 },

  imageSide: { position: 'absolute', top: 0, right: 0, bottom: 0, width: '58%', backgroundColor: C.navy, alignItems: 'center', justifyContent: 'flex-end' },
  sideImage: { width: '100%', height: '88%' },
  imageEdgeFade: { position: 'absolute', left: 0, top: 0 },

  content: { position: 'absolute', bottom: 0, left: 0, width: '62%', padding: 18, paddingBottom: 20, zIndex: 2 },
  contentDesktop: { width: '56%', padding: 36, paddingBottom: 36 },

  eyebrow: { color: '#E2E8F0', fontSize: 9, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 5 },
  eyebrowDesktop: { fontSize: 11, marginBottom: 8 },

  name: { color: '#fff', fontSize: 20, fontWeight: '800', lineHeight: 26, marginBottom: 5 },
  nameDesktop: { fontSize: 36, lineHeight: 44, marginBottom: 8 },

  message: { color: '#F8FAFC', fontSize: 11, lineHeight: 16, marginBottom: 14 },
  messageDesktop: { fontSize: 15, lineHeight: 22, marginBottom: 22 },

  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  priceLabel: { color: '#E2E8F0', fontSize: 9, fontWeight: '600', marginBottom: 2 },
  price: { color: '#fff', fontSize: 16, fontWeight: '800' },
  priceDesktop: { fontSize: 26 },

  shopBtn: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  shopBtnDesktop: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  shopBtnText: { color: C.navy, fontSize: 12, fontWeight: '800' },
  shopBtnTextDesktop: { fontSize: 15 },

  dots: { flexDirection: 'row', gap: 5, marginTop: 12, marginBottom: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.border },
  dotActive: { width: 20, backgroundColor: C.navy, borderRadius: 3 },
})
