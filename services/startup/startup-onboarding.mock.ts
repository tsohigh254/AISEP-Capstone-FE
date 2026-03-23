/**
 * Mock Service for Startup Onboarding
 * Based on Hybrid 5-Step Flow
 */

export interface OnboardingData {
  // Step 1: Identity
  startupName: string;
  industry: string;
  stage: string;
  legalType: "WITH_LEGAL_ENTITY" | "WITHOUT_LEGAL_ENTITY";
  
  // Step 2: Pitch
  problem: string;
  solution: string;
  targetAudience: string;
  
  // Step 3: Documents
  pitchDeckUrl?: string;
  websiteUrl?: string;
  productLink?: string;
  
  // Step 4: Progress
  completenessScore: number;
}

export const initialOnboardingData: OnboardingData = {
  startupName: "",
  industry: "",
  stage: "",
  legalType: "WITH_LEGAL_ENTITY",
  problem: "",
  solution: "",
  targetAudience: "",
  completenessScore: 0
};

export const saveOnboardingProgress = async (data: OnboardingData): Promise<{ success: boolean }> => {
  console.log("Saving Onboarding Data:", data);
  await new Promise(resolve => setTimeout(resolve, 800));
  return { success: true };
};

export const calculateReadiness = (data: OnboardingData): { score: number; missingItems: string[] } => {
  let score = 0;
  const missingItems = [];

  if (data.startupName) score += 10; else missingItems.push("Tên Startup");
  if (data.industry) score += 10; else missingItems.push("Lĩnh vực hoạt động");
  if (data.stage) score += 10; else missingItems.push("Giai đoạn phát triển");
  if (data.problem) score += 15; else missingItems.push("Mô tả vấn đề đang giải quyết");
  if (data.solution) score += 15; else missingItems.push("Mô tả giải pháp");
  if (data.targetAudience) score += 10; else missingItems.push("Đối tượng khách hàng");
  if (data.pitchDeckUrl) score += 20; else missingItems.push("Tài liệu Pitch Deck");
  if (data.websiteUrl || data.productLink) score += 10; else missingItems.push("Link sản phẩm/Website");

  return { score, missingItems };
};
