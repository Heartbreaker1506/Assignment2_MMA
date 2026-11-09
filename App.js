// Tác giả: Nguyễn Minh Quân - MSSV: CE180048 - Lớp: MMA301
// Điểm khởi đầu cấu hình Navigation và Provider cho toàn bộ ứng dụng SmartStore

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Các Context Providers quản lý trạng thái toàn cục
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { CartProvider } from './src/context/CartContext';
import { ShopProvider } from './src/context/ShopContext';

// Thành phần hiển thị thông báo nội bộ ứng dụng (In-app notification banner)
import { NotificationBanner } from './src/components/NotificationBanner';

// Các màn hình chính của ứng dụng SmartStore (đã đổi tên tệp độc lập, riêng biệt)
import {
  ProductCatalogScreen,
  ProductInfoScreen,
  ShoppingCartScreen,
  CloudHistoryScreen,
  GeminiAdvisorScreen,
  AppSettingsScreen,
} from './src/screens';

const Stack = createNativeStackNavigator();

// Điều hướng chính được bao bọc bởi ThemeProvider để hỗ trợ giao diện Sáng / Tối linh hoạt
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
              fontWeight: '800',
              fontSize: 16,
              letterSpacing: 0.3,
            },
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        >
          {/* Màn hình 1: Danh mục sản phẩm (Catalog) */}
          <Stack.Screen
            name="ProductList"
            component={ProductCatalogScreen}
            options={{ title: 'SmartStore' }}
          />

          {/* Màn hình 2: Chi tiết thông tin sản phẩm */}
          <Stack.Screen
            name="ProductDetail"
            component={ProductInfoScreen}
            options={{ title: 'Chi Tiết Sản Phẩm' }}
          />

          {/* Màn hình 3: Giỏ hàng & Thanh toán đơn hàng */}
          <Stack.Screen
            name="Cart"
            component={ShoppingCartScreen}
            options={{ title: 'Giỏ Hàng & Thanh Toán' }}
          />

          {/* Màn hình 4: Đồng bộ Firebase Cloud (Yêu thích & Đơn hàng đã đặt) */}
          <Stack.Screen
            name="SavedOrders"
            component={CloudHistoryScreen}
            options={{ title: 'Firebase Cloud Storage' }}
          />

          {/* Màn hình 5: Trợ lý mua sắm thông minh Gemini AI */}
          <Stack.Screen
            name="AiAssistant"
            component={GeminiAdvisorScreen}
            options={{ title: 'Trợ Lý Gemini AI' }}
          />

          {/* Màn hình 6: Cài đặt hệ thống, Thông báo & Bảng mô phỏng kiểm thử */}
          <Stack.Screen
            name="NotificationSettings"
            component={AppSettingsScreen}
            options={{ title: 'Cài Đặt & Test Matrix' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

// Điểm xuất gốc bao bọc tất cả Provider
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
