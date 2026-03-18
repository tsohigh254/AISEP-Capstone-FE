export { };

declare global {
    interface IBackendRes<T> {
        success: boolean
        data?: T | null
        message: string
        error: IError | null
    }

    interface IError {
        code: string
        message: string
        details: IErrorDetail[]
    }

    interface IErrorDetail {
        field: string
        message: string
    }

    interface IRegisterInfo {
        userID: number
        email: string
        userType: string
        roles: string[]
        accessToken: string
        refreshToken: string
        accessTokenExpires: string
        refreshTokenExpires: string
    }

    interface ILoginInfo {
        info: {
            userId: number
            email: string
            userType: string
            isActive: boolean
            emailVerified: boolean
            createdAt: string
            lastLoginAt: string
            roles: string[]
        }
        accessToken: string
        accessTokenExpires: string
    }

    interface IUser {
        userID: number
        email: string
        userType: string
        roles: string[]
    }

    interface IInvestorProfile {
        investorID: number
        fullName: string
        firmName: string
        title: string
        bio: string
        profilePhotoURL: string
        investmentThesis: string
        location: string
        country: string
        linkedInURL: string
        website: string
        createdAt: string
        updatedAt: string
    }

    interface ICreateInvestor {
        fullName: string
        firmName: string
        title: string
        bio: string
        investmentThesis: string
        location: string
        country: string
        linkedInURL: string
        website: string
    }

    interface IAdvisorProfile {
        advisorID: number
        userId: number
        fullName: string
        title: string
        company: string
        bio: string
        website: string
        linkedInURL: string
        mentorshipPhilosophy: string
        profilePhotoURL: string
        experienceYears: number
        items: string[]
        createdAt: string
        updatedAt: string
    }

    interface ICreateAdvisor {
        fullName: string
        title?: string
        company?: string
        bio?: string
        website?: string
        linkedInURL?: string
        mentorshipPhilosophy?: string
        profilePhotoURL?: File | string
        items?: string[]
    }

    interface IPaging {
        page: number
        pageSize: number
        totalItems: number
        totalPages: number
    }

    interface IPaginatedRes<T> {
        items: T[]
        paging: IPaging
    }

    interface IWatchlistItem {
        watchlistID: number
        startupID: number
        companyName: string
        oneLiner: string
        industry: string
        stage: string
        location: string
        logoURL: string
        watchReason: string
        priority: string
        addedAt: string
    }

    interface ICreateWatchlistItem {
        startupId: number
        watchReason: string
        priority: string
    }

    interface INotificationItem {
        notificationId: number
        notificationType: string
        title: string
        messagePreview: string
        isRead: boolean
        createdAt: string
        actionUrl: string
    }

    interface INotificationDetail {
        notificationId: number
        notificationType: string
        title: string
        message: string
        relatedEntityType: string
        relatedEntityId: number
        actionUrl: string
        isRead: boolean
        isSent: boolean
        createdAt: string
        readAt: string
    }

    interface IStartupSearchItem {
        startupID: number
        companyName: string
        oneLiner: string
        stage: string
        industry: string
        subIndustry: string
        location: string
        country: string
        logoURL: string
        fundingStage: string
        profileStatus: string
        updatedAt: string
    }

    // ── Connection ──
    interface IConnectionItem {
        connectionID: number
        startupID: number
        startupName: string
        investorID: number
        investorName: string
        connectionStatus: string
        personalizedMessage: string
        matchScore: number
        requestedAt: string
        respondedAt: string
    }

    interface IConnectionDetail {
        connectionID: number
        startupID: number
        startupName: string
        investorID: number
        investorName: string
        connectionStatus: string
        personalizedMessage: string
        attachedDocumentIDs: string
        matchScore: number
        requestedAt: string
        respondedAt: string
        informationRequests: IInfoRequest[]
    }

    interface IInfoRequest {
        requestID: number
        connectionID: number
        investorID: number
        requestType: string
        requestMessage: string
        requestStatus: string
        responseMessage: string
        responseDocumentIDs: string
        requestedAt: string
        fulfilledAt: string
    }

    interface ICreateConnection {
        startupId: number
        message: string
    }

    interface ICreateInfoRequest {
        requestType: string
        requestMessage: string
    }

    interface IFulfillInfoRequest {
        responseMessage: string
        responseDocumentIDs: string
    }

    // ── Admin User Management ──
    interface IAdminUser {
        userId: number
        email: string
        userType: string
        isActive: boolean
        emailVerified: boolean
        createdAt: string
        lastLoginAt: string
        roles: string[]
    }

    interface IRole {
        roleId: number
        roleName: string
        description: string
        createdAt: string
        updatedAt: string
        permissions: IPermission[]
    }

    interface IPermission {
        permissionId: number
        permissionName: string
        description: string
        category: string
    }

    interface IRegisterRequest {
        email: string
        password: string
        confirmPassword: string
        userType: string
    }
}