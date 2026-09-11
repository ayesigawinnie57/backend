import { useCallback, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import { Package, ShoppingBag, Grid2X2, Zap, Plus, List, Heart, Users, CreditCard } from 'lucide-react-native'
import { C } from '../theme'
import { productsApi, flashSalesApi, type ApiProduct, type FlashSaleItem } from '../lib/products'
import api from '../lib/api'

export default function AdminDashboard() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [flashSales, setFlashSales] = useState<FlashSaleItem[]>([])
  const [userCount, setUserCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useFocusEffect(useCallback(() => {
    Promise.all([
      productsApi.list().then(({ data }) => setProducts(data.results ?? (data as any))),
      flashSalesApi.list().then(({ data }) => setFlashSales(Array.isArray(data) ? data : (data as any).results ?? [])),
      api.get('/api/auth/admin/users/').then(({ data }) => setUserCount(Array.isArray(data) ? data.length : (data as any).count ?? (data as any).results?.length ?? 0)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, []))

  const activeFlash = flashSales.filter(s => s.is_active && !s.is_expired).length

  const pages = [
    {
      label: 'Products',
      desc: `${products.length} total products`,
      icon: Package,
      color: '#6366f1',
      actions: [
        { label: 'View All', route: '/admin/products' },
        { label: 'Add New', route: '/admin/products/add' },
      ],
    },
    {
      label: 'Flash Sales',
      desc: `${activeFlash} active sale${activeFlash !== 1 ? 's' : ''}`,
      icon: Zap,
      color: '#F97316',
      actions: [
        { label: 'Manage', route: '/admin/flashsales' },
      ],
    },
    {
      label: 'Categories',
      desc: 'Organise your products',
      icon: Grid2X2,
      color: '#10b981',
      actions: [
        { label: 'View All', route: '/admin/categories' },
        { label: 'Add New', route: '/admin/categories/add' },
      ],
    },
    {
      label: 'Orders',
      desc: 'Track & manage orders',
      icon: ShoppingBag,
      color: '#f59e0b',
      actions: [
        { label: 'View All', route: '/admin/orders' },
      ],
    },
    {
      label: 'Users',
      desc: `${userCount} registered user${userCount !== 1 ? 's' : ''}`,
      icon: Users,
      color: '#8b5cf6',
      actions: [
        { label: 'View All', route: '/admin/users' },
      ],
    },
    {
      label: 'Payments',
      desc: 'Pesapal transactions',
      icon: CreditCard,
      color: '#0ea5e9',
      actions: [
        { label: 'View All', route: '/admin/payments' },
      ],
    },
  ]

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.adminName}>Admin</Text>
      </View>

      <Text style={styles.sectionTitle}>Manage</Text>

      {loading
        ? <ActivityIndicator color={C.green} style={{ marginTop: 40 }} />
        : (
          <View style={styles.grid}>
            {pages.map(({ label, desc, icon: Icon, color, actions }) => (
              <View key={label} style={styles.card}>
                  <View style={styles.cardRow}>
                    <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
                      <Icon size={20} color={color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardLabel}>{label}</Text>
                      <Text style={styles.cardDesc}>{desc}</Text>
                    </View>
                    <View style={styles.cardActions}>
                      {actions.map(({ label: aLabel, route }) => (
                        <TouchableOpacity
                          key={aLabel}
                          style={[styles.actionBtn, { borderColor: color + '40', backgroundColor: color + '0d' }]}
                          onPress={() => router.push(route as any)}
                        >
                          {aLabel === 'Add New' ? <Plus size={12} color={color} /> : <List size={12} color={color} />}
                          <Text style={[styles.actionBtnText, { color }]}>{aLabel}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
            ))}
          </View>
        )
      }


    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingBottom: 24, backgroundColor: C.navy },
  greeting: { color: 'rgba(255,255,255,0.65)', fontSize: 13 },
  adminName: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: C.navy, marginHorizontal: 20, marginTop: 24, marginBottom: 12 },

  grid: { paddingHorizontal: 16, gap: 10 },
  card: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 12 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardLabel: { fontSize: 14, fontWeight: '800', color: C.navy },
  cardDesc: { fontSize: 11, color: C.muted, marginTop: 1 },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  actionBtnText: { fontSize: 11, fontWeight: '700' },


})
