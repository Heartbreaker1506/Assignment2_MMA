import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

import { ProductProvider } from './src/context/ProductContext';
import { CartProvider } from './src/context/CartContext';
import { WishlistProvider } from './src/context/WishlistContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { NotificationBanner } from './src/components/NotificationBanner';

// ErrorBoundary catches any runtime exceptions and shows error details on screen
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[SMARTSHOP CRITICAL ERROR]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorHeader}>⚠️ Đã bắt được lỗi runtime</Text>
          <Text style={styles.errorMessage}>{this.state.error?.toString()}</Text>
          <ScrollView style={styles.stackBox}>
            <Text style={styles.stackText}>{this.state.error?.stack}</Text>
          </ScrollView>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.retryBtnText}>Tải lại ứng dụng</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ProductProvider>
          <CartProvider>
            <WishlistProvider>
              <NavigationContainer>
                <AppNavigator />
                <NotificationBanner />
                <StatusBar style="dark" />
              </NavigationContainer>
            </WishlistProvider>
          </CartProvider>
        </ProductProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#FFF1F2',
    padding: 24,
    justifyContent: 'center',
  },
  errorHeader: {
    fontSize: 20,
    fontWeight: '800',
    color: '#BE123C',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: '#881337',
    marginBottom: 14,
    fontWeight: '600',
  },
  stackBox: {
    maxHeight: 250,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  stackText: {
    fontSize: 11,
    color: '#4B5563',
  },
  retryBtn: {
    marginTop: 20,
    backgroundColor: '#BE123C',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
