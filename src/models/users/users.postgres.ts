/* eslint-disable @typescript-eslint/naming-convention */
import { db } from '../../services/rds-postgres';

interface IUser {
    id: string;
    email: string;
    password: string;
    resetPasswordToken: string;
    resetPasswordExpires: number;
}

class UserModel {
    async createUser(user: Partial<IUser>): Promise<IUser> {
        const [newUser] = await db('users')
            .insert({
                email: user.email,
                password: user.password,
            })
            .returning('*');

        return newUser as IUser;
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
