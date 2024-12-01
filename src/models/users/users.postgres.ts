/* eslint-disable @typescript-eslint/naming-convention */
import { db } from '../../services/rds-postgres';

interface IUser {
    id: string;
    email: string;
    password: string;
    refreshToken: string | null;
    resetPasswordToken: string;
    resetPasswordExpires: number;
}

class UserModel {
    async createUser(user: Partial<IUser>): Promise<IUser> {
        const { email, password: hashedPassword } = user;
        const newUser = (await db('users')
            .insert({
                email,
                password: hashedPassword,
            })
            .returning('*')) as IUser[];
        return newUser[0] as IUser;
    }

    async findUserByEmail(email: string): Promise<IUser | null> {
        const [user] = await db('users').select('*').where({ email }).limit(1);

        return user || null;
    }

    async updateUser(id: string, user: Partial<IUser>): Promise<IUser | null> {
        const [updatedUser] = await db('users').where({ id }).update(user).returning('*');

        return updatedUser || null;
    }
}

const User = new UserModel();
export default User;
