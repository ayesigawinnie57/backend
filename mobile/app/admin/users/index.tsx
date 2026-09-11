import { useCallback, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image, TextInput } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import { Users, ShieldCheck, User, Search } from 'lucide-react-native'
import { C } from '../../theme'
import api from '../../lib/api'

type AppUser = {
  id: number
  name: string
  email: string
  phone: string
  avatar: string | null
  is_staff: boolean
  created_at: string
}

export default function AdminUsers() {
  const insets = useSafeAreaInsets()
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useFocusEffect(useCallback(() => {
    setLoading(true)
    api.get<AppUser[]>('/api/auth/admin/users/')
      .then(({ data }) => setUsers(Array.isArray(data) ? data : (data as any).results ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, []))

  const filtered = search.trim()
    ? users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Users size={20} color={C.navy} />
          <Text style={styles.title}>Users</Text>
        </View>
        <Text style={styles.count}>{users.length} total</Text>
      </View>

      <View style={styles.searchWrap}>
        <Search size={15} color={C.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email..."
          placeholderTextColor={C.mutedLight}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading
        ? <ActivityIndicator color={C.green} style={{ marginTop: 40 }} />
        : (
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {filtered.length === 0 && (
              <Text style={styles.empty}>No users found.</Text>
            )}
            {filtered.map(u => (
              <View key={u.id} style={styles.card}>
                {u.avatar
                  ? <Image source={{ uri: u.avatar }} style={styles.avatar} />
                  : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <User size={20} color={C.muted} />
                    </View>
                  )
                }
                <View style={styles.info}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>{u.name}</Text>
                    {u.is_staff && (
                      <View style={styles.staffBadge}>
                        <ShieldCheck size={11} color="#6366f1" />
                        <Text style={styles.staffText}>Staff</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.email} numberOfLines={1}>{u.email}</Text>
                  {u.phone ? <Text style={styles.phone}>{u.phone}</Text> : null}
                </View>
                <Text style={styles.date}>
                  {new Date(u.created_at).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </ScrollView>
        )
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 18, fontWeight: '800', color: C.navy },
  count: { fontSize: 12, fontWeight: '600', color: C.muted },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 16, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 14, color: C.navy },
  list: { paddingHorizontal: 16, paddingBottom: 40, gap: 10 },
  empty: { textAlign: 'center', color: C.muted, marginTop: 40, fontSize: 14 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  avatarPlaceholder: { backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 14, fontWeight: '700', color: C.navy, flexShrink: 1 },
  staffBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#6366f118', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  staffText: { fontSize: 10, fontWeight: '700', color: '#6366f1' },
  email: { fontSize: 12, color: C.muted },
  phone: { fontSize: 11, color: C.mutedLight },
  date: { fontSize: 11, color: C.mutedLight, alignSelf: 'flex-start' },
})
