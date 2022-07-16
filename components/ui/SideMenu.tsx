import { useContext, useState } from "react";
import { Box, Divider, Drawer, IconButton, Input, InputAdornment, List, ListItem, ListItemIcon, ListItemText, ListSubheader } from "@mui/material";
import { AccountCircleOutlined, AdminPanelSettings, CategoryOutlined, ConfirmationNumberOutlined, DashboardOutlined, EscalatorWarningOutlined, FemaleOutlined, LoginOutlined, MaleOutlined, SearchOutlined, VpnKeyOutlined } from "@mui/icons-material";
import { AuthContext, UIContext } from "../../context";
import { useRouter } from "next/router";

export const SideMenu = () => {
    const router = useRouter();
    const {isMenuOpen, toggleSideMenu} = useContext(UIContext); 
    const {isLoggedIn, user, logout} = useContext(AuthContext);

    const [searchTerm, setSearchTerm] = useState('');

    const onSearchTerm = () => {
        if (searchTerm.trim().length === 0) {
            return;
        }

        navigateTo(`/search/${searchTerm}`);
    }

    const navigateTo = (url: string) => {
        toggleSideMenu();
        router.push(url);
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
        <Drawer
            open={ isMenuOpen }
            anchor='right'
            sx={{ backdropFilter: 'blur(4px)', transition: 'all 0.5s ease-out' }}
            onClose={toggleSideMenu}
        >
            <Box sx={{ width: 250, paddingTop: 5 }}>
                <List>
                    <ListItem>
                        <Input
                            {...textFieldProps}
                            autoFocus
                            type='text'
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            onKeyPress={(event) => event.key === 'Enter' ? onSearchTerm() : null}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={onSearchTerm}
                                    >
                                        <SearchOutlined />
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                    </ListItem>

                    {
                        isLoggedIn && (
                            <>
                                <ListItem button>
                                    <ListItemIcon>
                                        <AccountCircleOutlined/>
                                    </ListItemIcon>
                                    <ListItemText primary={'Profile'} />
                                </ListItem>

                                <ListItem button onClick={() => navigateTo('/orders/history')}>
                                    <ListItemIcon>
                                        <ConfirmationNumberOutlined/>
                                    </ListItemIcon>
                                    <ListItemText primary={'Orders'} />
                                </ListItem>
                            </>
                        )
                    }

                    <ListItem 
                        button 
                        sx={{ display: { xs: '', sm: 'none' } }}
                        onClick={() => navigateTo('/category/men')}
                    >
                        <ListItemIcon>
                            <MaleOutlined/>
                        </ListItemIcon>
                        <ListItemText primary={'Men'} />
                    </ListItem>

                    <ListItem 
                        button 
                        sx={{ display: { xs: '', sm: 'none' } }}
                        onClick={() => navigateTo('/category/women')}
                    >
                        <ListItemIcon>
                            <FemaleOutlined/>
                        </ListItemIcon>
                        <ListItemText primary={'Women'} />
                    </ListItem>

                    <ListItem 
                        button 
                        sx={{ display: { xs: '', sm: 'none' } }}
                        onClick={() => navigateTo('/category/kids')}
                    >
                        <ListItemIcon>
                            <EscalatorWarningOutlined/>
                        </ListItemIcon>
                        <ListItemText primary={'Kids'} />
                    </ListItem>

                    {
                        isLoggedIn ? (
                            <ListItem button onClick={logout}>
                                <ListItemIcon>
                                    <LoginOutlined/>
                                </ListItemIcon>
                                <ListItemText primary={'Log Out'} />
                            </ListItem>
                        ) : (
                            <ListItem 
                                button
                                onClick={() => navigateTo(`/auth/login?p=${router.asPath}`)}
                            >
                                <ListItemIcon>
                                    <VpnKeyOutlined/>
                                </ListItemIcon>
                                <ListItemText primary={'Log In'} />
                            </ListItem>
                        )
                    }

                    {/* Admin */}
                    {
                        isLoggedIn && user?.role === 'admin' && (
                            <>
                                <Divider />
                                <ListSubheader>Admin Panel</ListSubheader>

                                <ListItem button onClick={() => navigateTo('/admin')}>
                                    <ListItemIcon>
                                        <DashboardOutlined />
                                    </ListItemIcon>
                                    <ListItemText primary={'Dashboard'} />
                                </ListItem>
                                <ListItem button>
                                    <ListItemIcon>
                                        <CategoryOutlined/>
                                    </ListItemIcon>
                                    <ListItemText primary={'Products'} onClick={() => navigateTo('/admin/products')} />
                                </ListItem>
                                <ListItem button onClick={() => navigateTo('/admin/orders')}>
                                    <ListItemIcon>
                                        <ConfirmationNumberOutlined/>
                                    </ListItemIcon>
                                    <ListItemText primary={'Orders'} />
                                </ListItem>

                                <ListItem button onClick={() => navigateTo('/admin/users')}>
                                    <ListItemIcon>
                                        <AdminPanelSettings/>
                                    </ListItemIcon>
                                    <ListItemText primary={'Users'} />
                                </ListItem>
                            </>
                        )
                    }
                </List>
            </Box>
        </Drawer>
    );
};