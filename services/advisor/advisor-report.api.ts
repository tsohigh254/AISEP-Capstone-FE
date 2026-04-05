import { GetAdvisorMentorships, GetAdvisorMentorshipById, GetMentorshipReport } from "@/services/advisor/advisor.api";
import { IConsultationReport, ConsultationReportStatus } from "@/types/advisor-report";
import { getMockReportById } from './advisor-report.mock';
import { parseReportFields } from "@/lib/report-parser";

export async function getAdvisorReports(): Promise<IConsultationReport[]> {
  try {
    const res = await GetAdvisorMentorships({ status: 'Completed', page: 1, pageSize: 100 });
    const items = (res as any).data?.data?.items || (res as any).data?.items || (res as any).data?.data || [];
    
    
    
    
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
           const actualReports = data.reports || [];
           actualReports.forEach((r: any) => {
               reports.push({
                   id: r.reportID?.toString() || data.MentorshipID?.toString(),
                   sessionId: data.mentorshipID?.toString() || data.id?.toString(),
                   advisorId: data.advisorID?.toString(),
                   startupId: data.startupID?.toString(),
                   startup: {
                       id: data.startupID,
                       displayName: data.startupName,
                       logoUrl: null,
                       industry: "Công nghệ",
                       stage: "SEED"
                   },
                   ...parseReportFields(r.reportSummary, r.detailedFindings, r.recommendations),
                   title: "Báo cáo tư vấn " + data.startupName,
                   followUpRequired: false,
                   status: (data.completionConfirmedByStartup || (data.feedbacks && data.feedbacks.some((f: any) => f.fromRole?.toUpperCase() === 'STARTUP'))) ? "FINALIZED" : "SUBMITTED",
                   version: 1,
                   submittedAt: r.submittedAt || r.createdAt || new Date().toISOString(),
                   lastEditedAt: r.updatedAt || r.createdAt || new Date().toISOString(),
                   sessionDate: data.scheduledStartAt || data.updatedAt || new Date().toISOString(),
                   sessionFormat: "GOOGLE_MEET",
                   attachments: [],
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
     const reportRes = await GetMentorshipReport(id);
     const actualReport = (reportRes as any).data?.data || (reportRes as any).data;
     if (!actualReport) return getMockReportById(id) || null;

     const detailRes = await GetAdvisorMentorshipById(actualReport.mentorshipID?.toString() || actualReport.MentorshipID?.toString());
     const data = (detailRes as any).data?.data || (detailRes as any).data;
     if (!data) return getMockReportById(id) || null;

     return {
         ...parseReportFields(actualReport.reportSummary, actualReport.detailedFindings, actualReport.recommendations),
         id: actualReport.reportID?.toString() || actualReport.ReportID?.toString() || data.MentorshipID?.toString(),
         sessionId: data.mentorshipID?.toString() || data.id?.toString(),       
         advisorId: data.advisorID?.toString(),
         startupId: data.startupID?.toString(),
         startup: {
             id: data.startupID,
             displayName: data.startupName,
             logoUrl: null,
             industry: "Công nghệ",
             stage: "SEED"
         },
         title: "Báo cáo tư vấn " + data.startupName,
         followUpRequired: false,
         status: (data.completionConfirmedByStartup || (data.feedbacks && data.feedbacks.some((f: any) => f.fromRole?.toUpperCase() === 'STARTUP'))) ? "FINALIZED" : "SUBMITTED",
         version: 1,
         submittedAt: actualReport.submittedAt || actualReport.createdAt || new Date().toISOString(),
         lastEditedAt: actualReport.updatedAt || actualReport.createdAt || new Date().toISOString(),
         sessionDate: data.scheduledStartAt || data.updatedAt || new Date().toISOString(),
         sessionFormat: "GOOGLE_MEET",
         attachments: [],
         history: []
     };
  } catch (e) {
     return getMockReportById(id) || null;
  }
}
