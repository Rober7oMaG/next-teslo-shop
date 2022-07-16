import bcrypt from 'bcryptjs';
import { User } from '../models';
import { db } from './';

export const checkUserCredentials = async(email: string, password: string) => {
    await db.connect();
    const user = await User.findOne({email});
    await db.disconnect();

    if (!user) {
        return null;
    }

    if (!bcrypt.compareSync(password, user.password!)) {
        return null;
    }

    const {_id, name, role} = user;

    return {
        _id,
        name,
        email: email.toLocaleLowerCase(),
        role
    };
}

export const OAuthToDbUser = async(OAuthName: string, OAuthEmail: string) => {
    await db.connect(); 
    const user = await User.findOne({email: OAuthEmail}); 

    if (user) {
        await db.disconnect();

        // Return existing user
        const {_id, name, email, role} = user;
        return {_id, name, email, role};
    }

    // Create user and return it
    const newUser = new User({name: OAuthName, email: OAuthEmail, password: '@', role: 'client'});
    await newUser.save();
    await db.disconnect();

    const {_id, name, email, role} = newUser;
    return {_id, name, email, role};
}

export const getClientsCount = async (): Promise<number> => {
    await db.connect();
    const clientsCount = await User.find({role: 'client'}).count();
    await db.disconnect();

    return clientsCount;
}