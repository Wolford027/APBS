import { Box, AppBar, Toolbar, Typography } from '@mui/material'
import React from 'react'
import SideNav from '../Components/SideNav'

function Backup() {
    const drawerWidth = 240;
  return (
    
    <Box sx={{display: 'flex'}}>
        <SideNav />
        <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` }}}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Audit Trail
          </Typography>
        </Toolbar>
        </AppBar>
    </Box>
  )
}

export default Backup