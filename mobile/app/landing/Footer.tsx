import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { C, LOGO } from '../theme'

export default function Footer() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <Image source={{ uri: LOGO }} style={styles.logo} resizeMode="contain" />
      <Text style={styles.tagline}>Your one-stop destination for everything you need.</Text>

      <View style={styles.links}>
        {['About Us', 'Help Center', 'Returns', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map((item) => (
          <TouchableOpacity key={item} onPress={() => router.push(`/${item.toLowerCase().replace(/ /g, '-')}` as any)}>
            <Text style={styles.link}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.copy}>© {new Date().getFullYear()} Majo Gadgets. All rights reserved.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { backgroundColor: C.navy, paddingHorizontal: 20, paddingVertical: 40, alignItems: 'center' },
  logo: { width: 140, height: 48, marginBottom: 12 },
  tagline: { fontSize: 13, color: C.mutedLight, textAlign: 'center', marginBottom: 24, maxWidth: 260 },
  links: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 24 },
  link: { fontSize: 13, color: C.mutedLight },
  copy: { fontSize: 12, color: C.muted },
})
