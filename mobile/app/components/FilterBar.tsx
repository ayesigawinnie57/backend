import { useEffect, useRef, useState } from 'react'
import {
  Modal, PanResponder, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, TouchableWithoutFeedback, View,
} from 'react-native'
import { ChevronDown, ChevronLeft, SlidersHorizontal, X } from 'lucide-react-native'
import { productsApi, type ApiCategory } from '../lib/products'
import { DEFAULT_FILTER, type FilterState } from '../lib/FilterContext'
import { C } from '../theme'

const FILTER_OPTIONS = [
  { key: 'category',    label: 'Category',    hasSub: true },
  { key: 'price',       label: 'Price Range', hasSub: true },
  { key: 'az',          label: 'A → Z',       hasSub: false },
  { key: 'za',          label: 'Z → A',       hasSub: false },
  { key: 'new',         label: 'New Arrivals',hasSub: false },
  { key: 'featured',    label: 'Featured',    hasSub: false },
  { key: 'recommended', label: 'Recommended', hasSub: false },
] as const

const PRICE_MIN = 20_000
const PRICE_MAX = 5_000_000
const T = 10 // thumb diameter

function RangeSlider({ min, max, onChange }: {
  min: number; max: number
  onChange: (min: number, max: number) => void
}) {
  const [trackW, setTrackW] = useState(0)
  const [minText, setMinText] = useState(min.toLocaleString('en-US'))
  const [maxText, setMaxText] = useState(max.toLocaleString('en-US'))
  const trackX = useRef(0)

  useEffect(() => {
    setMinText(min.toLocaleString('en-US'))
    setMaxText(max.toLocaleString('en-US'))
  }, [min, max])

  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
  const toPx = (val: number) => trackW > 0 ? (val / PRICE_MAX) * trackW : 0
  const toVal = (px: number) => trackW > 0 ? Math.round((px / trackW) * PRICE_MAX) : 0

  const minPx = toPx(min)
  const maxPx = toPx(max)

  const grab = (ref: React.RefObject<View>) =>
    ref.current?.measureInWindow((x) => { trackX.current = x })

  const trackRef = useRef<View>(null)

  const minPan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => grab(trackRef),
    onPanResponderMove: (_, g) => {
      const px = clamp(g.moveX - trackX.current, 0, maxPx - T)
      onChange(clamp(toVal(px), PRICE_MIN, max - 1000), max)
    },
  })).current

  const maxPan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => grab(trackRef),
    onPanResponderMove: (_, g) => {
      const px = clamp(g.moveX - trackX.current, minPx + T, trackW)
      onChange(min, clamp(toVal(px), min + 1000, PRICE_MAX))
    },
  })).current

  return (
    <View style={sl.row}>
      <TextInput
        style={sl.moneyInput}
        keyboardType="numeric"
        value={minText}
        underlineColorAndroid="transparent"
        onChangeText={text => {
          setMinText(text)
          const numericValue = Number(text.replace(/,/g, ''))
          if (!Number.isNaN(numericValue)) onChange(clamp(numericValue, PRICE_MIN, max - 1000), max)
        }}
        onBlur={() => setMinText(min.toLocaleString('en-US'))}
      />

      {/* One connected rail: endpoint markers and line are a single slider element. */}
      <View
        ref={trackRef}
        style={sl.trackWrap}
        onLayout={e => setTrackW(e.nativeEvent.layout.width)}
      >
        {/* full grey bg */}
        <View style={sl.trackBg} />
        {/* navy active fill */}
        {trackW > 0 && (
          <View style={[sl.fill, { left: minPx, width: maxPx - minPx }]} />
        )}
        {/* min thumb */}
        {trackW > 0 && (
          <View style={[sl.thumb, { left: minPx - T / 2 }]} {...minPan.panHandlers} />
        )}
        {/* max thumb */}
        {trackW > 0 && (
          <View style={[sl.thumb, { left: maxPx - T / 2 }]} {...maxPan.panHandlers} />
        )}
      </View>

      <TextInput
        style={sl.moneyInput}
        keyboardType="numeric"
        value={maxText}
        underlineColorAndroid="transparent"
        onChangeText={text => {
          setMaxText(text)
          const numericValue = Number(text.replace(/,/g, ''))
          if (!Number.isNaN(numericValue)) onChange(min, clamp(numericValue, min + 1000, PRICE_MAX))
        }}
        onBlur={() => setMaxText(max.toLocaleString('en-US'))}
      />
    </View>
  )
}

const sl = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  moneyInput: { fontSize: 11, fontWeight: '500', color: C.navy, width: 52, padding: 0, outlineWidth: 0 } as any,
  trackWrap: { flex: 1, height: T + 8, justifyContent: 'center', position: 'relative', transform: [{ translateY: 2 }] },
  trackBg: { height: 1.5, backgroundColor: C.border, borderRadius: 2, marginHorizontal: 8 },
  fill: { position: 'absolute', height: 1.5, top: (T + 4) / 2 - 0.75, backgroundColor: C.navy, borderRadius: 2 },
  thumb: {
    position: 'absolute',
    top: 2,
    width: T, height: T, borderRadius: T / 2,
    backgroundColor: '#fff', borderWidth: 2, borderColor: C.navy,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 3, elevation: 4,
  },
})

