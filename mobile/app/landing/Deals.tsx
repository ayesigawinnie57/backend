import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { C } from '../theme'
import { DESKTOP_BREAKPOINT } from '../lib/useIsDesktop'

export default function Deals() {
  const router = useRouter()
  const { width: W } = useWindowDimensions()
  const isDesktop = W >= DESKTOP_BREAKPOINT

  return (
    <View style={[styles.container, isDesktop && styles.containerDesktop]}>
      <View style={[styles.banner, isDesktop && styles.bannerDesktop]}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Limited Time Offer</Text>
        </View>
        <Text style={[styles.heading, isDesktop && styles.headingDesktop]}>
          Up to <Text style={styles.highlight}>50% Off</Text>{'\n'}on Top Brands
        </Text>
        <Text style={[styles.sub, isDesktop && styles.subDesktop]}>Don't miss our biggest sale of the season.</Text>

        <View style={styles.timer}>
          {[['12', 'Hours'], ['45', 'Mins'], ['30', 'Secs']].map(([val, label]) => (
            <View key={label} style={[styles.timerBox, isDesktop && styles.timerBoxDesktop]}>
              <Text style={[styles.timerVal, isDesktop && styles.timerValDesktop]}>{val}</Text>
              <Text style={styles.timerLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={[styles.btn, isDesktop && styles.btnDesktop]} onPress={() => router.push('/shop?sale=true' as any)}>
          <Text style={[styles.btnText, isDesktop && styles.btnTextDesktop]}>Grab the Deal</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { backgroundColor: C.bg, paddingHorizontal: 20, paddingVertical: 40 },
  containerDesktop: { paddingHorizontal: 32, paddingVertical: 56 },
  banner: { backgroundColor: C.navy, borderRadius: 24, padding: 28, alignItems: 'center' },
  bannerDesktop: { maxWidth: 1200, alignSelf: 'center', width: '100%', padding: 56, borderRadius: 32 },
  badge: { backgroundColor: 'rgba(34,197,94,0.2)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 16 },
  badgeText: { color: C.green, fontSize: 11, fontWeight: '600' },
  heading: { fontSize: 30, fontWeight: '800', color: C.bg, textAlign: 'center', lineHeight: 38, marginBottom: 10 },
  headingDesktop: { fontSize: 52, lineHeight: 62, marginBottom: 16 },
  highlight: { color: C.green },
  sub: { fontSize: 14, color: C.mutedLight, textAlign: 'center', marginBottom: 24 },
  subDesktop: { fontSize: 18, marginBottom: 36 },
  timer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  timerBox: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center', minWidth: 70 },
  timerBoxDesktop: { minWidth: 100, paddingHorizontal: 24, paddingVertical: 18, borderRadius: 18 },
  timerVal: { fontSize: 28, fontWeight: '800', color: C.bg },
  timerValDesktop: { fontSize: 44 },
  timerLabel: { fontSize: 11, color: C.mutedLight },
  btn: { backgroundColor: C.green, borderRadius: 999, paddingVertical: 14, paddingHorizontal: 40 },
  btnDesktop: { paddingVertical: 18, paddingHorizontal: 60 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnTextDesktop: { fontSize: 18 },
})
