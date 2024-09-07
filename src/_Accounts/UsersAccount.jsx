import * as React from 'react'
import SideNav from '../Components/SideNav'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { Button } from '@mui/material'
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
    <>
    <Box sx={{display: "flex" }}>
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
            Users Account
          </Typography>
        </Toolbar>
        <Button variant='contained' onClick={handleLogout} >Logout</Button>
    </AppBar>
    </Box>
    </>
  )
}
