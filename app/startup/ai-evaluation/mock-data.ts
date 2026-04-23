import { AIEvaluationReport, ReadinessSummary, ProfileSnapshot } from "./types";

/* ─── Mock Readiness ──────────────────────────────────────── */

export const mockReadiness: ReadinessSummary = {
  profile: {
    ready: true,
    completionPercent: 90,
    items: [
      { label: "Hồ sơ startup đã tạo", ready: true },
      { label: "Giai đoạn phát triển đã chọn", ready: true },
      { label: "Mô tả kinh doanh cốt lõi", ready: true },
      { label: "Thông tin đội ngũ / công ty", ready: true, detail: "Thiếu ảnh đại diện thành viên" },
    ],
  },
  documents: {
    ready: true,
    items: [
      { label: "Tài liệu kinh doanh hợp lệ đã tải lên", ready: true },
      { label: "Ít nhất 1 Pitch Deck hoặc Business Plan", ready: true },
      { label: "Tài liệu thuộc quyền sở hữu của startup", ready: true },
    ],
    eligibleDocs: [
      { id: "doc-1", name: "Pitch Deck Q1 2026 — EcoTrack.pdf", type: "PITCH_DECK", updatedAt: "20/03/2026", recommended: true },
      { id: "doc-2", name: "Business Plan — EcoTrack v2.1.pdf", type: "BUSINESS_PLAN", updatedAt: "18/03/2026", recommended: true },
    ],
  },
};

export const mockProfile: ProfileSnapshot = {
  name: "EcoTrack Solutions",
  stage: "Seed",
  industry: "CleanTech / SaaS",
  foundedYear: 2023,
  teamSize: 8,
  lastUpdated: "20/03/2026",
};

/* ─── Mock Reports ────────────────────────────────────────── */

