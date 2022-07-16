import type { NextApiRequest, NextApiResponse } from 'next'
import { db, seedDb } from '../../database';
import { Order, Product, User } from '../../models';

type Data = {
    message: string;
}

export default async  function handler (req: NextApiRequest, res: NextApiResponse<Data>) {
    if (process.env.NODE_ENV === 'production') {
        return res.status(401).json({message: "You have no access to this service."})
    }

    await db.connect();

    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();

    await Product.insertMany(seedDb.initialData.products);
    await User.insertMany(seedDb.initialData.users);

    await db.disconnect();

    res.status(200).json({message: 'Process done successfully.'});
}