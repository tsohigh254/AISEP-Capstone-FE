export function getStartupIndustryDisplay(profile: any, industries: any[] = []): string {
  if (!profile) return "Chưa có ngành";

  const parentIndustryId = Number(profile.industryId ?? profile.industryID ?? 0);
  const subIndustryId = Number(profile.subIndustryId ?? profile.subIndustryID ?? 0);

  const parentIndustryName =
    profile.parentIndustryName ||
    profile.industryName ||
    industries.find((item: any) => item.industryId === parentIndustryId || item.industryID === parentIndustryId)?.industryName ||
    "";

  const subIndustryName =
    profile.subIndustryName ||
    industries.find((item: any) => item.industryId === subIndustryId || item.industryID === subIndustryId)?.industryName ||
    "";

  const fallbackIndustry =
    profile.industry ||
    industries.find((item: any) => item.industryId === parentIndustryId || item.industryID === parentIndustryId)?.industryName ||
    "Chưa có ngành";

  return subIndustryName && parentIndustryName
    ? `${parentIndustryName} / ${subIndustryName}`
    : parentIndustryName || subIndustryName || fallbackIndustry;
}
