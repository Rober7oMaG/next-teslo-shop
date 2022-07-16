import React, { PropsWithChildren, useEffect, useReducer } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { tesloApi } from '../../api';
import { IUser } from '../../interfaces';
import { AuthContext, authReducer } from './';

export interface AuthState {
    isLoggedIn: boolean;
    user: IUser | undefined
};

const AUTH_INITIAL_STATE: AuthState = {
    isLoggedIn: false,
    user: undefined
};

export const AuthProvider: React.FC<PropsWithChildren> = ({children}) => {
    const [state, dispatch] = useReducer(authReducer, AUTH_INITIAL_STATE);
    const router = useRouter();
    const {data, status} = useSession();

    useEffect(() => {
      if (status === 'authenticated') {
        dispatch({type: 'Auth - Login', payload: data?.user as IUser});
      }
    }, [status, data]);
    

    // useEffect(() => {
    //     checkToken();
    // }, []);

    // const checkToken = async() => {
    //     if (!Cookies.get('token')) {
    //         return;
    //     }

    //     try {
    //         const {data} = await tesloApi.get('/user/validate-token');
    //         const {token, user} = data;
    
    //         Cookies.set('token', token);
    //         dispatch({type: 'Auth - Login', payload: user});
    //     } catch (error) {
    //         Cookies.remove('token');
    //         return;
    //     }
    // }

    const loginUser = async(email: string, password: string): Promise<boolean> => {
        try {
            const {data} = await tesloApi.post('/user/login', {email, password});
            const {token, user} = data;

            Cookies.set('token', token);
            dispatch({type: 'Auth - Login', payload: user});

            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    const registerUser = async(name: string, email: string, password: string): Promise<{hasError: boolean; message?: string}> => {
        try {
            const {data} = await tesloApi.post('/user/register', {name, email, password});
            const {token, user} = data;

            Cookies.set('token', token);
            dispatch({type: 'Auth - Login', payload: user});

            return {
                hasError: false
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const err = error as AxiosError
                return {
                    hasError: true,
                    message: err.message
                };
            }

            return {
                hasError: true,
                message: "An error has occurred while creating account. Try again."
            }
        }
    }

    const logout = () => {
        // Cookies.remove('token');
        Cookies.remove('cart');

        Cookies.remove('firstName');
        Cookies.remove('lastName');
        Cookies.remove('address');
        Cookies.remove('address2');
        Cookies.remove('zipCode');
        Cookies.remove('city');
        Cookies.remove('country');
        Cookies.remove('phone');

        signOut();

        // router.reload();
    }

    return (
        <AuthContext.Provider value={{
            ...state,

            // Methods
            loginUser,
            registerUser,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};