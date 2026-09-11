import { useEffect, useState } from 'react'
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { ArrowLeft, ImagePlus } from 'lucide-react-native'
import * as ImagePicker from 'expo-image-picker'
import { C } from '../../theme'
import { productsApi } from '../../lib/products'
import { appendImage } from '../../lib/formData'

export default function EditCategory() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [existingImage, setExistingImage] = useState<string | null>(null)
  const [newImage, setNewImage] = useState<{ uri: string; name: string; type: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setName('')
    setSlug('')
    setNewImage(null)
    setExistingImage(null)
    productsApi.categories().then(({ data }) => {
      const cats = Array.isArray(data) ? data : (data as any).results ?? []
      const cat = cats.find((c: any) => c.id === Number(id))
      if (mounted && cat) { setName(cat.name); setSlug(cat.slug); setExistingImage(cat.image) }
    }).finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [id])

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') { Alert.alert('Permission required', 'Allow access to your photo library.'); return }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.5 })
    if (!result.canceled) {
      const asset = result.assets[0]
      const mimeType = asset.mimeType || 'image/jpeg'
      const ext = mimeType.split('/')[1]?.split('+')[0] || 'jpeg'
      setNewImage({ uri: asset.uri, name: `category.${ext}`, type: mimeType })
    }
  }

  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) {
      Alert.alert('Validation', 'Name and slug are required.')
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', name.trim())
      fd.append('slug', slug.trim())
      if (newImage) await appendImage(fd, 'image', newImage)
      await productsApi.updateCategory(Number(id), fd)
      router.replace('/admin/categories' as any)
    } catch (e: any) {
      const err = e?.response?.data
      const msg = err?.slug?.[0] ?? err?.name?.[0] ?? err?.detail ?? 'Failed to update category.'
      Alert.alert('Error', msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator color={C.green} size="large" /></View>

  const previewUri = newImage?.uri ?? existingImage ?? null

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/admin/categories' as any)}><ArrowLeft size={22} color={C.navy} /></TouchableOpacity>
        <Text style={styles.title}>Edit Category</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {previewUri
            ? <Image key={`${id}:${previewUri}`} source={{ uri: previewUri }} style={styles.imagePreview} resizeMode="cover" />
            : <><ImagePlus size={28} color={C.muted} /><Text style={styles.imageHint}>Tap to change image</Text></>
          }
        </TouchableOpacity>

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Category Name *</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={C.mutedLight} />
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Slug</Text>
          <TextInput style={[styles.input, { color: C.muted }]} value={slug} onChangeText={setSlug} autoCapitalize="none" placeholderTextColor={C.mutedLight} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  title: { fontSize: 18, fontWeight: '800', color: C.navy },
  form: { padding: 20, paddingBottom: 40 },
  imagePicker: { height: 160, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: 24, gap: 8, overflow: 'hidden' },
  imagePreview: { width: '100%', height: '100%' },
  imageHint: { fontSize: 13, color: C.muted, fontWeight: '600' },
  fieldWrap: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '700', color: C.navy, marginBottom: 8 },
  input: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: C.navy },
  submitBtn: { backgroundColor: C.navy, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  loadingContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800' },
})
