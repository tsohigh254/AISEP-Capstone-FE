import { IConsultingStartup, ConsultingFormat } from './advisor-consulting';

// BE enum (auto-approve flow): Draft → Passed (ngay sau submit)
// PendingReview giữ lại như fallback nhưng BE không bao giờ set nữa
// Failed / NeedsMoreInfo chỉ Staff set được (giữ trong code để backward-compat)
export type ConsultationReportStatus =
  | 'Draft'
  | 'Passed'
  | 'Failed'
  | 'NeedsMoreInfo'
  | 'PendingReview';

export type ReportAttachmentType = 'DELIVERABLE' | 'SUPPORTING_NOTE' | 'IMAGE' | 'OTHER';

export interface IConsultationReportAttachment {
  id: string;
  reportId: string;
  originalFileName: string;
  mimeType: string;
  fileSizeBytes: number;
  attachmentType: ReportAttachmentType;
  uploadedAt: string;
  url: string;
}

export interface IConsultationReportHistory {
  id: string;
  reportId: string;
  version: number;
  eventType: string;
  actorType: 'ADVISOR' | 'SYSTEM' | 'STAFF';
  summary: string;
  createdAt: string;
}

export interface IConsultationReport {
  id: string;
  sessionId: string;
  advisorId: string;
  startupId: string;
  startup: IConsultingStartup;
  
  // Content
  title: string;
  summary: string;
  discussionOverview: string;
  keyFindings: string;
  advisorRecommendations: string;
  identifiedRisks: string;
  nextSteps: string;
  
  // Deliverables
  deliverablesSummary: string;
  followUpRequired: boolean;
  followUpNotes?: string;
  
  // Metadata
  submittedAt?: string;
  lastEditedAt: string;
  version: number;
  
  // Review status — trường chính FE dùng để điều hướng UI
  reviewStatus: ConsultationReportStatus;
  staffReviewNote?: string | null;
  reviewedAt?: string | null;
  staffRemarks?: string;

  // Startup acknowledgement
  startupAcknowledgedAt?: string | null;
  
  // Attachments
  attachmentsURL?: string | null;
  attachments: IConsultationReportAttachment[];

  // History
  history: IConsultationReportHistory[];
  
  // Link to original session info for display
  sessionDate: string;
  sessionFormat: ConsultingFormat;
}
