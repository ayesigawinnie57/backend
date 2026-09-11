import { useState, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import { ShoppingBag, Clock, CheckCircle, Truck, XCircle, Package, ChevronRight } from 'lucide-react-native'
import { C } from '../../theme'
import { adminOrdersApi, type ApiOrder } from '../../lib/products'

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Pending',   color: '#92400e', bg: '#fef3c7' },
  processing: { label: 'Confirmed', color: '#1e40af', bg: '#dbeafe' },
  shipped:    { label: 'Shipped',   color: '#6d28d9', bg: '#ede9fe' },
  delivered:  { label: 'Delivered', color: '#166534', bg: '#dcfce7' },
  cancelled:  { label: 'Cancelled', color: '#991b1b', bg: '#fee2e2' },
}

const TABS = [
  { key: '',           label: 'All',       icon: ShoppingBag },
  { key: 'pending',    label: 'Pending',   icon: Clock       },
  { key: 'processing', label: 'Confirmed', icon: Package     },
  { key: 'shipped',    label: 'Shipped',   icon: Truck       },
  { key: 'delivered',  label: 'Delivered', icon: CheckCircle },
  { key: 'cancelled',  label: 'Cancelled', icon: XCircle     },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminOrders() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [tab, setTab] = useState('')
  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const { data } = await adminOrdersApi.list(tab || undefined)
      const raw = data as any
      setOrders(Array.isArray(raw) ? raw : (raw?.results ?? []))
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [tab])

  useFocusEffect(useCallback(() => { fetchOrders() }, [fetchOrders]))

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <Text style={styles.count}>{orders.length} total</Text>
      </View>

      {/* Tab bar */}
      <View style={styles.tabScroll}>
        <FlatList
          horizontal
          data={TABS}
          keyExtractor={t => t.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabList}
          renderItem={({ item }) => {
            const active = tab === item.key
            const Icon = item.icon
            return (
              <TouchableOpacity
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setTab(item.key)}
                activeOpacity={0.7}
              >
                <Icon size={13} color={active ? '#fff' : C.muted} />
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{item.label}</Text>
              </TouchableOpacity>
            )
          }}
        />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={C.green} size="large" /></View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={o => String(o.id)}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(true) }} tintColor={C.green} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <ShoppingBag size={40} color={C.border} />
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          }
          renderItem={({ item }) => {
            const meta = STATUS_META[item.status] ?? STATUS_META.pending
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/admin/orders/${item.code}` as any)}
                activeOpacity={0.75}
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardRow}>
                      <Text style={styles.code}>{item.code}</Text>
                      <View style={[styles.badge, { backgroundColor: meta.bg }]}>
                        <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
                      </View>
                    </View>
                    <Text style={styles.items} numberOfLines={1}>
                      {item.items.map(i => i.product?.name ?? 'Item').join(', ')}
                    </Text>
                    <View style={styles.cardMeta}>
                      <Text style={styles.date}>{formatDate(item.created_at)}</Text>
                      <Text style={styles.dot}>·</Text>
                      <Text style={styles.total}>UGX {Number(item.total).toLocaleString()}</Text>
                      <Text style={styles.dot}>·</Text>
                      <Text style={styles.itemCount}>{item.items.length} item{item.items.length !== 1 ? 's' : ''}</Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color={C.mutedLight} />
                </View>
              </TouchableOpacity>
            )
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  title: { fontSize: 20, fontWeight: '800', color: C.navy },
  count: { fontSize: 13, color: C.muted, fontWeight: '600' },
  tabScroll: { backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  tabList: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  tabActive: { backgroundColor: C.navy, borderColor: C.navy },
  tabLabel: { fontSize: 12, fontWeight: '700', color: C.muted },
  tabLabelActive: { color: '#fff' },
  emptyText: { fontSize: 14, color: C.muted, fontWeight: '600' },
  card: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardInfo: { flex: 1, gap: 5 },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  code: { fontSize: 14, fontWeight: '800', color: C.navy, letterSpacing: 0.5 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  items: { fontSize: 12, color: C.muted },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  date: { fontSize: 11, color: C.mutedLight },
  dot: { fontSize: 11, color: C.mutedLight },
  total: { fontSize: 11, fontWeight: '700', color: C.green },
  itemCount: { fontSize: 11, color: C.mutedLight },
})
