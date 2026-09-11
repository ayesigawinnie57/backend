import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { ArrowLeft, Bell, LockKeyhole, UserRound } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { C } from './theme'

export default function SettingsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/' as any)} accessibilityLabel="Go back">
          <ArrowLeft size={22} color={C.navy} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.list}>
        <TouchableOpacity style={styles.row}>
          <UserRound size={20} color={C.navy} />
          <Text style={styles.rowText}>My Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Bell size={20} color={C.navy} />
          <Text style={styles.rowText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <LockKeyhole size={20} color={C.navy} />
          <Text style={styles.rowText}>Privacy and security</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  title: { color: C.navy, fontSize: 18, fontWeight: '800' },
  headerSpacer: { width: 22 },
  list: { padding: 16, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 18, borderWidth: 1, borderColor: C.border },
  rowText: { color: C.navy, fontSize: 15, fontWeight: '600' },
})