import { useCallback, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, Image, ActivityIndicator, TextInput, Switch, Modal,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect, useRouter } from 'expo-router'
import { Plus, Trash2, Pencil, Zap, X, Ban, Clock, Flame, BadgeDollarSign } from 'lucide-react-native'
import { C } from '../../theme'
import { flashSalesApi, productsApi, type FlashSaleItem, type ApiProduct } from '../../lib/products'
import DateTimePicker from '../components/DateTimePicker'

type FormState = {
  product_id: string
  flash_price: string
  ends_at: Date
  stock_limit: string
  is_active: boolean
}

export default function AdminFlashSales() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [sales, setSales] = useState<FlashSaleItem[]>([])
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<FlashSaleItem | null>(null)
  const [form, setForm] = useState<FormState>({ product_id: '', flash_price: '', ends_at: defaultEndsAt(), stock_limit: '', is_active: true })
  const [saving, setSaving] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [productsLoading, setProductsLoading] = useState(false)

  const set = (k: keyof FormState) => (v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }))

  useFocusEffect(useCallback(() => {
    load()
    setProductsLoading(true)
    productsApi.listAll().then(setProducts).catch(() => {}).finally(() => setProductsLoading(false))
  }, []))

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await flashSalesApi.list()
      setSales(Array.isArray(data) ? data : (data as any).results ?? [])
    } finally {
      setLoading(false)
    }
  }

  const openEdit = (s: FlashSaleItem) => {
    setEditing(s)
    setForm({
      product_id: String(s.product.id),
      flash_price: String(s.flash_price),
      ends_at: new Date(s.ends_at),
      stock_limit: String(s.stock_limit),
      is_active: s.is_active,
    })
    setProductSearch(s.product.name)
    setModal(true)
  }

  const handleSave = async () => {
    if (!form.product_id || !form.flash_price || !form.ends_at || !form.stock_limit) {
      Alert.alert('Validation', 'All fields are required.')
      return
    }
    if (form.ends_at <= new Date()) {
      Alert.alert('Validation', 'End time must be in the future.')
      return
    }
    if (!editing) return
    setSaving(true)
    try {
      const payload = {
        product_id: Number(form.product_id),
        flash_price: form.flash_price,
        ends_at: form.ends_at.toISOString(),
        stock_limit: Number(form.stock_limit),
        is_active: form.is_active,
      }
      const { data } = await flashSalesApi.update(editing.id, payload)
      setSales(prev => prev.map(s => s.id === editing.id ? data : s))
      setModal(false)
    } catch (e: any) {
      Alert.alert('Error', JSON.stringify(e?.response?.data) ?? 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (s: FlashSaleItem) => {
    Alert.alert('Delete Flash Sale', `Remove flash sale for "${s.product.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await flashSalesApi.delete(s.id)
          setSales(prev => prev.filter(x => x.id !== s.id))
        }
      },
    ])
  }

  const usedProductIds = new Set(
    sales
      .filter(s => !s.is_expired && s.is_active && (!editing || s.id !== editing.id))
      .map(s => String(s.product.id))
  )

  const selectedProduct = products.find(p => String(p.id) === form.product_id)
  const maxFlashPrice = selectedProduct ? Number(selectedProduct.price) : Infinity
  const maxStock = selectedProduct ? selectedProduct.stock : Infinity

  const filteredProducts = productSearch.trim().length > 0
    ? products.filter(p => !usedProductIds.has(String(p.id)) && p.name.toLowerCase().includes(productSearch.toLowerCase()))
    : products.filter(p => !usedProductIds.has(String(p.id)))

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Zap size={20} color="#F97316" fill="#F97316" />
          <Text style={styles.title}>Flash Sales</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/admin/flashsales/add' as any)}>
          <Plus size={16} color="#fff" />
          <Text style={styles.addBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {loading
        ? <ActivityIndicator color={C.green} style={{ marginTop: 40 }} />
        : (
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {sales.length === 0 && (
              <Text style={styles.empty}>No flash sales yet. Tap "New" to create one.</Text>
            )}
            {sales.map(s => {
              const stockPct = s.stock_limit > 0 ? s.stock_left / s.stock_limit : 1
              const critical = stockPct <= 0.2
              const expired = s.is_expired || !s.is_active
              return (
                <View key={s.id} style={[styles.card, expired && styles.cardExpired]}>
                  <View style={styles.cardTop}>
                    {s.product.image
                      ? <Image source={{ uri: s.product.image }} style={styles.thumb} resizeMode="cover" />
                      : <View style={[styles.thumb, styles.thumbPlaceholder]} />
                    }
                    <View style={styles.cardInfo}>
                      <Text style={styles.productName} numberOfLines={1}>{s.product.name}</Text>
                      <View style={styles.priceRow}>
                        <Text style={styles.flashPrice}>UGX {Number(s.flash_price).toLocaleString()}</Text>
                        <Text style={styles.origPrice}>UGX {Number(s.product.price).toLocaleString()}</Text>
                        <View style={styles.discBadge}>
                          <Text style={styles.discText}>-{s.discount_pct}%</Text>
                        </View>
                      </View>
                      <View style={styles.endsAtRow}>
                        {expired
                          ? <><Ban size={11} color="#ef4444" /><Text style={[styles.endsAt, { color: '#ef4444' }]}>Expired</Text></>
                          : <><Clock size={11} color={C.muted} /><Text style={styles.endsAt}>Ends {new Date(s.ends_at).toLocaleString()}</Text></>
                        }
                      </View>
                    </View>
                    <View style={styles.cardActions}>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(s)}>
                        <Pencil size={14} color="#6366f1" />
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#ef444418' }]} onPress={() => handleDelete(s)}>
                        <Trash2 size={14} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.stockRow}>
                    <View style={styles.stockBarTrack}>
                      <View style={[
                        styles.stockBarFill,
                        { width: `${stockPct * 100}%` as any },
                        critical && styles.stockBarCritical,
                      ]} />
                    </View>
                    <Text style={[styles.stockLabel, critical && styles.stockLabelCritical]}>
                      {s.stock_left} left of {s.stock_limit}
                    </Text>
                  </View>
                  {critical && !expired && (
                    <View style={styles.criticalBanner}>
                      <Flame size={13} color="#ef4444" />
                      <Text style={styles.criticalText}>Only {s.stock_left} left — selling fast!</Text>
                    </View>
                  )}
                </View>
              )
            })}
          </ScrollView>
        )
      }

      {/* Edit Modal */}
      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Flash Sale</Text>
              <TouchableOpacity onPress={() => setModal(false)}><X size={20} color={C.navy} /></TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.label}>Product *</Text>
              {selectedProduct && (
                <View style={styles.selectedProduct}>
                  {selectedProduct.image
                    ? <Image source={{ uri: selectedProduct.image }} style={styles.selectedThumb} />
                    : <View style={[styles.selectedThumb, styles.thumbPlaceholder]} />
                  }
                  <Text style={styles.selectedName} numberOfLines={1}>{selectedProduct.name}</Text>
                  <TouchableOpacity onPress={() => { set('product_id')(''); setProductSearch('') }}>
                    <X size={16} color={C.muted} />
                  </TouchableOpacity>
                </View>
              )}
              {!selectedProduct && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Search product..."
                    placeholderTextColor={C.mutedLight}
                    value={productSearch}
                    onChangeText={setProductSearch}
                  />
                  {productsLoading
                    ? <ActivityIndicator color={C.green} style={{ marginVertical: 16 }} />
                    : filteredProducts.length === 0
                      ? <Text style={styles.noProducts}>No products found.</Text>
                      : filteredProducts.map(p => (
                          <TouchableOpacity
                            key={p.id}
                            style={styles.productOption}
                            onPress={() => {
                              setProductSearch(p.name)
                              setForm(f => ({ ...f, product_id: String(p.id), flash_price: String(p.price), stock_limit: String(p.stock) }))
                            }}
                          >
                            {p.image
                              ? <Image source={{ uri: p.image }} style={styles.optionThumb} />
                              : <View style={[styles.optionThumb, styles.thumbPlaceholder]} />
                            }
                            <View style={{ flex: 1 }}>
                              <Text style={styles.optionName} numberOfLines={1}>{p.name}</Text>
                              <Text style={styles.optionPrice}>UGX {Number(p.price).toLocaleString()} · Stock: {p.stock}</Text>
                            </View>
                          </TouchableOpacity>
                        ))
                  }
                </>
              )}

              <Text style={styles.label}>Flash Price (UGX) *</Text>
              {selectedProduct && (
                <Text style={styles.fieldHint}>Original: UGX {Number(selectedProduct.price).toLocaleString()} — must be lower</Text>
              )}
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={form.flash_price}
                onChangeText={v => set('flash_price')(v === '' || Number(v) <= maxFlashPrice ? v : String(maxFlashPrice))}
                placeholder={selectedProduct ? `Max UGX ${Number(selectedProduct.price).toLocaleString()}` : 'e.g. 25000'}
                placeholderTextColor={C.mutedLight}
              />
              {selectedProduct && form.flash_price && Number(form.flash_price) > 0 ? (
                <View style={styles.savingHint}>
                  <BadgeDollarSign size={13} color={C.green} />
                  <Text style={styles.savingHintText}>Save UGX {(Number(selectedProduct.price) - Number(form.flash_price)).toLocaleString()} ({Math.round((1 - Number(form.flash_price) / Number(selectedProduct.price)) * 100)}% off)</Text>
                </View>
              ) : null}

              <Text style={styles.label}>Ends At *</Text>
              <DateTimePicker
                value={form.ends_at}
                onChange={d => setForm(f => ({ ...f, ends_at: d }))}
              />

              <Text style={styles.label}>Stock Limit *</Text>
              {selectedProduct && (
                <Text style={styles.fieldHint}>Available: {selectedProduct.stock} units</Text>
              )}
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={form.stock_limit}
                onChangeText={v => set('stock_limit')(v === '' || Number(v) <= maxStock ? v : String(maxStock))}
                placeholder={selectedProduct ? `Max ${selectedProduct.stock}` : 'e.g. 50'}
                placeholderTextColor={C.mutedLight}
              />

              <View style={styles.toggleRow}>
                <Text style={styles.label}>Active</Text>
                <Switch value={form.is_active} onValueChange={set('is_active')} trackColor={{ true: C.green }} thumbColor="#fff" />
              </View>

              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
                {saving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.saveBtnText}>Update Flash Sale</Text>
                }
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

function defaultEndsAt() {
  const d = new Date()
  d.setHours(d.getHours() + 24)
  return d
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 18, fontWeight: '800', color: C.navy },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F97316', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { padding: 16, gap: 14, paddingBottom: 40 },
  empty: { textAlign: 'center', color: C.muted, marginTop: 40, fontSize: 14 },

  card: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 12, gap: 10 },
  cardExpired: { opacity: 0.55 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  thumb: { width: 56, height: 56, borderRadius: 10 },
  thumbPlaceholder: { backgroundColor: C.bg },
  cardInfo: { flex: 1, gap: 3 },
  productName: { fontSize: 13, fontWeight: '700', color: C.navy },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flashPrice: { fontSize: 14, fontWeight: '800', color: '#F97316' },
  origPrice: { fontSize: 12, color: C.mutedLight, textDecorationLine: 'line-through' },
  discBadge: { backgroundColor: '#FEF2F2', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  discText: { fontSize: 11, fontWeight: '700', color: '#ef4444' },
  endsAtRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  endsAt: { fontSize: 11, color: C.muted },
  cardActions: { flexDirection: 'row', gap: 6 },
  iconBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#6366f118', alignItems: 'center', justifyContent: 'center' },

  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stockBarTrack: { flex: 1, height: 6, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden' },
  stockBarFill: { height: 6, backgroundColor: C.green, borderRadius: 3 },
  stockBarCritical: { backgroundColor: '#ef4444' },
  stockLabel: { fontSize: 11, color: C.muted, fontWeight: '600', minWidth: 80, textAlign: 'right' },
  stockLabelCritical: { color: '#ef4444' },
  criticalBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF2F2', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  criticalText: { fontSize: 12, fontWeight: '700', color: '#ef4444' },

  modalOverlay: { flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: C.navy },
  label: { fontSize: 13, fontWeight: '700', color: C.navy, marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: C.navy },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  savingHint: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  savingHintText: { fontSize: 12, color: C.green, fontWeight: '600' },
  fieldHint: { fontSize: 11, color: C.muted, marginBottom: 6, fontStyle: 'italic' },

  selectedProduct: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.bg, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: C.green },
  selectedThumb: { width: 40, height: 40, borderRadius: 8 },
  selectedName: { flex: 1, fontSize: 13, fontWeight: '700', color: C.navy },

  productOption: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  optionThumb: { width: 40, height: 40, borderRadius: 8 },
  optionName: { fontSize: 13, fontWeight: '600', color: C.navy },
  optionPrice: { fontSize: 11, color: C.muted },
  noProducts: { fontSize: 13, color: C.muted, textAlign: 'center', paddingVertical: 16 },

  saveBtn: { backgroundColor: '#F97316', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 20, marginBottom: 10 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
})
