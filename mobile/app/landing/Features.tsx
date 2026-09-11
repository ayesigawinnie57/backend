import { View, Text, StyleSheet, useWindowDimensions } from 'react-native'
import { Truck, Shield, RefreshCw, Headphones } from 'lucide-react-native'
import { C } from '../theme'
import { DESKTOP_BREAKPOINT } from '../lib/useIsDesktop'

const features = [
  { icon: Truck,       title: 'Fast Delivery',    desc: 'Get your orders delivered in 24–48 hours.' },
  { icon: Shield,      title: 'Secure Payments',  desc: 'Your payment info is always encrypted.' },
  { icon: RefreshCw,   title: 'Easy Returns',     desc: '30-day hassle-free return policy.' },
  { icon: Headphones,  title: '24/7 Support',     desc: 'Our team is always here to help you.' },
]

export default function Features() {
  const { width: W } = useWindowDimensions()
  const isDesktop = W >= DESKTOP_BREAKPOINT

  return (
    <View style={[styles.container, isDesktop && styles.containerDesktop]}>
      <View style={[styles.inner, isDesktop && styles.innerDesktop]}>
        <Text style={[styles.heading, isDesktop && styles.headingDesktop]}>Why Shop With Us?</Text>
        <Text style={styles.sub}>We make online shopping simple, safe, and enjoyable.</Text>
        <View style={[styles.grid, isDesktop && styles.gridDesktop]}>
          {features.map((f) => (
            <View key={f.title} style={[styles.card, isDesktop && styles.cardDesktop]}>
              <View style={[styles.iconBox, isDesktop && styles.iconBoxDesktop]}>
                <f.icon size={isDesktop ? 30 : 24} color={C.green} />
              </View>
              <Text style={[styles.title, isDesktop && styles.titleDesktop]}>{f.title}</Text>
              <Text style={[styles.desc, isDesktop && styles.descDesktop]}>{f.desc}</Text>
            </View>
          ))}
        </View>
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridDesktop: { gap: 20, flexWrap: 'nowrap' },
  card: { width: '47%', borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16, alignItems: 'center', backgroundColor: C.card },
  cardDesktop: { flex: 1, padding: 28, borderRadius: 20 },
  iconBox: { width: 52, height: 52, backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  iconBoxDesktop: { width: 68, height: 68, borderRadius: 18, marginBottom: 14 },
  title: { fontSize: 14, fontWeight: '700', color: C.navy, marginBottom: 4, textAlign: 'center' },
  titleDesktop: { fontSize: 17, marginBottom: 8 },
  desc: { fontSize: 12, color: C.muted, textAlign: 'center', lineHeight: 18 },
  descDesktop: { fontSize: 14, lineHeight: 22 },
})
