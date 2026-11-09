// Author: Trần Minh Quân - Student ID: CE181730

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { askGeminiProductAssistant } from '../services/aiService';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useShop } from '../context/ShopContext';
import { formatPrice } from '../utils/storage';
import { CustomButton } from '../components/CustomButton';

// Preset prompts for quick testing
const QUICK_PROMPTS = [
  {
    label: '📱 Điện thoại đáng mua',
    prompt: 'Tư vấn điện thoại hiệu năng cao, pin khỏe và camera sắc nét.',
    budget: '',
    mode: 'recommend',
  },
  {
    label: '💻 So sánh Laptop SV',
    prompt: 'So sánh các mẫu laptop mỏng nhẹ phù hợp cho sinh viên lập trình.',
    budget: '1500',
    mode: 'compare',
  },
  {
    label: '🎧 Phụ kiện dưới $300',
    prompt: 'Gợi ý tai nghe hoặc phụ kiện di động chính hãng dưới $300.',
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

  // Send query and catalog context to Gemini AI and validate output
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
      {/* Catalog context summary banner */}
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
          🤖 Trợ lý Mua sắm Gemini AI (R10 - Validated Catalog Context)
        </Text>
        <Text style={[styles.contextDesc, { color: colors.text }]}>
          Ngữ cảnh hiện tại: Đã nạp{' '}
          <Text style={{ fontWeight: '800' }}>{knownCatalog.length}</Text> sản
          phẩm thật từ Catalog &{' '}
          <Text style={{ fontWeight: '800' }}>{cartItems.length}</Text> mặt hàng
          trong giỏ. Mọi kết quả AI trả về đều đi qua bộ lọc{' '}
          <Text style={{ fontWeight: '800' }}>
            validateAiOutputAgainstCatalog()
          </Text>{' '}
          để chặn sản phẩm ảo giác (Hallucination).
        </Text>
      </View>

      {/* AI prompt and budget input form */}
      <View
        style={[
          styles.formCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {/* Mode selector: Recommend vs Compare */}
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
          >
            <Text
              style={[
                styles.modeBtnText,
                { color: mode === 'compare' ? '#FFFFFF' : colors.text },
              ]}
            >
              ⚖️ So sánh Sản phẩm
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick prompt chips */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Mẫu câu hỏi nhanh:
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
            >
              <Text style={[styles.presetText, { color: colors.primary }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>
          Nhu cầu mua sắm của bạn:
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
            Ngân sách tối đa ($ USD - Tùy chọn):
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

        {/* Toggle switch for testing AI hallucination filtering (Case 14) */}
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
              ? '🧪 [ĐANG BẬT] Mô phỏng Case 14: Giả lập AI trả kèm sản phẩm ảo giác (ID #99999) để test bộ lọc R10'
              : '☑️ [ĐANG TẮT] Bấm vào đây nếu muốn giả lập AI trả về sản phẩm ảo giác (Test Case 14)'}
          </Text>
        </TouchableOpacity>

        <CustomButton
          title="✨ Gửi yêu cầu tới Gemini AI & Kiểm chứng kết quả"
          onPress={() => handleAskAi()}
          loading={isLoading}
          variant="primary"
          style={{ marginTop: 10 }}
        />
      </View>

      {/* Validated AI response and recommendations */}
      {aiResult ? (
        <View style={styles.resultSection}>
          {/* Output Validation Report Card */}
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
              🛡️ Báo cáo Kiểm chứng Kết quả AI (Output Validator - R10)
            </Text>
            <Text
              style={[styles.validationSource, { color: colors.textSecondary }]}
            >
              Nguồn xử lý: {aiResult.source}
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
                  Gợi ý thô từ AI
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
                  Khớp Catalog thật
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
                  Đã chặn (Ảo giác)
                </Text>
              </View>
            </View>

            {/* List of rejected hallucinated items */}
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
                  🚫 Đã phát hiện và loại bỏ sản phẩm không khớp Catalog thật:
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

          {/* AI summary and comparison advice */}
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.summaryHeader, { color: colors.primary }]}>
              💬 Phân tích & Lời khuyên từ Trợ lý AI
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
                📌 Ghi chú so sánh: {aiResult.comparisonNote}
              </Text>
            ) : null}
          </View>

          {/* List of validated catalog products */}
          <Text style={[styles.recListHeader, { color: colors.text }]}>
            ✅ Sản phẩm Đề xuất Hợp lệ ({aiResult.validRecommendations.length})
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
                  />
                  <View style={styles.recInfo}>
                    <View style={styles.verifiedTag}>
                      <Text
                        style={[
                          styles.verifiedTagText,
                          { color: colors.success },
                        ]}
                      >
                        ✓ Khớp Catalog ID #{prod.id}
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
                  💡 Lý do đề xuất: {rec.reason}
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
                    title="+ Thêm vào giỏ"
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
    paddingBottom: 32,
  },
  contextBanner: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  contextTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  contextDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  formCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  modeBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '700',
  },
  promptInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    minHeight: 72,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetInput: {
    width: 120,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    textAlign: 'right',
  },
  simToggleBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  simToggleText: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  resultSection: {
    marginTop: 2,
  },
  validationCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 14,
  },
  validationTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  validationSource: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricBox: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  metricNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  rejectedBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  rejectedHeader: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  rejectedItemText: {
    fontSize: 12,
    lineHeight: 17,
  },
  summaryCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  summaryHeader: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  summaryBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  comparisonText: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  recListHeader: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  recCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  recTopRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  recImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    marginRight: 12,
  },
  recInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  verifiedTag: {
    marginBottom: 2,
  },
  verifiedTagText: {
    fontSize: 11,
    fontWeight: '800',
  },
  recTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  recPrice: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  recReason: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  recActions: {
    flexDirection: 'row',
    gap: 10,
  },
  recBtn: {
    flex: 1,
  },
});
