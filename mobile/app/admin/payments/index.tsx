import { useCallback, useMemo, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import { CreditCard, CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw, TrendingUp } from 'lucide-react-native'
import { C } from '../../theme'
import api from '../../lib/api'

type Payment = {
  id: number
  order_code: string | null
  pesapal_order_tracking_id: string
  merchant_reference: string
  amount: string
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'invalid'
  payment_method: string
  created_at: string
}

const STATUS_CONFIG = {
  completed: { color: '#10b981', bg: '#f0fdf4', border: '#10b981', icon: CheckCircle2, label: 'Completed' },
  pending:   { color: '#f59e0b', bg: '#fffbeb', border: '#f59e0b', icon: Clock,         label: 'Pending'   },
  failed:    { color: '#ef4444', bg: '#fef2f2', border: '#ef4444', icon: XCircle,       label: 'Failed'    },
  invalid:   { color: '#94a3b8', bg: '#f8fafc', border: '#94a3b8', icon: AlertCircle,   label: 'Invalid'   },
}

const FILTERS = ['all', 'completed', 'pending', 'failed', 'invalid'] as const
type Filter = typeof FILTERS[number]

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(iso).toLocaleDateString('en-UG', { day: 'numeric', month: 'short' })
}

export default function AdminPayments() {
  const insets = useSafeAreaInsets()
  const [allPayments, setAllPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')

  const fetchPayments = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true)
    try {
      const { data } = await api.get<Payment[]>('/api/orders/admin/payments/')
      setAllPayments(Array.isArray(data) ? data : (data as any).results ?? [])
    } catch {}
    finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { fetchPayments() }, [fetchPayments]))

  const filtered = useMemo(
    () => filter === 'all' ? allPayments : allPayments.filter(p => p.status === filter),
    [allPayments, filter]
  )

  const stats = useMemo(() => ({
    total: allPayments.length,
    collected: allPayments.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0),
    pending: allPayments.filter(p => p.status === 'pending').length,
    failed: allPayments.filter(p => p.status === 'failed').length,
    counts: Object.fromEntries(FILTERS.map(f => [f, f === 'all' ? allPayments.length : allPayments.filter(p => p.status === f).length])),
  }), [allPayments])

  const renderItem = useCallback(({ item: p }: { item: Payment }) => {
    const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.pending
    const Icon = cfg.icon
    return (
      <View style={[styles.card, { borderLeftColor: cfg.border }]}>
        <View style={styles.cardMain}>
          <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
            <Icon size={17} color={cfg.color} />
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.cardRow}>
              <Text style={styles.amount}>{p.currency} {Number(p.amount).toLocaleString()}</Text>
              <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
              </View>
            </View>
            {p.order_code && <Text style={styles.orderCode}>Order #{p.order_code}</Text>}
            <Text style={styles.trackingId} numberOfLines={1}>{p.pesapal_order_tracking_id}</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.method}>{p.payment_method || 'Pesapal'}</Text>
          <Text style={styles.date}>{timeAgo(p.created_at)}</Text>
        </View>
      </View>
    )
  }, [])

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <CreditCard size={20} color={C.navy} />
          <Text style={styles.title}>Payments</Text>
        </View>
        <TouchableOpacity onPress={() => fetchPayments(true)} style={styles.refreshBtn} disabled={refreshing}>
          <RefreshCw size={16} color={refreshing ? C.mutedLight : C.muted} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={p => String(p.id)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 30 }]}
        onRefresh={() => fetchPayments(true)}
        refreshing={refreshing}
        ListEmptyComponent={
          loading
            ? <ActivityIndicator color={C.green} style={{ marginTop: 40 }} />
            : <Text style={styles.empty}>No payments found.</Text>
        }
        ListHeaderComponent={
          <>
            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={[styles.statCard, styles.statCardGreen]}>
                <View style={styles.statValueRow}>
                  <TrendingUp size={13} color="#10b981" />
                  <Text style={[styles.statValue, { color: '#10b981' }]}>
                    UGX {stats.collected.toLocaleString()}
                  </Text>
                </View>
                <Text style={styles.statLabel}>Collected</Text>
              </View>
              <View style={[styles.statCard, stats.pending > 0 && styles.statCardAmber]}>
                <Text style={[styles.statValue, stats.pending > 0 && { color: '#f59e0b' }]}>{stats.pending}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={[styles.statCard, stats.failed > 0 && styles.statCardRed]}>
                <Text style={[styles.statValue, stats.failed > 0 && { color: '#ef4444' }]}>{stats.failed}</Text>
                <Text style={styles.statLabel}>Failed</Text>
              </View>
            </View>

            {/* Filter chips */}
            <View style={styles.filterRow}>
              {FILTERS.map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterChip, filter === f && styles.filterChipActive]}
                  onPress={() => setFilter(f)}
                >
                  <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                  {stats.counts[f] > 0 && (
                    <View style={[styles.filterCount, filter === f && styles.filterCountActive]}>
                      <Text style={[styles.filterCountText, filter === f && styles.filterCountTextActive]}>
                        {stats.counts[f]}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 18, fontWeight: '800', color: C.navy },
  refreshBtn: { padding: 6 },

  statsRow: { flexDirection: 'row', gap: 8, paddingTop: 16, paddingBottom: 4 },
  statCard: { flex: 1, backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 10, alignItems: 'center', gap: 2 },
  statCardGreen: { borderColor: '#10b98130' },
  statCardAmber: { borderColor: '#f59e0b30' },
  statCardRed: { borderColor: '#ef444430' },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue: { fontSize: 14, fontWeight: '800', color: C.navy },
  statLabel: { fontSize: 10, color: C.muted, fontWeight: '600' },

  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 14 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
  filterChipActive: { backgroundColor: C.navy, borderColor: C.navy },
  filterText: { fontSize: 12, fontWeight: '600', color: C.muted },
  filterTextActive: { color: '#fff' },
  filterCount: { backgroundColor: C.border, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  filterCountActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  filterCountText: { fontSize: 10, fontWeight: '700', color: C.muted },
  filterCountTextActive: { color: '#fff' },

  list: { paddingHorizontal: 16, gap: 8 },
  empty: { textAlign: 'center', color: C.muted, marginTop: 40, fontSize: 14 },

  card: { backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3, padding: 12, gap: 8 },
  cardMain: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: { width: 36, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1, gap: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  amount: { fontSize: 15, fontWeight: '800', color: C.navy },
  statusBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  statusText: { fontSize: 10, fontWeight: '700' },
  orderCode: { fontSize: 12, color: C.muted, fontWeight: '600' },
  trackingId: { fontSize: 10, color: C.mutedLight },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8 },
  method: { fontSize: 11, color: C.muted, fontWeight: '600' },
  date: { fontSize: 11, color: C.mutedLight },
})
