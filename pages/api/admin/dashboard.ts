import type { NextApiRequest, NextApiResponse } from 'next'
import { db, dbOrders, dbProducts, dbUsers } from '../../../database';

type Data = 
| {
    numberOfOrders: number;
    paidOrders: number;
    pendingOrders: number;
    numberOfClients: number;
    numberOfProducts: number;
    outOfStockProducts: number;
    lowStockProducts: number;  // 10 or less on stock
}
| {message: string}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    await db.connect();

    // const numberOfOrders = await dbOrders.getOrdersCount();
    // const paidOrders = await dbOrders.getPaidOrdersCount();
    // const pendingOrders = await dbOrders.getPendingOrdersCount();
    // const numberOfClients = await dbUsers.getClientsCount();
    // const numberOfProducts = await dbProducts.getProductsCount();
    // const outOfStockProducts = await dbProducts.getOutOfStockProductsCount();
    // const lowStockProducts = await dbProducts.getLowStockProductsCount();

    const [
        numberOfOrders,
        paidOrders,
        pendingOrders,
        numberOfClients,
        numberOfProducts,
        outOfStockProducts,
        lowStockProducts
    ] = await Promise.all([
        dbOrders.getOrdersCount(),
        dbOrders.getPaidOrdersCount(),
        dbOrders.getPendingOrdersCount(),
        dbUsers.getClientsCount(),
        dbProducts.getProductsCount(),
        dbProducts.getOutOfStockProductsCount(),
        dbProducts.getLowStockProductsCount()
    ]);

    await db.disconnect();

    return res.status(200).json({
        numberOfOrders,
        paidOrders,
        pendingOrders,
        numberOfClients,
        numberOfProducts,
        outOfStockProducts,
        lowStockProducts
    });
}
