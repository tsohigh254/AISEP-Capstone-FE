export { };

declare global {
    interface IBackendRes<T> {
        success: boolean
        isSuccess: boolean   // alias — BE .NET dùng isSuccess
        statusCode: number   // alias — BE .NET trả kèm status code
        data?: T | null
        message: string
        error: IError<T> | null
    }

    interface IError<T> {
        code: string
        message: string
        details: IErrorDetail<T>[]
    }

    interface IErrorDetail<T> {
        field: string
        message: string
        isSuccess: boolean
        statusCode: number
        data: T | null
    }

    interface IPagingData<T> {
        items: T[]
        paging: IPaging
    }

    // Alias used in some files
    type IPaginatedRes<T> = IPagingData<T>

    interface IPaging {
        page: number
        pageSize: number
        totalItems: number
        totalPages?: number
    }

    interface IRegisterInfo {
        data: IUser
        accessToken: string
    }

    interface ILoginInfo {
        data: IUser
        accessToken: string
    }

    interface IUser {
        userId: number
        email: string
        userType: string
        isActive: boolean
        emailVerified: boolean
        createdAt: string
        lastLoginAt: string
        roles: string[]
    }

    interface IStartupProfile {
        startupID: number
        userID: number
        companyName: string
        oneLiner: string
        description: string
        industryID: number
        industryName: string
        /** Giai đoạn: số 0–6 hoặc chuỗi (API .NET). */
        stage: string | number
        foundedDate: string
        website: string
        logoURL: string
        fundingAmountSought: number
        currentFundingRaised: number
        valuation: number
        fullNameOfApplicant: string
        roleOfApplicant: string
        contactEmail: string
        contactPhone: string
        businessCode: string
        marketScope: string
        problemStatement: string
        solutionSummary: string
        isVisible: boolean
        /** Một số API trả thêm trạng thái hiển thị dạng chuỗi; ưu tiên khi có. */
        visibilityStatus?: string
        teamSize: string // Changed to string
        subIndustry: string
        currentNeeds: string[]
        metricSummary: string
        pitchDeckUrl: string
        productStatus: string
        country: string
        location: string
        fileCertificateBusiness: string
        linkedInURL: string
        profileStatus: string
        approvedAt: string
        /** Tuỳ API (có thể không có). */
        approvedBy?: string | number
        createdAt: string
        updatedAt: string
    }

    interface IAdvisorProfile {
        advisorID: number
        userId: number
        fullName: string
        title: string
        bio: string
        profilePhotoURL: string
        mentorshipPhilosophy: string
        linkedInURL: string
        profileStatus: string
        totalMentees: number
        totalSessionHours: number
        averageRating: number
        createdAt: string
        updatedAt: string
        avalability: IAvailability
        industry: IAdvisorIndustryFocus[]
    }

    interface IAdvisorIndustryFocus {
        industryId: number
        industry: string
    }

    interface IAvailability {
        sessionFormats: string
        typicalSessionDuration: number
        weeklyAvailableHours: number
        maxConcurrentMentees: number
        responseTimeCommitment: string,
        calendarConnected: boolean
        isAcceptingNewMentees: boolean
        updatedAt: string
    }

    interface IAdvisorSearchResult {
        advisorID: number
        fullName: string
        title: string
        bio: string
        profilePhotoURL: string
        averageRating: number
        industry: IAdvisorIndustryFocus[]
    }

    interface IInvestorProfile {
        investorID: number
        userID: number
        fullName: string
        title: string
        bio: string
        profilePhotoURL: string
        firmName: string
        organization: string
        investorType: string
        investmentThesis: string
        connectionGuidance: string
        supportOffered: string[]
        preferredStages: string[]
        preferredIndustries: string[]
        preferredGeographies: string[]
        preferredMarketScopes: string[]
        preferredProductMaturity: string[]
        preferredValidationLevel: string[]
        preferredStrengths: string[]
        preferredAIScoreRange: string
        aiScoreImportance: string
        acceptingConnections: boolean
        website: string
        linkedInURL: string
        country: string
        location: string
        profileStatus: string
        createdAt: string
        updatedAt: string
    }

    interface ITeamMember {
        teamMemberID: number
        fullName: string
        role: string
        title: string
        linkedInURL: string
        bio: string
        photoURL: string
        isFounder: boolean
        yearsOfExperience: number
        createdAt: string
    }


    interface IDocument {
        documentID: number
        startupID: number
        documentType: string
        version: string
        fileUrl: string
        isArchived: boolean
        isAnalyzed: boolean
        analysisStatus: string
        uploadedAt: string
        proofStatus: string
        fileHash: string
        transactionHash: string
    }

    interface IBlockchainVerification {
        documentID: number
        computedHash: string
        onChainVerified: boolean
        status: string
    }

    interface IBlockchainChecking {
        documentID: number
        transactionHash: string
        status: string
        blockNumber: string
        confirmedAt: string
    }

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
        responseMessage?: string
        closedAt?: string
        closedReason?: string
    }

    interface IInvestorSearchItem {
        investorID: number
        fullName: string
        firmName?: string
        title?: string
        bio?: string
        profilePhotoURL?: string
        investorType?: string
        acceptingConnections?: boolean
        website?: string
        linkedInURL?: string
        location?: string
        country?: string
        preferredStages?: string[]
        preferredIndustries?: string[]
        averageRating?: number
        totalConnections?: number
        portfolioCount?: number
        ticketSize?: number
        ticketSizeMin?: number
        ticketSizeMax?: number
        matchScore?: number
    }

    interface INotificationItem {
        notificationId: number
        notificationType: string
        title: string
        messagePreview: string
        isRead: boolean
        actionUrl?: string
        createdAt: string
    }

    interface INotificationDetail {
        notificationId: number
        notificationType: string
        title: string
        message: string
        isRead: boolean
        actionUrl?: string
        createdAt: string
        readAt?: string
    }

    interface IMessage {
        messageId: number
        conversationId: number
        senderUserId: number
        senderDisplayName: string
        isMine: boolean
        content: string
        attachmentUrls: string | null
        isRead: boolean
        sentAt: string
        readAt: string | null
    }

    interface ICreateConversationBody {
        connectionId?: number
        mentorshipId?: number
    }

    interface IIncomingMessage {
        messageId: number
        conversationId: number
        senderId: number
        content: string
        attachmentUrl: string | null
        createdAt: string
    }

    interface ISendMessageBody {
        conversationId: number
        content: string
        attachmentUrl: string | null
    }

    interface IConversation {
        conversationId: number
        connectionId: number | null
        mentorshipId: number | null
        status: "Open" | "Closed"
        title: string
        participantId: number
        participantName: string
        participantRole: "Startup" | "Investor" | "Advisor"
        participantAvatarUrl: string | null
        lastMessagePreview: string | null
        unreadCount: number
        createdAt: string
        lastMessageAt: string | null
    }

    interface IConversationDetail {
        conversationId: number
        connectionId: number | null
        mentorshipId: number | null
        status: "Open" | "Closed"
        title: string
        participants: { userId: number; displayName: string; userType: string }[]
        createdAt: string
        lastMessageAt: string | null
    }

    interface IAuditLog {
        logId: number
        userId: number | null
        userEmail: string | null
        actionType: string
        entityType: string
        entityId: number | null
        actionDetails: string | null
        createdAt: string
    }

    interface IPermission {
        id: string
        name: string
        description: string
        category: string
        isCritical: boolean
    }

    interface IRole {
        id: string
        name: string
        description: string
        isProtected: boolean
        permissionIds: string[]
        assignedUserCount: number
        createdAt: string
        updatedAt: string
        createdBy: string
        updatedBy: string
    }

    interface IInfoRequest {
        infoRequestId: number
        connectionId: number
        requestedBy: number
        question: string
        status: string
        answer?: string | null
        rejectionReason?: string | null
        createdAt: string
        fulfilledAt?: string | null
    }

    interface ICreateInfoRequest {
        question: string
    }

    interface IFulfillInfoRequest {
        answer: string
    }

    interface ICreateInvestor {
        fullName: string
        firmName?: string
        title?: string
        bio?: string
        investorType?: string
    }

    interface IWatchlistItem {
        watchlistId: number
        investorID: number
        startupID: number
        startupName: string
        addedAt: string
    }

    interface ICreateWatchlistItem {
        startupID: number
    }

    interface IStartupSearchItem {
        startupID: number
        companyName: string
        industry?: string
        stage?: string
        country?: string
        aiScore?: number
        profilePhotoURL?: string
        tagline?: string
        matchScore?: number
    }

    interface IKYCStatus {
        status: string
        submittedAt?: string | null
        reviewedAt?: string | null
        rejectionReason?: string | null
    }
    interface IConnectionDetail extends IConnectionItem {}

    interface ICreateConnection {
        startupId: number
        message: string
    }
}
