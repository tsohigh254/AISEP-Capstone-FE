export type IssueCategory =
  | 'PAYMENT_ISSUE'
  | 'CONSULTING_ISSUE'
  | 'MESSAGING_ISSUE'
  | 'OFFER_OR_CONNECTION_ISSUE'
  | 'VERIFICATION_ISSUE'
  | 'DOCUMENT_ISSUE'
  | 'HARASSMENT_OR_MISCONDUCT'
  | 'TECHNICAL_PROBLEM'
  | 'OTHER';

export interface IssueReportInput {
  issueCategory: IssueCategory;
  relatedEntityType?: string;
  relatedEntityId?: string;
  description: string;
  attachments?: File[];
}

export interface IssueReportResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    status: string;
    submittedAt: string;
  };
}

/**
 * Mock API to submit an issue report.
 * In a real scenario, this would call POST /api/issues
 */
export async function SubmitIssueReport(input: IssueReportInput): Promise<IssueReportResponse> {
  console.log("Submitting Issue Report:", input);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // For demonstration, always return success unless description is empty (client-side handles this anyway)
  if (!input.description || !input.issueCategory) {
    return {
      success: false,
      message: "Missing required fields."
    };
  }

  return {
    success: true,
    message: "Báo cáo sự cố đã được gửi thành công.",
    data: {
      id: "ISSUE-" + Math.floor(1000 + Math.random() * 9000),
      status: "SUBMITTED",
      submittedAt: new Date().toISOString()
    }
  };
}
