import React from 'react';
import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import { NavDrawer, drawerWidth } from './SideNav';

export default function PageLayout({ title, actions, children }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="h1" sx={{ flexGrow: 1, fontSize: 18 }}>
            {title}
          </Typography>
          {actions}
        </Toolbar>
      </AppBar>
      <NavDrawer />
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, minWidth: 0 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
