import { useEffect, useState } from 'react'
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image, Modal } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowLeft, MapPin, CheckCircle, ShieldCheck, CreditCard, PackageCheck, Truck, ChevronDown, Check } from 'lucide-react-native'
import { useCart } from './lib/CartContext'
import { authApi, tokenStore } from './lib/auth'
import api from './lib/api'
import { pushNotification } from './lib/NotificationContext'
import { C } from './theme'
import type { ApiOrder } from './lib/products'

const REGIONS = ['Central Uganda', 'Eastern Uganda', 'Northern Uganda', 'Western Uganda']
const BOTTOM_NAV_HEIGHT = 60

type Form = { name: string; phone: string; note: string; country: string; region: string; district: string; village: string }

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { items, clearCart } = useCart()
  const [regionOpen, setRegionOpen] = useState(false)
  const [form, setForm] = useState<Form>({ name: '', phone: '', note: '', country: 'Uganda', region: '', district: '', village: '' })
  const [loading, setLoading] = useState(false)
  const [placedOrder, setPlacedOrder] = useState<ApiOrder | null>(null)

  function expectedDelivery(iso: string) {
    const d = new Date(iso)
    d.setDate(d.getDate() + 3)
    return d.toLocaleDateString('en-UG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  const set = (key: keyof Form) => (val: string) => setForm(f => ({ ...f, [key]: val }))

  useEffect(() => {
    tokenStore.getAccess().then(async (token) => {
      if (!token) return
      try {
        const { data } = await authApi.profile(token)
        setForm(f => ({
          ...f,
          name: data.name || f.name,
          phone: data.phone?.trim() || f.phone,
          country: data.country || 'Uganda',
          region: data.region || f.region,
          district: data.district || f.district,
          village: data.village || f.village,
        }))
      } catch {}
    })
  }, [])

  const savePhone = async (phone: string) => {
    if (!phone.trim()) return
    const token = await tokenStore.getAccess()
    if (token) { try { await authApi.updateProfile(token, { phone: phone.trim() }) } catch {} }
  }

  const handlePlaceOrder = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      Alert.alert('Required', 'Please fill in your name and phone number.')
      return
    }
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Add items to your cart before checking out.')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post<ApiOrder>('/api/orders/', {
        delivery_address: [form.region, form.district, form.village].filter(Boolean).join(', ') || 'Uganda',
        phone: form.phone.trim(),
        note: form.note.trim(),
        guest_name: form.name.trim(),
        // Only send product_id + quantity — price is always resolved server-side
        items: items.map(i => ({ product_id: i.id, quantity: i.quantity })),
      })
      clearCart()
      setPlacedOrder(data)
      pushNotification({
        type: 'order',
        title: `Order Placed — ${data.code}`,
        body: `Order No: ${data.code}\nItems: ${items.map(i => i.name).join(', ')}\nSubtotal: UGX ${Number(data.subtotal).toLocaleString()}\nDelivery: UGX ${Number(data.delivery_fee).toLocaleString()}\nTotal: UGX ${Number(data.total).toLocaleString()}\n\nEstimated Delivery: ${expectedDelivery(data.created_at)}`,
        time: 'Just now',
      })
    } catch (e: any) {
      const resp = e?.response?.data
      Alert.alert('Order Failed', resp?.detail ?? resp?.non_field_errors?.[0] ?? 'Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Success screen — all values from backend ──────────────────────────────
  if (placedOrder) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.successWrap}>
          <CheckCircle size={72} color={C.green} />
          <Text style={styles.successTitle}>Order Placed!</Text>
          <Text style={styles.successSub}>Your order has been received and is being processed.</Text>

          <View style={styles.orderCodeBox}>
            <Text style={styles.orderCodeLabel}>Order No:</Text>
            <Text style={styles.orderCodeValue}>{placedOrder.code}</Text>
          </View>

          {/* Amounts — 100% from backend */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>UGX {Number(placedOrder.subtotal).toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>UGX {Number(placedOrder.delivery_fee).toLocaleString()}</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>UGX {Number(placedOrder.total).toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.etaBox}>
            <Truck size={16} color={C.green} />
            <View>
              <Text style={styles.etaLabel}>Expected Delivery</Text>
              <Text style={styles.etaDate}>{expectedDelivery(placedOrder.created_at)}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.successBtn} onPress={() => router.push('/orders' as any)}>
            <Text style={styles.successBtnText}>Track My Order</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.successLink} onPress={() => router.replace('/' as any)}>
            <Text style={styles.successLinkText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // ── Checkout form ─────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/' as any)}>
          <ArrowLeft size={22} color={C.navy} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.title}>Checkout</Text>
          <Text style={styles.headerSub}>Complete your order</Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.progress}>
          <View style={styles.progressStepActive}><Text style={styles.progressNumberActive}>1</Text></View>
          <View style={styles.progressLineActive} />
          <View style={styles.progressStep}><Text style={styles.progressNumber}>2</Text></View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}><Text style={styles.progressNumber}>3</Text></View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabelActive}>Details</Text>
            <Text style={styles.progressLabel}>Review</Text>
            <Text style={styles.progressLabel}>Done</Text>
          </View>
        </View>

        {/* Delivery Details */}
        <View style={styles.sectionHeading}>
          <View style={styles.sectionIcon}><MapPin size={17} color={C.green} /></View>
          <View><Text style={styles.sectionTitle}>Delivery details</Text><Text style={styles.sectionSub}>Where should we deliver your order?</Text></View>
        </View>
        <Text style={styles.requiredHint}>Fields marked * are required to place your order.</Text>
        <View style={styles.card}>
          <Field label="Full Name" required value={form.name} onChangeText={set('name')} placeholder="Enter your full name" />
          <Field label="Phone Number" required value={form.phone} onChangeText={set('phone')} onBlur={() => savePhone(form.phone)} placeholder="Enter your phone number" keyboardType="phone-pad" />
          <View style={[fieldStyles.wrap, fieldStyles.border]}>
            <View style={fieldStyles.labelRow}><Text style={fieldStyles.label}>Country</Text></View>
            <View style={[fieldStyles.input, styles.lockedField]}><Text style={styles.lockedText}>Uganda</Text></View>
          </View>
          <View style={[fieldStyles.wrap, fieldStyles.border]}>
            <View style={fieldStyles.labelRow}><Text style={fieldStyles.label}>Region</Text></View>
            <TouchableOpacity style={[fieldStyles.input, styles.pickerBtn]} onPress={() => setRegionOpen(true)} activeOpacity={0.8}>
              <Text style={form.region ? styles.pickerValue : styles.pickerPlaceholder}>{form.region || 'Select region'}</Text>
              <ChevronDown size={15} color={C.muted} />
            </TouchableOpacity>
          </View>
          <Field label="District" value={form.district} onChangeText={set('district')} placeholder="e.g. Kampala" />
          <Field label="Village / Street" value={form.village} onChangeText={set('village')} placeholder="e.g. Nakawa" />
          <Field label="Order Note" value={form.note} onChangeText={set('note')} placeholder="Add delivery instructions (optional)" multiline last />
        </View>

        {/* Order items — prices shown from cart for preview only */}
        <View style={styles.sectionHeading}>
          <View style={styles.sectionIcon}><PackageCheck size={17} color={C.green} /></View>
          <View><Text style={styles.sectionTitle}>Your order</Text><Text style={styles.sectionSub}>{items.length} item{items.length === 1 ? '' : 's'}</Text></View>
        </View>
        <View style={styles.card}>
          {items.map(item => (
            <View key={item.id} style={styles.itemRow}>
              {item.image
                ? <Image source={{ uri: item.image }} style={styles.itemThumb} resizeMode="cover" />
                : <View style={[styles.itemThumb, { backgroundColor: C.bg }]} />
              }
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>UGX {(item.price * item.quantity).toLocaleString()}</Text>
            </View>
          ))}
          {items.length === 0 && <Text style={styles.emptyCart}>Your cart is empty.</Text>}
        </View>

        {/* Payment note — no hardcoded amounts shown before order is placed */}
        <View style={styles.paymentNote}>
          <ShieldCheck size={18} color="#15803d" />
          <View style={styles.paymentCopy}>
            <Text style={styles.paymentNoteTitle}>Secure checkout</Text>
            <Text style={styles.paymentNoteText}>Final price including delivery will be confirmed when your order is placed.</Text>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <View style={styles.sectionIcon}><CreditCard size={17} color={C.green} /></View>
          <View><Text style={styles.sectionTitle}>Payment</Text><Text style={styles.sectionSub}>Pay via MTN, Airtel or card</Text></View>
        </View>

        <View style={styles.orderBtnsRow}>
          <TouchableOpacity onPress={() => router.replace('/shop' as any)}>
            <Text style={styles.continueLinkText}>← Continue Shopping</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.placeBtn, loading && { opacity: 0.7 }]} onPress={handlePlaceOrder} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.placeBtnText}>Place Order</Text>
            }
          </TouchableOpacity>
        </View>
        <Text style={styles.secureNote}>Your order is protected by Majo Gadgets secure checkout.</Text>

        <View style={{ height: BOTTOM_NAV_HEIGHT + insets.bottom + 16 }} />
      </ScrollView>

      <Modal visible={regionOpen} transparent animationType="fade" onRequestClose={() => setRegionOpen(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setRegionOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Select Region</Text>
            {REGIONS.map(r => (
              <TouchableOpacity key={r} style={styles.modalOption} onPress={() => { set('region')(r); setRegionOpen(false) }}>
                <Text style={[styles.modalOptionText, form.region === r && styles.modalOptionActive]}>{r}</Text>
                {form.region === r && <Check size={16} color={C.green} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

function Field({ label, required = false, last = false, ...props }: { label: string; required?: boolean; last?: boolean } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={[fieldStyles.wrap, !last && fieldStyles.border]}>
      <View style={fieldStyles.labelRow}>
        <Text style={fieldStyles.label}>{label}</Text>
        {required ? <Text style={fieldStyles.required}>Required *</Text> : <Text style={fieldStyles.optional}>Optional</Text>}
      </View>
      <TextInput style={fieldStyles.input} placeholderTextColor={C.muted} {...props} />
    </View>
  )
}

const fieldStyles = StyleSheet.create({
  wrap: { paddingVertical: 12, paddingHorizontal: 16 },
  border: { borderBottomWidth: 1, borderBottomColor: C.border },
  label: { fontSize: 11, fontWeight: '700', color: C.mutedLight, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  required: { color: '#DC2626', fontSize: 10, fontWeight: '700' },
  optional: { color: C.mutedLight, fontSize: 10, fontWeight: '600' },
  input: { fontSize: 14, color: C.navy, minHeight: 20, backgroundColor: C.bg, borderRadius: 10, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, paddingVertical: 8, marginTop: 2 },
})

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTitleWrap: { alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: C.navy },
  headerSub: { color: C.muted, fontSize: 11, marginTop: 2 },
  scroll: { padding: 16, paddingTop: 12 },
  progress: { height: 62, flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 30, position: 'relative', marginBottom: 8 },
  progressStepActive: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  progressStep: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  progressNumberActive: { color: '#fff', fontSize: 12, fontWeight: '800' },
  progressNumber: { color: C.mutedLight, fontSize: 12, fontWeight: '800' },
  progressLineActive: { flex: 1, height: 2, backgroundColor: C.green, marginTop: 12 },
  progressLine: { flex: 1, height: 2, backgroundColor: C.border, marginTop: 12 },
  progressLabels: { position: 'absolute', left: 14, right: 14, top: 34, flexDirection: 'row', justifyContent: 'space-between' },
  progressLabelActive: { color: C.green, fontSize: 10, fontWeight: '800' },
  progressLabel: { color: C.mutedLight, fontSize: 10, fontWeight: '600' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10, marginBottom: 10 },
  sectionIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: C.navy },
  sectionSub: { fontSize: 11, color: C.muted, marginTop: 2 },
  requiredHint: { color: C.muted, fontSize: 11, marginBottom: 8, marginTop: -2 },
  card: { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, marginBottom: 10, overflow: 'hidden', shadowColor: '#0f172a', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  itemThumb: { width: 48, height: 48, borderRadius: 8 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '700', color: C.navy },
  itemQty: { fontSize: 12, color: C.muted, marginTop: 2 },
  itemPrice: { fontSize: 13, fontWeight: '800', color: C.navy },
  emptyCart: { color: C.muted, textAlign: 'center', padding: 20, fontSize: 13 },
  paymentNote: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F0FDF4', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#BBF7D0', marginTop: 4, marginBottom: 8 },
  paymentCopy: { flex: 1 },
  paymentNoteTitle: { fontSize: 12, color: '#166534', fontWeight: '800', marginBottom: 3 },
  paymentNoteText: { fontSize: 11, color: '#15803D', lineHeight: 16 },
  lockedField: { backgroundColor: C.bg, justifyContent: 'center' },
  lockedText: { fontSize: 14, color: C.navy, fontWeight: '600' },
  pickerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerValue: { fontSize: 14, color: C.navy },
  pickerPlaceholder: { fontSize: 14, color: C.muted },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(7,26,43,0.4)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  modalSheet: { backgroundColor: C.card, borderRadius: 16, padding: 24, width: '100%' },
  modalTitle: { fontSize: 16, fontWeight: '800', color: C.navy, marginBottom: 16 },
  modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  modalOptionText: { fontSize: 15, color: C.navy },
  modalOptionActive: { fontWeight: '800', color: C.green },
  secureNote: { textAlign: 'center', color: C.mutedLight, fontSize: 10, marginTop: 4 },
  orderBtnsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  placeBtn: { backgroundColor: C.navy, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center', shadowColor: C.navy, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  placeBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  continueLinkText: { color: C.green, fontSize: 13, fontWeight: '700' },
  // Success screen
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 14 },
  successTitle: { fontSize: 28, fontWeight: '800', color: C.navy },
  successSub: { fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 22 },
  successBtn: { backgroundColor: C.green, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, marginTop: 8 },
  successBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  successLink: { paddingVertical: 8 },
  successLinkText: { color: C.green, fontSize: 14, fontWeight: '700' },
  orderCodeBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.bg, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 20, paddingVertical: 12 },
  orderCodeLabel: { fontSize: 13, color: C.muted, fontWeight: '600' },
  orderCodeValue: { fontSize: 18, fontWeight: '800', color: C.navy, letterSpacing: 1.5 },
  summaryBox: { width: '100%', backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: C.border },
  summaryLabel: { fontSize: 13, color: C.muted },
  summaryValue: { fontSize: 13, color: C.navy, fontWeight: '600' },
  summaryTotal: { borderBottomWidth: 0 },
  summaryTotalLabel: { fontSize: 15, fontWeight: '800', color: C.navy },
  summaryTotalValue: { fontSize: 15, fontWeight: '800', color: C.green },
  etaBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F0FDF4', borderRadius: 12, borderWidth: 1, borderColor: '#BBF7D0', paddingHorizontal: 16, paddingVertical: 12, width: '100%' },
  etaLabel: { fontSize: 11, color: '#166534', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  etaDate: { fontSize: 13, color: '#14532d', fontWeight: '800', marginTop: 2 },
})
