import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/colors';
import { notificationService } from '../services/notificationService';

export const NotificationBanner = () => {
  const [activeNotification, setActiveNotification] = useState(null);
  const [slideAnim] = useState(new Animated.Value(-120));

  useEffect(() => {
    const unsubscribe = notificationService.addListener((notif) => {
      setActiveNotification(notif);
      Animated.spring(slideAnim, {
        toValue: 20,
        useNativeDriver: true,
        speed: 12,
        bounciness: 6,
      }).start();

      // Auto dismiss after 4 seconds
      const timer = setTimeout(() => {
        dismiss();
      }, 4500);

      return () => clearTimeout(timer);
    });

    return () => unsubscribe();
  }, [slideAnim]);

  const dismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -120,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setActiveNotification(null);
    });
  };

  if (!activeNotification) return null;

  const isOrder = activeNotification.type === 'order';

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity
        style={[styles.banner, isOrder ? styles.orderBanner : styles.promoBanner]}
        onPress={dismiss}
        activeOpacity={0.9}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name={isOrder ? 'checkmark-circle' : 'notifications'}
            size={24}
            color={COLORS.white}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>{activeNotification.title}</Text>
          <Text style={styles.body} numberOfLines={2}>{activeNotification.body}</Text>
        </View>

        <TouchableOpacity onPress={dismiss} style={styles.closeBtn}>
          <Ionicons name="close" size={18} color="rgba(255, 255, 255, 0.8)" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    ...SHADOWS.large,
  },
  orderBanner: {
    backgroundColor: '#059669', // Emerald
  },
  promoBanner: {
    backgroundColor: COLORS.primary,
  },
  iconContainer: {
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  title: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  body: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8,
  },
});
