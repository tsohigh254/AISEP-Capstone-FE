import type { IAdvisorFeedbackItem, IAdvisorFeedbackSummary } from '@/types/advisor-feedback';

export const mockFeedbackList: IAdvisorFeedbackItem[] = [
  {
    id: "fb_001",
    sessionId: "ses-101",
    startup: {
      id: "101",
      displayName: "Nova Labs",
    },
    session: {
      topic: "Go-to-market review",
      completedAt: "2026-03-10T10:00:00Z",
    },
    rating: 5,
    comment: "Tư vấn rất chuyên sâu và dễ hiểu. Advisor nắm vững thị trường và đưa ra những chiến lược sát với năng lực của team.",
    createdAt: "2026-03-11T08:30:00Z",
    canRespond: true,
    visibilityStatus: "VISIBLE",
    response: {
      id: "res_001",
      responseText: "Cảm ơn Nova Labs! Team làm việc rất năng nổ. Chúc các bạn ra mắt sản phẩm thành công.",
      createdAt: "2026-03-11T14:00:00Z",
      updatedAt: "2026-03-11T14:00:00Z",
    },
  },
  {
    id: "fb_002",
    sessionId: "ses-102",
    startup: {
      id: "102",
      displayName: "FinNext",
    },
    session: {
      topic: "Gọi vốn Series A",
      completedAt: "2026-03-05T14:00:00Z",
    },
    rating: 5,
    comment: "Nhờ chuyên gia phân tích kỹ lưỡng mô hình Unit Economics, chúng tôi đã nhận ra một số lỗ hổng trước khi gặp quỹ đầu tư.",
    createdAt: "2026-03-06T09:15:00Z",
    canRespond: true,
    visibilityStatus: "VISIBLE",
    response: null,
  },
  {
    id: "fb_003",
    sessionId: "ses-103",
    startup: {
      id: "103",
      displayName: "EduPlatform",
    },
    session: {
      topic: "Product Strategy",
      completedAt: "2026-02-28T09:00:00Z",
    },
    rating: 4,
    comment: "Những góp ý về UX rất thực tế. Tuy nhiên mình muốn thảo luận sâu hơn về technical architecture ở buổi sau.",
    createdAt: "2026-03-01T10:00:00Z",
    canRespond: true,
    visibilityStatus: "VISIBLE",
    response: null,
  },
  {
    id: "fb_004",
    sessionId: "ses-104",
    startup: {
      id: "104",
      displayName: "GreenLogistics",
    },
    session: {
      topic: "Vận hành chuỗi cung ứng",
      completedAt: "2026-02-20T15:30:00Z",
    },
    rating: 5,
    comment: null, // Rating only
    createdAt: "2026-02-21T11:00:00Z",
    canRespond: true,
    visibilityStatus: "VISIBLE",
    response: null,
  },
  {
    id: "fb_005",
    sessionId: "ses-105",
    startup: {
      id: "105",
      displayName: "MedScan AI",
    },
    session: {
      topic: "Tối ưu AI Algorithm",
      completedAt: "2026-02-15T14:00:00Z",
    },
    rating: 4,
    comment: null,
    createdAt: "2026-02-16T09:00:00Z",
    canRespond: true,
    visibilityStatus: "VISIBLE",
    response: null,
  },
  {
    id: "fb_006",
    sessionId: "ses-106",
    startup: {
      id: "106",
      displayName: "CloudKitchen VN",
    },
    session: {
      topic: "System Design",
      completedAt: "2026-02-10T09:30:00Z",
    },
    rating: 5,
    comment: "Giải quyết được vấn đề nan giải của hệ thống order đang bị bottleneck. Cực kì recommend kiến thức của anh Cường.",
    createdAt: "2026-02-11T16:20:00Z",
    canRespond: true,
    visibilityStatus: "VISIBLE",
    response: {
      id: "res_002",
      responseText: "Rất vui vì giải pháp message queue áp dụng hiệu quả! Keep up the good work.",
      createdAt: "2026-02-12T08:00:00Z",
      updatedAt: "2026-02-12T08:00:00Z",
    },
  },
];

export function getMockFeedbackSummary(advisorId: string): IAdvisorFeedbackSummary {
  const visibleFeedbacks = mockFeedbackList.filter(f => f.visibilityStatus === 'VISIBLE');
  const totalReviews = visibleFeedbacks.length;

  if (totalReviews === 0) {
    return {
      advisorId,
      averageRating: null,
      totalReviews: 0,
      ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const sum = visibleFeedbacks.reduce((acc, f) => acc + f.rating, 0);
  const averageRating = Number((sum / totalReviews).toFixed(1));

  const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const f of visibleFeedbacks) {
    ratingBreakdown[f.rating as 1 | 2 | 3 | 4 | 5]++;
  }

  return {
    advisorId,
    averageRating,
    totalReviews,
    ratingBreakdown,
    lastUpdatedAt: new Date().toISOString(),
  };
}

export async function getMockFeedbackList(
  filters?: {
    rating?: number;
    hasComment?: boolean;
    sort?: 'NEWEST' | 'OLDEST' | 'HIGHEST_RATING' | 'LOWEST_RATING';
  }
): Promise<IAdvisorFeedbackItem[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  let results = [...mockFeedbackList];

  // Apply filters
  if (filters?.rating) {
    results = results.filter(f => f.rating === filters.rating);
  }

  if (filters?.hasComment !== undefined) {
    if (filters.hasComment) {
      results = results.filter(f => f.comment && f.comment.trim() !== "");
    } else {
      results = results.filter(f => !f.comment || f.comment.trim() === "");
    }
  }

  // Apply sorting
  if (filters?.sort) {
    switch (filters.sort) {
      case 'NEWEST':
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'OLDEST':
        results.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'HIGHEST_RATING':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'LOWEST_RATING':
        results.sort((a, b) => a.rating - b.rating);
        break;
    }
  } else {
    // Default sort by NEWEST
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return results;
}

export async function submitMockFeedbackResponse(feedbackId: string, responseText: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const feedbackIndex = mockFeedbackList.findIndex(f => f.id === feedbackId);
  if (feedbackIndex === -1) return false;

  mockFeedbackList[feedbackIndex].response = {
    id: `res_mock_${Date.now()}`,
    responseText,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return true;
}
