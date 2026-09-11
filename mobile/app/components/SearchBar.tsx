import { useState, useRef } from 'react'
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Image, Animated } from 'react-native'
import { Search, X, TrendingUp } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import { C } from '../theme'
import { products } from '../data'

const SUGGESTIONS = ['Arduino', 'Sensor', 'Module', 'Battery', 'Charger']

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const router = useRouter()
  const inputRef = useRef<TextInput>(null)

  const results = query.trim().length > 0
    ? products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : []

  const showDropdown = focused && (results.length > 0 || query.trim().length === 0)

  const submit = () => {
    if (query.trim()) {
      router.push(`/shop?q=${query}` as any)
      setQuery('')
      inputRef.current?.blur()
    }
  }

  return (
    <View style={styles.wrapper}>
      {/* Input */}
      <View style={[styles.inputRow, focused && styles.inputRowFocused]}>
        <TouchableOpacity onPress={() => inputRef.current?.focus()} style={styles.searchIconWrap}>
          <Search size={18} color={focused ? C.navy : C.muted} />
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Search products..."
          placeholderTextColor={C.mutedLight}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={submit}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
        />

        {query.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={() => { setQuery(''); inputRef.current?.focus() }}>
            <View style={styles.clearCircle}>
              <X size={11} color="#fff" strokeWidth={3} />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Dropdown */}
      {showDropdown && (
        <View style={styles.dropdown}>
          {results.length > 0 ? (
            results.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.resultItem}
                onPress={() => {
                  router.push(`/shop/${product.id}` as any)
                  setQuery('')
                }}
              >
                <View style={styles.resultIconWrap}>
                  {product.image
                    ? <Image source={{ uri: product.image }} style={styles.thumb} resizeMode="cover" />
                    : <Search size={14} color={C.muted} />
                  }
                </View>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName} numberOfLines={1}>{product.name}</Text>
                  <Text style={styles.resultPrice}>UGX {product.price.toLocaleString()}</Text>
                </View>
                <TouchableOpacity onPress={() => setQuery(product.name)} style={styles.fillBtn}>
                  <Text style={styles.fillArrow}>↗</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          ) : (
            <>
              <Text style={styles.trendingLabel}>Trending searches</Text>
              {SUGGESTIONS.map(s => (
                <TouchableOpacity key={s} style={styles.resultItem} onPress={() => setQuery(s)}>
                  <View style={styles.resultIconWrap}>
                    <TrendingUp size={14} color={C.muted} />
                  </View>
                  <Text style={styles.suggestionText}>{s}</Text>
                  <TouchableOpacity onPress={() => setQuery(s)} style={styles.fillBtn}>
                    <Text style={styles.fillArrow}>↗</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: C.card, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border, zIndex: 100 },

  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.bg,
    borderRadius: 999,
    borderWidth: 1.5, borderColor: C.border,
    height: 48,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  inputRowFocused: {
    borderColor: C.navy,
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },

  searchIconWrap: { width: 44, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, fontSize: 15, color: C.navy, height: 48 },
  clearBtn: { width: 44, alignItems: 'center', justifyContent: 'center' },
  clearCircle: { width: 18, height: 18, borderRadius: 9, backgroundColor: C.mutedLight, alignItems: 'center', justifyContent: 'center' },

  dropdown: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1, borderColor: C.border,
    marginTop: 6,
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 6,
  },
  trendingLabel: { fontSize: 11, fontWeight: '700', color: C.mutedLight, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 },

  resultItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: C.border, gap: 12 },
  resultIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  thumb: { width: 36, height: 36 },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 14, fontWeight: '600', color: C.navy },
  resultPrice: { fontSize: 12, color: C.green, fontWeight: '600', marginTop: 1 },
  suggestionText: { flex: 1, fontSize: 14, color: C.navy },
  fillBtn: { padding: 4 },
  fillArrow: { fontSize: 16, color: C.mutedLight },
})
