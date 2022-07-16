import React, { useContext, useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { AppBar, Badge, Box, Button, IconButton, Input, InputAdornment, Link, Toolbar, Typography } from '@mui/material';
import { ClearOutlined, SearchOutlined, ShoppingCartOutlined } from '@mui/icons-material';
import { CartContext, UIContext } from '../../context';

export const Navbar = () => {
    const {asPath, push} = useRouter();
    const {toggleSideMenu} = useContext(UIContext);
    const {numberOfItems} = useContext(CartContext);

    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const onSearchTerm = () => {
        if (searchTerm.trim().length === 0) {
            return;
        }

        push(`/search/${searchTerm}`);
    }

    // TextField autoFocus
    const textFieldInputFocus = (inputRef: any) => {
        if (inputRef && inputRef.node !== null) {
            setTimeout(() => {
                inputRef.focus();
            }, 100);
        }

        return inputRef;
    };

    let textFieldProps = { inputRef: textFieldInputFocus }

    return (
        <AppBar>
            <Toolbar>
                <NextLink href='/' passHref>
                    <Link display='flex' alignItems='center'>
                        <Typography variant='h6'>Teslo |</Typography>
                        <Typography sx={{ml: 0.6}}>Shop</Typography>
                    </Link>
                </NextLink>

                <Box flex={1} />

                <Box className='fadeIn' sx={{display: isSearchVisible ? 'none' : {xs: 'none', sm: 'flex'}}}>
                    <NextLink href='/category/men' passHref>
                        <Link display='flex' alignItems='center'>
                            <Button color={asPath === '/category/men' ? 'primary' : 'info'}>Men</Button>
                        </Link> 
                    </NextLink>
                    <NextLink href='/category/women' passHref>
                        <Link display='flex' alignItems='center'>
                            <Button color={asPath === '/category/women' ? 'primary' : 'info'}>Women</Button>
                        </Link> 
                    </NextLink>
                    <NextLink href='/category/kids' passHref>
                        <Link display='flex' alignItems='center'>
                            <Button color={asPath === '/category/kids' ? 'primary' : 'info'}>Kids</Button>
                        </Link> 
                    </NextLink>
                </Box>

                <Box flex={1} />

                {/* Bigger screens */}
                {
                    isSearchVisible ? (
                        <Input
                            sx={{display: {xs: 'none', sm: 'flex'}}}
                            className='fadeIn'
                            autoFocus
                            type='text'
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            onKeyPress={(event) => event.key === 'Enter' ? onSearchTerm() : null}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setIsSearchVisible(false)}
                                    >
                                        <ClearOutlined />
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                    ) : (
                        <IconButton
                            className='fadeIn'
                            onClick={() => setIsSearchVisible(true)}
                        >
                            <SearchOutlined
                                sx={{display: {xs: 'none', sm: 'flex'}}}
                            />
                        </IconButton>
                    )
                }

                {/* Small screens */}
                <IconButton
                    sx={{display: {xs: 'flex', sm: 'none'}}}
                    onClick={toggleSideMenu}
                >
                    <SearchOutlined />
                </IconButton>

                <NextLink href='/cart' passHref>
                    <Link>
                        <IconButton>
                            <Badge badgeContent={numberOfItems > 9 ? '+9' : numberOfItems} color='secondary'>
                                <ShoppingCartOutlined />
                            </Badge>
                        </IconButton>
                    </Link>
                </NextLink>

                <Button onClick={toggleSideMenu}>Menu</Button>
            </Toolbar>
        </AppBar>
    );
};
