// components/SideNav.js
import * as React from 'react';
import NextLink from 'next/link';
import {useRouter} from 'next/router';
import {
  Drawer, Toolbar, List, ListItemButton, ListItemIcon, ListItemText,
  Divider, Box, Collapse,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import StorageIcon from '@mui/icons-material/Storage';
import ForumIcon from '@mui/icons-material/Forum';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import PropTypes from 'prop-types';

const drawerWidth = 240;

// Hierarchical nav config
const navItems = [
  {label: 'How to use', href: '/how-to-use', icon: <QuestionMarkIcon />},
  {label: 'Config', href: '/config', icon: <SettingsIcon />},
  {
    label: 'Admin',
    icon: <AdminPanelSettingsIcon />,
    children: [
      {label: 'Manage Assistants', href: '/admin/assistants', icon: <AdminPanelSettingsIcon />},
      {label: 'Vector Stores', href: '/admin/vector-stores', icon: <StorageIcon />},
    ],
  },
  {label: 'Client', href: '/client', icon: <ForumIcon />},
];

export default function SideNav({variant = 'permanent', open, onClose}) {
  const router = useRouter();

  const isActive = (href) =>
    router.pathname === href || router.pathname.startsWith(`${href}/`);

  // Track which parent sections are open
  const [openSections, setOpenSections] = React.useState({});
  React.useEffect(() => {
    // auto-open any section whose child matches the current route
    const next = {};
    for (const item of navItems) {
      if (item.children?.length) {
        next[item.label] = item.children.some((c) => isActive(c.href));
      }
    }
    setOpenSections((prev) => ({...prev, ...next}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname]);

  const toggleSection = (key) =>
    setOpenSections((prev) => ({...prev, [key]: !prev[key]}));

  const content = (
    <Box sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
      <Toolbar />
      <Divider />
      <List sx={{py: 0}}>
        {navItems.map((item) => {
          const hasChildren = !!item.children?.length;

          if (!hasChildren) {
            // Simple leaf item -> direct navigation
            return (
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
            );
          }

          // Parent with children -> toggle expand, not a link
          const parentActive = item.children.some((c) => isActive(c.href));
          const openState = !!openSections[item.label];

          return (
            <React.Fragment key={item.label}>
              <ListItemButton
                onClick={() => toggleSection(item.label)}
                selected={parentActive}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
                {openState ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              <Collapse in={openState} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItemButton
                      key={child.href}
                      component={NextLink}
                      href={child.href}
                      selected={isActive(child.href)}
                      onClick={onClose}
                      sx={{pl: 4}}
                    >
                      <ListItemIcon>{child.icon}</ListItemIcon>
                      <ListItemText primary={child.label} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          );
        })}
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
