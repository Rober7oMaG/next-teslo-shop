import type { NextPage } from 'next';
import { Typography } from '@mui/material';
import { ShopLayout } from '../../components/layouts';
import { FullScreenLoading } from '../../components/ui';
import { ProductList } from '../../components/products';
import { useProducts } from '../../hooks';
// import { initialData } from '../database/products';


const MenPage: NextPage = () => {
  const {products, isLoading} = useProducts('/products?gender=men')

  return (
    <ShopLayout title='Teslo Shop | Men' pageDescription='Men category page'>
      <Typography variant='h1' component='h1'>Men</Typography>
      <Typography variant='h2' sx={{mb: 1}}>All Products</Typography>

      {
        isLoading ? <FullScreenLoading /> : <ProductList products={products} />
      }

    </ShopLayout>
  );
};

export default MenPage;
