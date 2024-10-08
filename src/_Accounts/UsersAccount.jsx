import * as React from 'react'
import SideNav from '../Components/SideNav'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { Avatar, Button } from '@mui/material'
import { useAuth } from '../_Auth/AuthContext'
import { useNavigate } from 'react-router-dom'


const drawerWidth = 240;

export default function UsersAccount() {

  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <Box sx={{display: "flex", height: '100vh' }}>
      <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              Users Account
            </Typography>
          </Toolbar>
      </AppBar>
      <SideNav />
      <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <Avatar src='' sx={{width: { xs: '8rem', sm: '10rem', md: '12rem' }, height: { xs: '8rem', sm: '10rem', md: '12rem' }}} />
          <Button variant='contained' onClick={handleLogout} >Logout</Button>
        </Box>
      </Box>
  
    </Box>
  )
}
