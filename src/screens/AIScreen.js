import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { geminiService } from '../services/geminiService';
import { ValidatedAICard } from '../components/ValidatedAICard';
import { Header } from '../components/Header';
import { COLORS, SHADOWS } from '../constants/colors';

const SAMPLE_PROMPTS = [
  '💻 Laptop mỏng nhẹ pin trâu giá hợp lý',
  '📱 Smartphone chụp ảnh đẹp đánh giá cao',
  '🛋️ Đồ nội thất trang trí nhà cửa đẹp',
  '⚡ Tìm sản phẩm đang giảm giá nhiều nhất',
];

export const AIScreen = ({ route, navigation }) => {
  const { products } = useProducts();
  const { addToCart } = useCart();

  const [prompt, setPrompt] = useState(route.params?.initialPrompt || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Auto execute if initialPrompt is passed from ProductDetailScreen
  useEffect(() => {
    if (route.params?.initialPrompt && !result && !loading) {
      handleAskAI(route.params.initialPrompt);
    }
  }, [route.params?.initialPrompt]);

  const handleAskAI = async (queryText) => {
    const query = (queryText || prompt).trim();
    if (!query) return;

    setLoading(true);
    setError(null);

    try {
      // Pass query AND real catalog products for grounded advice + strict validation
      const aiResponse = await geminiService.askShoppingAdvisor(query, products);
      setResult(aiResponse);
    } catch (err) {
      console.error('[AIScreen] Error querying Gemini:', err);
      setError(err.message || 'Không thể kết nối tới Gemini AI. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        title="Trợ lý Mua sắm Gemini AI"
        subtitle="Tư vấn chuẩn xác dựa trên kho hàng thực tế"
        rightIcon="settings-outline"
        onRightPress={() => navigation.navigate('SettingsTab')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Intro Banner */}
        <View style={styles.introCard}>
          <View style={styles.introHeader}>
            <View style={styles.geminiBadge}>
              <Ionicons name="sparkles" size={16} color={COLORS.white} />
              <Text style={styles.geminiBadgeText}>Gemini 1.5 Flash</Text>
            </View>
            <View style={styles.groundedBadge}>
              <Ionicons name="shield-checkmark" size={12} color={COLORS.success} />
              <Text style={styles.groundedText}>Grounded with Catalog</Text>
            </View>
          </View>
          <Text style={styles.introTitle}>Bạn cần tìm sản phẩm như thế nào?</Text>
          <Text style={styles.introDesc}>
            Gemini sẽ đọc dữ liệu từ kho sản phẩm thực tế của SmartShop để đưa ra lời khuyên khách quan và chọn lọc sản phẩm thích hợp nhất.
          </Text>

          {/* Quick Suggestion Chips */}
          <Text style={styles.sampleTitle}>Gợi ý câu hỏi nhanh:</Text>
          <View style={styles.sampleChipsContainer}>
            {SAMPLE_PROMPTS.map((sample, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.sampleChip}
                onPress={() => {
                  setPrompt(sample);
                  handleAskAI(sample);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.sampleChipText}>{sample}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.loadingTitle}>Gemini AI đang suy nghĩ...</Text>
            <Text style={styles.loadingSubtitle}>
              Đang phân tích {products.length} sản phẩm trong kho hàng để tìm đề xuất tối ưu.
            </Text>
          </View>
        )}

        {/* Error Card */}
        {error && !loading && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={28} color={COLORS.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => handleAskAI()}>
              <Text style={styles.retryBtnText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* AI Results & Validated Matching Section */}
        {result && !loading && (
          <View style={styles.resultContainer}>
            {/* AI Advice Speech Bubble */}
            <View style={styles.adviceBubble}>
              <View style={styles.advisorAvatar}>
                <Ionicons name="sparkles" size={18} color={COLORS.accent} />
              </View>
              <View style={styles.adviceContent}>
                <Text style={styles.advisorName}>Lời khuyên từ SmartShop AI</Text>
                <Text style={styles.adviceText}>{result.advice}</Text>
                {result.matchingReason ? (
                  <Text style={styles.matchingReason}>📌 {result.matchingReason}</Text>
                ) : null}
              </View>
            </View>

            {/* Validation & Anti-Hallucination Status Banner (Mandatory R10) */}
            <View
              style={[
                styles.validationBanner,
                result.hadHallucinations ? styles.validationWarning : styles.validationSuccess,
              ]}
            >
              <Ionicons
                name={result.hadHallucinations ? 'warning-outline' : 'shield-checkmark-outline'}
                size={18}
                color={result.hadHallucinations ? '#B45309' : '#047857'}
              />
              <Text
                style={[
                  styles.validationText,
                  { color: result.hadHallucinations ? '#B45309' : '#047857' },
                ]}
              >
                {result.validationMessage}
              </Text>
            </View>

            {/* Validated Products List */}
            <Text style={styles.recommendedTitle}>
              Sản phẩm đề xuất ({result.validatedProducts.length})
            </Text>

            {result.validatedProducts.map((prod) => (
              <ValidatedAICard
                key={`val-${prod.id}`}
                product={prod}
                reason={result.matchingReason}
                onSelect={(p) =>
                  navigation.navigate('ProductDetail', { productId: p.id, product: p })
                }
                onAddToCart={(p) => addToCart(p, 1)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Input Bar at Bottom */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Nhập nhu cầu mua sắm hoặc hỏi so sánh..."
          value={prompt}
          onChangeText={setPrompt}
          onSubmitEditing={() => handleAskAI()}
          returnKeyType="send"
          placeholderTextColor={COLORS.textLight}
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!prompt.trim() || loading) && styles.sendButtonDisabled]}
          onPress={() => handleAskAI()}
          disabled={!prompt.trim() || loading}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-up" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  introCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  geminiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  geminiBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  groundedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  groundedText: {
    color: '#065F46',
    fontSize: 10,
    fontWeight: '600',
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  introDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  sampleTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 14,
    marginBottom: 6,
  },
  sampleChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sampleChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sampleChipText: {
    fontSize: 12,
    color: COLORS.text,
  },
  loadingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginVertical: 12,
    ...SHADOWS.small,
  },
  loadingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.accent,
    marginTop: 12,
  },
  loadingSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  errorCard: {
    backgroundColor: COLORS.dangerLight,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.danger,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  resultContainer: {
    marginTop: 4,
  },
  adviceBubble: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    marginBottom: 12,
    ...SHADOWS.small,
  },
  advisorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  adviceContent: {
    flex: 1,
  },
  advisorName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accent,
    marginBottom: 4,
  },
  adviceText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
  matchingReason: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
  },
  validationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    gap: 8,
  },
  validationSuccess: {
    backgroundColor: COLORS.successLight,
    borderColor: '#A7F3D0',
    borderWidth: 1,
  },
  validationWarning: {
    backgroundColor: COLORS.warningLight,
    borderColor: '#FDE68A',
    borderWidth: 1,
  },
  validationText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
  recommendedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
});
