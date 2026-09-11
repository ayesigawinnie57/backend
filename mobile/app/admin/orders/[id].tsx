import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert, TextInput, Modal } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft, Package, MapPin, Phone, FileText, CheckCircle, Clock, Truck, XCircle, ShoppingBag } from 'lucide-react-native'
import { adminOrdersApi, type ApiOrder } from '../../lib/products'
import { C } from '../../theme'

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'] as const

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending:    { label: 'Pending',   color: '#92400e', bg: '#fef3c7', icon: Clock       },
  processing: { label: 'Confirmed', color: '#1e40af', bg: '#dbeafe', icon: Package     },
  shipped:    { label: 'Shipped',   color: '#6d28d9', bg: '#ede9fe', icon: Truck       },
  delivered:  { label: 'Delivered', color: '#166534', bg: '#dcfce7', icon: CheckCircle },
  cancelled:  { label: 'Cancelled', color: '#991b1b', bg: '#fee2e2', icon: XCircle    },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-UG', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminOrderDetail() {
  const { id: code } = useLocalSearchParams()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [order, setOrder] = useState<ApiOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [cancelModal, setCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    adminOrdersApi.get(String(code))
      .then(({ data }) => setOrder(data))
      .catch(() => Alert.alert('Error', 'Could not load order details.'))
      .finally(() => setLoading(false))
  }, [code])

  const act = async (action: () => Promise<{ data: ApiOrder }>, label: string, notify: (o: ApiOrder) => void): Promise<boolean> => {
    setActing(true)
    try {
      const { data } = await action()
      setOrder(data)
      notify(data)
      return true
    } catch (e: any) {
      Alert.alert('Failed', e?.response?.data?.detail ?? `Could not ${label}.`)
      return false
    } finally {
      setActing(false)
    }
  }

  const handleConfirm = () => act(
    () => adminOrdersApi.confirm(order!.code),
    'confirm',
    () => {}
  )

  const handleShip = () => act(
    () => adminOrdersApi.ship(order!.code),
    'ship',
    () => {}
  )

  const handleDeliver = () => act(
    () => adminOrdersApi.deliver(order!.code),
    'deliver',
    () => {}
  )

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      Alert.alert('Required', 'Please enter a cancellation reason.')
      return
    }
    const ok = await act(
      () => adminOrdersApi.cancel(order!.code, cancelReason.trim()),
      'cancel',
      () => {}
    )
    if (ok) {
      setCancelModal(false)
      setCancelReason('')
    }
  }

  if (loading) {
    return <View style={[styles.container, styles.center, { paddingTop: insets.top }]}><ActivityIndicator size="large" color={C.green} /></View>
  }

  if (!order) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Order not found.</Text>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/orders' as any)}><Text style={styles.backLink}>← Go Back</Text></TouchableOpacity>
      </View>
    )
  }

  const meta = STATUS_META[order.status] ?? STATUS_META.pending
  const StatusIcon = meta.icon
  const isCancelled = order.status === 'cancelled'
  const isDelivered = order.status === 'delivered'
  const currentStep = STATUS_STEPS.indexOf(order.status as any)
  const subtotal = order.items.reduce((s, i) => s + Number(i.price) * i.quantity, 0)

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/admin/orders' as any)} style={styles.backBtn}>
          <ArrowLeft size={20} color={C.navy} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Order Details</Text>
          <Text style={styles.headerSub}>{order.code}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Status banner */}
        <View style={[styles.statusBanner, { backgroundColor: meta.bg }]}>
          <View style={[styles.statusIconWrap, { backgroundColor: meta.color }]}>
            <StatusIcon size={22} color="#fff" />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.statusLabel, { color: meta.color }]}>{meta.label}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statusInfo}>
            <Text style={styles.infoLabel}>Updated</Text>
            <Text style={styles.statusDate}>{formatDate(order.updated_at)}</Text>
          </View>
        </View>

        {/* Progress tracker */}
        {!isCancelled && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Order Progress</Text>
            </View>
            <View style={styles.progressRow}>
              {STATUS_STEPS.map((step, i) => {
                const done = currentStep >= i
                const stepMeta = STATUS_META[step]
                const StepIcon = stepMeta.icon
                return (
                  <View key={step} style={styles.progressStep}>
                    <View style={styles.progressTrack}>
                      <View style={[styles.line, { backgroundColor: i === 0 ? 'transparent' : currentStep >= i ? C.green : C.border }]} />
                      <View style={[styles.dot, done ? { backgroundColor: C.green, borderColor: C.green } : { backgroundColor: C.card, borderColor: C.border }]}>
                        <StepIcon size={12} color={done ? '#fff' : C.mutedLight} />
                      </View>
                      <View style={[styles.line, { backgroundColor: i === STATUS_STEPS.length - 1 ? 'transparent' : currentStep > i ? C.green : C.border }]} />
                    </View>
                    <Text style={[styles.progressLabel, done && { color: C.navy, fontWeight: '700' }]} numberOfLines={1}>
                      {stepMeta.label}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>
        )}

        {/* Items */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <ShoppingBag size={15} color={C.green} />
            <Text style={styles.sectionTitle}>Items</Text>
            <Text style={styles.sectionCount}>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</Text>
          </View>
          {order.items.map((item, i) => (
            <View key={item.id} style={[styles.itemRow, i < order.items.length - 1 && styles.itemDivider]}>
              {item.product?.image
                ? <Image source={{ uri: item.product.image }} style={styles.itemThumb} resizeMode="cover" />
                : <View style={styles.itemThumbEmpty}><Package size={18} color={C.mutedLight} /></View>
              }
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.product?.name ?? 'Product'}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>UGX {(Number(item.price) * item.quantity).toLocaleString()}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>UGX {Number(order.total).toLocaleString()}</Text>
          </View>
        </View>

        {/* Delivery info */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <MapPin size={15} color={C.green} />
            <Text style={styles.sectionTitle}>Delivery Info</Text>
          </View>
          <View style={styles.infoGrid}>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{order.delivery_address || '—'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{order.phone || '—'}</Text>
            </View>
          </View>
          {!!order.note && (
            <View style={styles.noteRow}>
              <FileText size={13} color={C.mutedLight} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Note</Text>
                <Text style={styles.infoValue}>{order.note}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Cancel reason */}
        {isCancelled && !!order.cancel_reason && (
          <View style={styles.cancelReasonCard}>
            <XCircle size={14} color="#991b1b" />
            <View style={{ flex: 1 }}>
              <Text style={styles.cancelReasonLabel}>Cancellation Reason</Text>
              <Text style={styles.cancelReasonText}>{order.cancel_reason}</Text>
            </View>
          </View>
        )}

        {/* Order meta */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Clock size={15} color={C.green} />
            <Text style={styles.sectionTitle}>Order Info</Text>
          </View>
          <View style={styles.infoGrid}>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Placed on</Text>
              <Text style={styles.infoValue}>{formatDate(order.created_at)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Last updated</Text>
              <Text style={styles.infoValue}>{formatDate(order.updated_at)}</Text>
            </View>
          </View>
        </View>

        {/* Admin actions */}
        {!isCancelled && !isDelivered && (
          <View style={styles.actionsCard}>
            <Text style={styles.actionsTitle}>Admin Actions</Text>
            <View style={styles.actionsRow}>
              {order.status === 'pending' && (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#dbeafe' }]} onPress={handleConfirm} disabled={acting}>
                  {acting ? <ActivityIndicator size="small" color="#1e40af" /> : <><CheckCircle size={16} color="#1e40af" /><Text style={[styles.actionBtnText, { color: '#1e40af' }]}>Confirm</Text></>}
                </TouchableOpacity>
              )}
              {order.status === 'processing' && (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ede9fe' }]} onPress={handleShip} disabled={acting}>
                  {acting ? <ActivityIndicator size="small" color="#6d28d9" /> : <><Truck size={16} color="#6d28d9" /><Text style={[styles.actionBtnText, { color: '#6d28d9' }]}>Mark Shipped</Text></>}
                </TouchableOpacity>
              )}
              {order.status === 'shipped' && (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#dcfce7' }]} onPress={handleDeliver} disabled={acting}>
                  {acting ? <ActivityIndicator size="small" color="#166534" /> : <><CheckCircle size={16} color="#166534" /><Text style={[styles.actionBtnText, { color: '#166534' }]}>Mark Delivered</Text></>}
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#fee2e2' }]} onPress={() => setCancelModal(true)} disabled={acting}>
                <XCircle size={16} color="#991b1b" />
                <Text style={[styles.actionBtnText, { color: '#991b1b' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Cancel modal */}
      <Modal visible={cancelModal} transparent animationType="fade" onRequestClose={() => setCancelModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cancel Order</Text>
            <Text style={styles.modalSub}>Provide a reason for cancellation.</Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Enter reason..."
              placeholderTextColor={C.mutedLight}
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setCancelModal(false); setCancelReason('') }}>
                <Text style={styles.modalCancelText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleCancel} disabled={acting}>
                {acting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.modalConfirmText}>Cancel Order</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 15, color: C.muted, marginBottom: 12 },
  backLink: { fontSize: 14, color: C.green, fontWeight: '700' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: C.navy },
  headerSub: { fontSize: 11, color: C.muted, marginTop: 1, letterSpacing: 0.5 },
  scroll: { padding: 16, gap: 12 },
  statusBanner: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, padding: 16 },
  statusIconWrap: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statusInfo: { flex: 1 },
  statusLabel: { fontSize: 16, fontWeight: '800' },
  statusDate: { fontSize: 11, color: C.muted, marginTop: 3 },
  divider: { width: 1, height: '100%', backgroundColor: 'rgba(0,0,0,0.08)', marginHorizontal: 4 },
  card: { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: C.navy, flex: 1 },
  sectionCount: { fontSize: 11, color: C.muted, fontWeight: '600' },
  progressRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 20 },
  progressStep: { flex: 1, alignItems: 'center' },
  progressTrack: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  line: { flex: 1, height: 2 },
  dot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  progressLabel: { fontSize: 10, color: C.mutedLight, fontWeight: '600', marginTop: 6, textAlign: 'center' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  itemDivider: { borderBottomWidth: 1, borderBottomColor: C.border },
  itemThumb: { width: 52, height: 52, borderRadius: 10 },
  itemThumbEmpty: { width: 52, height: 52, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '700', color: C.navy },
  itemQty: { fontSize: 11, color: C.muted, marginTop: 3 },
  itemPrice: { fontSize: 13, fontWeight: '800', color: C.navy },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: C.border },
  totalLabel: { fontSize: 14, fontWeight: '800', color: C.navy },
  totalValue: { fontSize: 14, fontWeight: '800', color: C.green },
  infoGrid: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14 },
  infoCell: { flex: 1 },
  infoLabel: { fontSize: 11, color: C.mutedLight, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  infoValue: { fontSize: 13, color: C.navy, fontWeight: '600', lineHeight: 18 },
  noteRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: C.border },
  cancelReasonCard: { flexDirection: 'row', gap: 10, backgroundColor: '#fee2e2', borderRadius: 14, borderWidth: 1, borderColor: '#fecaca', padding: 14 },
  cancelReasonLabel: { fontSize: 11, color: '#991b1b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  cancelReasonText: { fontSize: 13, color: '#7f1d1d', fontWeight: '600' },
  actionsCard: { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, gap: 12 },
  actionsTitle: { fontSize: 13, fontWeight: '800', color: C.navy },
  actionsRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  actionBtnText: { fontSize: 13, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: C.card, borderRadius: 20, padding: 24, width: '100%', gap: 12 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: C.navy },
  modalSub: { fontSize: 13, color: C.muted },
  reasonInput: { borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 12, fontSize: 14, color: C.navy, minHeight: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  modalCancelText: { fontSize: 14, fontWeight: '700', color: C.muted },
  modalConfirmBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#ef4444', alignItems: 'center' },
  modalConfirmText: { fontSize: 14, fontWeight: '700', color: '#fff' },
})
