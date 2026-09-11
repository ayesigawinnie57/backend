import { useEffect, useState } from 'react'
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { ArrowLeft, ImagePlus } from 'lucide-react-native'
import * as ImagePicker from 'expo-image-picker'
import { C } from '../../theme'
import { productsApi, type ApiProduct, type ApiCategory } from '../../lib/products'
import { appendImage } from '../../lib/formData'

type Form = { name: string; price: string; originalPrice: string; stock: string; categoryId: string }

export default function EditProduct() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [form, setForm] = useState<Form>({ name: '', price: '', originalPrice: '', stock: '', categoryId: '' })
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [existingImage, setExistingImage] = useState<string | null>(null)
  const [newImage, setNewImage] = useState<{ uri: string; name: string; type: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const set = (key: keyof Form) => (val: string) => setForm((f) => ({ ...f, [key]: val }))

  useEffect(() => {
    setNewImage(null)
    setExistingImage(null)
    Promise.all([productsApi.get(Number(id)), productsApi.categories()]).then(([{ data: p }, { data: catsData }]) => {
      const cats = Array.isArray(catsData) ? catsData : (catsData as any).results ?? []
      setCategories(cats)
      setExistingImage(p.image)
      setForm({
        name: p.name,
        price: p.price,
        originalPrice: p.original_price ?? '',
        stock: String(p.stock),
        categoryId: String(p.category?.id ?? ''),
      })
    }).catch(() => Alert.alert('Error', 'Failed to load product.')).finally(() => setLoading(false))
  }, [id])

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') { Alert.alert('Permission required', 'Allow access to your photo library.'); return }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.5 })
    if (!result.canceled) {
      const asset = result.assets[0]
      const mimeType = asset.mimeType || 'image/jpeg'
      const ext = mimeType.split('/')[1]?.split('+')[0] || 'jpeg'
      setNewImage({ uri: asset.uri, name: `product.${ext}`, type: mimeType })
    }
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.price.trim()) {
      Alert.alert('Validation', 'Name and price are required.')
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name.trim())
      fd.append('price', form.price)
      fd.append('category_id', form.categoryId)
      if (form.originalPrice) fd.append('original_price', form.originalPrice)
      if (form.stock) fd.append('stock', form.stock)
      if (newImage) await appendImage(fd, 'image', newImage)
      await productsApi.update(Number(id), fd)
      router.replace('/admin/products' as any)
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail ?? 'Failed to update product.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={C.green} size="large" /></View>
  }

  const previewUri = newImage?.uri ?? existingImage ?? null

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/admin/products' as any)}><ArrowLeft size={22} color={C.navy} /></TouchableOpacity>
        <Text style={styles.title}>Edit Product</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {previewUri
            ? <Image key={previewUri} source={{ uri: previewUri }} style={styles.imagePreview} resizeMode="cover" />
            : <><ImagePlus size={28} color={C.muted} /><Text style={styles.imageHint}>Tap to change image</Text></>
          }
        </TouchableOpacity>

        <Field label="Product Name *" value={form.name} onChangeText={set('name')} />
        <Field label="Price (UGX) *" value={form.price} onChangeText={set('price')} keyboardType="numeric" />
        <Field label="Original Price (UGX)" value={form.originalPrice} onChangeText={set('originalPrice')} keyboardType="numeric" />
        <Field label="Stock" value={form.stock} onChangeText={set('stock')} keyboardType="numeric" />

        <Text style={styles.label}>Category</Text>
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

        <TouchableOpacity style={[styles.submitBtn, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
          {saving ? (
            <View style={styles.loadingContent}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.submitText}>Saving...</Text>
            </View>
          ) : <Text style={styles.submitText}>Save Changes</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor={C.mutedLight} {...props} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  title: { fontSize: 18, fontWeight: '800', color: C.navy },
  form: { padding: 20, paddingBottom: 40 },
  imagePicker: { height: 160, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: 20, gap: 8, overflow: 'hidden' },
  imagePreview: { width: '100%', height: '100%' },
  imageHint: { fontSize: 13, color: C.muted, fontWeight: '600' },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: C.navy, marginBottom: 8 },
  input: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: C.navy },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
  catChipActive: { backgroundColor: C.green, borderColor: C.green },
  catChipText: { fontSize: 12, fontWeight: '600', color: C.muted, textTransform: 'capitalize' },
  catChipTextActive: { color: '#fff' },
  submitBtn: { backgroundColor: C.navy, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  loadingContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800' },
})
