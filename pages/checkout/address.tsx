import React, { useContext, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import Cookies from 'js-cookie';
import { ShopLayout } from '../../components/layouts'
import { countries, jwt } from '../../utils';
import { CartContext } from '../../context';

type FormData = {
    firstName: string;
    lastName: string;
    address: string;
    address2?: string;
    zipCode: string;
    city: string;
    country: string;
    phone: string;
};

const getAddressFromCookies = (): FormData => {
    return {
        firstName: Cookies.get('firstName') || '',
        lastName: Cookies.get('lastName') || '',
        address: Cookies.get('address') || '',
        address2: Cookies.get('address2') || '',
        zipCode: Cookies.get('zipCode') || '',
        city: Cookies.get('city') || '',
        country: Cookies.get('country') || '',
        phone: Cookies.get('phone') || ''
    }
}

const AddressPage = () => {
    const router = useRouter();
    const {updateAddress} = useContext(CartContext);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        defaultValues: {
            firstName: '',
            lastName: '',
            address: '',
            address2: '',
            zipCode: '',
            city: '',
            country: countries[0].code,
            phone: '',
        }
    });

    useEffect(() => {
      reset(getAddressFromCookies());
    }, [reset]);
    
    const onAddressSubmit = (data: FormData) => {
        updateAddress(data);
        router.push('/checkout/summary');
    };

    return (
        <ShopLayout title={'Teslo Shop | Checkout - Address'} pageDescription={'Confirm destination address'}>
            <form onSubmit={handleSubmit(onAddressSubmit)}>
                <Typography variant='h1' component='h1'>Address</Typography>

                <Grid container spacing={2} sx={{mt: 2}}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label='First Name'
                            variant='filled'
                            fullWidth
                            {
                                ...register('firstName', {
                                    required: 'First Name field is required.',
                                    minLength: {value: 2, message: 'Your name has to be at least 2 characters long.'}
                                })
                            }
                            error={!!errors.firstName}
                            helperText={errors.firstName?.message}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label='Last Name'
                            variant='filled'
                            fullWidth
                            {
                                ...register('lastName', {
                                    required: 'Last Name field is required.',
                                    minLength: {value: 2, message: 'Your last name has to be at least 2 characters long.'}
                                })
                            }
                            error={!!errors.lastName}
                            helperText={errors.lastName?.message}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label='Address'
                            variant='filled'
                            fullWidth
                            {
                                ...register('address', {
                                    required: 'Address field is required.'
                                })
                            }
                            error={!!errors.address}
                            helperText={errors.address?.message}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label='Address 2'
                            variant='filled'
                            fullWidth
                            {
                                ...register('address2')
                            }
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label='Zip Code'
                            variant='filled'
                            fullWidth
                            {
                                ...register('zipCode', {
                                    required: 'Zip Code field is required.'
                                })
                            }
                            error={!!errors.zipCode}
                            helperText={errors.zipCode?.message}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label='City'
                            variant='filled'
                            fullWidth
                            {
                                ...register('city', {
                                    required: 'City field is required.'
                                })
                            }
                            error={!!errors.city}
                            helperText={errors.city?.message}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        {/* <FormControl fullWidth> */}
                            <TextField
                                // key={Cookies.get('country') || countries[0].code}
                                // select
                                variant='filled'
                                label='Country'
                                fullWidth
                                // defaultValue={Cookies.get('country') || countries[0].code}
                                {
                                    ...register('country', {
                                        required: 'Country field is required.'
                                    })
                                }
                                error={!!errors.country}
                                helperText={errors.country?.message}
                            />
                                {/* {
                                    countries.map(country => (
                                        <MenuItem key={country.code} value={country.code}>{country.name}</MenuItem>
                                    ))
                                }
                            </TextField> 
                        </FormControl> */}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label='Phone Number'
                            variant='filled'
                            fullWidth
                            {
                                ...register('phone', {
                                    required: 'Phone Number field is required.'
                                })
                            }
                            error={!!errors.phone}
                            helperText={errors.phone?.message}
                        />
                    </Grid>
                </Grid>

                <Box sx={{mt: 5}} display='flex' justifyContent='center'>
                    <Button color='secondary' className='circular-btn' size='large' type='submit'>Check Order</Button>
                </Box>
            </form>
        </ShopLayout>
    );
};

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time
// export const getServerSideProps: GetServerSideProps = async ({req}) => {
//     const {token = ''} = req.cookies;
//     let userId = '';
//     let isValidToken = false;

//     try {
//         userId = await jwt.isValidToken(token);
//         isValidToken = true;
//     } catch (error) {
//         isValidToken = false;
//     }

//     if (!isValidToken) {
//         return {
//             redirect: {
//                 destination: '/auth/login?p=/checkout/address',
//                 permanent: false
//             }
//         }
//     }

//     return {
//         props: {
            
//         }
//     }
// }

export default AddressPage;