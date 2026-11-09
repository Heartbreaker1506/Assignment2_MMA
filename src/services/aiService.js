// =========================================================================
// Dự án: SmartStore - Ứng dụng Thương mại Điện tử Tích hợp (MMA301 Assignment 2)
// Sinh viên thực hiện: Nguyễn Minh Quân - MSSV: CE180048
// Tệp: src/services/aiService.js - Tích hợp Gemini AI & Bộ lọc chống ảo giác (R10)
// =========================================================================

import { ENV_CONFIG, isGeminiApiKeyConfigured } from '../config/env';
import { formatPrice } from '../utils/storage';

// Xây dựng câu nhắc (prompt) có cấu trúc nạp sản phẩm Catalog thật, giỏ hàng và ngân sách
export const buildShoppingPrompt = ({
  userPrompt,
  budgetLimit,
  catalogProducts = [],
  cartItems = [],
  mode = 'recommend',
}) => {
  const catalogSnapshot = catalogProducts.slice(0, 20).map((item) => ({
    id: item.id,
    title: item.title,
    price: item.price,
    category: item.category,
    rating: item.rating,
    brand: item.brand,
  }));

  const cartSnapshot = cartItems.map((c) => ({
    id: c.product.id,
    title: c.product.title,
    quantity: c.quantity,
    price: c.product.price,
  }));

  return `
Bạn là Trợ lý Mua sắm Thông minh (SmartStore AI Assistant) cho ứng dụng thương mại điện tử MMA301.
Nhiệm vụ: Tư vấn hoặc so sánh sản phẩm bằng tiếng Việt ngắn gọn, trung thực.
QUY TẮC BẮT BUỘC:
1. CHỈ ĐƯỢC gợi ý các sản phẩm có thật nằm trong danh sách CATALOG_DATA bên dưới.
2. Tuyệt đối KHÔNG tự bịa ra ID hoặc tên sản phẩm ngoài CATALOG_DATA.
3. Trả về đúng định dạng JSON hợp lệ (không bọc thêm văn bản thừa bên ngoài JSON):
{
  "summary": "Tóm tắt lời khuyên tư vấn theo nhu cầu và ngân sách...",
  "comparisonNote": "Phân tích so sánh ưu/nhược điểm hoặc độ phù hợp ngân sách...",
  "recommendations": [
    {
      "productId": <id_số_nguyên_trong_catalog>,
      "productTitle": "<tên_sản_phẩm>",
      "reason": "<lý_do_phù_hợp_ngắn_gọn>"
    }
  ]
}

THÔNG TIN NGỮ CẢNH:
- Chế độ yêu cầu: ${mode === 'compare' ? 'So sánh sản phẩm' : 'Tư vấn chọn mua'}
- Nhu cầu người dùng: "${userPrompt || 'Tư vấn sản phẩm tốt và đáng mua nhất'}"
- Ngân sách tối đa: ${budgetLimit > 0 ? `$${budgetLimit}` : 'Không giới hạn'}
- Giỏ hàng hiện tại: ${JSON.stringify(cartSnapshot)}
- CATALOG_DATA (Danh sách sản phẩm thật):
${JSON.stringify(catalogSnapshot)}
`.trim();
};

