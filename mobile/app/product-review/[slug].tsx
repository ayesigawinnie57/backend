import { useEffect, useState, useCallback, useRef } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
  ActivityIndicator, Alert, Image, FlatList, Platform,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import {
  ArrowLeft, Star, CheckCircle, Camera, X, ShoppingBag,
} from 'lucide-react-native'
import { C } from '../theme'
import { productsApi, type ApiProduct, type EligibilityResult } from '../lib/products'

// ── Category attribute config ─────────────────────────────────────────────

type Attr = { key: string; label: string; emoji: string }

const CATEGORY_ATTRS: Record<string, Attr[]> = {
  phones: [
    { key: 'performance_rating',      label: 'Performance',     emoji: '⚙️' },
    { key: 'battery_life_rating',     label: 'Battery Life',    emoji: '🔋' },
    { key: 'product_quality_rating',  label: 'Build Quality',   emoji: '💎' },
    { key: 'design_rating',           label: 'Design',          emoji: '🎨' },
    { key: 'value_for_money_rating',  label: 'Value for Money', emoji: '💰' },
  ],
  laptops: [
    { key: 'performance_rating',      label: 'Performance',     emoji: '⚙️' },
    { key: 'battery_life_rating',     label: 'Battery Life',    emoji: '🔋' },
    { key: 'product_quality_rating',  label: 'Build Quality',   emoji: '💎' },
    { key: 'design_rating',           label: 'Design',          emoji: '🎨' },
    { key: 'value_for_money_rating',  label: 'Value for Money', emoji: '💰' },
  ],
  earphones: [
    { key: 'performance_rating',      label: 'Sound Quality',   emoji: '🎵' },
    { key: 'battery_life_rating',     label: 'Battery Life',    emoji: '🔋' },
    { key: 'product_quality_rating',  label: 'Comfort',         emoji: '😌' },
    { key: 'features_rating',         label: 'Connectivity',    emoji: '📡' },
  ],
  'smart-watches': [
    { key: 'features_rating',         label: 'Features',        emoji: '📋' },
    { key: 'battery_life_rating',     label: 'Battery Life',    emoji: '🔋' },
    { key: 'design_rating',           label: 'Display',         emoji: '🖥️' },
    { key: 'size_fit_rating',         label: 'Comfort',         emoji: '😌' },
  ],
  accessories: [
    { key: 'product_quality_rating',  label: 'Product Quality', emoji: '⭐' },
    { key: 'condition_rating',        label: 'Condition',       emoji: '📦' },
    { key: 'value_for_money_rating',  label: 'Value for Money', emoji: '💎' },
    { key: 'design_rating',           label: 'Design',          emoji: '🎨' },
  ],
}

const DEFAULT_ATTRS: Attr[] = [
  { key: 'product_quality_rating',  label: 'Product Quality', emoji: '⭐' },
  { key: 'performance_rating',      label: 'Performance',     emoji: '⚙️' },
  { key: 'value_for_money_rating',  label: 'Value for Money', emoji: '💎' },
  { key: 'design_rating',           label: 'Design',          emoji: '🎨' },
]

function getAttrsForCategory(categorySlug?: string): Attr[] {
  if (!categorySlug) return DEFAULT_ATTRS
  const slug = categorySlug.toLowerCase()
  for (const key of Object.keys(CATEGORY_ATTRS)) {
    if (slug.includes(key)) return CATEGORY_ATTRS[key]
  }
  return DEFAULT_ATTRS
}

const OVERALL_LABELS: Record<number, string> = {
  1: 'Very Poor', 2: 'Poor', 3: 'Average', 4: 'Good', 5: 'Excellent',
}

const TOTAL_STEPS = 5

// ── Sub-components ────────────────────────────────────────────────────────

function StarSelector({ value, onChange, size = 36 }: { value: number; onChange: (v: number) => void; size?: number }) {
  return (
    <View style={s.starRow}>
      {[1, 2, 3, 4, 5].map(i => (
        <TouchableOpacity key={i} onPress={() => onChange(i)} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}>
          <Star size={size} color="#F59E0B" fill={i <= value ? '#F59E0B' : 'transparent'} />
        </TouchableOpacity>
      ))}
    </View>
  )
}

