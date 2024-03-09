import React from 'react'
import Box from '@mui/material/Box'
import SideNav from '../Components/SideNav'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Calendar from '../Components/Calendar'


const drawerWidth = 240;

export default function Dashboard(){

  return(

    <>
    <Box sx={{display: "flex", marginTop:10, marginLeft:-10}}>
      <SideNav/>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Dashboard
          </Typography>
        </Toolbar>
    </AppBar>
    <Calendar/>
    </Box>
    </>


  )


}