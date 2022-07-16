import React, { PropsWithChildren, useEffect, useReducer } from 'react';
import axios, { AxiosError } from 'axios';
import Cookie from 'js-cookie';
import { useSnackbar } from 'notistack';
import { ICartProduct, IOrder, ShippingAddress } from '../../interfaces';
import { CartContext, cartReducer } from './';
import { tesloApi } from '../../api';

export interface CartState {
    isLoaded: boolean;
    cart: ICartProduct[];
    numberOfItems: number;
    subtotal: number;
    tax: number;
    total: number;
    shippingAddress?: ShippingAddress
}

const CART_INITIAL_STATE: CartState = {
    isLoaded: false,
    // cart: Cookie.get('cart') ? JSON.parse(Cookie.get('cart')!) : []
    cart: [],
    numberOfItems: 0,
    subtotal: 0,
    tax: 0,
    total: 0,

    shippingAddress: undefined
}

export const CartProvider: React.FC<PropsWithChildren> = ({children}) => {
    const [state, dispatch] = useReducer(cartReducer, CART_INITIAL_STATE);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    // useEffect(() => {
    //     try {
    //         const cookieCart = Cookie.get('cart') ? JSON.parse(Cookie.get('cart')!) : [];
    //         dispatch({type: 'Cart - Load cart from cookies | storage', payload: cookieCart});
    //     } catch (error) {
    //         dispatch({type: 'Cart - Load cart from cookies | storage', payload: []});
    //     }
    // }, []);

    useEffect(() => {
        let cookieCart = Cookie.get('cart') !== undefined ? JSON.parse(Cookie.get('cart')!) : []
        dispatch({type: 'Cart - Load cart from cookies | storage', payload: cookieCart})        
    }, []);

    useEffect(() => {
        if (Cookie.get('firstName')) {
            const shippingAddress = {
                firstName: Cookie.get('firstName') || '',
                lastName: Cookie.get('lastName') || '',
                address: Cookie.get('address') || '',
                address2: Cookie.get('address2') || '',
                zipCode: Cookie.get('zipCode') || '',
                city: Cookie.get('city') || '',
                country: Cookie.get('country') || '',
                phone: Cookie.get('phone') || ''
            }
    
            dispatch({type: 'Cart - Load address from cookies', payload: shippingAddress});
        }
    }, []);

    useEffect(() => {
        if (state.cart.length > 0) {
            Cookie.set('cart', JSON.stringify(state.cart));
        }
    }, [state.cart]);
    
    useEffect(() => {
        const numberOfItems = state.cart.reduce((previous, current) => current.quantity + previous, 0);
        const subtotal = state.cart.reduce((previous, current) => (current.price * current.quantity) + previous, 0);
        const taxRate = Number(process.env.NEXT_PUBLIC_TAX_RATE || 0);

        const orderSummary = {
            numberOfItems,
            subtotal,
            tax: subtotal * taxRate,
            total: subtotal * (taxRate + 1)
        }

        dispatch({type: 'Cart - Update order summary', payload: orderSummary});
    }, [state.cart]);

    const addProductToCart = (product: ICartProduct) => {
        // Check if product exists in cart
        const productInCart = state.cart.some(p => p._id === product._id);

        if(!productInCart) {
            // If doesn't exists, product is added
            dispatch({type: 'Cart - Update cart', payload: [...state.cart, product]});

            enqueueSnackbar('Added to cart!', {
                variant: 'success',
                autoHideDuration: 2000,
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'right'
                }
            });

            return;
        }

        // Check if product with the same size exists
        const productInCartWithSameSize = state.cart.some(p => p._id === product._id && p.size === product.size);
        if (!productInCartWithSameSize) {
            // If product with this size doesn't exist, it is added
            dispatch({type: 'Cart - Update cart', payload: [...state.cart, product]});

            enqueueSnackbar('Added to cart!', {
                variant: 'success',
                autoHideDuration: 2000,
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'right'
                }
            });

            return;
        }

        // Product with that size exists
        const updatedProducts = state.cart.map(p => {
            if (p._id !== product._id) {
                return p;
            }

            if (p.size !== product.size) {
                return p;
            }

            // Update quantity
            p.quantity += product.quantity;

            return p;
        });

        dispatch({type: 'Cart - Update cart', payload: updatedProducts});

        enqueueSnackbar('Added to cart!', {
            variant: 'success',
            autoHideDuration: 2000,
            anchorOrigin: {
                vertical: 'top',
                horizontal: 'right'
            }
        });
    }

    const updateCartQuantity = (product: ICartProduct) => {
        dispatch({type: 'Cart - Change product quantity', payload: product});
    }

    const removeCartProduct = (product: ICartProduct) => {
        dispatch({type: 'Cart - Remove product from cart', payload: product});

        enqueueSnackbar('Removed from cart', {
            variant: 'error',
            autoHideDuration: 2000,
            anchorOrigin: {
                vertical: 'top',
                horizontal: 'right'
            }
        });
    }

    const updateAddress = (address: ShippingAddress) => {
        Cookie.set('firstName', address.firstName);
        Cookie.set('lastName', address.lastName);
        Cookie.set('address', address.address);
        Cookie.set('address2', address.address2 || '');
        Cookie.set('zipCode', address.zipCode);
        Cookie.set('city', address.city);
        Cookie.set('country', address.country);
        Cookie.set('phone', address.phone);

        dispatch({type: 'Cart - Update address', payload: address});
    }

    const createOrder = async(): Promise<{hasError: boolean; message: string;}> => {
        if (!state.shippingAddress) {
            throw new Error("There's no shipping address.");
        }

        const body: IOrder = {
            orderItems: state.cart.map(p => ({
                ...p,
                size: p.size!
            })),
            shippingAddress: state.shippingAddress,
            numberOfItems: state.numberOfItems,
            subtotal: state.subtotal,
            tax: state.tax,
            total: state.total,
            isPaid: false
        }

        try {
            const {data} = await tesloApi.post<IOrder>('/orders', body);
            
            dispatch({type: 'Cart - Order complete'});

            enqueueSnackbar('Order created!', {
                variant: 'success',
                autoHideDuration: 2000,
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'right'
                }
            });

            Cookie.remove('cart');
            
            return {
                hasError: false,
                message: data._id!
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const err = error as AxiosError;
                return {
                    hasError: true,
                    message: err.message
                };
            }

            return {
                hasError: true,
                message: "Unknown error, contact administrator."
            };
        }
    }

    return (
        <CartContext.Provider value={{
            ...state,

            // Methods
            addProductToCart,
            updateCartQuantity,
            removeCartProduct,
            updateAddress,
            createOrder
        }}>
            {children}
        </CartContext.Provider>
    );
}