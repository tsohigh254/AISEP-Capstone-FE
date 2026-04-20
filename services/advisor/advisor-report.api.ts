import { GetAdvisorMentorships, GetAdvisorMentorshipById, GetMentorshipReport } from "@/services/advisor/advisor.api";
import { IConsultationReport, ConsultationReportStatus } from "@/types/advisor-report";
import { getMockReportById } from './advisor-report.mock';
import { parseReportFields } from "@/lib/report-parser";

export async function getAdvisorReports(): Promise<IConsultationReport[]> {
  try {
    const [completedRes, inProgressRes] = await Promise.all([
      GetAdvisorMentorships({ status: 'Completed', page: 1, pageSize: 100 }),
      GetAdvisorMentorships({ status: 'InProgress', page: 1, pageSize: 100 }),
    ]);
    const completedItems = (completedRes as any).data?.data?.items || (completedRes as any).data?.items || (completedRes as any).data?.data || [];
    const inProgressItems = (inProgressRes as any).data?.data?.items || (inProgressRes as any).data?.items || (inProgressRes as any).data?.data || [];
    const items = [...completedItems, ...inProgressItems];
    
    
    
    
    const allMentorships = items.filter((m: any, i: number, arr: any[]) => 
      arr.findIndex(x => (x.mentorshipID || x.id) === (m.mentorshipID || m.id)) === i
    );
    
    const detailPromises = allMentorships.map((m: any) => GetAdvisorMentorshipById(m.mentorshipID?.toString() || m.id?.toString()));
    const detailResponses = await Promise.allSettled(detailPromises);
    
    const reports: IConsultationReport[] = [];
    
    detailResponses.forEach(result => {
       if (result.status === 'fulfilled') {
           const data = (result.value as any).data?.data || (result.value as any).data;
           if (!data) return;
           const rawReports: any[] = data.reports || [];
           // Only show the latest (non-superseded) report per session
           const latestReports = rawReports.filter(
             // BE cung cấp isLatestForSession; fallback về supersededByReportID == null
             (r: any) => r.isLatestForSession !== false && r.supersededByReportID == null
           );
           const actualReports = latestReports.length > 0 ? latestReports : rawReports.slice(-1);
           actualReports.forEach((r: any) => {
           const normalizedReviewStatus: ConsultationReportStatus =
                 r.reviewStatus === "Draft" || !r.reviewStatus
                   ? "Draft"
                   : (r.reviewStatus as ConsultationReportStatus);
               reports.push({
                   ...parseReportFields(r.reportSummary, r.detailedFindings, r.recommendations),
                   id: r.reportID?.toString() || data.MentorshipID?.toString(),
                   sessionId: data.mentorshipID?.toString() || data.id?.toString(),
                   advisorId: data.advisorID?.toString(),
                   startupId: data.startupID?.toString(),
                   startup: {
                       id: data.startupID,
                       displayName: data.startupName,
                       logoUrl: data.startupLogoUrl || null,
                       industry: data.startupIndustry || "Ông nghệ",
                       stage: data.startupStage || "SEED"
                   },
                   reviewStatus: normalizedReviewStatus,
                   version: 1,
                   submittedAt: r.submittedAt || r.createdAt || new Date().toISOString(),
                   lastEditedAt: r.updatedAt || r.createdAt || new Date().toISOString(),
                   sessionDate: data.scheduledStartAt || data.updatedAt || new Date().toISOString(),
                   sessionFormat: "GOOGLE_MEET",
                   attachmentsURL: r.attachmentsURL || null,
                   startupAcknowledgedAt: r.startupAcknowledgedAt || null,
                   staffReviewNote: r.staffReviewNote || null,
                   attachments: r.attachmentsURL
                     ? [{
                         id: r.reportID?.toString() || "att-1",
                         reportId: r.reportID?.toString() || "",
                         originalFileName: r.attachmentsURL.split("/").pop()?.split("?")[0] || "Tài liệu",
                         mimeType: "application/octet-stream",
                         fileSizeBytes: 0,
                         attachmentType: "DOCUMENT" as any,
                         uploadedAt: r.updatedAt || r.createdAt || new Date().toISOString(),
                         url: r.attachmentsURL,
                       }]
                     : [],
                   history: []
               });
           });
       }
    });
    return reports;
  } catch(e) {
    console.error(e);
    return [];
  }
}

export async function getAdvisorReportById(id: string): Promise<IConsultationReport | null> {
  try {
     // GET /api/mentorships/{id} includes reports[] — no separate endpoint needed
     const detailRes = await GetAdvisorMentorshipById(id);
     const data = (detailRes as any).data?.data || (detailRes as any).data;
     if (!data) return null;

     const actualReport = Array.isArray(data.reports) ? data.reports[0] : null;
     if (!actualReport) return null;

     const normalizedReviewStatus: ConsultationReportStatus =
       actualReport.reviewStatus === "Draft" || !actualReport.reviewStatus
         ? "Draft"
         : (actualReport.reviewStatus as ConsultationReportStatus);

     return {
         ...parseReportFields(actualReport.reportSummary, actualReport.detailedFindings, actualReport.recommendations),
         id: actualReport.reportID?.toString() || actualReport.ReportID?.toString() || data.MentorshipID?.toString(),
         sessionId: data.mentorshipID?.toString() || data.id?.toString(),       
         advisorId: data.advisorID?.toString(),
         startupId: data.startupID?.toString(),
         startup: {
             id: data.startupID,
             displayName: data.startupName,
             logoUrl: data.startupLogoUrl || null,
             industry: data.startupIndustry || "Công nghệ",
             stage: data.startupStage || "SEED"
         },
         reviewStatus: normalizedReviewStatus,
         version: 1,
         submittedAt: actualReport.submittedAt || actualReport.createdAt || new Date().toISOString(),
         lastEditedAt: actualReport.updatedAt || actualReport.createdAt || new Date().toISOString(),
         sessionDate: data.scheduledStartAt || data.updatedAt || new Date().toISOString(),
         sessionFormat: "GOOGLE_MEET",
         attachmentsURL: actualReport.attachmentsURL || null,
         startupAcknowledgedAt: actualReport.startupAcknowledgedAt || null,
         staffReviewNote: actualReport.staffReviewNote || null,
         attachments: actualReport.attachmentsURL
           ? [{
               id: actualReport.reportID?.toString() || "att-1",
               reportId: actualReport.reportID?.toString() || "",
               originalFileName: actualReport.attachmentsURL.split("/").pop()?.split("?")[0] || "Tài liệu",
               mimeType: "application/octet-stream",
               fileSizeBytes: 0,
               attachmentType: "DOCUMENT" as any,
               uploadedAt: actualReport.updatedAt || actualReport.createdAt || new Date().toISOString(),
               url: actualReport.attachmentsURL,
             }]
           : [],
         history: []
     };
  } catch (e) {
     return getMockReportById(id) || null;
  }
}
