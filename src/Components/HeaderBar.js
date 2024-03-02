import React from 'react'
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

const drawerWidth = 240;


export default function HeaderBar() {

  return (
    
    <AppBar
    position="fixed"
    sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}>
    <Toolbar>
      <Typography variant="h6" noWrap component="div">
        APBS Dashboard
      </Typography>
    </Toolbar>
  </AppBar>
  )
}
