import axios from "../interceptor";

interface ICreateMentorshipRequest {
    advisorId: number
    challengeDescription: string
    specificQuestions: string
    expectedDuration: string
    expectedScope: string
}

interface ICreateSessionRequest {
    scheduledStartAt: string
    durationMinutes: number
    meetingUrl: string
}

interface ICreateReportRequest {
    sessionId: number
    reportSummary: string
    detailedFindings: string
    recommendations: string
}

interface ICreateFeedBackRequest {
    sessionId: number
    rating: number
    comment: string
}

interface ISlotRequest {
    startTime: string
    endTime: string
    notes: string
}

interface IWeeklySchedule {
    slots: ISlotRequest[]
}

interface IBookSessionRequest {
    mentorshipID: number
    availableSlotID: number
    meetingUrl: string
}

interface ISlotUpdateRequest {
    startTime: string
    endTime: string
    notes: string
    isActive: boolean
}

export const CreateMentorship = (data: ICreateMentorshipRequest) => {
    return axios.post<IBackendRes<string>>("/api/mentorships", data);
}

export interface IGetMentorshipsParams {
    page?: number
    pageSize?: number
    key?: string
}

export interface ISessionParams {
    page?: number
    pageSize?: number
}

export interface IAvailableSlotParams {
    page?: number
    pageSize?: number
}

// export const GetMentorships = (params: IGetMentorshipsParams = {}) => {
//     const query = new URLSearchParams();
//     query.set("Page", String(params.page ?? 1));
//     query.set("PageSize", String(params.pageSize ?? 10));

//     if (params.key?.trim()) {
//         query.set("Key", params.key.trim());
//     }

//     return axios.get<IBackendRes<IPagingData<IMentorship>>>(`/api/mentorships?${query}`);
// }

// export const GetMentorshipById = (id: number) => {
//     return axios.get<IBackendRes<IMentorshipDetail>>(`/api/mentorships/${id}`);
// }

export const AcceptMentorship = (id: number) => {
    return axios.post<IBackendRes<string>>(`/api/mentorships/${id}/accept`);
}

export const RejectMentorship = (id: number, reason: string) => {
    return axios.post<IBackendRes<string>>(`/api/mentorships/${id}/reject`, { reason });
}

// export const CreateSession = (id: number, data: ICreateSessionRequest) => {
//     return axios.post<IBackendRes<string>>(`/api/mentorships/${id}/sessions`, data)
// }

// export const UpdateSession = (id: number) => {
//     return axios.put<IBackendRes<string>>(`/api/mentorships/sessions/${id}`)
// }

export const CreateReport = (id: number, data: ICreateReportRequest) => {
    return axios.post<IBackendRes<string>>(`/api/mentorships/${id}/reports`, data)
}

// export const GetSessions = (params: ISessionParams) => {
//     const query = new URLSearchParams();
//     query.set("Page", String(params.page ?? 1));
//     query.set("PageSize", String(params.pageSize ?? 10));

//     return axios.get<IBackendRes<IPagingData<ISession>>>(`/api/mentorships/sessions?${query}`)
// }

// export const GetReport = (id: number) => {
//     return axios.get<IBackendRes<IReport>>(`/api/mentorships/${id}/reports`)
// }

// export const CreateFeedBack = (id: number, data: ICreateFeedBackRequest) => {
//     return axios.post<IBackendRes<string>>(`/api/mentorships/${id}/feedback`, data)
// }

// // Advisor slot + Book Session
// export const CreateWeeklySchedule = (data: ISlotRequest) => {
//     return axios.post<IBackendRes<string>>(`/api/mentorships/available-slots`, data)
// }

// export const CreateWeeklyScheduleBulk = (data: IWeeklySchedule) => {
//     return axios.post<IBackendRes<string>>(`/api/mentorships/available-slots/bulk`, data)
// }

// export const UpdateWeeklySchedule = (templateId: number, data: ISlotUpdateRequest) => {
//     return axios.put<IBackendRes<string>>(`/api/mentorships/available-slots/${templateId}`, data)
// }

// export const DeleteWeeklySchedule = (templateId: number) => {
//     return axios.delete<IBackendRes<string>>(`/api/mentorships/available-slots/${templateId}`)
// }

// export const GetAvailableSlots = (params: IAvailableSlotParams) => {
//     const query = new URLSearchParams();
//     query.set("Page", String(params.page ?? 1));
//     query.set("PageSize", String(params.pageSize ?? 10));

//     return axios.get<IBackendRes<ISlot[]>>(`/api/mentorships/my-available-slots?${query}`)
// }

// export const GetAvailableSlotsByMentorId = (advisorId: number, params: IAvailableSlotParams) => {
//     const query = new URLSearchParams();
//     query.set("Page", String(params.page ?? 1));
//     query.set("PageSize", String(params.pageSize ?? 10));

//     return axios.get<IBackendRes<ISlot[]>>(`/api/mentorships/advisors/${advisorId}/available-slots?${query}`)
// }

// export const BookSession = (data: IBookSessionRequest) => {
//     return axios.post<IBackendRes<string>>(`/api/mentorships/book-session`, data)
// }

