// Author: Nguyễn Minh Quân - Student ID: CE180048

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
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
          backgroundColor: colors.surface,
          borderColor: colors.primary,
        },
      ]}
    >
      <View style={styles.textCol}>
        <View style={styles.badgeRow}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>
            🔔 THÔNG BÁO HỆ THỐNG
          </Text>
        </View>
        <Text style={[styles.titleText, { color: colors.text }]} numberOfLines={1}>
          {inAppBanner.title}
        </Text>
        <Text style={[styles.bodyText, { color: colors.textSecondary }]} numberOfLines={2}>
          {inAppBanner.body}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.closeBtn, { backgroundColor: colors.primaryLight }]}
        onPress={dismissBanner}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[styles.closeBtnText, { color: colors.primary }]}>Đóng</Text>
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
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  },
  textCol: {
    flex: 1,
    marginRight: 10,
  },
  badgeRow: {
    marginBottom: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '800',
  },
  bodyText: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  closeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  closeBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
