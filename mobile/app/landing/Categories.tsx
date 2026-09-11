import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { C } from '../theme'
import { DESKTOP_BREAKPOINT } from '../lib/useIsDesktop'

const categories = [
  { name: 'Electronics', emoji: '📱', slug: 'electronics' },
  { name: 'Fashion', emoji: '👗', slug: 'fashion' },
  { name: 'Home & Living', emoji: '🛋️', slug: 'home-living' },
  { name: 'Sports', emoji: '⚽', slug: 'sports' },
  { name: 'Beauty', emoji: '💄', slug: 'beauty' },
  { name: 'Books', emoji: '📚', slug: 'books' },
  { name: 'Toys', emoji: '🧸', slug: 'toys' },
  { name: 'Groceries', emoji: '🛒', slug: 'groceries' },
]

export default function Categories() {
  const router = useRouter()
  const { width: W } = useWindowDimensions()
  const isDesktop = W >= DESKTOP_BREAKPOINT

  const cards = categories.map((cat) => (
    <TouchableOpacity
      key={cat.slug}
      style={[styles.card, isDesktop && styles.cardDesktop]}
      onPress={() => router.push(`/shop?category=${cat.slug}` as any)}
    >
      <View style={[styles.iconBox, isDesktop && styles.iconBoxDesktop]}>
        <Text style={[styles.emoji, isDesktop && styles.emojiDesktop]}>{cat.emoji}</Text>
      </View>
      <Text style={[styles.name, isDesktop && styles.nameDesktop]}>{cat.name}</Text>
    </TouchableOpacity>
  ))

  return (
    <View style={[styles.container, isDesktop && styles.containerDesktop]}>
      <View style={[styles.inner, isDesktop && styles.innerDesktop]}>
        <Text style={[styles.heading, isDesktop && styles.headingDesktop]}>Shop by Category</Text>
        <Text style={styles.sub}>Find exactly what you're looking for.</Text>
        {isDesktop ? (
          <View style={styles.desktopGrid}>{cards}</View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {cards}
          </ScrollView>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { backgroundColor: C.bg, paddingHorizontal: 20, paddingVertical: 40 },
  containerDesktop: { paddingHorizontal: 32, paddingVertical: 56 },
  inner: {},
  innerDesktop: { maxWidth: 1200, alignSelf: 'center', width: '100%' },
  heading: { fontSize: 26, fontWeight: '800', color: C.navy, textAlign: 'center', marginBottom: 8 },
  headingDesktop: { fontSize: 36 },
  sub: { fontSize: 14, color: C.muted, textAlign: 'center', marginBottom: 28 },
  row: { flexDirection: 'row', gap: 12, paddingRight: 20 },
  desktopGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  card: { width: 92, alignItems: 'center', backgroundColor: C.card, borderRadius: 16, padding: 10, borderWidth: 1, borderColor: C.border },
  cardDesktop: { width: 130, padding: 18, borderRadius: 20 },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(34,197,94,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  iconBoxDesktop: { width: 64, height: 64, borderRadius: 16, marginBottom: 10 },
  emoji: { fontSize: 22 },
  emojiDesktop: { fontSize: 32 },
  name: { fontSize: 10, fontWeight: '600', color: C.navy, textAlign: 'center' },
  nameDesktop: { fontSize: 13 },
})
