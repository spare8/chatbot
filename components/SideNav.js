import * as React from 'react';
import NextLink from 'next/link';
import {useRouter} from 'next/router';
import {
  Drawer, Toolbar, List, ListItemButton, ListItemIcon, ListItemText,
  Divider, Box, Collapse, Chip,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import StorageIcon from '@mui/icons-material/Storage';
import ForumIcon from '@mui/icons-material/Forum';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import PropTypes from 'prop-types';
import {ConfigStatusContext} from '../lib/configStatusContext';

export const drawerWidth = 240;

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
  const {ok} = React.useContext(ConfigStatusContext);
  const disableOthers = !ok;

  const isActive = (href) =>
    router.pathname === href || router.pathname.startsWith(`${href}/`);

  // Track which parent sections are open
  const [openSections, setOpenSections] = React.useState({});
  React.useEffect(() => {
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
            const isEnabledWithoutConfig = ['/config', '/how-to-use'].includes(item.href);
            const isConfig = item.href === '/config';
            const disabled = disableOthers && !isEnabledWithoutConfig;

            const Component = disabled ? 'button' : NextLink;
            const hrefProp = disabled ? undefined : item.href;

            return (
              <ListItemButton
                key={item.href}
                component={Component}
                href={hrefProp}
                selected={isActive(item.href)}
                onClick={onClose}
                disabled={disabled}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={
                    isConfig && !ok ? (
                      <>
                        {item.label}
                        <Chip
                          label="Pending"
                          size="small"
                          color="warning"
                          sx={{ml: 1}}
                        />
                      </>
                    ) : (
                      item.label
                    )
                  }
                />
              </ListItemButton>
            );
          }

          // Parent with children -> toggle expand, not a link
          const parentActive = item.children.some((c) => isActive(c.href));
          const openState = !!openSections[item.label];

          return (
            <React.Fragment key={item.label}>
              <ListItemButton onClick={() => toggleSection(item.label)} selected={parentActive}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
                {openState ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              <Collapse in={openState} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => {
                    const disabled = disableOthers; // all admin children disabled until configured
                    const Component = disabled ? 'button' : NextLink;
                    const hrefProp = disabled ? undefined : child.href;

                    return (
                      <ListItemButton
                        key={child.href}
                        component={Component}
                        href={hrefProp}
                        selected={isActive(child.href)}
                        onClick={onClose}
                        disabled={disabled}
                        sx={{pl: 4}}
                      >
                        <ListItemIcon>{child.icon}</ListItemIcon>
                        <ListItemText primary={child.label} />
                      </ListItemButton>
                    );
                  })}
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

SideNav.propTypes = {
  variant: PropTypes.oneOf(['permanent', 'temporary']),
  open: PropTypes.bool,
  onClose: PropTypes.func,
};
