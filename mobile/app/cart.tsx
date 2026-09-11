import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react-native'
import { useCart } from './lib/CartContext'
import { C } from './theme'

const DELIVERY_FEE = 5000
export default function CartScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { items, totalPrice, totalItems, updateQuantity, removeFromCart, clearCart } = useCart()
  const grandTotal = totalPrice + (items.length > 0 ? DELIVERY_FEE : 0)

  if (items.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/' as any)}><ArrowLeft size={22} color={C.navy} /></TouchableOpacity>
          <Text style={styles.title}>My Cart</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.empty}>
          <ShoppingBag size={64} color={C.mutedLight} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add items to get started</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/shop' as any)}>
            <Text style={styles.shopBtnText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/' as any)}><ArrowLeft size={22} color={C.navy} /></TouchableOpacity>
        <Text style={styles.title}>My Cart ({totalItems})</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearText}>Clear all</Text>
        </TouchableOpacity>
      </View>

      {/* List — takes remaining space */}
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {item.image
              ? <Image source={{ uri: item.image }} style={styles.thumb} resizeMode="cover" />
              : <View style={[styles.thumb, styles.thumbPlaceholder]} />
            }
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.price}>UGX {item.price.toLocaleString()}</Text>
              {item.originalPrice && (
                <Text style={styles.original}>UGX {item.originalPrice.toLocaleString()}</Text>
              )}
              <View style={styles.qtyRow}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                  <Minus size={14} color={C.navy} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                  <Plus size={14} color={C.navy} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.rightCol}>
              <Text style={styles.subtotal}>UGX {(item.price * item.quantity).toLocaleString()}</Text>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => removeFromCart(item.id)}>
                <Trash2 size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={[styles.summary, { paddingBottom: insets.bottom + 76 }]}> 
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>UGX {totalPrice.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={styles.summaryValue}>UGX {DELIVERY_FEE.toLocaleString()}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>UGX {grandTotal.toLocaleString()}</Text>
            </View>
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.continueBtn} onPress={() => router.push('/shop' as any)}>
                <Text style={styles.continueBtnText}>Continue Shopping</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.checkoutBtn} onPress={() => router.push('/checkout' as any)}>
                <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  title: { fontSize: 18, fontWeight: '800', color: C.navy },
  clearText: { fontSize: 13, fontWeight: '600', color: '#ef4444' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: C.navy },
  emptySubtitle: { fontSize: 14, color: C.muted },
  shopBtn: { backgroundColor: C.green, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, marginTop: 8 },
  shopBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  listContent: { padding: 12, paddingBottom: 0, gap: 10 },
  row: { flexDirection: 'row', backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 10, gap: 10 },
  thumb: { width: 72, height: 72, borderRadius: 9 },
  thumbPlaceholder: { backgroundColor: C.bg },
  info: { flex: 1, gap: 4 },
  name: { fontSize: 12, fontWeight: '700', color: C.navy, lineHeight: 16 },
  price: { fontSize: 12, fontWeight: '800', color: C.green },
  original: { fontSize: 10, color: C.mutedLight, textDecorationLine: 'line-through' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  qtyBtn: { width: 26, height: 26, borderRadius: 7, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  qtyText: { fontSize: 13, fontWeight: '700', color: C.navy, minWidth: 18, textAlign: 'center' },
  rightCol: { alignItems: 'flex-end', justifyContent: 'space-between' },
  subtotal: { fontSize: 11, fontWeight: '800', color: C.navy, maxWidth: 96, textAlign: 'right' },
  deleteBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#ef444418', alignItems: 'center', justifyContent: 'center' },

  summary: { backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border, paddingHorizontal: 16, paddingTop: 14, marginTop: 4, gap: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: C.muted, fontWeight: '500' },
  summaryValue: { fontSize: 12, color: C.navy, fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8, marginTop: 2 },
  totalLabel: { fontSize: 14, fontWeight: '800', color: C.navy },
  totalValue: { fontSize: 16, fontWeight: '800', color: C.green },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 4, alignItems: 'stretch' },
  checkoutBtn: { flex: 1, backgroundColor: C.navy, borderRadius: 10, minHeight: 42, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  checkoutText: { color: '#fff', fontSize: 11, fontWeight: '800', textAlign: 'center' },
  continueBtn: { flex: 1, paddingHorizontal: 4, minHeight: 42, alignItems: 'center', justifyContent: 'center' },
  continueBtnText: { color: C.green, fontSize: 11, fontWeight: '700', textAlign: 'center' },
})
