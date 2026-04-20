import axios from "../interceptor";

export const Register = (email : string, password : string, confirmPassword : string , userType : string) => {
    return axios.post<IBackendRes<IValidationError[]>>(`/api/auth/register`, {
        email,
        password,
        confirmPassword,
        userType,
    });
}

export const Login = (email: string, password: string) => {
    return axios.post<IBackendRes<ILoginInfo>>(`/api/auth/login`, {
        email,
        password,
    });
}

export const RefreshToken = () => {
    return axios.post<IBackendRes<IRegisterInfo>>(`/api/auth/refresh-token`);
}

export const Logout = () => {
    return axios.post<IBackendRes<string>>(`/api/auth/logout`);
}

export const RevokeAll = () => {
    return axios.post(`/api/auth/revoke-all`);
}

export const ChangePassword = (currentPassword: string, newPassword: string, confirmNewPassword: string) => {
    return axios.put<IBackendRes<IValidationError[]>>(`/api/auth/change-password`, {
        currentPassword,
        newPassword,
        confirmNewPassword
    });
}

export const ResetAdminPassword = (userId : number, newPassword: string) => {
    return axios.put<IBackendRes<null>>(`/api/auth/admin/reset-password`, {
        userId,
        newPassword,
    })
}

export const ForgotPassword = (email: string) => {
    return axios.post<IBackendRes<IValidationError[]>>(`/api/auth/forgot-password`, {
        email,
    });
}  

export const ResetPassword = (email : string, newPassword: string, confirmNewPassword: string) => {
    return axios.post<IBackendRes<IValidationError[]>>(`/api/auth/reset-password`, {
        email,
        newPassword,
        confirmNewPassword
    });
}

export const VerifyEmail = (email : string, otp : string) => {
    return axios.post<IBackendRes<IRegisterInfo>>(`/api/auth/verify-email`, {
        email,
        otp
    })
}

export const ResendVerificationEmail = (email : string) => {
    return axios.post<IBackendRes<string>>(`/api/auth/resend`, {
        email
    })
}





 







