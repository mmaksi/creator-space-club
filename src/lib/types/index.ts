export interface IUser {
    id: string;
    email: string;
    password: string;
    resetPasswordToken: string | null;
    resetPasswordExpires: Date | null;
    roles: string[];
    googleId?: string;
}
