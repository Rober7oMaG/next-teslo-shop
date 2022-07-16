import React from 'react';
import NextLink from 'next/link';
import { RemoveShoppingCartOutlined } from '@mui/icons-material';
import { Box, Link, Typography } from '@mui/material';
import { ShopLayout } from '../../components/layouts';

export const EmptyCartPage = () => {
    return (
        <ShopLayout title={'Empty Cart'} pageDescription={'No items on shopping cart'} >
            <Box 
                display='flex' 
                justifyContent='center' 
                alignItems='center' 
                height='calc(100vh - 200px)'
                sx={{flexDirection: {xs: 'column', sm: 'row'}}}
            >
                <RemoveShoppingCartOutlined sx={{fontSize: 100}} />
                <Box display='flex' flexDirection='column' alignItems='center'>
                    <Typography>Your shopping cart is empty</Typography>
                    <NextLink href='/' passHref>
                        <Link typography='h4' color='secondary'>Go back</Link>
                    </NextLink>
                </Box>
            </Box>
        </ShopLayout>
    );
};

export default EmptyCartPage;
