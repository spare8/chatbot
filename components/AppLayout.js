// components/AppLayout.js
import * as React from 'react';
import {useState} from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Box, CssBaseline, useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SideNav, {drawerWidth} from './SideNav';
import PropTypes from 'prop-types';

export default function AppLayout({title = 'Chatbot', children}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));

  const handleToggle = () => setMobileOpen((v) => !v);

  return (
    <Box sx={{display: 'flex', minHeight: '100vh'}}>
      <CssBaseline />

      {/* AppBar — ensure it's ABOVE the drawer, and sized/shifted on desktop */}
      <AppBar
        position="fixed"
        color="default"
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1, // <-- put AppBar above Drawer
          backgroundColor: 'background.paper',
          width: {md: `calc(100% - ${drawerWidth}px)`},
          ml: {md: `${drawerWidth}px`},
        }}
      >
        <Toolbar>
          {!mdUp && (
            <IconButton color="inherit" edge="start" onClick={handleToggle} sx={{mr: 1}}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div">
            {title}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Side nav: temporary on mobile, permanent on desktop */}
      {!mdUp && (
        <SideNav
          variant="temporary"
          open={mobileOpen}
          onClose={handleToggle}
        />
      )}
      {mdUp && <SideNav variant="permanent" />}

      {/* Main content — offset for AppBar and reserve space for the drawer on desktop */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          ml: {md: `${drawerWidth}px`}, // <-- reserve space so drawer doesn't cover content
        }}
      >
        {/* Use a Toolbar spacer to offset the fixed AppBar height */}
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

AppLayout.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
};
