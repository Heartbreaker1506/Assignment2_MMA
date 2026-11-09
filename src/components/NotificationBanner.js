// Author: Trần Minh Quân - Student ID: CE181730

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useShop } from '../context/ShopContext';

// Floating in-app notification banner displayed when a business event triggers
export const NotificationBanner = () => {
  const { colors } = useTheme();
  const { inAppBanner, dismissBanner } = useShop();

  if (!inAppBanner) return null;

  return (
    <View
      style={[
        styles.bannerContainer,
        {
          backgroundColor: colors.primary,
          borderColor: colors.primaryLight,
        },
      ]}
    >
      <View style={styles.textCol}>
        <Text style={styles.badgeText}>🔔 THÔNG BÁO HỆ THỐNG (R09)</Text>
        <Text style={styles.titleText} numberOfLines={1}>
          {inAppBanner.title}
        </Text>
        <Text style={styles.bodyText} numberOfLines={2}>
          {inAppBanner.body}
        </Text>
      </View>

      <TouchableOpacity style={styles.closeBtn} onPress={dismissBanner}>
        <Text style={styles.closeBtnText}>Đóng</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    marginTop: 6,
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 4,
  },
  textCol: {
    flex: 1,
    marginRight: 10,
  },
  badgeText: {
    color: '#DBEAFE',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 2,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  bodyText: {
    color: '#EFF6FF',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
