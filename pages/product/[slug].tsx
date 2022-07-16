import React, { useContext, useState } from 'react';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { Box, Button, Chip, Grid, Typography } from '@mui/material';
import { ShopLayout } from '../../components/layouts';
import { ItemCounter, ProductSlideshow, SizeSelector } from '../../components/products';
import { ICartProduct, IProduct, TValidSize } from '../../interfaces';
import { dbProducts } from '../../database';
import { getAllProductSlugs } from '../../database/dbProducts';
import { CartContext } from '../../context';

interface Props {
    product: IProduct
}

export const ProductPage: NextPage<Props> = ({product}) => {
    const router = useRouter();
    const {addProductToCart} = useContext(CartContext);

    const [tempCartProduct, setTempCartProduct] = useState<ICartProduct>({
        _id: product._id,
        image: product.images[0],
        price: product.price,
        size: undefined,
        slug: product.slug,
        title: product.title,
        gender: product.gender,
        quantity: 1
    });

    const sizeSelected = (size: TValidSize) => {
        setTempCartProduct(currentProduct => ({
            ...currentProduct,
            size
        }));
    }

    const onUpdateQuantity = (quantity: number) => {
        setTempCartProduct(currentProduct => ({
            ...currentProduct,
            quantity
        }));
    }

    const onAddToCart = () => {
        if (!tempCartProduct.size) {
            return;
        }

        addProductToCart(tempCartProduct);

        // Reset quantity to 1
        setTempCartProduct({...tempCartProduct, quantity: 1});
        
        // router.push('/cart');
    }
    
    return (
        <ShopLayout title={product.title} pageDescription={product.description}>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={7}>
                    <ProductSlideshow images={product.images} />
                </Grid>

                <Grid item xs={12} sm={5}>
                    <Box display='flex' flexDirection='column'>
                        {/* Titles */}
                        <Typography variant='h1' component='h1'>{product.title}</Typography>
                        <Typography variant='subtitle1' component='h2'>${product.price}</Typography>

                        {/* Quantity */}
                        <Box sx={{my: 2}}>
                            <Typography variant='subtitle2'>Quantity</Typography>
                            <ItemCounter 
                                currentValue={tempCartProduct.quantity}
                                maxValue={product.inStock > 10 ? 10 : product.inStock} 
                                updateQuantity={onUpdateQuantity}
                             />
                            <SizeSelector 
                                sizes={product.sizes}
                                selectedSize={tempCartProduct.size} 
                                onSizeSelected={sizeSelected}
                            />
                        </Box>

                        {
                            (product.inStock > 0) ? (
                                <Button 
                                    color='secondary' 
                                    className='circular-btn' 
                                    onClick={onAddToCart} 
                                    disabled={!tempCartProduct.size}
                                >
                                    {
                                        tempCartProduct.size ? 'Add to cart' : 'Select a size'
                                    }
                                </Button>
                            ) : (
                                <Chip label='Not available' color='error' variant='outlined' />
                            )
                        }

                        {/* Description */}
                        <Box sx={{mt: 3}}>
                            <Typography variant='subtitle2'>Description</Typography>
                            <Typography variant='body2'>{product.description}</Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </ShopLayout>
    );
};

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time
// export const getServerSideProps: GetServerSideProps = async ({params}) => {
//     const {slug = ''} = params as {slug: string};

//     const product = await dbProducts.getProductBySlug(slug);

//     if (!product) {
//         return {
//             redirect: {
//                 destination: '/',
//                 permanent: false
//             }
//         }
//     }

//     return {
//         props: {
//             product
//         }
//     }
// }

export const getStaticPaths: GetStaticPaths = async (ctx) => {
    const productSlugs = await getAllProductSlugs();
  
    return {
      paths: productSlugs.map(({slug}) => ({
        params: {slug}
      })),
      fallback: 'blocking'
    }
}
  
  export const getStaticProps: GetStaticProps = async ({params}) => {
    const {slug = ''} = params as {slug: string};
    const product = await dbProducts.getProductBySlug(slug);
  
    if (!product) {
        return {
            redirect: {
            destination: '/',
            permanent: false
            }
        }
    }
  
    return {
        props: {
            product
        },
        revalidate: 60 * 60 * 24
    }
}

export default ProductPage;