// Kiểm chứng kết quả AI trả về đối chiếu với Catalog thật để loại bỏ sản phẩm ảo giác (R10)
export const validateAiOutputAgainstCatalog = (
  rawAiOutput,
  catalogProducts = []
) => {
  const catalogMapById = new Map();
  const catalogMapByTitle = new Map();

  catalogProducts.forEach((product) => {
    if (product && product.id !== undefined) {
      catalogMapById.set(Number(product.id), product);
      catalogMapByTitle.set(String(product.title).trim().toLowerCase(), product);
    }
  });

  const rawList = Array.isArray(rawAiOutput?.recommendations)
    ? rawAiOutput.recommendations
    : [];

  const validRecommendations = [];
  const rejectedItems = [];
  const seenIds = new Set();

  rawList.forEach((rec) => {
    const candidateId = Number(rec?.productId);
    const candidateTitle = String(rec?.productTitle || '')
      .trim()
      .toLowerCase();

    // Đối chiếu theo ID sản phẩm trước, sau đó tìm theo tên sản phẩm chính xác
    const matchedProduct =
      catalogMapById.get(candidateId) || catalogMapByTitle.get(candidateTitle);

    if (matchedProduct && !seenIds.has(matchedProduct.id)) {
      seenIds.add(matchedProduct.id);
      validRecommendations.push({
        productId: matchedProduct.id,
        productTitle: matchedProduct.title,
        reason: String(
          rec?.reason ||
            `Phù hợp với nhu cầu tìm kiếm, đánh giá ${matchedProduct.rating}/5 sao.`
        ),
        product: matchedProduct,
      });
    } else if (!matchedProduct) {
      // Chặn ngay lập tức sản phẩm ảo giác không có thật trong danh mục
      rejectedItems.push({
        productId: rec?.productId ?? 'N/A',
        productTitle: rec?.productTitle || 'Sản phẩm không xác định',
        rejectReason:
          'ID/Tên sản phẩm không tồn tại trong Catalog thật (Đã chặn bởi Output Validator - R10)',
      });
    }
  });

  return {
    summary: String(
      rawAiOutput?.summary ||
        'Dưới đây là kết quả phân tích sản phẩm dựa trên danh mục hiện có của cửa hàng.'
    ),
    comparisonNote: String(
      rawAiOutput?.comparisonNote ||
        'Các sản phẩm hiển thị bên dưới đều đã được đối chiếu khớp 100% với dữ liệu Catalog.'
    ),
    validRecommendations,
    rejectedItems,
    validationReport: {
      totalRawCount: rawList.length,
      validCount: validRecommendations.length,
      rejectedCount: rejectedItems.length,
      isClean: rejectedItems.length === 0,
      checkedAt: new Date().toISOString(),
    },
  };
};

// Động cơ tư vấn dự phòng an toàn khi chưa nhập khóa Gemini API hoặc mất mạng
const generateSmartFallbackResponse = ({
  userPrompt,
  budgetLimit,
  catalogProducts = [],
  cartItems = [],
  mode = 'recommend',
  simulateHallucination = false,
}) => {
  const query = String(userPrompt || '').trim().toLowerCase();
  const numericBudget = Number(budgetLimit) > 0 ? Number(budgetLimit) : 0;

  let candidates = [...catalogProducts];

  if (numericBudget > 0) {
    candidates = candidates.filter((item) => item.price <= numericBudget);
  }

  if (query.length > 0) {
    const keywordMatches = candidates.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.brand.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (query.includes('điện thoại') && item.category === 'smartphones') ||
        (query.includes('phone') && item.category === 'smartphones') ||
        (query.includes('laptop') && item.category === 'laptops') ||
        (query.includes('máy tính') &&
          (item.category === 'laptops' || item.category === 'tablets')) ||
        (query.includes('phụ kiện') &&
          item.category === 'mobile-accessories') ||
        (query.includes('rẻ') && item.price < 300) ||
        (query.includes('sinh viên') && item.price <= 1000)
    );
    if (keywordMatches.length > 0) {
      candidates = keywordMatches;
    }
  }

  // Sắp xếp các ứng cử viên theo điểm đánh giá cao nhất
  candidates.sort((a, b) => b.rating - a.rating);
  const picked = candidates.slice(0, 3);

  const recommendations = picked.map((item, idx) => ({
    productId: item.id,
    productTitle: item.title,
    reason:
      mode === 'compare'
        ? `Ứng viên #${idx + 1}: Giá ${formatPrice(item.price)}, đánh giá ${
            item.rating
          }★ (${item.brand}) - Nổi bật trong phân khúc ${item.category}.`
        : `Đề xuất phù hợp nhu cầu (${formatPrice(item.price)}, Rating ${
            item.rating
          }★): ${item.description.slice(0, 90)}...`,
  }));

  // Chèn một sản phẩm ảo giác giả lập khi kiểm thử bộ lọc (Test Case 14)
  if (simulateHallucination) {
    recommendations.unshift({
      productId: 99999,
      productTitle: 'Quantum Hologram Phone Z99 (Sản phẩm AI bịa)',
      reason:
        'Sản phẩm giả lập AI Hallucination để kiểm thử bộ lọc validateAiOutputAgainstCatalog (Case 14).',
    });
  }

  let summaryText = '';
  if (picked.length === 0) {
    summaryText =
      numericBudget > 0
        ? `Hiện tại trong Catalog không có sản phẩm nào có giá dưới mức ngân sách ${formatPrice(
            numericBudget
          )}. Bạn hãy thử tăng ngân sách hoặc xóa bộ lọc giá nhé!`
        : 'Không tìm thấy sản phẩm khớp hoàn toàn trong danh mục hiện tại.';
  } else if (mode === 'compare') {
    const cheapest = [...picked].sort((a, b) => a.price - b.price)[0];
    const highestRated = picked[0];
    summaryText = `So sánh ${picked.length} sản phẩm trong Catalog: "${highestRated.title}" dẫn đầu về điểm đánh giá (${highestRated.rating}★), trong khi "${cheapest.title}" tối ưu chi phí nhất (${formatPrice(cheapest.price)}).`;
  } else {
    summaryText = `Dựa trên ${catalogProducts.length} sản phẩm trong Catalog${
      numericBudget > 0 ? ` và ngân sách tối đa ${formatPrice(numericBudget)}` : ''
    }${
      cartItems.length > 0
        ? ` (cùng ${cartItems.length} món đang có trong giỏ hàng)`
        : ''
    }, hệ thống tìm thấy ${picked.length} sản phẩm phù hợp nhất với yêu cầu của bạn.`;
  }

  return {
    summary: summaryText,
    comparisonNote:
      picked.length >= 2
        ? `Chênh lệch giá giữa các lựa chọn từ ${formatPrice(
            Math.min(...picked.map((p) => p.price))
          )} đến ${formatPrice(
            Math.max(...picked.map((p) => p.price))
          )}. Tất cả sản phẩm hiển thị đã qua bước kiểm tra đối chiếu ID thật.`
        : 'Đã kiểm tra tính hợp lệ của dữ liệu sản phẩm với Catalog hiện tại.',
    recommendations,
  };
};

