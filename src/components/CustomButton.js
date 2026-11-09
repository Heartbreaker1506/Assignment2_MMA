// Author: Trần Minh Quân - Student ID: CE181730

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Reusable button component supporting multiple style variants and loading state
export const CustomButton = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const { colors } = useTheme();

  // Get button colors based on variant
  const getButtonStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: colors.primaryLight,
          borderColor: colors.primaryLight,
          textColor: colors.primary,
        };
      case 'danger':
        return {
          backgroundColor: colors.danger,
          borderColor: colors.danger,
          textColor: '#FFFFFF',
        };
      case 'success':
        return {
          backgroundColor: colors.success,
          borderColor: colors.success,
          textColor: '#FFFFFF',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.primary,
          borderWidth: 1.5,
          textColor: colors.primary,
        };
      case 'primary':
      default:
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          textColor: '#FFFFFF',
        };
    }
  };

  const btnColor = getButtonStyles();
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: btnColor.backgroundColor,
          borderColor: btnColor.borderColor,
          borderWidth: btnColor.borderWidth || 0,
          opacity: isDisabled ? 0.65 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={btnColor.textColor}
          style={styles.spinner}
        />
      ) : null}
      <Text style={[styles.text, { color: btnColor.textColor }, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  spinner: {
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});
