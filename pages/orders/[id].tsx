import React, { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import { Box, Card, CardContent, Chip, CircularProgress, Divider, Grid, Typography } from '@mui/material';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { CreditCardOffOutlined, CreditScoreOutlined } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { CartItems, OrderSummary } from '../../components/cart';
import { ShopLayout } from '../../components/layouts'
import { dbOrders } from '../../database';
import { IOrder } from '../../interfaces';
import { tesloApi } from '../../api';

export type OrderResponseBody = {
    id: string;
    status:
        | "COMPLETED"
        | "SAVED"
        | "APPROVED"
        | "VOIDED"
        | "PAYER_ACTION_REQUIRED";
};

interface Props {
    order: IOrder
}

const OrderPage: NextPage<Props> = ({order}) => {
    const router = useRouter();
    const {shippingAddress} = order;
    const [isPaying, setIsPaying] = useState(false);
    const {enqueueSnackbar, closeSnackbar} = useSnackbar();

    const onOrderCompleted = async (details: OrderResponseBody) => {
        if (details.status !== 'COMPLETED') {
            return alert("There's no PayPal payment.")
        }

        setIsPaying(true);

        try {
            const {data} = await tesloApi.post(`/orders/pay`, {
                transactionId: details.id,
                orderId: order._id
            });

            enqueueSnackbar('Payment succeeded!', {
                variant: 'success',
                autoHideDuration: 2000,
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'right'
                }
            });

            router.reload();
        } catch (error) {
            setIsPaying(false);

            enqueueSnackbar('Payment error', {
                variant: 'error',
                autoHideDuration: 2000,
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'right'
                }
            });
        }
    }

    return (
        <ShopLayout title={`Teslo Shop | Order: ${order._id}`} pageDescription={'Order Summary'}>
            <Typography variant='h1' component='h1'>Order: {order._id}</Typography>

            {
                order.isPaid ? (
                    <Chip
                        sx={{my: 2}}
                        label="Payment done"
                        variant='outlined'
                        color='success'
                        icon={<CreditScoreOutlined />}
                    />
                ) : (
                    <Chip
                        sx={{my: 2}}
                        label="Pending payment"
                        variant='outlined'
                        color='error'
                        icon={<CreditCardOffOutlined />}
                    />
                )
            }

            <Grid container className='fadeIn'>
                <Grid item xs={12} sm={7}>
                    <CartItems products={order.orderItems} />
                </Grid>
                <Grid item xs={12} sm={5}>
                    <Card className='summary-card'>
                        <CardContent>
                            <Typography variant='h2'>
                                Summary ({order.numberOfItems} {order.numberOfItems > 1 ? 'items' : 'item'})
                            </Typography>

                            <Divider sx={{my: 1}} />

                            <Box display='flex' justifyContent='space-between'>
                                <Typography variant='subtitle1'>Shipping address</Typography>
                            </Box>

                            <Typography>{shippingAddress.firstName} {shippingAddress.lastName}</Typography>
                            <Typography>
                                {shippingAddress.address} {shippingAddress.address2 ? `, ${shippingAddress.address2}` : ''}
                            </Typography>
                            <Typography>{shippingAddress.city}, {shippingAddress.zipCode}</Typography>
                            <Typography>{shippingAddress.country}</Typography>
                            <Typography>{shippingAddress.phone}</Typography>

                            <Divider sx={{my: 1}} />

                            <Box display='flex' justifyContent='space-between'>
                                <Typography variant='subtitle1'>Order</Typography>
                            </Box>

                            <OrderSummary 
                                orderValues={{
                                    numberOfItems: order.numberOfItems, 
                                    subtotal: order.subtotal, 
                                    tax: order.tax, 
                                    total: order.total
                                }} 
                            />

                            <Box sx={{mt: 3}} display='flex' flexDirection='column'>
                                <Box 
                                    display='flex' 
                                    sx={{display: isPaying ? 'flex' : 'none'}}
                                    justifyContent='center' 
                                    className='fadeIn'
                                >
                                    <CircularProgress />
                                </Box>

                                <Box 
                                    sx={{display: isPaying ? 'none' : 'flex', flex: 1}}
                                    flexDirection='column'
                                    className='fadeIn'
                                >
                                    {
                                        order.isPaid ? (
                                            <Chip
                                                sx={{my: 2}}
                                                label="Payment done"
                                                variant='outlined'
                                                color='success'
                                                icon={<CreditScoreOutlined />}
                                            />
                                        ) : (
                                            <PayPalButtons
                                                createOrder={(data, actions) => {
                                                    return actions.order.create({
                                                        purchase_units: [
                                                            {
                                                                amount: {
                                                                    value: order.total.toString(),
                                                                },
                                                            },
                                                        ],
                                                    });
                                                }}
                                                onApprove={(data, actions) => {
                                                    return actions.order!.capture().then((details) => {
                                                        console.log({details});
                                                        onOrderCompleted(details);
                                                        // const name = details.payer.name!.given_name;
                                                        // alert(`Transaction completed by ${name}`);
                                                    });
                                                }}
                                            />
                                        )
                                    }
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </ShopLayout>
    );
};

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time
export const getServerSideProps: GetServerSideProps = async ({req, query}) => {
    const {id = ''} = query;
    const session: any = await getSession({req});

    // Check there's a logged user
    if (!session) {
        return {
            redirect: {
                destination: `/auth/login?p=orders/${id}`,
                permanent: false
            }
        }
    }

    const order = await dbOrders.getOrderById(id.toString());

    // If order does not exist, redirect
    if (!order) {
        return {
            redirect: {
                destination: '/orders/history',
                permanent: false
            }
        }
    }

    // Check that order's user is the one that is logged in
    if (order.user !== session.user._id) {
        return {
            redirect: {
                destination: '/orders/history',
                permanent: false
            }
        }
    }
 
    // All validations passed, return the order
    return {
        props: {
            order
        }
    }
}

export default OrderPage;