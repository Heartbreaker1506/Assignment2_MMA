// =========================================================================
// Dự án: SmartStore - Ứng dụng Thương mại Điện tử Tích hợp (MMA301 Assignment 2)
// Sinh viên thực hiện: Nguyễn Minh Quân - MSSV: CE180048
// Tệp: src/screens/ai/AiAssistantScreen.js - Màn hình 5: Trợ lý Mua sắm Gemini AI & Chống ảo giác (R10)
// =========================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { askGeminiProductAssistant } from '../../services/aiService';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useShop } from '../../context/ShopContext';
import { formatPrice } from '../../utils/storage';
import { CustomButton } from '../../components/CustomButton';

// Các mẫu câu hỏi gợi ý nhanh theo nhu cầu thực tế
const QUICK_PROMPTS = [
  {
    label: '📱 Điện thoại Flagship',
    prompt: 'Tư vấn điện thoại cấu hình mạnh, pin trâu và camera chụp sắc nét nhất.',
    budget: '',
    mode: 'recommend',
  },
  {
    label: '💻 Laptop SV CNTT',
    prompt: 'So sánh các mẫu laptop mỏng nhẹ phù hợp cho sinh viên lập trình.',
    budget: '1500',
    mode: 'compare',
  },
  {
    label: '🎧 Phụ kiện dưới $300',
    prompt: 'Gợi ý phụ kiện công nghệ hoặc âm thanh chất lượng tốt dưới $300.',
    budget: '300',
    mode: 'recommend',
  },
];

