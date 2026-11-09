// Author: Nguyễn Minh Quân - Student ID: CE180048

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { CustomButton } from './CustomButton';

// Reusable UI component for displaying loading, empty, and error states with retry actions
export const StateFeedback = ({
  type = 'empty', // 'loading' | 'empty' | 'error'
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  const { colors } = useTheme();

  if (type === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.title, { color: colors.text, marginTop: 14 }]}>
          {title || 'Đang đồng bộ dữ liệu...'}
        </Text>
        {message ? (
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {message}
          </Text>
        ) : null}
      </View>
    );
  }

  const isError = type === 'error';

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: isError ? colors.dangerLight : colors.surface,
          borderColor: isError ? colors.danger : colors.border,
        },
      ]}
    >
      <Text style={styles.iconText}>{isError ? '⚡' : '✨'}</Text>
      <Text
        style={[
          styles.title,
          { color: isError ? colors.danger : colors.text },
        ]}
      >
        {title || (isError ? 'Đã xảy ra sự cố kết nối' : 'Không tìm thấy dữ liệu')}
      </Text>
      {message ? (
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
      ) : null}

      <View style={styles.actionsRow}>
        {onAction ? (
          <CustomButton
            title={actionLabel || (isError ? 'Thử lại ngay' : 'Làm mới')}
            onPress={onAction}
            variant={isError ? 'danger' : 'primary'}
            style={styles.actionBtn}
          />
        ) : null}

        {onSecondaryAction ? (
          <CustomButton
            title={secondaryActionLabel || 'Tùy chọn khác'}
            onPress={onSecondaryAction}
            variant="outline"
            style={styles.actionBtn}
          />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 56,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    marginVertical: 18,
    marginHorizontal: 4,
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  iconText: {
    fontSize: 40,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  actionBtn: {
    minWidth: 140,
  },
});