export const mockReports: AIEvaluationReport[] = [
  {
    evaluationId: "eval-001",
    startupId: "s-001",
    status: "COMPLETED",
    overallScore: 78,
    pitchDeckScore: 82,
    businessPlanScore: 74,
    teamScore: 85,
    marketScore: 72,
    productScore: 80,
    tractionScore: 65,
    financialScore: 70,
    calculatedAt: "20/03/2026 14:30",
    generatedAt: "20/03/2026 14:32",
    isCurrent: true,
    configVersion: "v2.1.0",
    modelVersion: "claude-sonnet-4-20250514",
    promptVersion: "eval-prompt-v3.2",
    snapshotLabel: "Đánh giá Q1 2026",
    warningMessages: [
      "Dữ liệu tài chính chỉ cập nhật đến Q4/2023, một số chỉ số có thể không phản ánh tình hình hiện tại.",
    ],
    executiveSummary: "EcoTrack Solutions thể hiện tiềm năng tốt trong lĩnh vực CleanTech với đội ngũ sáng lập có kinh nghiệm và sản phẩm đã có traction ban đầu. Tuy nhiên, mô hình tài chính và chiến lược gọi vốn cần được cải thiện đáng kể để thu hút nhà đầu tư ở vòng Seed. Pitch Deck được đánh giá khá tốt về mặt cấu trúc nhưng cần bổ sung thêm dữ liệu thị trường cụ thể.",
    strengths: [
      "Đội ngũ sáng lập có chuyên môn sâu trong lĩnh vực CleanTech với hơn 15 năm kinh nghiệm kết hợp.",
      "Sản phẩm MVP đã ra mắt và có 500+ người dùng đang hoạt động trong 3 tháng đầu tiên.",
      "Mô hình B2B SaaS với recurring revenue tạo nền tảng tốt cho tăng trưởng bền vững.",
      "Pitch Deck trình bày rõ ràng, có cấu trúc logic và design chuyên nghiệp.",
    ],
    opportunities: [
      "Thị trường CleanTech toàn cầu dự kiến đạt $2.5T vào 2030 với CAGR 20%+.",
      "Chính sách ESG ngày càng nghiêm ngặt tạo nhu cầu lớn cho giải pháp carbon tracking.",
      "Có thể mở rộng sang thị trường Đông Nam Á với chi phí thấp thông qua partnership.",
    ],
    risks: [
      "Thị trường cạnh tranh cao với nhiều đối thủ đã có vốn lớn như Persefoni, Watershed.",
      "Phụ thuộc vào quy định ESG — nếu chính sách thay đổi có thể ảnh hưởng đến nhu cầu.",
      "Unit economics chưa rõ ràng, CAC/LTV ratio cần được chứng minh thêm.",
    ],
    concerns: [
      "Burn rate hiện tại cao so với runway, chỉ còn khoảng 6 tháng nếu không gọi vốn.",
      "Thiếu CTO/CPO có kinh nghiệm scale sản phẩm SaaS.",
    ],
    gaps: [
      "Chưa có dữ liệu retention rate sau tháng thứ 3.",
      "Financial model thiếu phân tích sensitivity analysis.",
      "Chưa có thông tin về competitive moat cụ thể.",
      "Thiếu chi tiết về go-to-market strategy cho thị trường quốc tế.",
    ],
    recommendations: [
      { category: "Tài chính", priority: "HIGH", text: "Xây dựng financial model chi tiết hơn với sensitivity analysis và unit economics rõ ràng.", impact: "Tăng độ tin cậy của pitch với nhà đầu tư, ước tính cải thiện 20-30% tỷ lệ chuyển đổi meeting." },
      { category: "Đội ngũ", priority: "HIGH", text: "Tuyển dụng CTO hoặc Technical Co-founder có kinh nghiệm scale SaaS product.", impact: "Giải quyết gap kỹ thuật lớn nhất, tăng confidence của nhà đầu tư về khả năng thực thi." },
      { category: "Sản phẩm", priority: "MEDIUM", text: "Thiết lập hệ thống đo lường retention và engagement metrics chi tiết hơn.", impact: "Cung cấp dữ liệu cụ thể về product-market fit cho các cuộc họp gọi vốn." },
      { category: "Thị trường", priority: "MEDIUM", text: "Bổ sung competitive analysis chi tiết và xác định rõ competitive moat.", impact: "Giúp nhà đầu tư hiểu rõ vị trí và lợi thế cạnh tranh của startup." },
      { category: "Tăng trưởng", priority: "LOW", text: "Xây dựng case study từ 2-3 khách hàng doanh nghiệp hiện tại.", impact: "Tạo social proof mạnh cho các cuộc hội thoại với nhà đầu tư tiềm năng." },
    ],
    subMetrics: {
      team: [
        { name: "Kinh nghiệm lãnh đạo", score: 9, maxScore: 10, comment: "CEO có 10 năm kinh nghiệm trong lĩnh vực sustainability." },
        { name: "Đa dạng kỹ năng", score: 7, maxScore: 10, comment: "Cần bổ sung chuyên môn kỹ thuật cấp cao." },
        { name: "Cam kết toàn thời gian", score: 10, maxScore: 10, comment: "Toàn bộ founding team làm full-time." },
        { name: "Track record", score: 8, maxScore: 10, comment: "CEO từng exit startup trước đó ở mức nhỏ." },
      ],
      market: [
        { name: "Quy mô thị trường", score: 8, maxScore: 10, comment: "TAM lớn, SAM được xác định hợp lý." },
        { name: "Tốc độ tăng trưởng", score: 9, maxScore: 10, comment: "Thị trường CleanTech tăng trưởng mạnh." },
        { name: "Cạnh tranh", score: 5, maxScore: 10, comment: "Nhiều đối thủ mạnh, cần rõ hơn về differentiation." },
        { name: "Timing", score: 8, maxScore: 10, comment: "ESG regulations đang thúc đẩy nhu cầu mạnh mẽ." },
      ],
      product: [
        { name: "MVP readiness", score: 9, maxScore: 10, comment: "MVP đã live với khách hàng thực." },
        { name: "User feedback", score: 7, maxScore: 10, comment: "Feedback tích cực nhưng sample size nhỏ." },
        { name: "Technical architecture", score: 8, maxScore: 10, comment: "Stack hiện đại, scalable." },
        { name: "UX/UI quality", score: 8, maxScore: 10, comment: "Giao diện chuyên nghiệp, dễ sử dụng." },
      ],
      traction: [
        { name: "Người dùng / khách hàng", score: 6, maxScore: 10, comment: "500+ users, cần tăng tốc." },
        { name: "Revenue", score: 5, maxScore: 10, comment: "MRR thấp, chưa chứng minh được willingness to pay." },
        { name: "Tăng trưởng MoM", score: 7, maxScore: 10, comment: "20% MoM growth rate, khá tốt cho giai đoạn đầu." },
        { name: "Retention", score: 6, maxScore: 10, comment: "Dữ liệu retention chưa đủ dài để đánh giá." },
      ],
      financial: [
        { name: "Unit economics", score: 5, maxScore: 10, comment: "CAC/LTV chưa được chứng minh rõ ràng." },
        { name: "Burn rate", score: 6, maxScore: 10, comment: "Burn rate cao, cần tối ưu." },
        { name: "Revenue model", score: 8, maxScore: 10, comment: "SaaS subscription model rõ ràng." },
        { name: "Financial projections", score: 6, maxScore: 10, comment: "Projections thiếu sensitivity analysis." },
      ],
    },
  },
  {
    evaluationId: "eval-002",
    startupId: "s-001",
    status: "COMPLETED",
    overallScore: 65,
    pitchDeckScore: 70,
    businessPlanScore: 60,
    teamScore: 80,
    marketScore: 68,
    productScore: 62,
    tractionScore: 50,
    financialScore: 55,
    calculatedAt: "15/02/2026 10:00",
    generatedAt: "15/02/2026 10:03",
    isCurrent: false,
    configVersion: "v2.0.0",
    modelVersion: "claude-sonnet-4-20250514",
    promptVersion: "eval-prompt-v3.1",
    snapshotLabel: "Đánh giá đầu tiên",
    warningMessages: [
      "Business Plan chưa bao gồm phần financial projection.",
      "Pitch Deck chưa có phần competitive landscape chi tiết.",
    ],
    executiveSummary: "EcoTrack Solutions đang ở giai đoạn sớm với sản phẩm MVP vừa ra mắt. Đội ngũ có tiềm năng nhưng cần bổ sung thêm nhân sự kỹ thuật. Tài liệu kinh doanh cần được cải thiện đáng kể trước khi tiếp cận nhà đầu tư.",
    strengths: [
      "Ý tưởng sản phẩm phù hợp xu hướng thị trường ESG.",
      "CEO có background mạnh trong lĩnh vực sustainability.",
      "MVP đã hoàn thành và bắt đầu có người dùng thử nghiệm.",
    ],
    opportunities: [
      "Thị trường carbon tracking đang tăng trưởng nhanh.",
      "Ít đối thủ tại thị trường Việt Nam.",
    ],
    risks: [
      "Chưa có revenue, mô hình kinh doanh chưa được validate.",
      "Team size nhỏ, khó scale nhanh.",
    ],
    concerns: [
      "Financial projection hoàn toàn thiếu trong Business Plan.",
      "Chưa có dữ liệu về customer acquisition cost.",
    ],
    gaps: [
      "Thiếu competitive analysis.",
      "Thiếu go-to-market strategy.",
      "Thiếu financial model.",
    ],
    recommendations: [
      { category: "Tài liệu", priority: "HIGH", text: "Bổ sung financial projection vào Business Plan.", impact: "Yêu cầu cơ bản để tiếp cận nhà đầu tư." },
      { category: "Sản phẩm", priority: "HIGH", text: "Thu thập thêm user feedback và validation data.", impact: "Chứng minh product-market fit." },
      { category: "Thị trường", priority: "MEDIUM", text: "Xây dựng competitive landscape analysis.", impact: "Giúp positioning rõ ràng hơn." },
    ],
    subMetrics: {
      team: [
        { name: "Kinh nghiệm lãnh đạo", score: 9, maxScore: 10, comment: "CEO có kinh nghiệm mạnh." },
        { name: "Đa dạng kỹ năng", score: 6, maxScore: 10, comment: "Thiếu kỹ sư cấp cao." },
        { name: "Cam kết toàn thời gian", score: 10, maxScore: 10, comment: "Full-time team." },
        { name: "Track record", score: 7, maxScore: 10, comment: "Kinh nghiệm hạn chế với startup." },
      ],
      market: [
        { name: "Quy mô thị trường", score: 7, maxScore: 10, comment: "TAM lớn." },
        { name: "Tốc độ tăng trưởng", score: 8, maxScore: 10, comment: "Thị trường tăng mạnh." },
        { name: "Cạnh tranh", score: 6, maxScore: 10, comment: "Chưa phân tích kỹ." },
        { name: "Timing", score: 7, maxScore: 10, comment: "Thời điểm tốt." },
      ],
      product: [
        { name: "MVP readiness", score: 7, maxScore: 10, comment: "MVP basic." },
        { name: "User feedback", score: 5, maxScore: 10, comment: "Ít feedback." },
        { name: "Technical architecture", score: 7, maxScore: 10, comment: "Cần review." },
        { name: "UX/UI quality", score: 6, maxScore: 10, comment: "Cần cải thiện." },
      ],
      traction: [
        { name: "Người dùng / khách hàng", score: 4, maxScore: 10, comment: "Rất ít users." },
        { name: "Revenue", score: 3, maxScore: 10, comment: "Chưa có revenue." },
        { name: "Tăng trưởng MoM", score: 5, maxScore: 10, comment: "Tăng chậm." },
        { name: "Retention", score: 5, maxScore: 10, comment: "Chưa đo được." },
      ],
      financial: [
        { name: "Unit economics", score: 3, maxScore: 10, comment: "Chưa có data." },
        { name: "Burn rate", score: 5, maxScore: 10, comment: "Chấp nhận được." },
        { name: "Revenue model", score: 7, maxScore: 10, comment: "Mô hình rõ." },
        { name: "Financial projections", score: 4, maxScore: 10, comment: "Thiếu hoàn toàn." },
      ],
    },
  },
  {
    evaluationId: "eval-003",
    startupId: "s-001",
    status: "FAILED",
    overallScore: 0,
    pitchDeckScore: 0,
    businessPlanScore: 0,
    teamScore: 0,
    marketScore: 0,
    productScore: 0,
    tractionScore: 0,
    financialScore: 0,
    calculatedAt: "01/01/2026 09:00",
    generatedAt: "",
    isCurrent: false,
    configVersion: "v1.8.0",
    modelVersion: "claude-sonnet-4-20250514",
    promptVersion: "eval-prompt-v2.5",
    snapshotLabel: "Thử nghiệm ban đầu",
    warningMessages: ["Lỗi xử lý: Tài liệu không đủ điều kiện để đánh giá."],
    executiveSummary: "",
    strengths: [],
    opportunities: [],
    risks: [],
    concerns: [],
    gaps: [],
    recommendations: [],
    subMetrics: {
      team: [], market: [], product: [], traction: [], financial: [],
    },
  },
];
