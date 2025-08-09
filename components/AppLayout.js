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

      {/* AppBar */}
      <AppBar position="fixed" color="default" sx={{backgroundColor: 'background.paper'}}>
        <Toolbar>
          {!mdUp && (
            <IconButton color="inherit" edge="start" onClick={handleToggle} sx={{mr: 1}}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div">{title}</Typography>
        </Toolbar>
      </AppBar>

      {/* Side nav: temporary on mobile, permanent on desktop */}
      {!mdUp && <SideNav variant="temporary" open={mobileOpen} onClose={handleToggle} />}
      {mdUp && <SideNav variant="permanent" />}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          mt: 8, // offset for AppBar
          ...(mdUp ? {ml: `${drawerWidth}px`} : {}),
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

AppLayout.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
};