type Props = { value: FilterState; onChange: (f: FilterState) => void }

export default function FilterBar({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'list' | 'category' | 'price'>('list')
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const btnRef = useRef<View>(null)
  const [pos, setPos] = useState({ top: 0 })

  useEffect(() => {
    productsApi.categories().then(({ data }) =>
      setCategories(Array.isArray(data) ? data : (data as any)?.results ?? [])
    ).catch(() => {})
  }, [])

  const openMenu = () => {
    productsApi.categories().then(({ data }) =>
      setCategories(Array.isArray(data) ? data : (data as any)?.results ?? [])
    ).catch(() => {})
    btnRef.current?.measureInWindow((_x, y, _w, h) => {
      setPos({ top: y + h + 4 })
      setStep('list')
      setOpen(true)
    })
  }

  const close = () => { setOpen(false); setStep('list') }

  const pick = (key: FilterState['type'], hasSub: boolean) => {
    if (hasSub) {
      const next: FilterState = { ...DEFAULT_FILTER, type: key }
      if (key === 'price') { next.minPrice = String(PRICE_MIN); next.maxPrice = String(PRICE_MAX) }
      onChange(next)
      setStep(key as 'category' | 'price')
    } else {
      onChange({ ...DEFAULT_FILTER, type: key })
      close()
    }
  }

  const sliderMin = Number(value.minPrice) || PRICE_MIN
  const sliderMax = Number(value.maxPrice) || PRICE_MAX
  const active = value.type !== null
  const activeLabel = active ? FILTER_OPTIONS.find(o => o.key === value.type)?.label ?? '' : null
  const clear = (e: any) => { e.stopPropagation?.(); onChange(DEFAULT_FILTER); close() }

  return (
    <>
      <View ref={btnRef} collapsable={false}>
        <TouchableOpacity style={[s.btn, active && s.btnActive]} onPress={openMenu} activeOpacity={0.8}>
          <SlidersHorizontal size={13} color={active ? '#fff' : C.navy} />
          <Text style={[s.btnTxt, active && s.btnTxtActive]}>{activeLabel ?? 'Filter'}</Text>
          {active
            ? <TouchableOpacity onPress={clear} hitSlop={8}><X size={11} color="#fff" /></TouchableOpacity>
            : <ChevronDown size={11} color={C.muted} />
          }
        </TouchableOpacity>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <TouchableWithoutFeedback onPress={close}>
          <View style={StyleSheet.absoluteFill}>
            <TouchableWithoutFeedback>
              <View style={[s.sheet, { top: pos.top }]}>

                {step === 'list' && (
                  <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                    {FILTER_OPTIONS.map(opt => (
                      <TouchableOpacity
                        key={opt.key}
                        style={[s.row, value.type === opt.key && s.rowActive]}
                        onPress={() => pick(opt.key, opt.hasSub)}
                      >
                        <Text style={[s.rowTxt, value.type === opt.key && s.rowTxtActive]}>{opt.label}</Text>
                        {opt.hasSub
                          ? <ChevronDown size={13} color={C.mutedLight} />
                          : value.type === opt.key && <View style={s.dot} />
                        }
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                {step === 'category' && (
                  <>
                    <TouchableOpacity style={s.back} onPress={() => setStep('list')}>
                      <ChevronLeft size={14} color={C.navy} />
                      <Text style={s.backTxt}>Category</Text>
                    </TouchableOpacity>
                    <ScrollView style={{ maxHeight: 220 }} bounces={false} showsVerticalScrollIndicator={false}>
                      {categories.map(cat => (
                        <TouchableOpacity
                          key={cat.id}
                          style={[s.row, value.category === cat.slug && s.rowActive]}
                          onPress={() => { onChange({ ...value, category: cat.slug }); close() }}
                        >
                          <Text style={[s.rowTxt, value.category === cat.slug && s.rowTxtActive]}>{cat.name}</Text>
                          {value.category === cat.slug && <View style={s.dot} />}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )}

                {step === 'price' && (
                  <>
                    <TouchableOpacity style={s.back} onPress={() => setStep('list')}>
                      <ChevronLeft size={14} color={C.navy} />
                      <Text style={s.backTxt}>Price Range (UGX)</Text>
                    </TouchableOpacity>
                    <View style={s.pricePad}>
                      <RangeSlider
                        min={sliderMin} max={sliderMax}
                        onChange={(mn, mx) => onChange({ ...value, minPrice: String(mn), maxPrice: String(mx) })}
                      />
                    </View>
                  </>
                )}

              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  )
}

const s = StyleSheet.create({
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.card,
  },
  btnActive: { backgroundColor: C.navy, borderColor: C.navy },
  btnTxt: { fontSize: 12, fontWeight: '600', color: C.navy },
  btnTxtActive: { color: '#fff' },

  sheet: {
    position: 'absolute', right: 12, width: 210,
    backgroundColor: C.card, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 8, overflow: 'hidden',
  },
  row: { paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: C.border },
  rowActive: { backgroundColor: '#F0F4FF' },
  rowTxt: { fontSize: 13, color: C.navy, fontWeight: '500' },
  rowTxtActive: { fontWeight: '700', color: C.green },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },

  back: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.bg },
  backTxt: { fontSize: 13, fontWeight: '700', color: C.navy },

  pricePad: { padding: 12, gap: 14 },
})
