// components/SideNav.js
import * as React from 'react';
import NextLink from 'next/link';
import {useRouter} from 'next/router';
import {
  Drawer, Toolbar, List, ListItemButton, ListItemIcon, ListItemText, Divider, Box,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import StorageIcon from '@mui/icons-material/Storage';
import ForumIcon from '@mui/icons-material/Forum';
import PropTypes from 'prop-types';

const drawerWidth = 240;

const navItems = [
  {label: 'Home', href: '/', icon: <HomeIcon />},
  {label: 'Config', href: '/config', icon: <SettingsIcon />},
  {label: 'Client', href: '/client', icon: <ForumIcon />},
  {label: 'Admin', href: '/admin', icon: <AdminPanelSettingsIcon />},
  {label: 'Assistants', href: '/admin/assistants', icon: <AdminPanelSettingsIcon />},
  {label: 'Vector Stores', href: '/admin/vector-stores', icon: <StorageIcon />},
];

export default function SideNav({variant = 'permanent', open, onClose}) {
  const router = useRouter();
  const isActive = (href) => router.pathname === href || router.pathname.startsWith(href + '/');

  const content = (
    <Box sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
      <Toolbar />
      <Divider />
      <List sx={{py: 0}}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.href}
            component={NextLink}
            href={item.href}
            selected={isActive(item.href)}
            onClick={onClose}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        'display': {xs: 'block', md: 'block'},
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
        },
      }}
    >
      {content}
    </Drawer>
  );
}

export {drawerWidth};

SideNav.propTypes = {
  variant: PropTypes.oneOf(['permanent', 'temporary']),
  open: PropTypes.bool,
  onClose: PropTypes.func,
};
