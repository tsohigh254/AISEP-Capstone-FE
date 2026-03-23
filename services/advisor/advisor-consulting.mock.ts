import type {
  IConsultingRequest,
  IConsultingSession,
  IConsultingStartup,
} from '@/types/advisor-consulting';

// ---------------------------------------------------------------------------
// Startup stubs
// ---------------------------------------------------------------------------

export const startupFinNext: IConsultingStartup = {
  id: 101,
  displayName: 'FinNext',
  logoUrl: null,
  industry: 'Fintech',
  stage: 'Series A',
};

export const startupMedScanAI: IConsultingStartup = {
  id: 102,
  displayName: 'MedScan AI',
  logoUrl: null,
  industry: 'HealthTech',
  stage: 'Seed',
};

export const startupEduPlatform: IConsultingStartup = {
  id: 103,
  displayName: 'EduPlatform',
  logoUrl: null,
  industry: 'EdTech',
  stage: 'Pre-Seed',
};

export const startupGreenLogistics: IConsultingStartup = {
  id: 104,
  displayName: 'GreenLogistics',
  logoUrl: null,
  industry: 'Logistics & Supply Chain',
  stage: 'Series A',
};

const startupCloudKitchenVN: IConsultingStartup = {
  id: 105,
  displayName: 'CloudKitchen VN',
  logoUrl: null,
  industry: 'FoodTech',
  stage: 'Series B',
};

const startupCryptoTrade: IConsultingStartup = {
  id: 106,
  displayName: 'CryptoTrade',
  logoUrl: null,
  industry: 'Blockchain & Crypto',
  stage: 'Seed',
};

const startupAutoDrive: IConsultingStartup = {
  id: 107,
  displayName: 'AutoDrive',
  logoUrl: null,
  industry: 'Automotive Tech',
  stage: 'Series A',
};

// ---------------------------------------------------------------------------
// Mock requests
// ---------------------------------------------------------------------------

