import React, { useContext, useEffect, useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { Box, Button, Card, CardContent, Chip, Divider, Grid, Link, Typography } from '@mui/material';
import Cookies from 'js-cookie';
import { CartItems, OrderSummary } from '../../components/cart';
import { ShopLayout } from '../../components/layouts'
import { CartContext } from '../../context';
// import { countries } from '../../utils';

const SummaryPage = () => {
    const router = useRouter();
    const {shippingAddress, numberOfItems, createOrder} = useContext(CartContext);

    const [isPosting, setIsPosting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!Cookies.get('firstName')) {
            router.push('/checkout/address')
        }
    
    }, [router]);

    const onCreateOrder = async () => {
        setIsPosting(true);

        const {hasError, message} = await createOrder();

        if (hasError) {
            setIsPosting(false);
            setErrorMessage(message);
            return;
        }

        router.replace(`/orders/${message}`);
    }

    if (!shippingAddress) {
        return <></>;
    }

    const {firstName, lastName, address, address2 = '', zipCode, city, country, phone} = shippingAddress;

    return (
        <ShopLayout title={'Teslo Shop | Order Summary'} pageDescription={'Order Summary'}>
            <Typography variant='h1' component='h1'>Order Summary</Typography>

            <Grid container>
                <Grid item xs={12} sm={7}>
                    <CartItems />
                </Grid>
                <Grid item xs={12} sm={5}>
                    <Card className='summary-card'>
                        <CardContent>
                            <Typography variant='h2'>Summary ({numberOfItems} {numberOfItems === 1 ? 'item' : 'items'})</Typography>

                            <Divider sx={{my: 1}} />

                            <Box display='flex' justifyContent='space-between'>
                                <Typography variant='subtitle1'>Shipping address</Typography>
                                <NextLink href='/checkout/address' passHref>
                                    <Link underline='always'>
                                        Change Address
                                    </Link>
                                </NextLink>
                            </Box>

                            <Typography>{firstName} {lastName}</Typography>
                            <Typography>{address}{address2 ? `, ${address2}` : ''}</Typography>
                            <Typography>{city}, {zipCode}</Typography>
                            {/* <Typography>{countries.find(c => c.code === country)?.name}</Typography> */}
                            <Typography>{country}</Typography>
                            <Typography>{phone}</Typography>

                            <Divider sx={{my: 1}} />

                            <Box display='flex' justifyContent='space-between'>
                                <Typography variant='subtitle1'>Order</Typography>
                                <NextLink href='/cart' passHref>
                                    <Link underline='always'>
                                        Manage Cart
                                    </Link>
                                </NextLink>
                            </Box>

                            <OrderSummary />

                            <Box sx={{mt: 3}} display='flex' flexDirection='column'>
                                <Button 
                                    color='secondary' 
                                    className='circular-btn' 
                                    fullWidth 
                                    onClick={onCreateOrder} 
                                    disabled={isPosting}
                                >
                                    Confirm Order
                                </Button>

                                <Chip
                                    color='error'
                                    label={errorMessage}
                                    sx={{display: errorMessage ? 'flex' : 'none', mt: 2}}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </ShopLayout>
    );
};

export default SummaryPage;