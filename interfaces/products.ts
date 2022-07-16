export interface IProduct {
    _id: string;
    description: string;
    images: string[];
    inStock: number;
    price: number;
    sizes: TValidSize[];
    slug: string;
    tags: string[];
    title: string;
    type: TValidType;
    gender: 'men'|'women'|'kid'|'unisex';
    createdAt: string;
    updatedAt: string;
};

export type TValidSize = 'XS'|'S'|'M'|'L'|'XL'|'XXL'|'XXXL';
export type TValidType = 'shirts'|'pants'|'hoodies'|'hats';