import React, { useContext } from 'react';
import NextLink from 'next/link';
import { Box, Button, CardActionArea, CardMedia, Grid, Link, Typography } from '@mui/material';
import { ItemCounter } from '../products';
import { CartContext } from '../../context';
import { ICartProduct, IOrderItem } from '../../interfaces';

interface Props {
    editable?: boolean;
    products?: IOrderItem[];
}

export const CartItems: React.FC<Props> = ({editable = false, products}) => {
    const {cart, updateCartQuantity, removeCartProduct} = useContext(CartContext);

    const onQuantityChange = (product: ICartProduct, newQuantityValue: number) => {
        product.quantity = newQuantityValue;
        updateCartQuantity(product);
    }

    const productsToShow = products ? products : cart;

    return (
        <>
            {
                productsToShow.map(product => (
                    <Grid container spacing={2} sx={{mb: 1}} key={product.slug + product.size}>
                        <Grid item xs={3}>
                            <NextLink href={`/product/${product.slug}`} passHref>
                                <Link>
                                    <CardActionArea>
                                        <CardMedia 
                                            image={product.image}
                                            component='img'
                                            sx={{borderRadius: '5px'}}
                                        />
                                    </CardActionArea>
                                </Link>
                            </NextLink>
                        </Grid>
                        <Grid item xs={7}>
                            <Box display='flex' flexDirection='column'>
                                <Typography variant='body1'>{product.title}</Typography>
                                <Typography variant='body1'>Size: <strong>{product.size}</strong></Typography>
                                {
                                    editable ? (
                                        <ItemCounter
                                            currentValue={product.quantity}
                                            maxValue={10}
                                            updateQuantity={(value) => {onQuantityChange(product as ICartProduct, value)}}
                                        /> 
                                    ) : (
                                        <Typography variant='subtitle2'>Quantity: {product.quantity}</Typography>
                                    )
                                }
                            </Box>
                        </Grid>
                        <Grid item xs={2} display='flex' alignItems='center' flexDirection='column'>
                            <Typography variant='subtitle1'>${product.price}</Typography>
                            {
                                editable && (
                                    <Button 
                                    variant='text' 
                                    color='secondary' 
                                    onClick={() => removeCartProduct(product as ICartProduct)}
                                    >
                                        Remove
                                    </Button>
                                )
                            }

                        </Grid>
                    </Grid>
                ))
            }
        </>
    );
};