function SmallStars({ value }: { value: number }) {
  return (
    <View style={s.starRow}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={14} color="#F59E0B" fill={i <= value ? '#F59E0B' : 'transparent'} />
      ))}
    </View>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────

export default function ProductReviewScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<ApiProduct | null>(null)
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null)

  const [step, setStep] = useState(1)
  const [overallRating, setOverallRating] = useState(0)
  const [attrRatings, setAttrRatings] = useState<Record<string, number>>({})
  const [reviewText, setReviewText] = useState('')
  const [photos, setPhotos] = useState<{ uri: string; name: string; type: string }[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const attrs = getAttrsForCategory(product?.category?.slug)

  useEffect(() => {
    if (!slug) { setLoading(false); return }
    Promise.all([
      productsApi.get(slug),
      productsApi.checkEligibility(slug),
    ]).then(([pRes, eRes]) => {
      setProduct(pRes.data)
      setEligibility(eRes.data)
    }).catch(() => {
      setEligibility({ eligible: false, reason: 'error' })
    }).finally(() => setLoading(false))
  }, [slug])

  const pickOverall = useCallback((val: number) => {
    setOverallRating(val)
    if (autoTimer.current) clearTimeout(autoTimer.current)
    autoTimer.current = setTimeout(() => setStep(2), 500)
  }, [])

  const setAttr = useCallback((key: string, val: number) => {
    setAttrRatings(prev => {
      const updated = { ...prev, [key]: val }
      const currentAttrs = getAttrsForCategory(product?.category?.slug)
      const allDone = currentAttrs.every(a => (updated[a.key] ?? 0) > 0)
      if (allDone) {
        if (autoTimer.current) clearTimeout(autoTimer.current)
        autoTimer.current = setTimeout(() => setStep(3), 400)
      }
      return updated
    })
  }, [product?.category?.slug])

  const pickPhotos = async () => {
    if (photos.length >= 5) {
      Alert.alert('Limit reached', 'You can upload up to 5 photos.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - photos.length,
    })
    if (result.canceled) return
    const newPhotos = result.assets.map(a => ({
      uri: a.uri,
      name: a.fileName ?? `photo_${Date.now()}.jpg`,
      type: a.mimeType ?? 'image/jpeg',
    }))
    setPhotos(prev => [...prev, ...newPhotos].slice(0, 5))
  }

  const removePhoto = (uri: string) => setPhotos(prev => prev.filter(p => p.uri !== uri))

  const handleSubmit = async () => {
    if (!slug || !eligibility?.eligible) return
    setSubmitting(true)
    try {
      const form = new FormData()
      form.append('overall_rating', String(overallRating))
      if (eligibility.order_id) form.append('order', String(eligibility.order_id))
      if (eligibility.order_item_id) form.append('order_item', String(eligibility.order_item_id))
      attrs.forEach(a => {
        const v = attrRatings[a.key]
        if (v) form.append(a.key, String(v))
      })
      if (reviewText.trim()) form.append('review_text', reviewText.trim())
      photos.forEach((p, i) => {
        form.append('uploaded_images', {
          uri: Platform.OS === 'ios' ? p.uri.replace('file://', '') : p.uri,
          name: p.name,
          type: p.type,
        } as any)
      })

      await productsApi.submitReview(slug, form)
      setDone(true)
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? e?.response?.data?.overall_rating?.[0] ?? 'Could not submit your review. Please try again.'
      Alert.alert('Submission failed', msg)
    } finally {
      setSubmitting(false)
    }
  }

  const goBack = () => {
    if (step > 1) setStep(p => p - 1)
    else router.canGoBack() ? router.back() : router.replace('/shop' as any)
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[s.container, s.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={C.green} size="large" />
      </View>
    )
  }

  // ── Not eligible ─────────────────────────────────────────────────────────
  if (!eligibility?.eligible) {
    const alreadyReviewed = eligibility?.reason === 'already_reviewed'
    return (
      <View style={[s.container, s.center, { paddingTop: insets.top }]}>
        <View style={s.lockIconWrap}>
          {alreadyReviewed ? <CheckCircle size={32} color={C.green} /> : <Star size={32} color={C.mutedLight} />}
        </View>
        <Text style={s.lockTitle}>{alreadyReviewed ? 'Already Reviewed' : 'Review not available yet'}</Text>
        <Text style={s.lockText}>
          {alreadyReviewed
            ? 'You have already submitted a review for this product. Each product can only be reviewed once.'
            : 'You can only review a product after the related order has been successfully delivered.'}
        </Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/shop' as any)}>
          <Text style={s.primaryBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // ── Done ─────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <View style={[s.container, s.center, { paddingTop: insets.top }]}>
        <View style={s.doneIconWrap}>
          <CheckCircle size={48} color={C.green} />
        </View>
        <Text style={s.doneTitle}>Thank You for Your Review!</Text>
        <Text style={s.doneText}>
          Your review has been submitted successfully. Your feedback helps other Majo customers choose with confidence.
        </Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => router.replace('/shop' as any)}>
          <Text style={s.primaryBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const canContinue =
    (step === 1 && overallRating > 0) ||
    (step === 2 && attrs.every(a => (attrRatings[a.key] ?? 0) > 0)) ||
    step === 3 ||
    step === 4 ||
    step === 5

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={goBack}>
          <ArrowLeft size={20} color={C.navy} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Rate Product</Text>
        <Text style={s.stepLabel}>{step} of {TOTAL_STEPS}</Text>
      </View>

      {/* Progress bar */}
      <View style={s.progressBar}>
        <View style={[s.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` as any }]} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Step 1: Overall rating ── */}
        {step === 1 && (
          <View style={s.stepWrap}>
            {/* Product card */}
            <View style={s.productCard}>
              {product?.image
                ? <Image source={{ uri: product.image }} style={s.productImage} resizeMode="cover" />
                : <View style={s.productImagePlaceholder}><ShoppingBag size={32} color={C.mutedLight} /></View>
              }
              <View style={s.productInfo}>
                <Text style={s.productCategory}>{product?.category?.name?.toUpperCase() ?? ''}</Text>
                <Text style={s.productName} numberOfLines={2}>{product?.name ?? ''}</Text>
              </View>
            </View>

            <Text style={s.stepTitle}>How would you rate this product?</Text>
            <StarSelector value={overallRating} onChange={pickOverall} size={40} />
            {overallRating > 0 && (
              <Text style={s.overallLabel}>{OVERALL_LABELS[overallRating]}</Text>
            )}
          </View>
        )}

        {/* ── Step 2: Category-specific attributes ── */}
        {step === 2 && (
          <View style={s.stepWrap}>
            <Text style={s.stepTitle}>What did you think about this product?</Text>
            <Text style={s.stepSub}>Rate each aspect of the product.</Text>
            {attrs.map(attr => (
              <View key={attr.key} style={s.attrRow}>
                <View style={s.attrLabelRow}>
                  <Text style={s.attrEmoji}>{attr.emoji}</Text>
                  <Text style={s.attrLabel}>{attr.label}</Text>
                </View>
                <StarSelector value={attrRatings[attr.key] ?? 0} onChange={v => setAttr(attr.key, v)} size={28} />
                {(attrRatings[attr.key] ?? 0) > 0 && (
                  <Text style={s.attrRatingLabel}>{OVERALL_LABELS[attrRatings[attr.key]]}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ── Step 3: Written review ── */}
        {step === 3 && (
          <View style={s.stepWrap}>
            <Text style={s.stepTitle}>Tell us about the product</Text>
            <Text style={s.stepSub}>Your review can help other customers make a better choice.</Text>
            <TextInput
              style={s.textInput}
              multiline
              textAlignVertical="top"
              placeholder="Share your experience with this product..."
              placeholderTextColor={C.mutedLight}
              value={reviewText}
              onChangeText={t => setReviewText(t.slice(0, 500))}
              maxLength={500}
            />
            <Text style={s.charCount}>{reviewText.length}/500</Text>
            <Text style={s.optionalHint}>This field is optional.</Text>
          </View>
        )}

        {/* ── Step 4: Photos ── */}
        {step === 4 && (
          <View style={s.stepWrap}>
            <Text style={s.stepTitle}>Add photos</Text>
            <Text style={s.stepSub}>Show other customers what you received. (Optional, max 5)</Text>

            <TouchableOpacity style={s.photoPickerBtn} onPress={pickPhotos} disabled={photos.length >= 5}>
              <Camera size={20} color={photos.length >= 5 ? C.mutedLight : C.navy} />
              <Text style={[s.photoPickerText, photos.length >= 5 && { color: C.mutedLight }]}>
                {photos.length === 0 ? 'Choose Photos' : `Add More (${photos.length}/5)`}
              </Text>
            </TouchableOpacity>

            {photos.length > 0 && (
              <View style={s.photoGrid}>
                {photos.map(p => (
                  <View key={p.uri} style={s.photoThumbWrap}>
                    <Image source={{ uri: p.uri }} style={s.photoThumb} resizeMode="cover" />
                    <TouchableOpacity style={s.photoRemoveBtn} onPress={() => removePhoto(p.uri)}>
                      <X size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── Step 5: Summary ── */}
        {step === 5 && (
          <View style={s.stepWrap}>
            <Text style={s.stepTitle}>Review Summary</Text>
            <Text style={s.stepSub}>Check your review before submitting.</Text>

            {/* Product */}
            <View style={s.summaryCard}>
              <Text style={s.summarySection}>PRODUCT</Text>
              <View style={s.summaryProductRow}>
                {product?.image
                  ? <Image source={{ uri: product.image }} style={s.summaryProductImage} resizeMode="cover" />
                  : <View style={[s.summaryProductImage, { backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }]}><ShoppingBag size={18} color={C.mutedLight} /></View>
                }
                <Text style={s.summaryProductName} numberOfLines={2}>{product?.name}</Text>
              </View>
            </View>

            {/* Overall */}
            <View style={s.summaryCard}>
              <Text style={s.summarySection}>OVERALL RATING</Text>
              <View style={s.summaryRow}>
                <SmallStars value={overallRating} />
                <Text style={s.summaryRatingText}>{OVERALL_LABELS[overallRating]}</Text>
              </View>
            </View>

            {/* Attribute ratings */}
            {attrs.some(a => attrRatings[a.key]) && (
              <View style={s.summaryCard}>
                <Text style={s.summarySection}>YOUR RATINGS</Text>
                {attrs.filter(a => attrRatings[a.key]).map(a => (
                  <View key={a.key} style={s.summaryAttrRow}>
                    <Text style={s.summaryAttrLabel}>{a.emoji} {a.label}</Text>
                    <SmallStars value={attrRatings[a.key]} />
                  </View>
                ))}
              </View>
            )}

            {/* Review text */}
            {reviewText.trim() !== '' && (
              <View style={s.summaryCard}>
                <Text style={s.summarySection}>YOUR REVIEW</Text>
                <Text style={s.summaryReviewText}>"{reviewText.trim()}"</Text>
              </View>
            )}

            {/* Photos */}
            {photos.length > 0 && (
              <View style={s.summaryCard}>
                <Text style={s.summarySection}>PHOTOS</Text>
                <View style={s.photoGrid}>
                  {photos.map(p => (
                    <Image key={p.uri} source={{ uri: p.uri }} style={s.photoThumb} resizeMode="cover" />
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[s.primaryBtn, submitting && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.primaryBtnText}>Submit Review</Text>
              }
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* Footer continue button */}
      {step < 5 && (
        <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TouchableOpacity
            style={[s.primaryBtn, !canContinue && s.primaryBtnDisabled]}
            onPress={() => canContinue && setStep(p => p + 1)}
            disabled={!canContinue}
          >
            <Text style={s.primaryBtnText}>
              {step === 3 || step === 4 ? 'Continue' : 'Next'}
            </Text>
          </TouchableOpacity>
          {(step === 3 || step === 4) && (
            <TouchableOpacity style={s.skipBtn} onPress={() => setStep(p => p + 1)}>
              <Text style={s.skipBtnText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { alignItems: 'center', justifyContent: 'center', padding: 32 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 34, height: 34, borderRadius: 9, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: C.navy },
  stepLabel: { fontSize: 12, color: C.mutedLight, fontWeight: '600' },

  progressBar: { height: 3, backgroundColor: C.border },
  progressFill: { height: 3, backgroundColor: C.green },

  scroll: { padding: 20, paddingBottom: 120 },
  stepWrap: { gap: 16 },
  stepTitle: { fontSize: 20, fontWeight: '800', color: C.navy, lineHeight: 28 },
  stepSub: { fontSize: 13, color: C.muted, lineHeight: 20, marginTop: -8 },

  // Product card
  productCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 14 },
  productImage: { width: 72, height: 72, borderRadius: 12 },
  productImagePlaceholder: { width: 72, height: 72, borderRadius: 12, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  productInfo: { flex: 1, gap: 4 },
  productCategory: { fontSize: 10, fontWeight: '700', color: C.mutedLight, letterSpacing: 1 },
  productName: { fontSize: 15, fontWeight: '800', color: C.navy, lineHeight: 20 },

  // Stars
  starRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  overallLabel: { fontSize: 16, fontWeight: '800', color: '#F59E0B', textAlign: 'center' },

  // Attributes
  attrRow: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14, gap: 10 },
  attrLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  attrEmoji: { fontSize: 18 },
  attrLabel: { fontSize: 14, fontWeight: '700', color: C.navy },
  attrRatingLabel: { fontSize: 12, color: '#F59E0B', fontWeight: '700' },

  // Text input
  textInput: { minHeight: 140, borderWidth: 1, borderColor: C.border, borderRadius: 14, backgroundColor: C.card, padding: 14, fontSize: 14, color: C.navy, lineHeight: 22 },
  charCount: { fontSize: 11, color: C.mutedLight, textAlign: 'right', marginTop: -8 },
  optionalHint: { fontSize: 12, color: C.mutedLight, fontStyle: 'italic' },

  // Photos
  photoPickerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1.5, borderColor: C.border, borderStyle: 'dashed', borderRadius: 14, paddingVertical: 18, backgroundColor: C.card },
  photoPickerText: { fontSize: 14, fontWeight: '700', color: C.navy },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoThumbWrap: { position: 'relative' },
  photoThumb: { width: 80, height: 80, borderRadius: 10 },
  photoRemoveBtn: { position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center' },

  // Summary
  summaryCard: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14, gap: 10 },
  summarySection: { fontSize: 10, fontWeight: '800', color: C.mutedLight, letterSpacing: 1.2 },
  summaryProductRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  summaryProductImage: { width: 52, height: 52, borderRadius: 10 },
  summaryProductName: { flex: 1, fontSize: 14, fontWeight: '700', color: C.navy },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryRatingText: { fontSize: 13, fontWeight: '700', color: '#F59E0B' },
  summaryAttrRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryAttrLabel: { fontSize: 13, color: C.navy, fontWeight: '600' },
  summaryReviewText: { fontSize: 13, color: C.muted, lineHeight: 20, fontStyle: 'italic' },

  // Lock / done
  lockIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  lockTitle: { fontSize: 20, fontWeight: '800', color: C.navy, textAlign: 'center', marginBottom: 8 },
  lockText: { fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  doneIconWrap: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  doneTitle: { fontSize: 24, fontWeight: '800', color: C.navy, textAlign: 'center', marginBottom: 10 },
  doneText: { fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 22, marginBottom: 28 },

  // Buttons
  primaryBtn: { backgroundColor: C.navy, borderRadius: 14, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  primaryBtnDisabled: { backgroundColor: C.border },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  skipBtn: { alignItems: 'center', paddingVertical: 10 },
  skipBtnText: { fontSize: 13, color: C.mutedLight, fontWeight: '600' },
  footer: { backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border, paddingHorizontal: 20, paddingTop: 12, gap: 4 },
})
