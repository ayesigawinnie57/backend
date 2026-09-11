import { ScrollView, StatusBar } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Products from './landing/Products'
import FlashDeals from './landing/FlashDeals'
import Recommended from './landing/Recommended'
import AdSection from './landing/AdSection'

export default function Index() {
  const insets = useSafeAreaInsets()

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 88 }}
      >
        <Products />
        <AdSection />
        <FlashDeals />
        <Recommended />
        <AdSection isFinal />
        <Products title="New Products" subtitle="Fresh arrivals worth discovering" />
      </ScrollView>
    </>
  )
}
