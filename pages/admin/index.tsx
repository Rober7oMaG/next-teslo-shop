import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { AccessTimeOutlined, AttachMoneyOutlined, CancelPresentationOutlined, CategoryOutlined, CreditCardOffOutlined, DashboardOutlined, GroupOutlined, ProductionQuantityLimitsOutlined } from '@mui/icons-material';
import { AdminLayout } from '../../components/layouts';
import { Grid, Typography } from '@mui/material';
import { SummaryTile } from '../../components/admin';
import { DashboardSummaryResponse } from '../../interfaces';

const DashboardPage = () => {
    const {data, error} = useSWR<DashboardSummaryResponse>('/api/admin/dashboard', {
        refreshInterval: 30000
    });

    const [refreshIn, setRefreshIn] = useState(30);

    useEffect(() => {
      const interval = setInterval(() => {
        setRefreshIn(refreshIn => refreshIn > 0 ? refreshIn - 1 : 30)
      }, 1000);
    
      return () => clearInterval(interval);
    }, []);
    

    if (!error && !data) {
        return <></>;
    }

    if (error) {
        console.log(error);
        return <Typography>Error loading information</Typography>
    }

    const {
        numberOfOrders,
        paidOrders,
        pendingOrders,
        numberOfClients,
        numberOfProducts,
        outOfStockProducts,
        lowStockProducts
    } = data!;

    return (
        <AdminLayout title='Dashboard' subtitle='General Statistics' icon={<DashboardOutlined />}>
            <Grid container spacing={2}>
                <SummaryTile 
                    title={numberOfOrders} 
                    subtitle='Orders' 
                    icon={<CreditCardOffOutlined color='secondary' sx={{fontSize: 40}} />} 
                />
                <SummaryTile 
                    title={paidOrders} 
                    subtitle='Paid Orders' 
                    icon={<AttachMoneyOutlined color='success' sx={{fontSize: 40}} />} 
                />
                <SummaryTile 
                    title={pendingOrders} 
                    subtitle='Pending Orders' 
                    icon={<CreditCardOffOutlined color='error' sx={{fontSize: 40}} />} 
                />
                <SummaryTile 
                    title={numberOfClients} 
                    subtitle='Clients' 
                    icon={<GroupOutlined color='primary' sx={{fontSize: 40}} />} 
                />
                <SummaryTile 
                    title={numberOfProducts} 
                    subtitle='Products' 
                    icon={<CategoryOutlined color='primary' sx={{fontSize: 40}} />} 
                />
                <SummaryTile 
                    title={outOfStockProducts} 
                    subtitle='Out of Stock' 
                    icon={<CancelPresentationOutlined color='error' sx={{fontSize: 40}} />} 
                />
                <SummaryTile 
                    title={lowStockProducts} 
                    subtitle='Low Stock' 
                    icon={<ProductionQuantityLimitsOutlined color='warning' sx={{fontSize: 40}} />} 
                />
                <SummaryTile 
                    title={refreshIn} 
                    subtitle='Update in' 
                    icon={<AccessTimeOutlined color='secondary' sx={{fontSize: 40}} />} 
                />
            </Grid>
        </AdminLayout>
    );
};

export default DashboardPage;