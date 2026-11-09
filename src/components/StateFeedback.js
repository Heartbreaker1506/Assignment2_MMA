// Author: Nguyễn Minh Quân - Student ID: CE180048

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
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
          {title || 'Đang tải dữ liệu...'}
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
      <Text style={styles.iconText}>{isError ? '⚠️' : '📦'}</Text>
      <Text
        style={[
          styles.title,
          { color: isError ? colors.danger : colors.text },
        ]}
      >
        {title || (isError ? 'Đã xảy ra lỗi kết nối' : 'Không có dữ liệu')}
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
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    marginVertical: 20,
    marginHorizontal: 4,
    padding: 22,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 36,
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  actionBtn: {
    minWidth: 135,
  },
});
