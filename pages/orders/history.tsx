import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import NextLink from 'next/link';
import { Chip, Grid, Link, Typography } from '@mui/material';
import {DataGrid, GridColDef, GridValueGetterParams} from '@mui/x-data-grid';
import { ShopLayout } from '../../components/layouts';
import { getSession } from 'next-auth/react';
import { dbOrders } from '../../database';
import { IOrder } from '../../interfaces';

const columns: GridColDef[] = [
    {field: 'id', headerName: 'ID', width: 100},
    {field: 'fullName', headerName: 'Full Name', width: 300},
    {
        field: 'paid',
        headerName: 'Paid',
        description: 'Shows wether the order is paid or not',
        width: 200,
        renderCell: (params: GridValueGetterParams) => {
            return (
                params.row.paid 
                    ? <Chip color='success' label='Paid' variant='outlined' />
                    : <Chip color='error' label='Not paid' variant='outlined' />
            )
        }
    },
    {
        field: 'order',
        headerName: 'Order',
        width: 200,
        sortable: false,
        renderCell: (params: GridValueGetterParams) => {
            return (
                <NextLink href={`/orders/${params.row.orderId}`} passHref>
                    <Link underline='always'>
                        Check order
                    </Link>
                </NextLink>
            )
        }
    }
];

interface Props {
    orders: IOrder[]
}

const HistoryPage: NextPage<Props> = ({orders}) => {
    const rows = orders.map((order, index) => ({
        id: index + 1,
        fullName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        paid: order.isPaid,
        orderId: order._id
    }))

    return (
        <ShopLayout title={'Teslo Shop | Orders History'} pageDescription={"Client's orders history"}>
            <Typography variant='h1' component='h1'>Orders History</Typography>

            <Grid container className='fadeIn'>
                <Grid item xs={12} sx={{height: 650, width: '100%'}}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[10]}
                    />

                </Grid>
            </Grid>
        </ShopLayout>
    );
};

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time
export const getServerSideProps: GetServerSideProps = async ({req}) => {
    const session: any = await getSession({req});

    if (!session) {
        return {
            redirect: {
                destination: '/auth/login?p=/orders/history',
                permanent: false
            }
        }
    }

    const orders = await dbOrders.getOrdersByUser(session.user._id);

    return {
        props: {
            orders
        }
    }
}

export default HistoryPage;