// Hàm chính gọi Trợ lý mua sắm Gemini AI kèm bộ lọc xác thực chống ảo giác
export const askGeminiProductAssistant = async ({
  userPrompt,
  budgetLimit = 0,
  catalogProducts = [],
  cartItems = [],
  mode = 'recommend',
  simulateHallucination = false,
}) => {
  if (simulateHallucination || !isGeminiApiKeyConfigured()) {
    await new Promise((resolve) => setTimeout(resolve, 550));
    const rawFallback = generateSmartFallbackResponse({
      userPrompt,
      budgetLimit,
      catalogProducts,
      cartItems,
      mode,
      simulateHallucination,
    });

    const validated = validateAiOutputAgainstCatalog(
      rawFallback,
      catalogProducts
    );

    return {
      ...validated,
      source: simulateHallucination
        ? 'Simulated AI Hallucination Test (Case 14)'
        : 'Catalog Context Fallback Engine (Safe Mode)',
    };
  }

  try {
    const promptText = buildShoppingPrompt({
      userPrompt,
      budgetLimit,
      catalogProducts,
      cartItems,
      mode,
    });

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      ENV_CONFIG.GEMINI.model
    )}:generateContent?key=${encodeURIComponent(ENV_CONFIG.GEMINI.apiKey)}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    // Loại bỏ markdown code fences nếu có trước khi phân giải JSON
    const cleanedJsonText = rawText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    const parsedOutput = JSON.parse(cleanedJsonText);

    // Kiểm chứng kết quả AI đối chiếu với sản phẩm thật trước khi trả về giao diện
    const validated = validateAiOutputAgainstCatalog(
      parsedOutput,
      catalogProducts
    );

    return {
      ...validated,
      source: `Google Gemini API (${ENV_CONFIG.GEMINI.model})`,
    };
  } catch (error) {
    console.warn(
      '[AiService] Gọi Gemini API thất bại, chuyển sang động cơ dự phòng:',
      error
    );

    const fallbackRaw = generateSmartFallbackResponse({
      userPrompt,
      budgetLimit,
      catalogProducts,
      cartItems,
      mode,
      simulateHallucination: false,
    });

    const validated = validateAiOutputAgainstCatalog(
      fallbackRaw,
      catalogProducts
    );

    return {
      ...validated,
      source: 'Fallback Engine (Tự động khôi phục sau lỗi Gemini API)',
      fallbackWarning:
        'Không thể kết nối trực tiếp tới Gemini API. Đã chuyển sang chế độ tư vấn dự phòng an toàn dựa trên Catalog thật.',
    };
  }
};
