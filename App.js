import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';

import { ProductProvider } from './src/context/ProductContext';
import { CartProvider } from './src/context/CartContext';
import { WishlistProvider } from './src/context/WishlistContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { NotificationBanner } from './src/components/NotificationBanner';
import { COLORS } from './src/constants/colors';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar style="dark" backgroundColor={COLORS.card} />
        <ProductProvider>
          <CartProvider>
            <WishlistProvider>
              <NavigationContainer>
                <View style={styles.container}>
                  <AppNavigator />
                  <NotificationBanner />
                </View>
              </NavigationContainer>
            </WishlistProvider>
          </CartProvider>
        </ProductProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.card,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
