import { useCallback, useState } from 'react'
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, Image, ActivityIndicator, TextInput, Switch,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import { ArrowLeft, BadgeDollarSign } from 'lucide-react-native'
import { C } from '../../theme'
import { flashSalesApi, productsApi, type ApiProduct } from '../../lib/products'
import DateTimePicker from '../components/DateTimePicker'

type FormState = {
  product_id: string
  flash_price: string
  ends_at: Date
  stock_limit: string
  is_active: boolean
}

function defaultEndsAt() {
  const d = new Date()
  d.setHours(d.getHours() + 24)
  return d
}

const EMPTY: FormState = { product_id: '', flash_price: '', ends_at: defaultEndsAt(), stock_limit: '', is_active: true }

export default function AddFlashSale() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [form, setForm] = useState<FormState>({ ...EMPTY, ends_at: defaultEndsAt() })
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (k: keyof FormState) => (v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }))

  useFocusEffect(useCallback(() => {
    setForm({ ...EMPTY, ends_at: defaultEndsAt() })
    setProductSearch('')
    setProductsLoading(true)
    productsApi.listAll().then(setProducts).catch(() => {}).finally(() => setProductsLoading(false))
  }, []))

  const selectedProduct = products.find(p => String(p.id) === form.product_id)
  const maxFlashPrice = selectedProduct ? Number(selectedProduct.price) : Infinity
  const maxStock = selectedProduct ? selectedProduct.stock : Infinity

  const filteredProducts = productSearch.trim().length > 0
    ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
    : products

  const handleSave = async () => {
    if (!form.product_id || !form.flash_price || !form.ends_at || !form.stock_limit) {
      Alert.alert('Validation', 'All fields are required.')
      return
    }
    if (form.ends_at <= new Date()) {
      Alert.alert('Validation', 'End time must be in the future.')
      return
    }
    setSaving(true)
    try {
      await flashSalesApi.create({
        product_id: Number(form.product_id),
        flash_price: form.flash_price,
        ends_at: form.ends_at.toISOString(),
        stock_limit: Number(form.stock_limit),
        is_active: form.is_active,
      })
      router.replace('/admin/flashsales' as any)
    } catch (e: any) {
      Alert.alert('Error', JSON.stringify(e?.response?.data) ?? 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/admin/flashsales' as any)}>
          <ArrowLeft size={22} color={C.navy} />
        </TouchableOpacity>
        <Text style={styles.title}>New Flash Sale</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Product *</Text>
        {selectedProduct ? (
          <View style={styles.selectedProduct}>
            {selectedProduct.image
              ? <Image source={{ uri: selectedProduct.image }} style={styles.selectedThumb} />
              : <View style={[styles.selectedThumb, styles.thumbPlaceholder]} />
            }
            <Text style={styles.selectedName} numberOfLines={1}>{selectedProduct.name}</Text>
            <TouchableOpacity onPress={() => { set('product_id')(''); setProductSearch('') }}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
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
        {selectedProduct && form.flash_price && Number(form.flash_price) > 0 && (
          <View style={styles.savingHint}>
            <BadgeDollarSign size={13} color={C.green} />
            <Text style={styles.savingHintText}>Save UGX {(Number(selectedProduct.price) - Number(form.flash_price)).toLocaleString()} ({Math.round((1 - Number(form.flash_price) / Number(selectedProduct.price)) * 100)}% off)</Text>
          </View>
        )}

        <Text style={styles.label}>Ends At *</Text>
        <DateTimePicker value={form.ends_at} onChange={d => setForm(f => ({ ...f, ends_at: d }))} />

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
            : <Text style={styles.saveBtnText}>Create Flash Sale</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  title: { fontSize: 18, fontWeight: '800', color: C.navy },
  form: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '700', color: C.navy, marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: C.navy },
  fieldHint: { fontSize: 11, color: C.muted, marginBottom: 6, fontStyle: 'italic' },
  savingHint: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  savingHintText: { fontSize: 12, color: C.green, fontWeight: '600' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  saveBtn: { backgroundColor: '#F97316', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24, marginBottom: 10 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  selectedProduct: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.bg, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: C.green },
  selectedThumb: { width: 40, height: 40, borderRadius: 8 },
  thumbPlaceholder: { backgroundColor: C.bg },
  selectedName: { flex: 1, fontSize: 13, fontWeight: '700', color: C.navy },
  clearBtn: { fontSize: 16, color: C.muted, paddingHorizontal: 4 },
  productOption: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  optionThumb: { width: 40, height: 40, borderRadius: 8 },
  optionName: { fontSize: 13, fontWeight: '600', color: C.navy },
  optionPrice: { fontSize: 11, color: C.muted },
  noProducts: { fontSize: 13, color: C.muted, textAlign: 'center', paddingVertical: 16 },
})
