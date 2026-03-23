import { IConsultingStartup, ConsultingFormat } from './advisor-consulting';

export type ConsultationReportStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'NEEDS_REVISION'
  | 'FINALIZED'
  | 'DELETED';

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
  status: ConsultationReportStatus;
  version: number;
  submittedAt?: string;
  finalizedAt?: string;
  lastEditedAt: string;
  
  // Review (Staff side feedback)
  staffRemarks?: string;
  
  // Attachments
  attachments: IConsultationReportAttachment[];

  // History
  history: IConsultationReportHistory[];
  
  // Link to original session info for display
  sessionDate: string;
  sessionFormat: ConsultingFormat;
}
