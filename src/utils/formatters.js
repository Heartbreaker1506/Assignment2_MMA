/**
 * Utility functions for formatting currencies, dates, ratings, and strings.
 */

export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return `$${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const truncateText = (text, maxLength = 60) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

export const calculateDiscountPrice = (price, discountPercentage) => {
  const p = Number(price) || 0;
  const d = Number(discountPercentage) || 0;
  if (d <= 0) return p;
  const discounted = p * (1 - d / 100);
  return Math.round(discounted * 100) / 100;
};

