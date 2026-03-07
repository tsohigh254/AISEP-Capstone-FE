import axios from "../interceptor";

export const GetNotifications = (params?: {
    unreadOnly?: boolean;
    type?: string;
    page?: number;
    pageSize?: number;
}) => {
    return axios.get<IBackendRes<IPaginatedRes<INotificationItem>>>(`/api/notifications`, {
        params: {
            page: params?.page ?? 1,
            pageSize: params?.pageSize ?? 20,
            ...(params?.unreadOnly !== undefined && { unreadOnly: params.unreadOnly }),
            ...(params?.type && { type: params.type }),
        },
    });
};

export const GetNotificationById = (id: number) => {
    return axios.get<IBackendRes<INotificationDetail>>(`/api/notifications/${id}`);
};

export const DeleteNotification = (id: number) => {
    return axios.delete<IBackendRes<string>>(`/api/notifications/${id}`);
};

export const MarkNotificationAsRead = (id: number, isRead: boolean = true) => {
    return axios.put<IBackendRes<string>>(`/api/notifications/${id}/read`, { isRead });
};

export const MarkAllNotificationsAsRead = () => {
    return axios.put<IBackendRes<string>>(`/api/notifications/read-all`);
};
