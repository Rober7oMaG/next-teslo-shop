import React from 'react';
import { Box, Typography } from '@mui/material';
import { ShopLayout } from '../components/layouts'

const Custom404Page = () => {
    return (
        <ShopLayout title={'Page Not Found'} pageDescription={'Nothing to show here'}>
            <Box 
                display='flex' 
                justifyContent='center' 
                alignItems='center' 
                height='calc(100vh - 200px)'
                sx={{flexDirection: {xs: 'column', sm: 'row'}}}
            >
                <Typography variant='h1' component='h1' fontSize={80} fontWeight={200}>404 |</Typography>
                <Typography fontSize={20} marginLeft={2}>Page Not Found</Typography>
            </Box>
        </ShopLayout>
    );
}

export default Custom404Page;