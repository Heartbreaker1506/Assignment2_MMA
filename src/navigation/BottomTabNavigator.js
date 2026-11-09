import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ProductListScreen } from '../screens/ProductListScreen';
import { CartScreen } from '../screens/CartScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { AIScreen } from '../screens/AIScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useCart } from '../context/CartContext';
import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  const { itemCount } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'grid-outline';
          if (route.name === 'CatalogTab') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'WishlistTab') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'CartTab') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'AITab') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'SettingsTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="CatalogTab"
        component={ProductListScreen}
        options={{ tabBarLabel: 'Sản phẩm' }}
      />

      <Tab.Screen
        name="WishlistTab"
        component={WishlistScreen}
        options={{ tabBarLabel: 'Yêu thích' }}
      />

      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          tabBarLabel: 'Giỏ hàng',
          ...(itemCount > 0 ? { tabBarBadge: itemCount > 99 ? '99+' : itemCount } : {}),
        }}
      />

      <Tab.Screen
        name="AITab"
        component={AIScreen}
        options={{ tabBarLabel: 'Hỏi AI' }}
      />

      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Cài đặt' }}
      />
    </Tab.Navigator>
  );
};
