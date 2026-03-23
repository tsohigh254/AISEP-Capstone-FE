import { getMockReports, getMockReportById } from './advisor-report.mock';
import { IConsultationReport } from '@/types/advisor-report';

export async function getAdvisorReports(): Promise<IConsultationReport[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return getMockReports();
}

export async function getAdvisorReportById(id: string): Promise<IConsultationReport | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return getMockReportById(id) || null;
}
