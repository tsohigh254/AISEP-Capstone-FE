export {};

declare global {
  interface IBackendRes<T> {
    success: boolean;
    isSuccess: boolean; // alias — BE .NET dùng isSuccess
    statusCode: number; // alias — BE .NET trả kèm status code
    data?: T | null;
    message: string;
    error: IError<T> | null;
  }

  interface IError<T> {
    code: string;
    message: string;
    details: IErrorDetail<T>[];
  }

  interface IErrorDetail<T> {
    field: string;
    message: string;
    isSuccess: boolean;
    statusCode: number;
    data: T | null;
  }

  interface IPagingData<T> {
    data?: T[];
    items?: T[];
    paging: IPaging;
  }

  // Alias used in some files
  type IPaginatedRes<T> = IPagingData<T>;

  interface IPaging {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages?: number;
  }

  interface IRegisterInfo {
    data: IUser;
    accessToken: string;
  }

  interface ILoginInfo {
    data: IUser;
    accessToken: string;
  }

  interface IUser {
    userId: number;
    email: string;
    userType: string;
    isActive: boolean;
    emailVerified: boolean;
    createdAt: string;
    lastLoginAt: string;
    roles: string[];
  }

  interface IIndustryRef {
    industryId: number;
    industryName: string;
    id?: number;
    name?: string;
  }

  interface IStageRef {
    stageId: number;
    stageName: string;
    id?: number;
    name?: string;
  }

  interface IStartupProfile {
    startupID: number;
    startupId?: number;
    userID: number;
    companyName: string;
    oneLiner: string;
    description: string;
    industryId?: number;
    industryID?: number;
    industryName: string;
    parentIndustryName?: string | null;
    subIndustryId?: number | null;
    subIndustryID?: number | null;
    subIndustryName?: string | null;
    stageId?: number;
    stageID?: number;
    stageName?: string;
    /** Giai đoạn: số 0–6 hoặc chuỗi (API .NET). */
    stage: string | number;
    foundedDate: string;
    website: string;
    logoURL: string;
    fundingAmountSought: number;
    currentFundingRaised: number;
    valuation: number;
    fullNameOfApplicant: string;
    roleOfApplicant: string;
    contactEmail: string;
    contactPhone: string;
    businessCode: string;
    /** Mã doanh nghiệp đã xác minh qua KYC — null nếu chưa KYC hoặc không có pháp nhân. */
    enterpriseCode?: string | null;
    marketScope: string;
    problemStatement: string;
    solutionSummary: string;
    isVisible: boolean;
    /** Một số API trả thêm trạng thái hiển thị dạng chuỗi; ưu tiên khi có. */
    visibilityStatus?: string;
    teamSize: string; // Changed to string
    subIndustry?: string;
    currentNeeds: string[];
    metricSummary: string;
    pitchDeckUrl: string;
    productStatus: string;
    country: string;
    location: string;
    fileCertificateBusiness: string;
    linkedInURL: string;
    profileStatus: string;
    /** Gói đăng ký hiện tại: "Free" | "Pro" | "Fundraising" */
    subscriptionPlan?: string | null;
    /** Ngày hết hạn gói (ISO 8601, nullable). */
    subscriptionEndDate?: string | null;
    approvedAt: string;
    /** Tuỳ API (có thể không có). */
    approvedBy?: string | number;
    createdAt: string;
    updatedAt: string;
  }

  interface IDocumentAccessLog {
    logID: number;
    userID: number;
    userName: string;
    userType: string;
    action: string;
    accessedAt: string;
  }

  interface IAdvisorProfile {
    advisorID: number;
    userId: number;
    fullName: string;
    title: string;
    bio: string;
    profilePhotoURL: string;
    mentorshipPhilosophy: string;
    linkedInURL: string;
    profileStatus: string;
    totalMentees: number;
    totalSessionHours: number;
    averageRating: number;
    createdAt: string;
    updatedAt: string;
    availability: IAvailability;
    industryFocus: IAdvisorIndustryFocusDto[];
  }

  interface IAdvisorIndustryFocusDto {
    industryId: number;
    industry: string;
  }

  // Keep alias for backward compat
  type IAdvisorIndustryFocus = IAdvisorIndustryFocusDto;

  interface IAvailability {
    sessionFormats: string;
    typicalSessionDuration: number;
    weeklyAvailableHours: number;
    maxConcurrentMentees: number;
    responseTimeCommitment: string;
    calendarConnected: boolean;
    isAcceptingNewMentees: boolean;
    updatedAt: string;
  }

  interface IAdvisorSearchResult {
    advisorID: number;
    fullName: string;
    title: string;
    bio: string;
    profilePhotoURL: string;
    averageRating: number;
    industry: IAdvisorIndustryFocus[];
  }

  interface IInvestorProfile {
    investorID: number;
    userID: number;
    fullName: string;
    title: string;
    bio: string;
    profilePhotoURL: string;
    firmName: string;
    organization: string;
    investorType: string;
    investmentThesis: string;
    connectionGuidance: string;
    supportOffered: string[];
    preferredStages: IStageRef[];
    preferredIndustries: IIndustryRef[];
    preferredGeographies: string[];
    preferredMarketScopes: string[];
    preferredProductMaturity: string[];
    preferredValidationLevel: string[];
    preferredStrengths: string[];
    preferredAIScoreRange: string;
    aiScoreImportance: string;
    acceptingConnections: boolean;
    discoverableForStartups?: boolean;
    canRequestConnection?: boolean;
    profileAvailabilityReason?: "OPEN" | "INVESTOR_PAUSED_DISCOVERY";
    website: string;
    linkedInURL: string;
    country: string;
    location: string;
    profileStatus: string;
    workflowStatus?: string;
    verificationLabel?: string;
    kycVerified?: boolean;
    createdAt: string;
    updatedAt: string;
  }

  interface ITeamMember {
    teamMemberID: number;
    fullName: string;
    role: string;
    title: string;
    linkedInURL: string;
    bio: string;
    photoURL: string;
    isFounder: boolean;
    yearsOfExperience: number;
    createdAt: string;
  }

  interface IDocument {
    documentID: number;
    startupID: number;
    documentType: string;
    version: string;
    fileUrl: string;
    isArchived: boolean;
    isAnalyzed: boolean;
    analysisStatus: string;
    uploadedAt: string;
    proofStatus: string;
    fileHash: string;
    transactionHash: string;
  }

  interface IBlockchainVerification {
    documentID: number;
    computedHash: string;
    onChainVerified: boolean;
    status: string;
  }

  interface IDocument {
    documentID: number;
    startupID: number;
    documentType: string;
    title: string;
    version: string;
    fileUrl: string;
    isArchived: boolean;
    isAnalyzed: boolean;
    analysisStatus: string;
    uploadedAt: string;
    proofStatus: string;
    fileHash: string;
    transactionHash: string;
    anchoredAt: string | null;
    visibility?: number;
    visibilityLabel?: string;
  }

  interface IDocumentVersionHistory {
    documentID: number;
    version: string;
    title: string;
    fileUrl: string;
    uploadedAt: string;
    reviewStatus: string;
    proofStatus: string;
    fileHash: string;
    isArchived: boolean;
    isCurrent: boolean;
  }

  interface IBlockchainChecking {
    documentID: number;
    transactionHash: string;
    status: string;
    blockNumber: string;
    confirmedAt: string;
  }

  interface IConnectionItem {
    connectionID: number;
    startupID: number;
    startupName: string;
    startupLogoURL?: string | null;
    startupStage?: string | null;
    startupIndustryName?: string | null;
    investorID: number;
    investorName: string;
    investorPhotoURL?: string | null;
    firmName?: string | null;
    connectionStatus: string;
    personalizedMessage: string;
    matchScore: number;
    requestedAt: string;
    respondedAt: string;
    responseMessage?: string;
    closedAt?: string;
    closedReason?: string;
    initiatedByRole?: "INVESTOR" | "STARTUP";
  }

  interface IInvestorSearchItem {
    investorID: number;
    fullName: string;
    firmName?: string;
    title?: string;
    bio?: string;
    profilePhotoURL?: string;
    investorType?: "INDIVIDUAL_ANGEL" | "INSTITUTIONAL";
    website?: string;
    linkedInURL?: string;
    location?: string;
    country?: string;
    preferredStages?: IStageRef[];
    preferredIndustries?: IIndustryRef[];
    preferredGeographies?: string[];
    averageRating?: number;
    totalConnections?: number;
    portfolioCount: number;
    acceptedConnectionCount: number;
    ticketSize?: number;
    ticketSizeMin?: number | null;
    ticketSizeMax?: number | null;
    profileStatus?: string;
    workflowStatus?: string;
    verificationLabel?: string;
    kycVerified: boolean;
    discoverableForStartups?: boolean;
    acceptingConnections: boolean;
    canRequestConnection: boolean;
    connectionStatus: "NONE" | "REQUESTED" | "ACCEPTED" | "IN_DISCUSSION";
    initiatedByRole: "INVESTOR" | "STARTUP" | null;
    connectionId: number | null;
    updatedAt?: string;
  }

  interface IInterestedInvestorItem {
    investorId: number;
    displayName: string;
    representativeName: string;
    fundName?: string | null;
    profilePhotoURL?: string | null;
    shortSummary?: string | null;
    verificationStatus: "VERIFIED" | "BASIC_VERIFIED";
    verificationBadge:
      | "Verified Investor Entity"
      | "Verified Angel Investor"
      | "Basic Verified";
    dateOfInterest: string;
  }

  interface IInterestedInvestorsList {
    page: number;
    pageSize: number;
    total: number;
    data: IInterestedInvestorItem[];
  }

  interface INotificationItem {
    notificationId: number;
    notificationType: string;
    title: string;
    messagePreview: string;
    isRead: boolean;
    actionUrl?: string;
    relatedEntityType?: string | null;
    createdAt: string;
  }

  interface INotificationDetail {
    notificationId: number;
    notificationType: string;
    title: string;
    message: string;
    isRead: boolean;
    actionUrl?: string;
    relatedEntityType?: string | null;
    createdAt: string;
    readAt?: string;
  }

  interface IMessage {
    messageId: number;
    conversationId: number;
    senderUserId: number;
    senderDisplayName: string;
    isMine: boolean;
    content: string;
    attachmentUrls: string | null;
    isRead: boolean;
    sentAt: string;
    readAt: string | null;
  }

  interface ICreateConversationBody {
    connectionId?: number;
    mentorshipId?: number;
  }

  interface IIncomingMessage {
    messageId: number;
    conversationId: number;
    senderId: number;
    content: string;
    attachmentUrl: string | null;
    createdAt: string;
  }

  interface ISendMessageBody {
    conversationId: number;
    content: string;
    attachmentUrl: string | null;
  }

  interface IConversation {
    conversationId: number;
    connectionId: number | null;
    mentorshipId: number | null;
    status: "Open" | "Closed";
    title: string;
    participantId: number;
    participantName: string;
    participantRole: "Startup" | "Investor" | "Advisor";
    participantAvatarUrl: string | null;
    lastMessagePreview: string | null;
    unreadCount: number;
    createdAt: string;
    lastMessageAt: string | null;
  }

  interface IConversationDetail {
    conversationId: number;
    connectionId: number | null;
    mentorshipId: number | null;
    status: "Open" | "Closed";
    title: string;
    participants: { userId: number; displayName: string; userType: string }[];
    createdAt: string;
    lastMessageAt: string | null;
  }

  interface IAuditLog {
    logId: number;
    userId: number | null;
    userEmail: string | null;
    actionType: string;
    entityType: string;
    entityId: number | null;
    actionDetails: string | null;
    createdAt: string;
  }

  interface IPermission {
    id: string;
    name: string;
    description: string;
    category: string;
    isCritical: boolean;
  }

  interface IRole {
    id: string;
    name: string;
    description: string;
    isProtected: boolean;
    permissionIds: string[];
    assignedUserCount: number;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
  }

  interface IInfoRequest {
    infoRequestId: number;
    connectionId: number;
    requestedBy: number;
    question: string;
    status: string;
    answer?: string | null;
    rejectionReason?: string | null;
    createdAt: string;
    fulfilledAt?: string | null;
  }

  interface ICreateInfoRequest {
    question: string;
  }

  interface IFulfillInfoRequest {
    answer: string;
  }

  interface ICreateInvestor {
    fullName: string;
    firmName?: string;
    title?: string;
    bio?: string;
    investorType?: string;
    location?: string;
    website?: string;
    linkedInURL?: string;
    investmentThesis?: string;
  }

  interface IInvestorPreferences {
    preferredIndustries: IIndustryRef[];
    preferredStages: IStageRef[];
    preferredMarketScopes: string[];
    supportOffered: string[];
    preferredGeographies?: string;
    ticketMin?: number | null;
    ticketMax?: number | null;
    minPotentialScore?: number | null;
  }

  interface IUpdateInvestorPreferences {
    preferredIndustryIDs?: number[];
    preferredStageIDs?: number[];
    preferredIndustryIds?: number[];
    preferredStageIds?: number[];
    preferredMarketScopes?: string[];
    supportOffered?: string[];
    ticketMin?: number | null;
    ticketMax?: number | null;
  }

  interface IUpdateInvestorProfile {
    fullName?: string;
    firmName?: string;
    title?: string;
    bio?: string;
    location?: string;
    country?: string;
    website?: string;
    linkedInURL?: string;
    investmentThesis?: string;
  }

  interface IWatchlistItem {
    watchlistId: number;
    startupID: number;
    startupName: string;
    companyName?: string;
    industry?: string | null;
    stage?: string | null;
    logoURL?: string | null;
    priority?: string | null;
    addedAt: string;
    aiScore?: number | null;
  }

  interface ICreateWatchlistItem {
    startupID: number;
  }

  interface IStartupSearchItem {
    startupID: number;
    startupId?: number;
    companyName: string;
    industry?: string;
    industryId?: number;
    industryID?: number;
    industryName?: string;
    subIndustryId?: number | null;
    subIndustryID?: number | null;
    subIndustryName?: string | null;
    parentIndustryName?: string | null;
    stageId?: number;
    stageID?: number;
    stageName?: string;
    stage?: string;
    country?: string;
    aiScore?: number;
    profilePhotoURL?: string;
    tagline?: string;
    matchScore?: number;
    subIndustry?: string;
    logoURL?: string;
    fundingAmountSought?: number | null;
    currentFundingRaised?: number | null;
    createdAt?: string;
  }

  interface IValidationError {
    field: string;
    messages: string[];
  }

  interface IKYCStatus {
    status: string;
    submittedAt?: string | null;
    reviewedAt?: string | null;
    rejectionReason?: string | null;
  }
  interface IConnectionDetail extends IConnectionItem {}

  interface ICanInviteResult {
    canInvite: boolean;
    reasonCodes: string[];
    retryAfterSeconds?: number | null;
    minMessageLength?: number | null;
    messageMaxLength: number;
  }

  interface ICreateConnection {
    startupId?: number;
    investorId?: number;
    message?: string;
  }

  interface ICreateStartupInvestorInvite {
    investorId: number;
    message?: string;
  }

  interface IPaymentInfo {
     checkoutUrl : string,
     orderCode : number
  }
}
