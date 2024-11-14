import React, { useState, useEffect } from 'react'
import SideNav from '../Components/SideNav'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { Avatar, Button } from '@mui/material'
import { useAuth } from '../_Auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const drawerWidth = 240;

export default function UsersAccount() {
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('')
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const fetchFullName = async () => {
    try {
      const res = await axios.get('http://localhost:8800/full-name')
      const { first_name, middle_name, last_name, role } = res.data
      setFullName(`${first_name} ${middle_name ? middle_name : ''} ${last_name}`)
      setRole(role)  // Directly set the role
      console.log(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchFullName()
  }, []);

  return (
    <Box sx={{display: "flex", height: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px}` },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            User Profile
          </Typography>
        </Toolbar>
      </AppBar>
      <SideNav />
      
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        {/* Avatar Positioned Top Right */}
        <Avatar
          src=""
          sx={{
            position: 'absolute',
            top: '80px',  // Adjust the distance from the top
            right: '50px',  // Adjust the distance from the right
            width: '100px',
            height: '100px',
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '5rem' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Button variant='contained' onClick={handleLogout} sx={{top: 120, left: 410}}>Logout</Button>
          </Box>
        </Box>
        <Typography variant='h4'>{fullName}</Typography>
        <Typography variant='h4'>{role}</Typography>
        <Typography variant='h4'>Change Password</Typography>
        <Typography variant='h4'>Change Security Pin</Typography>
      </Box>
    </Box>
  )
}
