// Author: Nguyễn Minh Quân - Student ID: CE180048

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Context Providers
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { CartProvider } from './src/context/CartContext';
import { ShopProvider } from './src/context/ShopContext';

// In-app notification banner component
import { NotificationBanner } from './src/components/NotificationBanner';

// App Screens
import { ProductListScreen } from './src/screens/ProductListScreen';
import { ProductDetailScreen } from './src/screens/ProductDetailScreen';
import { CartScreen } from './src/screens/CartScreen';
import { SavedOrdersScreen } from './src/screens/SavedOrdersScreen';
import { AiAssistantScreen } from './src/screens/AiAssistantScreen';
import { NotificationSettingsScreen } from './src/screens/NotificationSettingsScreen';

const Stack = createNativeStackNavigator();

// Main navigator wrapped inside ThemeProvider to support light/dark mode headers
const AppNavigator = () => {
  const { colors, isDarkMode } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <NotificationBanner />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="ProductList"
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.surface,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 17,
            },
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        >
          {/* Screen 1: Product Catalog */}
          <Stack.Screen
            name="ProductList"
            component={ProductListScreen}
            options={{ title: 'SmartShop - Danh Mục Sản Phẩm' }}
          />

          {/* Screen 2: Product Detail */}
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailScreen}
            options={{ title: 'Chi Tiết Sản Phẩm' }}
          />

          {/* Screen 3: Shopping Cart & Checkout */}
          <Stack.Screen
            name="Cart"
            component={CartScreen}
            options={{ title: 'Giỏ Hàng & Thanh Toán' }}
          />

          {/* Screen 4: Saved Wishlist & Order History (Firebase) */}
          <Stack.Screen
            name="SavedOrders"
            component={SavedOrdersScreen}
            options={{ title: 'Firebase Wishlist & Đơn Hàng' }}
          />

          {/* Screen 5: Gemini AI Product Assistant */}
          <Stack.Screen
            name="AiAssistant"
            component={AiAssistantScreen}
            options={{ title: 'Trợ Lý Mua Sắm Gemini AI' }}
          />

          {/* Screen 6: Notification Settings & Test Simulator */}
          <Stack.Screen
            name="NotificationSettings"
            component={NotificationSettingsScreen}
            options={{ title: 'Thông Báo & Kiểm Thử Hệ Thống' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ShopProvider>
          <CartProvider>
            <AppNavigator />
          </CartProvider>
        </ShopProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
