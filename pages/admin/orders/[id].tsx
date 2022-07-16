import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { Box, Card, CardContent, Chip, Divider, Grid, Typography } from '@mui/material';
import { AirplaneTicketOutlined, CreditCardOffOutlined, CreditScoreOutlined } from '@mui/icons-material';
import { CartItems, OrderSummary } from '../../../components/cart';
import { AdminLayout } from '../../../components/layouts';
import { dbOrders } from '../../../database';
import { IOrder } from '../../../interfaces';

interface Props {
    order: IOrder
}

const OrderAdminPage: NextPage<Props> = ({order}) => {
    const {shippingAddress} = order;

    return (
        <AdminLayout 
            title='Order Summary' 
            subtitle={`Order: ${order._id}`} 
            icon={<AirplaneTicketOutlined />}
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
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </AdminLayout>
    );
};

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time
export const getServerSideProps: GetServerSideProps = async ({req, query}) => {
    const {id = ''} = query;

    const order = await dbOrders.getOrderById(id.toString());

    // If order does not exist, redirect
    if (!order) {
        return {
            redirect: {
                destination: '/admin/orders',
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

export default OrderAdminPage;