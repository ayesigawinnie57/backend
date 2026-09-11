import { useCallback, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, ScrollView, Image } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { Flame, Zap, ShoppingCart, Clock } from 'lucide-react-native'
import { flashSalesApi, type FlashSaleItem } from '../lib/products'
import { useCart } from '../lib/CartContext'
import { toCardProduct } from '../lib/products'
import { C } from '../theme'
import { DESKTOP_BREAKPOINT } from '../lib/useIsDesktop'

function useCountdown(endsAt: string) {
  const calc = () => Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000))
  const [secs, setSecs] = useState(calc)
  useEffect(() => {
    const t = setInterval(() => setSecs(calc()), 1000)
    return () => clearInterval(t)
  }, [endsAt])
  const expired = secs === 0
  const days = Math.floor(secs / 86400)
  const h = Math.floor((secs % 86400) / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  let label = ''
  if (secs >= 7 * 86400) {
    const weeks = Math.floor(secs / (7 * 86400))
    const remDays = Math.floor((secs % (7 * 86400)) / 86400)
    const remHrs = h % 24
    label = `${weeks}w ${remDays}d ${remHrs}h`
  } else if (secs >= 86400) {
    label = `${days}d ${h}h ${m}m`
  } else if (secs >= 3600) {
    label = `${h}h ${m}m`
  } else {
    label = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  }
  return { label, expired, urgent: secs < 3600 }
}

