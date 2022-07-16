import { IUser, TValidSize } from "./";

export interface IOrder {
    _id?: string;
    user?: IUser | string;
    orderItems: IOrderItem[];
    shippingAddress: ShippingAddress;
    paymentMethod?: string;

    numberOfItems: number;
    subtotal: number;
    tax: number;
    total: number;

    isPaid: boolean;
    paidAt?: string;

    transactionId?: string;

    createdAt?: string;
    updatedAt?: string;
};

export interface IOrderItem {
    _id: string;
    title: string;
    size: TValidSize;
    quantity: number;
    slug: string;
    image: string;
    price: number;
    gender: string;
};

export interface ShippingAddress {
    firstName: string;
    lastName: string;
    address: string;
    address2?: string;
    zipCode: string;
    city: string;
    country: string;
    phone: string;
}