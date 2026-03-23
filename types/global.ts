export { };

declare global {
    interface IBackendRes<T> {
        success: boolean
        isSuccess: boolean   // alias — BE .NET dùng isSuccess
        statusCode: number   // alias — BE .NET trả kèm status code
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
        isSuccess: boolean
        statusCode: number
        data: T | null
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

    interface IAdvisorProfile {
        advisorID: number
        availability: null
        averageRating: null
        bio: string
        company: string
        createdAt: string
        expertise: IExpertise[]
        fullName: string
        industry: []
        linkedInURL: string
        mentorshipPhilosophy: string
        profileCompleteness: string
        profilePhotoURL: string
        profileStatus: string
        title: string
        totalMentees: number
        totalSessionHours: number
        updatedAt: string
        website: string
    }

    interface IExpertise {
        category: string
        proficiencyLevel: string
        subTopic: string
        yearsOfExperience: number
    }

    interface IStartupProfile {
        startupID: number
        userID: number
        companyName: string
        oneLiner: string
        description: string
        industryID: number
        industryName: string
        subIndustry: string
        stage: string
        foundedDate: string
        teamSize: number
        location: string
        country: string
        website: string
        logoURL: string
        coverImageURL: string
        fundingAmountSought: number
        currentFundingRaised: number
        valuation: number
        profileStatus: string
        profileCompleteness: number
        approvedAt: string
        createdAt: string
        updatedAt: string
        teamMembers: ITeamMember[]
    }

    interface ITeamMember {
        teamMemberID: number
        fullName: string
        role: string
        title: string
        linkedInURL: string
        bio: string
        photoURL: string
        isFounder: string
        yearsOfExperience: string
        createdAt: string
    }
}