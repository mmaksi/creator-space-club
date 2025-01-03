/* eslint-disable @typescript-eslint/naming-convention */
import { IUser } from '../../lib/types';
import { db } from '../../services/rds-postgres';

class UserModel {
    async createUser(user: Partial<IUser>): Promise<IUser> {
        const newUser = (await db('users').insert(user).returning('*')) as IUser[];
        return newUser[0] as IUser;
    }

    async findUserBy(query: Partial<IUser>): Promise<IUser | null> {
        const [user] = await db('users').select('*').where(query).limit(1);

        return user || null;
    }

    async updateUser(id: string, user: Partial<IUser>): Promise<IUser | null> {
        const [updatedUser] = await db('users').where({ id }).update(user).returning('*');

        return updatedUser || null;
    }
}

const User = new UserModel();
export default User;
