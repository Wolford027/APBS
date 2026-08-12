import React, { useState } from 'react';
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { NavDrawer, drawerWidth } from './SideNav';

export default function PageLayout({ title, actions, children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
          <IconButton
            color="inherit"
            edge="start"
            aria-label="Open navigation menu"
            onClick={() => setMobileNavOpen(true)}
            sx={{ mr: 1, display: { sm: 'none' } }}
          >
            <MenuRoundedIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="h1" sx={{ flexGrow: 1, fontSize: 18 }}>
            {title}
          </Typography>
          {actions}
        </Toolbar>
      </AppBar>
      <NavDrawer
        responsive
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, minWidth: 0 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
