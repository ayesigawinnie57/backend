import { useCallback, useEffect, useState } from 'react'
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Image, ActivityIndicator, Switch,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import { ArrowLeft, ImagePlus, X } from 'lucide-react-native'
import * as ImagePicker from 'expo-image-picker'
import { C } from '../../theme'
import { productsApi, type ApiCategory } from '../../lib/products'
import { appendImage, type PickedImage } from '../../lib/formData'

type Form = {
  name: string
  price: string
  originalPrice: string
  stock: string
  categoryId: string
  shortDescription: string
  longDescription: string
  deliveryFee: string
  isFeatured: boolean
  isNewDeal: boolean
}

const EMPTY_FORM: Form = {
  name: '', price: '', originalPrice: '', stock: '', categoryId: '',
  shortDescription: '', longDescription: '', deliveryFee: '',
  isFeatured: false, isNewDeal: false,
}

export default function AddProduct() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [form, setForm] = useState<Form>(EMPTY_FORM)
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [images, setImages] = useState<PickedImage[]>([])
  const [loading, setLoading] = useState(false)

  const set = (key: keyof Form) => (val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }))

  useFocusEffect(useCallback(() => {
    setForm({ ...EMPTY_FORM, categoryId: categories[0] ? String(categories[0].id) : '' })
    setImages([])
    setLoading(false)
  }, [categories]))

  useEffect(() => {
    productsApi.categories().then(({ data }) => {
      const cats = Array.isArray(data) ? data : (data as any).results ?? []
      setCategories(cats)
      if (cats.length) setForm((f) => ({ ...f, categoryId: String(cats[0].id) }))
    })
  }, [])

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') { Alert.alert('Permission required', 'Allow access to your photo library.'); return }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.5,
    })
    if (!result.canceled) {
      const picked: PickedImage[] = result.assets.map((asset) => {
        const mimeType = asset.mimeType || 'image/jpeg'
        const ext = mimeType.split('/')[1]?.split('+')[0] || 'jpeg'
        return { uri: asset.uri, name: `product.${ext}`, type: mimeType }
      })
      setImages((prev) => [...prev, ...picked])
    }
  }

  const removeImage = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index))

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.price.trim() || !form.categoryId) {
      Alert.alert('Validation', 'Name, price and category are required.')
      return
    }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name.trim())
      fd.append('price', form.price)
      fd.append('category_id', form.categoryId)
      if (form.originalPrice) fd.append('original_price', form.originalPrice)
      if (form.stock) fd.append('stock', form.stock)
      if (form.shortDescription) fd.append('short_description', form.shortDescription)
      if (form.longDescription) fd.append('long_description', form.longDescription)
      if (form.deliveryFee) fd.append('delivery_fee', form.deliveryFee)
      fd.append('is_featured', String(form.isFeatured))
      fd.append('is_new_deal', String(form.isNewDeal))
      // first image becomes the cover, all go into images[] for the gallery
      if (images.length > 0) await appendImage(fd, 'image', images[0])
      for (const img of images) await appendImage(fd, 'images', img)
      await productsApi.create(fd)
      router.replace('/admin/products' as any)
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail ?? 'Failed to add product.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/admin/products' as any)}>
          <ArrowLeft size={22} color={C.navy} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Product</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>

        {/* Multi-image picker */}
        <Text style={styles.label}>Images</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          <View style={styles.imageRow}>
            {images.map((img, i) => (
              <View key={i} style={styles.imageThumbWrap}>
                <Image source={{ uri: img.uri }} style={styles.imageThumb} resizeMode="cover" />
                <TouchableOpacity style={styles.removeImg} onPress={() => removeImage(i)}>
                  <X size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
              <ImagePlus size={24} color={C.muted} />
              <Text style={styles.imageHint}>Add</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Field label="Product Name *" value={form.name} onChangeText={set('name')} placeholder="e.g. Wireless Earbuds" />
        <Field label="Price (UGX) *" value={form.price} onChangeText={set('price')} placeholder="e.g. 29000" keyboardType="numeric" />
        <Field label="Original Price (UGX)" value={form.originalPrice} onChangeText={set('originalPrice')} placeholder="e.g. 59000" keyboardType="numeric" />
        <Field label="Stock" value={form.stock} onChangeText={set('stock')} placeholder="e.g. 50" keyboardType="numeric" />
        <Field label="Delivery Fee (UGX)" value={form.deliveryFee} onChangeText={set('deliveryFee')} placeholder="e.g. 5000" keyboardType="numeric" />
        <Field label="Short Description" value={form.shortDescription} onChangeText={set('shortDescription')} placeholder="Brief summary (max 300 chars)" maxLength={300} />
        <Field label="Long Description" value={form.longDescription} onChangeText={set('longDescription')} placeholder="Full product details..." multiline numberOfLines={5} style={styles.textarea} />

        {/* Checkboxes */}
        <View style={[styles.toggleRow, form.isFeatured && styles.toggleRowActive]}>
          <Text style={[styles.toggleLabel, form.isFeatured && styles.toggleLabelActive]}>Featured</Text>
          <Switch
            value={form.isFeatured}
            onValueChange={(v) => set('isFeatured')(v)}
            trackColor={{ false: C.border, true: C.green }}
            thumbColor={form.isFeatured ? '#fff' : C.mutedLight}
          />
        </View>
        <View style={[styles.toggleRow, form.isNewDeal && styles.toggleRowActive]}>
          <Text style={[styles.toggleLabel, form.isNewDeal && styles.toggleLabelActive]}>New Deal</Text>
          <Switch
            value={form.isNewDeal}
            onValueChange={(v) => set('isNewDeal')(v)}
            trackColor={{ false: C.border, true: C.green }}
            thumbColor={form.isNewDeal ? '#fff' : C.mutedLight}
          />
        </View>

        <Text style={styles.label}>Category *</Text>
        <View style={styles.categoryRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catChip, form.categoryId === String(cat.id) && styles.catChipActive]}
              onPress={() => set('categoryId')(String(cat.id))}
            >
              <Text style={[styles.catChipText, form.categoryId === String(cat.id) && styles.catChipTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <View style={styles.loadingContent}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.submitText}>Saving...</Text>
            </View>
          ) : <Text style={styles.submitText}>Save Product</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

function Field({ label, style, ...props }: { label: string; style?: any } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.input, style]} placeholderTextColor={C.mutedLight} {...props} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  title: { fontSize: 18, fontWeight: '800', color: C.navy },
  form: { padding: 20, paddingBottom: 40 },
  imageRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  imageThumbWrap: { position: 'relative' },
  imageThumb: { width: 90, height: 90, borderRadius: 10 },
  removeImg: { position: 'absolute', top: 4, right: 4, backgroundColor: '#00000099', borderRadius: 10, padding: 3 },
  addImageBtn: { width: 90, height: 90, borderRadius: 10, borderWidth: 1, borderColor: C.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: C.card, gap: 4 },
  imageHint: { fontSize: 11, color: C.muted, fontWeight: '600' },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: C.navy, marginBottom: 8 },
  input: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: C.navy },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12 },
  toggleRowActive: { backgroundColor: '#F0FDF4', borderColor: C.green },
  toggleLabel: { fontSize: 14, fontWeight: '700', color: C.muted },
  toggleLabelActive: { color: C.green },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
  catChipActive: { backgroundColor: C.green, borderColor: C.green },
  catChipText: { fontSize: 12, fontWeight: '600', color: C.muted, textTransform: 'capitalize' },
  catChipTextActive: { color: '#fff' },
  submitBtn: { backgroundColor: C.green, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 24, alignItems: 'center', marginTop: 8, alignSelf: 'flex-end' },
  loadingContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitText: { color: '#fff', fontSize: 13, fontWeight: '700' },
})
