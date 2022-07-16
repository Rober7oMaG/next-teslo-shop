import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { db } from '../../../database';
import { User } from '../../../models';
import { jwt, validations } from '../../../utils';

type Data = 
| {message: string}
| {
    token: string,
    user: {
        name: string,
        email: string,
        role: string
    }
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    switch (req.method) {
        case 'POST':
            return registerUser(req, res);
    
        default:
            res.status(400).json({ message: 'Bad Request.' });
    }
}

const registerUser = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
    const {name = '', email = '', password = ''} = req.body as {name: string, email: string, password: string};
    
    // Validations
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password has to be longer than 5 characters.' });
    }
    
    if (name.length < 2) {
        return res.status(400).json({ message: 'Name has to be longer than 2 characters.' });
    }

    if (!validations.isValidEmail(email)) {
        return res.status(400).json({ message: 'Invalid email.' });
    }
    
    await db.connect();
    const user = await User.findOne({email});

    if (user) {
        return res.status(400).json({ message: 'This email is already registered.' });
    }

    const newUser = new User({
        name,
        email: email.toLocaleLowerCase(),
        password: bcrypt.hashSync(password),
        role: 'client'
    });

    try {
        await newUser.save({validateBeforeSave: true});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Check server logs." });
    }

    const {_id, role} = newUser;

    const token = jwt.signToken(_id, email);

    return res.status(200).json({
        token,
        user: {
            name,
            email, 
            role
        }
    });
}
