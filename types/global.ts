export { };

declare global {
    interface IBackendRes<T> {
        success: boolean
        data?: T | null
        message: string
        error : IError | null
    }

    interface IError {
        code : string
        message : string
        details : IErrorDetail[]
    }

    interface IErrorDetail {
        field : string
        message : string
    }

    interface IRegisterInfo {
        info : IUser
        accessToken : string
        accessTokenExpires : number
    }

    interface ILoginInfo {
        info : IUser
        accessToken : string
        accessTokenExpires : number
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
}