export const AiAssistantScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { cartItems, addToCart } = useCart();
  const {
    knownCatalog,
    simulationFlags,
    toggleSimulationFlag,
  } = useShop();

  const [mode, setMode] = useState('recommend'); // 'recommend' | 'compare'
  const [userPrompt, setUserPrompt] = useState(
    route?.params?.initialPrompt ||
      'Tư vấn cho tôi sản phẩm công nghệ có đánh giá cao và đáng tiền nhất trong cửa hàng.'
  );
  const [budgetText, setBudgetText] = useState(
    route?.params?.initialBudget ? String(route.params.initialBudget) : ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  useEffect(() => {
    if (route?.params?.initialPrompt) {
      setUserPrompt(route.params.initialPrompt);
    }
    if (route?.params?.initialBudget) {
      setBudgetText(String(route.params.initialBudget));
    }
  }, [route?.params?.initialPrompt, route?.params?.initialBudget]);

  // Gửi câu hỏi và ngữ cảnh Catalog sang Gemini AI kèm bộ lọc chống ảo giác
  const handleAskAi = async (overrideFlags = {}) => {
    setIsLoading(true);
    const numericBudget = Number(budgetText) > 0 ? Number(budgetText) : 0;
    const useHallucinationSim =
      overrideFlags.simulateHallucination !== undefined
        ? overrideFlags.simulateHallucination
        : simulationFlags.simulateAiHallucination;

    const response = await askGeminiProductAssistant({
      userPrompt,
      budgetLimit: numericBudget,
      catalogProducts: knownCatalog,
      cartItems,
      mode,
      simulateHallucination: useHallucinationSim,
    });

    setAiResult(response);
    setIsLoading(false);
  };

  const applyQuickPreset = (preset) => {
    setMode(preset.mode);
    setUserPrompt(preset.prompt);
    setBudgetText(preset.budget);
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Banner giới thiệu cơ chế bảo vệ chống ảo giác (Anti-Hallucination Guard) */}
      <View
        style={[
          styles.contextBanner,
          {
            backgroundColor: colors.purpleLight,
            borderColor: colors.purple,
          },
        ]}
      >
        <Text style={[styles.contextTitle, { color: colors.purple }]}>
          🤖 Gemini AI Smart Advisor (Anti-Hallucination Guard)
        </Text>
        <Text style={[styles.contextDesc, { color: colors.text }]}>
          Ngữ cảnh thiết bị: Đã nạp{' '}
          <Text style={{ fontWeight: '800' }}>{knownCatalog.length}</Text> sản
          phẩm thực từ Catalog &{' '}
          <Text style={{ fontWeight: '800' }}>{cartItems.length}</Text> món trong giỏ.
          Mọi kết quả đều được kiểm chứng qua{' '}
          <Text style={{ fontWeight: '800' }}>validateAiOutputAgainstCatalog()</Text>{' '}
          để ngăn chặn sản phẩm ảo giác (Test Case 14).
        </Text>
      </View>

      {/* Form nhập câu hỏi, chế độ tư vấn và ngân sách */}
      <View
        style={[
          styles.formCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {/* Nút chọn chế độ: Tư vấn gợi ý vs So sánh thông minh */}
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              {
                backgroundColor:
                  mode === 'recommend' ? colors.primary : colors.background,
                borderColor:
                  mode === 'recommend' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setMode('recommend')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modeBtnText,
                { color: mode === 'recommend' ? '#FFFFFF' : colors.text },
              ]}
            >
              💡 Tư vấn Chọn mua
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeBtn,
              {
                backgroundColor:
                  mode === 'compare' ? colors.primary : colors.background,
                borderColor:
                  mode === 'compare' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setMode('compare')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modeBtnText,
                { color: mode === 'compare' ? '#FFFFFF' : colors.text },
              ]}
            >
              ⚖️ So sánh Thông minh
            </Text>
          </TouchableOpacity>
        </View>

        {/* Các nhãn câu hỏi nhanh */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Gợi ý nhanh theo chủ đề:
        </Text>
        <View style={styles.presetsRow}>
          {QUICK_PROMPTS.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.presetChip,
                {
                  backgroundColor: colors.primaryLight,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => applyQuickPreset(item)}
              activeOpacity={0.7}
            >
              <Text style={[styles.presetText, { color: colors.primary }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>
          Câu hỏi hoặc nhu cầu của bạn:
        </Text>
        <TextInput
          style={[
            styles.promptInput,
            {
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          multiline
          numberOfLines={3}
          placeholder="Nhập nhu cầu tìm kiếm hoặc sản phẩm muốn so sánh..."
          placeholderTextColor={colors.textSecondary}
          value={userPrompt}
          onChangeText={setUserPrompt}
        />

        <View style={styles.budgetRow}>
          <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>
            Ngân sách tối đa ($ USD):
          </Text>
          <TextInput
            style={[
              styles.budgetInput,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            keyboardType="numeric"
            placeholder="Không giới hạn"
            placeholderTextColor={colors.textSecondary}
            value={budgetText}
            onChangeText={setBudgetText}
          />
        </View>

        {/* Công tắc mô phỏng lỗi sản phẩm ảo giác phục vụ chấm bài (Test Case 14) */}
        <TouchableOpacity
          style={[
            styles.simToggleBox,
            {
              backgroundColor: simulationFlags.simulateAiHallucination
                ? colors.warningLight
                : colors.background,
              borderColor: simulationFlags.simulateAiHallucination
                ? colors.warning
                : colors.border,
            },
          ]}
          onPress={() => toggleSimulationFlag('simulateAiHallucination')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.simToggleText,
              {
                color: simulationFlags.simulateAiHallucination
                  ? colors.warning
                  : colors.textSecondary,
              },
            ]}
          >
            {simulationFlags.simulateAiHallucination
              ? '🧪 [ĐANG BẬT] Mô phỏng Case 14: Giả lập AI trả sản phẩm ảo giác (ID #99999) để test bộ lọc R10'
              : '☑️ [ĐANG TẮT] Chạm vào đây để giả lập AI trả về sản phẩm ảo giác (Test Case 14)'}
          </Text>
        </TouchableOpacity>

        <CustomButton
          title="✨ Gửi câu hỏi tới Gemini AI"
          onPress={() => handleAskAi()}
          loading={isLoading}
          variant="primary"
          style={{ marginTop: 10, paddingVertical: 14 }}
        />
      </View>

      {/* Kết quả phản hồi từ Gemini AI sau khi đã qua bộ lọc xác thực */}
      {aiResult ? (
        <View style={styles.resultSection}>
          {/* Thẻ báo cáo kiểm chứng đầu ra (Output Validation Report) */}
          <View
            style={[
              styles.validationCard,
              {
                backgroundColor: colors.surface,
                borderColor:
                  aiResult.validationReport.rejectedCount > 0
                    ? colors.warning
                    : colors.success,
              },
            ]}
          >
            <Text style={[styles.validationTitle, { color: colors.text }]}>
              🛡️ Báo cáo Kiểm chứng AI (Anti-Hallucination - R10)
            </Text>
            <Text
              style={[styles.validationSource, { color: colors.textSecondary }]}
            >
              Cơ chế: {aiResult.source}
            </Text>

            <View style={styles.metricsRow}>
              <View
                style={[
                  styles.metricBox,
                  { backgroundColor: colors.background },
                ]}
              >
                <Text style={[styles.metricNum, { color: colors.text }]}>
                  {aiResult.validationReport.totalRawCount}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Gợi ý thô
                </Text>
              </View>

              <View
                style={[
                  styles.metricBox,
                  { backgroundColor: colors.successLight },
                ]}
              >
                <Text style={[styles.metricNum, { color: colors.success }]}>
                  {aiResult.validationReport.validCount}
                </Text>
                <Text style={[styles.metricLabel, { color: colors.success }]}>
                  Khớp thật
                </Text>
              </View>

              <View
                style={[
                  styles.metricBox,
                  {
                    backgroundColor:
                      aiResult.validationReport.rejectedCount > 0
                        ? colors.dangerLight
                        : colors.background,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.metricNum,
                    {
                      color:
                        aiResult.validationReport.rejectedCount > 0
                          ? colors.danger
                          : colors.textSecondary,
                    },
                  ]}
                >
                  {aiResult.validationReport.rejectedCount}
                </Text>
                <Text
                  style={[
                    styles.metricLabel,
                    {
                      color:
                        aiResult.validationReport.rejectedCount > 0
                          ? colors.danger
                          : colors.textSecondary,
                    },
                  ]}
                >
                  Đã chặn (Ảo)
                </Text>
              </View>
            </View>

            {/* Danh sách các sản phẩm ảo giác bị phát hiện và chặn lại */}
            {aiResult.rejectedItems && aiResult.rejectedItems.length > 0 ? (
              <View
                style={[
                  styles.rejectedBox,
                  {
                    backgroundColor: colors.dangerLight,
                    borderColor: colors.danger,
                  },
                ]}
              >
                <Text style={[styles.rejectedHeader, { color: colors.danger }]}>
                  🚫 Đã phát hiện và loại bỏ sản phẩm không có trong Catalog:
                </Text>
                {aiResult.rejectedItems.map((rej, idx) => (
                  <Text
                    key={idx}
                    style={[styles.rejectedItemText, { color: colors.text }]}
                  >
                    • [ID: {rej.productId}] "{rej.productTitle}" →{' '}
                    {rej.rejectReason}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>

          {/* Lời khuyên và tóm tắt phân tích từ AI */}
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.summaryHeader, { color: colors.primary }]}>
              💬 Lời khuyên từ Gemini AI
            </Text>
            <Text style={[styles.summaryBody, { color: colors.text }]}>
              {aiResult.summary}
            </Text>
            {aiResult.comparisonNote ? (
              <Text
                style={[
                  styles.comparisonText,
                  { color: colors.textSecondary },
                ]}
              >
                📌 So sánh: {aiResult.comparisonNote}
              </Text>
            ) : null}
          </View>

          {/* Danh sách các sản phẩm thật được AI đề xuất */}
          <Text style={[styles.recListHeader, { color: colors.text }]}>
            ✅ Sản phẩm Đề xuất Đã kiểm chứng ({aiResult.validRecommendations.length})
          </Text>

          {aiResult.validRecommendations.map((rec) => {
            const prod = rec.product;
            return (
              <View
                key={String(rec.productId)}
                style={[
                  styles.recCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={styles.recTopRow}>
                  <Image
                    source={{ uri: prod.thumbnail }}
                    style={[
                      styles.recImage,
                      { backgroundColor: colors.background },
                    ]}
                    resizeMode="cover"
                  />
                  <View style={styles.recInfo}>
                    <View style={styles.verifiedTag}>
                      <Text
                        style={[
                          styles.verifiedTagText,
                          { color: colors.success },
                        ]}
                      >
                        ✓ Khớp Catalog #{prod.id}
                      </Text>
                    </View>
                    <Text style={[styles.recTitle, { color: colors.text }]}>
                      {prod.title}
                    </Text>
                    <Text style={[styles.recPrice, { color: colors.primary }]}>
                      {formatPrice(prod.price)} • ★ {prod.rating}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[styles.recReason, { color: colors.textSecondary }]}
                >
                  💡 {rec.reason}
                </Text>

                <View style={styles.recActions}>
                  <CustomButton
                    title="Xem chi tiết"
                    onPress={() =>
                      navigation.navigate('ProductDetail', { product: prod })
                    }
                    variant="outline"
                    style={styles.recBtn}
                  />
                  <CustomButton
                    title="+ Thêm giỏ"
                    onPress={() => addToCart(prod, 1)}
                    variant="primary"
                    style={styles.recBtn}
                  />
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 14,
    paddingBottom: 36,
  },
  contextBanner: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  contextTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  contextDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  formCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  modeBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 11,
    fontWeight: '700',
  },
  promptInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    fontSize: 13,
    minHeight: 64,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  budgetInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'android' ? 4 : 6,
    minHeight: 38,
    fontSize: 13,
    width: 130,
    textAlign: 'right',
    textAlignVertical: 'center',
  },
  simToggleBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  simToggleText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
  resultSection: {
    marginTop: 6,
  },
  validationCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  validationTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  validationSource: {
    fontSize: 11,
    marginBottom: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricBox: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  metricNum: {
    fontSize: 18,
    fontWeight: '900',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  rejectedBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  rejectedHeader: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  rejectedItemText: {
    fontSize: 11,
    lineHeight: 16,
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  summaryHeader: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
  },
  summaryBody: {
    fontSize: 13,
    lineHeight: 20,
  },
  comparisonText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  recListHeader: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  recCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },
  recTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recImage: {
    width: 68,
    height: 68,
    borderRadius: 10,
    marginRight: 10,
  },
  recInfo: {
    flex: 1,
  },
  verifiedTag: {
    marginBottom: 2,
  },
  verifiedTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  recTitle: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  recPrice: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  recReason: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  recActions: {
    flexDirection: 'row',
    gap: 8,
  },
  recBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
  },
});

