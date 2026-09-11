import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { C } from '../../theme'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const QUICK = [
  { label: '1h',  h: 1 },
  { label: '6h',  h: 6 },
  { label: '12h', h: 12 },
  { label: '1d',  h: 24 },
  { label: '2d',  h: 48 },
  { label: '3d',  h: 72 },
  { label: '7d',  h: 168 },
]

function Seg({ label, val, onUp, onDown }: { label: string; val: string; onUp: () => void; onDown: () => void }) {
  return (
    <View style={s.seg}>
      <TouchableOpacity onPress={onUp} hitSlop={8} style={s.arrow}>
        <Text style={s.arrowTxt}>▲</Text>
      </TouchableOpacity>
      <Text style={s.segVal}>{val}</Text>
      <TouchableOpacity onPress={onDown} hitSlop={8} style={s.arrow}>
        <Text style={s.arrowTxt}>▼</Text>
      </TouchableOpacity>
      <Text style={s.segLabel}>{label}</Text>
    </View>
  )
}

type Props = { value: Date; onChange: (d: Date) => void }

export default function DateTimePicker({ value, onChange }: Props) {
  const now = new Date()
  const upd = (fn: (d: Date) => void) => { const n = new Date(value); fn(n); onChange(n) }
  const dim = new Date(value.getFullYear(), value.getMonth() + 1, 0).getDate()

  return (
    <View style={s.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={s.chips}>
          {QUICK.map(q => {
            const t = new Date(now.getTime() + q.h * 3600000)
            const active = Math.abs(value.getTime() - t.getTime()) < 60000
            return (
              <TouchableOpacity key={q.label} style={[s.chip, active && s.chipOn]} onPress={() => onChange(t)}>
                <Text style={[s.chipTxt, active && s.chipTxtOn]}>{q.label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>

      <View style={s.row}>
        <Seg label="day" val={String(value.getDate()).padStart(2,'0')}
          onUp={() => upd(d => d.setDate(value.getDate() >= dim ? 1 : value.getDate() + 1))}
          onDown={() => upd(d => d.setDate(value.getDate() <= 1 ? dim : value.getDate() - 1))} />
        <Text style={s.sep}>/</Text>
        <Seg label="mon" val={MONTHS[value.getMonth()]}
          onUp={() => upd(d => d.setMonth(value.getMonth() >= 11 ? 0 : value.getMonth() + 1))}
          onDown={() => upd(d => d.setMonth(value.getMonth() <= 0 ? 11 : value.getMonth() - 1))} />
        <Text style={s.sep}>/</Text>
        <Seg label="year" val={String(value.getFullYear())}
          onUp={() => upd(d => d.setFullYear(value.getFullYear() + 1))}
          onDown={() => upd(d => d.setFullYear(Math.max(now.getFullYear(), value.getFullYear() - 1)))} />

        <View style={s.divider} />

        <Seg label="hr" val={String(value.getHours()).padStart(2,'0')}
          onUp={() => upd(d => d.setHours(value.getHours() >= 23 ? 0 : value.getHours() + 1))}
          onDown={() => upd(d => d.setHours(value.getHours() <= 0 ? 23 : value.getHours() - 1))} />
        <Text style={s.colon}>:</Text>
        <Seg label="min" val={String(value.getMinutes()).padStart(2,'0')}
          onUp={() => upd(d => d.setMinutes(value.getMinutes() >= 59 ? 0 : value.getMinutes() + 1))}
          onDown={() => upd(d => d.setMinutes(value.getMinutes() <= 0 ? 59 : value.getMinutes() - 1))} />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  wrap: { gap: 8 },

  chips: { flexDirection: 'row', gap: 6 },
  chip: { paddingHorizontal: 11, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
  chipOn: { backgroundColor: '#F97316', borderColor: '#F97316' },
  chipTxt: { fontSize: 11, fontWeight: '600', color: C.muted },
  chipTxtOn: { color: '#fff' },

  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
  },
  seg: { alignItems: 'center', gap: 1 },
  segVal: { fontSize: 14, fontWeight: '700', color: C.navy, minWidth: 28, textAlign: 'center' },
  segLabel: { fontSize: 8, fontWeight: '600', color: C.mutedLight, letterSpacing: 0.4, textTransform: 'lowercase', marginTop: 2 },
  arrow: { paddingVertical: 2, paddingHorizontal: 4 },
  arrowTxt: { fontSize: 7, color: C.mutedLight },

  sep: { fontSize: 13, fontWeight: '600', color: C.border, marginHorizontal: 2, marginBottom: 14 },
  colon: { fontSize: 13, fontWeight: '600', color: C.border, marginHorizontal: 2, marginBottom: 14 },
  divider: { width: 1, height: 36, backgroundColor: C.border, marginHorizontal: 8 },
})