function FlashCard({ item, cardWidth }: { item: FlashSaleItem; cardWidth: number }) {
  const router = useRouter()
  const { addToCart } = useCart()
  const { label, expired, urgent } = useCountdown(item.ends_at)
  const stockPct = item.stock_limit > 0 ? item.stock_left / item.stock_limit : 1
  const critical = stockPct <= 0.2
  const product = toCardProduct(item.product)

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }, critical && styles.cardCritical]}
      onPress={() => router.push(`/shop/${item.product.id}` as any)}
      activeOpacity={0.85}
    >
      {/* Image */}
      <View style={styles.imgWrap}>
        {item.product.image
          ? <Image source={{ uri: item.product.image }} style={styles.img} resizeMode="cover" />
          : <View style={[styles.img, { backgroundColor: C.bg }]} />
        }
        <View style={styles.discBadge}>
          <Text style={styles.discText}>-{item.discount_pct}%</Text>
        </View>
        {critical && (
          <View style={styles.hotBadge}>
            <Flame size={10} color="#fff" fill="#fff" />
            <Text style={styles.hotText}>HOT</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">{item.product.name}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.flashPrice}>UGX {Number(item.flash_price).toLocaleString()}</Text>
          <Text style={styles.origPrice}>UGX {Number(item.product.price).toLocaleString()}</Text>
        </View>

        {/* Countdown */}
        <View style={styles.timerRow}>
          <Clock size={10} color={expired ? '#ef4444' : urgent ? '#F97316' : C.muted} />
          {expired
            ? <Text style={styles.expiredText}>Expired</Text>
            : <Text style={[styles.timerText, urgent && styles.timerUrgent]}>{label}</Text>
          }
        </View>

        {/* Stock bar */}
        <View style={styles.stockWrap}>
          <View style={styles.stockTrack}>
            <View style={[
              styles.stockFill,
              { width: `${stockPct * 100}%` as any },
              critical && styles.stockFillCritical,
            ]} />
          </View>
          <Text style={[styles.stockText, critical && styles.stockTextCritical]}>
            {item.stock_left} left
          </Text>
        </View>

        {/* Urgency */}
        {critical && !expired && (
          <Text style={styles.urgency}>🔥 Only {item.stock_left} left!</Text>
        )}
        {!critical && item.stock_left <= Math.ceil(item.stock_limit * 0.5) && !expired && (
          <Text style={styles.urgencyMild}>⚡ Selling fast</Text>
        )}

        <TouchableOpacity
          style={[styles.cartBtn, expired && styles.cartBtnDisabled]}
          disabled={expired}
          onPress={(e) => { e.stopPropagation?.(); addToCart(product, 1) }}
        >
          <ShoppingCart size={13} color="#fff" />
          <Text style={styles.cartBtnText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

export default function FlashDeals() {
  const router = useRouter()
  const { width: W } = useWindowDimensions()
  const isDesktop = W >= DESKTOP_BREAKPOINT
  const [sales, setSales] = useState<FlashSaleItem[]>([])
  const [showAll, setShowAll] = useState(false)

  useFocusEffect(useCallback(() => {
    flashSalesApi.list(true).then(({ data }) => {
      setSales(Array.isArray(data) ? data : (data as any).results ?? [])
    }).catch(() => {})
  }, []))

  if (sales.length === 0) return null

  const LIMIT = 6
  const visible = showAll ? sales : sales.slice(0, LIMIT)
  const hasMore = sales.length > LIMIT

  const cols = isDesktop ? 5 : 2
  const gap = 10
  const hPad = isDesktop ? 0 : 12
  const cardWidth = (W - hPad * 2 - gap * (cols - 1)) / cols

  return (
    <View style={[styles.container, isDesktop && styles.containerDesktop]}>
      <View style={[styles.inner, isDesktop && styles.innerDesktop]}>

        <View style={styles.sectionHeader}>
          <View style={styles.titleRow}>
            <Zap size={isDesktop ? 24 : 20} color="#F97316" fill="#F97316" />
            <Text style={[styles.heading, isDesktop && styles.headingDesktop]}>Flash Sales</Text>
            <View style={styles.liveBadge}><Text style={styles.liveText}>LIVE</Text></View>
          </View>
          <TouchableOpacity onPress={() => router.push('/shop?sale=true' as any)}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sub}>Limited stock · Prices drop every hour</Text>

        <ScrollView horizontal={!isDesktop} showsHorizontalScrollIndicator={false}>
          <View style={[styles.grid, isDesktop && styles.gridDesktop, { gap }]}>
            {visible.map(s => <FlashCard key={s.id} item={s} cardWidth={cardWidth} />)}
          </View>
        </ScrollView>

        {hasMore && (
          <TouchableOpacity style={styles.viewMoreBtn} onPress={() => setShowAll(v => !v)}>
            <Text style={styles.viewMoreText}>
              {showAll ? 'Show Less ↑' : `View All ${sales.length} Flash Sales ↓`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#FFF7ED', paddingHorizontal: 12, paddingVertical: 24, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#FDBA74' },
  containerDesktop: { paddingHorizontal: 32 },
  inner: {},
  innerDesktop: { maxWidth: 1200, alignSelf: 'center', width: '100%' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heading: { fontSize: 20, fontWeight: '800', color: C.navy },
  headingDesktop: { fontSize: 26 },
  liveBadge: { backgroundColor: '#ef4444', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  liveText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  seeAll: { color: C.green, fontSize: 13, fontWeight: '700' },
  sub: { color: C.muted, fontSize: 12, marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridDesktop: { flexWrap: 'wrap' },

  card: { backgroundColor: C.card, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  cardCritical: { borderColor: '#ef4444', borderWidth: 1.5 },
  imgWrap: { position: 'relative' },
  img: { width: '100%', aspectRatio: 1 },
  discBadge: { position: 'absolute', top: 6, left: 6, backgroundColor: '#ef4444', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  discText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  hotBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: '#F97316', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 3 },
  hotText: { color: '#fff', fontSize: 9, fontWeight: '800' },

  info: { padding: 8, gap: 5 },
  name: { fontSize: 12, fontWeight: '700', color: C.navy, lineHeight: 16 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5, flexWrap: 'wrap' },
  flashPrice: { fontSize: 13, fontWeight: '800', color: '#F97316' },
  origPrice: { fontSize: 10, color: C.mutedLight, textDecorationLine: 'line-through' },

  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timerText: { fontSize: 11, fontWeight: '700', color: C.navy, fontVariant: ['tabular-nums'] },
  timerUrgent: { color: '#F97316' },
  expiredText: { fontSize: 11, color: '#ef4444', fontWeight: '700' },

  stockWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stockTrack: { flex: 1, height: 4, backgroundColor: C.border, borderRadius: 2, overflow: 'hidden' },
  stockFill: { height: 4, backgroundColor: C.green, borderRadius: 2 },
  stockFillCritical: { backgroundColor: '#ef4444' },
  stockText: { fontSize: 10, color: C.muted, fontWeight: '600' },
  stockTextCritical: { color: '#ef4444' },

  urgency: { fontSize: 11, fontWeight: '800', color: '#ef4444' },
  urgencyMild: { fontSize: 11, fontWeight: '700', color: '#F97316' },

  viewMoreBtn: { marginTop: 14, alignItems: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#FDBA74', backgroundColor: '#FFF0DC' },
  viewMoreText: { fontSize: 13, fontWeight: '700', color: '#F97316' },

  cartBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: '#F97316', borderRadius: 8, paddingVertical: 7, marginTop: 2 },
  cartBtnDisabled: { backgroundColor: C.muted },
  cartBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
})