const mockRequests: IConsultingRequest[] = [
  // 1 ── REQUESTED – FinNext
  {
    id: 'req-001',
    status: 'REQUESTED',
    submittedAt: '2026-03-20T09:00:00+07:00',
    expiresAt: '2026-03-24T09:00:00+07:00',
    startup: startupFinNext,
    objective: 'Go-to-market strategy',
    problemContext: 'Chúng tôi có sản phẩm B2B payment nhưng chưa rõ cách tiếp cận đúng phân khúc SME ở thị trường Việt Nam. Đã thử cold email nhưng tỷ lệ chuyển đổi rất thấp.',
    scopeTags: ['strategy', 'marketing'],
    durationMinutes: 60,
    additionalNotes: 'Startup is preparing for launch in Q2 2026. Need actionable timeline.',
    preferredFormat: 'GOOGLE_MEET',
    preferredSlots: [
      {
        id: 'slot-001a',
        proposedBy: 'STARTUP',
        startAt: '2026-03-25T10:00:00+07:00',
        endAt: '2026-03-25T11:00:00+07:00',
        timezone: 'Asia/Ho_Chi_Minh',
        status: 'PROPOSED',
        note: 'Morning preferred',
        createdAt: '2026-03-20T09:00:00+07:00',
      },
      {
        id: 'slot-001b',
        proposedBy: 'STARTUP',
        startAt: '2026-03-26T14:00:00+07:00',
        endAt: '2026-03-26T15:00:00+07:00',
        timezone: 'Asia/Ho_Chi_Minh',
        status: 'PROPOSED',
        createdAt: '2026-03-20T09:00:00+07:00',
      },
    ],
    slotProposals: [],
    confirmation: {
      startupConfirmedAt: null,
      advisorConfirmedAt: null,
      fullyConfirmed: false,
    },
    timeline: [
      {
        id: 'act-001a',
        actionType: 'REQUEST_CREATED',
        actorType: 'STARTUP',
        toStatus: 'REQUESTED',
        createdAt: '2026-03-20T09:00:00+07:00',
      },
    ],
  },

  // 2 ── REQUESTED – MedScan AI
  {
    id: 'req-002',
    status: 'REQUESTED',
    submittedAt: '2026-03-21T11:30:00+07:00',
    expiresAt: '2026-03-23T11:30:00+07:00',
    startup: startupMedScanAI,
    objective: 'Fundraising readiness',
    problemContext: 'Chúng tôi chuẩn bị gặp các Series A investor trong 6 tuần tới nhưng chưa tự tin về pitch deck và financial model. Cần góc nhìn từ người đã từng raise thành công.',
    scopeTags: ['fundraising', 'strategy'],
    durationMinutes: 60,
    preferredFormat: 'MICROSOFT_TEAMS',
    preferredSlots: [
      {
        id: 'slot-002a',
        proposedBy: 'STARTUP',
        startAt: '2026-03-27T09:00:00+07:00',
        endAt: '2026-03-27T10:00:00+07:00',
        timezone: 'Asia/Ho_Chi_Minh',
        status: 'PROPOSED',
        createdAt: '2026-03-21T11:30:00+07:00',
      },
    ],
    slotProposals: [],
    confirmation: {
      startupConfirmedAt: null,
      advisorConfirmedAt: null,
      fullyConfirmed: false,
    },
    timeline: [
      {
        id: 'act-002a',
        actionType: 'REQUEST_CREATED',
        actorType: 'STARTUP',
        toStatus: 'REQUESTED',
        createdAt: '2026-03-21T11:30:00+07:00',
      },
    ],
  },

  // 3 ── ACCEPTED – EduPlatform
  {
    id: 'req-003',
    status: 'ACCEPTED',
    submittedAt: '2026-03-15T08:00:00+07:00',
    expiresAt: null,
    startup: startupEduPlatform,
    objective: 'Product strategy',
    problemContext: 'Roadmap hiện tại có quá nhiều feature đang được build song song, team đang bị overload và chưa rõ ưu tiên nào thực sự tạo ra giá trị cho user.',
    scopeTags: ['product', 'strategy'],
    durationMinutes: 90,
    additionalNotes: 'Currently serving 5,000 MAU across 3 universities.',
    preferredFormat: 'GOOGLE_MEET',
    preferredSlots: [
      {
        id: 'slot-003a',
        proposedBy: 'STARTUP',
        startAt: '2026-03-20T13:00:00+07:00',
        endAt: '2026-03-20T14:30:00+07:00',
        timezone: 'Asia/Ho_Chi_Minh',
        status: 'DECLINED',
        createdAt: '2026-03-15T08:00:00+07:00',
      },
    ],
    slotProposals: [
      {
        id: 'slot-003b',
        proposedBy: 'ADVISOR',
        startAt: '2026-03-28T10:00:00+07:00',
        endAt: '2026-03-28T11:30:00+07:00',
        timezone: 'Asia/Ho_Chi_Minh',
        status: 'PROPOSED',
        note: 'I am available Friday morning instead.',
        createdAt: '2026-03-17T15:00:00+07:00',
      },
      {
        id: 'slot-003c',
        proposedBy: 'ADVISOR',
        startAt: '2026-03-29T14:00:00+07:00',
        endAt: '2026-03-29T15:30:00+07:00',
        timezone: 'Asia/Ho_Chi_Minh',
        status: 'PROPOSED',
        note: 'Saturday afternoon also works.',
        createdAt: '2026-03-17T15:00:00+07:00',
      },
    ],
    confirmation: {
      startupConfirmedAt: null,
      advisorConfirmedAt: null,
      fullyConfirmed: false,
    },
    acceptedAt: '2026-03-17T14:45:00+07:00',
    advisorRespondedAt: '2026-03-17T14:45:00+07:00',
    timeline: [
      {
        id: 'act-003a',
        actionType: 'REQUEST_CREATED',
        actorType: 'STARTUP',
        toStatus: 'REQUESTED',
        createdAt: '2026-03-15T08:00:00+07:00',
      },
      {
        id: 'act-003b',
        actionType: 'REQUEST_ACCEPTED',
        actorType: 'ADVISOR',
        fromStatus: 'REQUESTED',
        toStatus: 'ACCEPTED',
        createdAt: '2026-03-17T14:45:00+07:00',
      },
      {
        id: 'act-003c',
        actionType: 'SLOTS_PROPOSED',
        actorType: 'ADVISOR',
        metadata: { slotCount: 2 },
        createdAt: '2026-03-17T15:00:00+07:00',
      },
    ],
  },

  // 4 ── SCHEDULED – GreenLogistics
  {
    id: 'req-004',
    status: 'SCHEDULED',
    submittedAt: '2026-03-10T07:30:00+07:00',
    expiresAt: null,
    startup: startupGreenLogistics,
    objective: 'Operations review',
    problemContext: 'Chi phí last-mile delivery đang chiếm 38% doanh thu, cao hơn benchmark ngành 15%. Chúng tôi đã thử tối ưu route nhưng chưa tìm ra đòn bẩy chính.',
    scopeTags: ['operations', 'strategy'],
    durationMinutes: 60,
    preferredFormat: 'MICROSOFT_TEAMS',
    preferredSlots: [
      {
        id: 'slot-004a',
        proposedBy: 'STARTUP',
        startAt: '2026-03-24T09:00:00+07:00',
        endAt: '2026-03-24T10:00:00+07:00',
        timezone: 'Asia/Ho_Chi_Minh',
        status: 'ACCEPTED',
        createdAt: '2026-03-10T07:30:00+07:00',
      },
    ],
    slotProposals: [],
    confirmation: {
      startupConfirmedAt: '2026-03-13T10:00:00+07:00',
      advisorConfirmedAt: '2026-03-12T16:00:00+07:00',
      fullyConfirmed: true,
    },
    acceptedAt: '2026-03-12T15:30:00+07:00',
    advisorRespondedAt: '2026-03-12T15:30:00+07:00',
    timeline: [
      {
        id: 'act-004a',
        actionType: 'REQUEST_CREATED',
        actorType: 'STARTUP',
        toStatus: 'REQUESTED',
        createdAt: '2026-03-10T07:30:00+07:00',
      },
      {
        id: 'act-004b',
        actionType: 'REQUEST_ACCEPTED',
        actorType: 'ADVISOR',
        fromStatus: 'REQUESTED',
        toStatus: 'ACCEPTED',
        createdAt: '2026-03-12T15:30:00+07:00',
      },
      {
        id: 'act-004c',
        actionType: 'SLOT_ACCEPTED',
        actorType: 'ADVISOR',
        metadata: { slotId: 'slot-004a' },
        createdAt: '2026-03-12T16:00:00+07:00',
      },
      {
        id: 'act-004d',
        actionType: 'SCHEDULE_CONFIRMED',
        actorType: 'SYSTEM',
        fromStatus: 'ACCEPTED',
        toStatus: 'SCHEDULED',
        createdAt: '2026-03-13T10:00:00+07:00',
      },
    ],
  },

  // 5 ── COMPLETED – CloudKitchen VN
  {
    id: 'req-005',
    status: 'FINALIZED',
    submittedAt: '2026-03-01T10:00:00+07:00',
    expiresAt: null,
    startup: startupCloudKitchenVN,
    objective: 'Finance advisory',
    problemContext: 'Runway hiện tại còn 8 tháng, unit economics chưa positive. Cần advisor giúp review và đưa ra khuyến nghị cụ thể trước khi raise Series B.',
    scopeTags: ['fundraising', 'strategy'],
    durationMinutes: 90,
    preferredFormat: 'GOOGLE_MEET',
    preferredSlots: [
      {
        id: 'slot-005a',
        proposedBy: 'STARTUP',
        startAt: '2026-03-08T14:00:00+07:00',
        endAt: '2026-03-08T15:30:00+07:00',
        timezone: 'Asia/Ho_Chi_Minh',
        status: 'ACCEPTED',
        createdAt: '2026-03-01T10:00:00+07:00',
      },
    ],
    slotProposals: [],
    confirmation: {
      startupConfirmedAt: '2026-03-04T09:00:00+07:00',
      advisorConfirmedAt: '2026-03-03T17:00:00+07:00',
      fullyConfirmed: true,
    },
    acceptedAt: '2026-03-03T16:30:00+07:00',
    advisorRespondedAt: '2026-03-03T16:30:00+07:00',
    timeline: [
      {
        id: 'act-005a',
        actionType: 'REQUEST_CREATED',
        actorType: 'STARTUP',
        toStatus: 'REQUESTED',
        createdAt: '2026-03-01T10:00:00+07:00',
      },
      {
        id: 'act-005b',
        actionType: 'REQUEST_ACCEPTED',
        actorType: 'ADVISOR',
        fromStatus: 'REQUESTED',
        toStatus: 'ACCEPTED',
        createdAt: '2026-03-03T16:30:00+07:00',
      },
      {
        id: 'act-005c',
        actionType: 'SCHEDULE_CONFIRMED',
        actorType: 'SYSTEM',
        fromStatus: 'ACCEPTED',
        toStatus: 'SCHEDULED',
        createdAt: '2026-03-04T09:00:00+07:00',
      },
      {
        id: 'act-005d',
        actionType: 'SESSION_COMPLETED',
        actorType: 'SYSTEM',
        fromStatus: 'SCHEDULED',
        toStatus: 'COMPLETED',
        createdAt: '2026-03-08T15:35:00+07:00',
      },
    ],
  },

  // 6 ── REJECTED – CryptoTrade
  {
    id: 'req-006',
    status: 'REJECTED',
    submittedAt: '2026-03-18T14:00:00+07:00',
    expiresAt: null,
    startup: startupCryptoTrade,
    objective: 'Legal consultation',
    problemContext: 'Chúng tôi đang vận hành sàn crypto nhưng chưa rõ nghĩa vụ pháp lý theo quy định mới của Việt Nam. Cần review để tránh rủi ro tuân thủ.',
    scopeTags: ['legal'],
    durationMinutes: 60,
    preferredFormat: 'GOOGLE_MEET',
    preferredSlots: [
      {
        id: 'slot-006a',
        proposedBy: 'STARTUP',
        startAt: '2026-03-25T09:00:00+07:00',
        endAt: '2026-03-25T10:00:00+07:00',
        timezone: 'Asia/Ho_Chi_Minh',
        status: 'DECLINED',
        createdAt: '2026-03-18T14:00:00+07:00',
      },
    ],
    slotProposals: [],
    confirmation: {
      startupConfirmedAt: null,
      advisorConfirmedAt: null,
      fullyConfirmed: false,
    },
    rejectionReason: 'Không phù hợp chuyên môn',
    rejectedAt: '2026-03-19T10:00:00+07:00',
    advisorRespondedAt: '2026-03-19T10:00:00+07:00',
    timeline: [
      {
        id: 'act-006a',
        actionType: 'REQUEST_CREATED',
        actorType: 'STARTUP',
        toStatus: 'REQUESTED',
        createdAt: '2026-03-18T14:00:00+07:00',
      },
      {
        id: 'act-006b',
        actionType: 'REQUEST_REJECTED',
        actorType: 'ADVISOR',
        fromStatus: 'REQUESTED',
        toStatus: 'REJECTED',
        metadata: { reason: 'Không phù hợp chuyên môn' },
        createdAt: '2026-03-19T10:00:00+07:00',
      },
    ],
  },

  // 7 ── CANCELLED – AutoDrive
  {
    id: 'req-007',
    status: 'CANCELLED',
    submittedAt: '2026-03-12T08:00:00+07:00',
    expiresAt: null,
    startup: startupAutoDrive,
    objective: 'Technology review',
    problemContext: 'Tech stack hiện tại đang gặp bottleneck ở sensor fusion layer, latency cao hơn yêu cầu 40ms. Cần advisor có kinh nghiệm AV để review architecture.',
    scopeTags: ['engineering', 'product'],
    durationMinutes: 90,
    preferredFormat: 'MICROSOFT_TEAMS',
    preferredSlots: [
      {
        id: 'slot-007a',
        proposedBy: 'STARTUP',
        startAt: '2026-03-20T10:00:00+07:00',
        endAt: '2026-03-20T11:30:00+07:00',
        timezone: 'Asia/Ho_Chi_Minh',
        status: 'DECLINED',
        createdAt: '2026-03-12T08:00:00+07:00',
      },
    ],
    slotProposals: [],
    confirmation: {
      startupConfirmedAt: null,
      advisorConfirmedAt: null,
      fullyConfirmed: false,
    },
    cancelReason: 'Startup đã thay đổi kế hoạch nội bộ.',
    cancelledBy: 'STARTUP',
    cancelledAt: '2026-03-16T11:00:00+07:00',
    acceptedAt: '2026-03-14T09:00:00+07:00',
    advisorRespondedAt: '2026-03-14T09:00:00+07:00',
    timeline: [
      {
        id: 'act-007a',
        actionType: 'REQUEST_CREATED',
        actorType: 'STARTUP',
        toStatus: 'REQUESTED',
        createdAt: '2026-03-12T08:00:00+07:00',
      },
      {
        id: 'act-007b',
        actionType: 'REQUEST_ACCEPTED',
        actorType: 'ADVISOR',
        fromStatus: 'REQUESTED',
        toStatus: 'ACCEPTED',
        createdAt: '2026-03-14T09:00:00+07:00',
      },
      {
        id: 'act-007c',
        actionType: 'REQUEST_CANCELLED',
        actorType: 'STARTUP',
        fromStatus: 'ACCEPTED',
        toStatus: 'CANCELLED',
        metadata: { reason: 'Startup đã thay đổi kế hoạch nội bộ.' },
        createdAt: '2026-03-16T11:00:00+07:00',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Mock sessions
// ---------------------------------------------------------------------------

const mockSessions: IConsultingSession[] = [
  // From SCHEDULED request (GreenLogistics) – upcoming
  {
    id: 'ses-001',
    requestId: 'req-004',
    startup: startupGreenLogistics,
    objective: 'Operations review',
    scheduledStartAt: '2026-03-24T09:00:00+07:00',
    scheduledEndAt: '2026-03-24T10:00:00+07:00',
    timezone: 'Asia/Ho_Chi_Minh',
    status: 'SCHEDULED',
    meetingMode: 'GOOGLE_MEET',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    confirmation: {
      startupConfirmedAt: '2026-03-13T10:00:00+07:00',
      advisorConfirmedAt: '2026-03-12T16:00:00+07:00',
      fullyConfirmed: true,
    },
  },

  // From COMPLETED request (CloudKitchen VN)
  {
    id: 'ses-002',
    requestId: 'req-005',
    startup: startupCloudKitchenVN,
    objective: 'Finance advisory',
    scheduledStartAt: '2026-03-08T14:00:00+07:00',
    scheduledEndAt: '2026-03-08T15:30:00+07:00',
    timezone: 'Asia/Ho_Chi_Minh',
    status: 'COMPLETED',
    meetingMode: 'GOOGLE_MEET',
    confirmation: {
      startupConfirmedAt: '2026-03-04T09:00:00+07:00',
      advisorConfirmedAt: '2026-03-03T17:00:00+07:00',
      fullyConfirmed: true,
    },
    completedAt: '2026-03-08T15:35:00+07:00',
  },

  // Extra upcoming session – EduPlatform (pending confirmation)
  {
    id: 'ses-003',
    requestId: 'req-003',
    startup: startupEduPlatform,
    objective: 'Product strategy',
    scheduledStartAt: '2026-03-28T10:00:00+07:00',
    scheduledEndAt: '2026-03-28T11:30:00+07:00',
    timezone: 'Asia/Ho_Chi_Minh',
    status: 'PENDING_CONFIRMATION',
    meetingMode: 'MICROSOFT_TEAMS',
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/123456789',
    confirmation: {
      startupConfirmedAt: null,
      advisorConfirmedAt: null,
      fullyConfirmed: false,
    },
  },
];

// ---------------------------------------------------------------------------
// Mock helper functions
// ---------------------------------------------------------------------------

export function getMockRequests(status?: string): IConsultingRequest[] {
  if (!status) return mockRequests;
  return mockRequests.filter((r) => r.status === status);
}

export function getMockRequestById(id: string): IConsultingRequest | null {
  return mockRequests.find((r) => r.id === id) ?? null;
}

export function getMockSessions(status?: string): IConsultingSession[] {
  if (!status) return mockSessions;
  return mockSessions.filter((s) => s.status === status);
}
