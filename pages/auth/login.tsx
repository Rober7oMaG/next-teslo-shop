import React, { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { getSession, signIn, getProviders } from 'next-auth/react';
import { Box, Button, Chip, Divider, Grid, Link, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { ErrorOutline } from '@mui/icons-material';
import { AuthLayout } from '../../components/layouts';
import { validations } from '../../utils';

type FormData = {
    email: string;
    password: string;
};

const LoginPage = () => {
    const router = useRouter();
    // const {loginUser} = useContext(AuthContext);
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [showErrow, setShowErrow] = useState(false);
    const [providers, setProviders] = useState<any>({});

    useEffect(() => {
      getProviders().then(provs => {
        setProviders(provs);
      });
    }, [])
    
    
    const onUserLogin = async ({email, password}: FormData) => {
        setShowErrow(false);
        
        // const isValidLogin = await loginUser(email, password);
        
        // if (!isValidLogin) {
        //     setShowErrow(true);
            
        //     setTimeout(() => {
        //         setShowErrow(false);
        //     }, 3000);
            
        //     return;
        // }
        
        // const destination = router.query.p?.toString() || '/';
        // router.replace(destination);
        await signIn('credentials', {email, password});
    }

    return (
        <AuthLayout title='Login'>
            <form onSubmit={handleSubmit(onUserLogin)} noValidate>
                <Box sx={{width: 350, padding: '10px 20px'}}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} >
                            <Typography variant='h1' component='h1'>Log In</Typography>
                            <Chip
                                sx={{mt: 1, display: showErrow ? 'flex' : 'none'}}
                                label='Incorrect credentials.'
                                color='error'
                                icon={<ErrorOutline />}
                                className='fadeIn'
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                type='email'
                                label='Email'
                                variant='filled'
                                fullWidth
                                {
                                    ...register('email', {
                                        required: 'Email field is required.',
                                        validate: validations.isEmail
                                    })
                                }
                                error={!!errors.email}
                                helperText={errors.email?.message}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label='Password'
                                type='password'
                                variant='filled'
                                fullWidth
                                {...register('password', {
                                    required: 'Password field is required.',
                                    minLength: {value: 6, message: 'Password has to be at least 6 characters long.'}
                                })}
                                error={!!errors.password}
                                helperText={errors.password?.message}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                type='submit'
                                color='secondary'
                                className='circular-btn'
                                size='large'
                                fullWidth
                            >
                                Log in
                            </Button>
                        </Grid>
                        <Grid item xs={12} display='flex' justifyContent='center'>
                            <NextLink href={router.query.p ? `/auth/register?p=${router.query.p}` : '/auth/register'} passHref>
                                <Link underline='always'>
                                    {"Don't have an account? Create one"}
                                </Link>
                            </NextLink>
                        </Grid>

                        <Grid item xs={12} display='flex' flexDirection='column' justifyContent='center'>
                            <Divider sx={{width: '100%', mb: 2}} />

                            {
                                Object.values(providers).map((provider: any) => {
                                    if (provider.id === 'credentials') {
                                        return (
                                            <div key="credentials"></div>
                                        );
                                    }

                                    return (
                                        <Button
                                            key={provider.id}
                                            variant='outlined'
                                            fullWidth
                                            color='primary'
                                            sx={{mb: 1}}
                                            onClick={() => signIn(provider.id)}
                                        >
                                            {provider.name}
                                        </Button>
                                    );
                                })
                            }
                        </Grid>

                    </Grid>
                </Box>
            </form>
        </AuthLayout>
    );
};

// You should use getServerSideProps when:
// - Only if you need to pre-render a page whose data must be fetched at request time
export const getServerSideProps: GetServerSideProps = async ({req, query}) => {
    const session = await getSession({req});
    const {p = '/'} = query; 

    if (session) {
        return {
            redirect: {
                destination: p.toString(),
                permanent: false
            }
        };
    }

    return {
        props: {
            
        }
    }
}

export default LoginPage;