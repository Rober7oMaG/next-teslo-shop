import React, { useContext, useState } from 'react';
import { GetServerSideProps } from 'next';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { getSession, signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { Box, Button, Chip, Grid, Link, TextField, Typography } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';
import { AuthLayout } from '../../components/layouts';
import { validations } from '../../utils';
import { tesloApi } from '../../api';
import { AuthContext } from '../../context';

type FormData = {
    name: string;
    email: string;
    password: string;
    passwordConfirmation: string;
};

const RegisterPage = () => {
    const router = useRouter();
    const {registerUser} = useContext(AuthContext);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [showErrow, setShowErrow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const onRegisterForm = async ({name, email, password, passwordConfirmation}: FormData) => {
        setShowErrow(false);

        const {hasError, message} = await registerUser(name, email, password);

        if (hasError) {
            setShowErrow(true);
            setErrorMessage(message!);

            setTimeout(() => {
                setShowErrow(false);
            }, 3000);

            return;
        }

        // const destination = router.query.p?.toString() || '/';
        // router.replace(destination);
        await signIn('credentials', {email, password});
    }

    return (
        <AuthLayout title='Teslo Shop | Register'>
            <form onSubmit={handleSubmit(onRegisterForm)} noValidate>
                <Box sx={{width: 350, padding: '10px 20px'}}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} display='flex' justifyContent='center'>
                            <Typography variant='h1' component='h1'>Register</Typography>
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
                                label='Full Name'
                                variant='filled'
                                fullWidth
                                {
                                    ...register('name', {
                                        required: 'Name field is required.',
                                        minLength: {value: 2, message: 'Name has to be at least 2 characters long.'}
                                    })
                                }
                                error={!!errors.name}
                                helperText={errors.name?.message}
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
                                Create Account
                            </Button>
                        </Grid>
                        <Grid item xs={12} display='flex' justifyContent='center'>
                            <NextLink href={router.query.p ? `/auth/login?p=${router.query.p}` : '/auth/login'} passHref>
                                <Link underline='always'>
                                    {"Already have an account? Log in"}
                                </Link>
                            </NextLink>
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

export default RegisterPage;