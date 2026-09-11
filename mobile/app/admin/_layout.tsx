import { Tabs } from 'expo-router'
import { LayoutDashboard, Package, Grid2X2, ShoppingBag, Zap, Users, CreditCard } from 'lucide-react-native'
import { C } from '../theme'

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#F97316',
        tabBarInactiveTintColor: C.muted,
        tabBarStyle: { borderTopColor: C.border, backgroundColor: C.card },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarScrollEnabled: true,
        tabBarItemStyle: { minWidth: 70 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <LayoutDashboard size={20} color={color} /> }}
      />
      <Tabs.Screen
        name="products/index"
        options={{ title: 'Products', tabBarIcon: ({ color }) => <Package size={20} color={color} /> }}
      />
      <Tabs.Screen
        name="flashsales/index"
        options={{ title: 'Flash Sales', tabBarIcon: ({ color }) => <Zap size={20} color={color} fill={color} /> }}
      />
      <Tabs.Screen
        name="categories/index"
        options={{ title: 'Categories', tabBarIcon: ({ color }) => <Grid2X2 size={20} color={color} /> }}
      />
      <Tabs.Screen
        name="orders/index"
        options={{ title: 'Orders', tabBarIcon: ({ color }) => <ShoppingBag size={20} color={color} /> }}
      />
      <Tabs.Screen
        name="users/index"
        options={{ title: 'Users', tabBarIcon: ({ color }) => <Users size={20} color={color} /> }}
      />
      <Tabs.Screen
        name="payments/index"
        options={{ title: 'Payments', tabBarIcon: ({ color }) => <CreditCard size={20} color={color} /> }}
      />
      <Tabs.Screen name="products/add" options={{ href: null }} />
      <Tabs.Screen name="products/[id]" options={{ href: null }} />
      <Tabs.Screen name="categories/add" options={{ href: null }} />
      <Tabs.Screen name="categories/[id]" options={{ href: null }} />
      <Tabs.Screen name="orders/[id]" options={{ href: null }} />
      <Tabs.Screen name="flashsales/add" options={{ href: null }} />
    </Tabs>
  )
}
