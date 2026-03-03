export { };

declare global {
    interface IBackendRes<T> {
        message: string
        isSuccess: boolean
        statusCode: number
        data : T | null
    }

    interface IRegisterInfo {
        data : IUser
        accessToken : string
    }

    interface ILoginInfo {
        data : IUser
        accessToken : string
    }

    interface IUser {
        userId : number
        email : string
        userType : string
        isActive : boolean
        emailVerified : boolean
        createdAt : string
        lastLoginAt : string
        roles : string[]
    }

    interface IAdvisorProfile {
        advisorID : number
        availability : null
        averageRating : null
        bio : string
        company : string
        createdAt : string
        expertise : IExpertise[]
        fullName : string
        industry: []
        linkedInURL : string
        mentorshipPhilosophy : string
        profileCompleteness : string
        profilePhotoURL : string
        profileStatus : string
        title : string
        totalMentees : number
        totalSessionHours : number
        updatedAt : string
        website : string
    }

    interface IExpertise{
        category : string
        proficiencyLevel : string
        subTopic : string
        yearsOfExperience : number
    }
}