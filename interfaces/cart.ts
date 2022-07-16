import { TValidSize } from "./";

export interface ICartProduct {
    _id: string;
    image: string;
    // inStock: number;
    price: number;
    size?: TValidSize;
    slug: string;
    title: string;
    gender: 'men'|'women'|'kid'|'unisex';
    quantity: number;
};