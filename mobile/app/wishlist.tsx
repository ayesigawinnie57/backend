import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Heart, ArrowLeft, Trash2 } from 'lucide-react-native'
import ProductCard from './components/ProductCard'
import { useWishlist } from './lib/WishlistContext'
import { C } from './theme'

export default function WishlistPage() {
  const router = useRouter()
  const { items, removeFromWishlist } = useWishlist()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/' as any)} accessibilityLabel="Go back">
          <ArrowLeft size={22} color={C.navy} />
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <Heart size={19} color="#ef4444" fill="#ef4444" />
          <Text style={styles.title}>Wishlist</Text>
        </View>
        <Text style={styles.count}>{items.length}</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Heart size={44} color={C.border} />
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptyText}>Save products you love and find them here later.</Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/shop' as any)}>
            <Text style={styles.shopButtonText}>Explore Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.grid}>
            {items.map(product => (
              <View key={product.id} style={styles.item}>
                <ProductCard product={product} />
                <TouchableOpacity style={styles.removeButton} onPress={() => removeFromWishlist(product.id)} accessibilityLabel={`Remove ${product.name} from wishlist`}>
                  <Trash2 size={14} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  title: { color: C.navy, fontSize: 18, fontWeight: '800' },
  count: { minWidth: 22, textAlign: 'center', color: C.green, fontSize: 13, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 32 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: { position: 'relative' },
  removeButton: { position: 'absolute', right: 5, bottom: 58, width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, elevation: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyTitle: { color: C.navy, fontSize: 20, fontWeight: '800', marginTop: 16 },
  emptyText: { color: C.muted, fontSize: 13, textAlign: 'center', marginTop: 8 },
  shopButton: { backgroundColor: C.green, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12, marginTop: 20 },
  shopButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
})