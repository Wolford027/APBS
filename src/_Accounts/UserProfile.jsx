import React, { useState } from 'react';
import SideNav from '../Components/SideNav';
import {
  AppBar,
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Toolbar,
  Typography,
  Avatar,
} from '@mui/material';
import { useAuth } from '../_Auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

export default function UsersAccount() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin123');
  const [newUsername, setNewUsername] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleUsernameChange = () => {
    if (newUsername.trim() !== '') {
      setUsername(newUsername);
      setNewUsername('');
      alert('Username updated successfully!');
    } else {
      alert('Please enter a valid username.');
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Users Settings
          </Typography>
        </Toolbar>
      </AppBar>
      <SideNav />
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* User Info Section */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            borderRadius: 0,
            mb: 3,
            boxSizing: 'border-box',
            justifyContent: 'space-between',
            marginTop: 10,
            marginLeft: -5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src=""
              alt="Profile Picture"
              sx={{
                width: '5rem',
                height: '5rem',
              }}
            />
            <Box>
              <Typography variant="h6">Jane Jack Matthew</Typography>
              <Typography variant="body2">{username}</Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
            sx={{ alignSelf: 'flex-end' }}
          >
            Logout
          </Button>
        </Paper>
        {/* Grid Layout for Account Sections */}
        <Grid container spacing={2} justifyContent="center">
          {/* Change Password Section */}
          <Grid item xs={12} md={5}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                🔒 Change Password
              </Typography>
              <TextField
                label="Current Password"
                type="password"
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="New Password"
                type="password"
                fullWidth
                sx={{ mb: 2 }}
              />
              <Button variant="contained" fullWidth>
                Update Password
              </Button>
            </Paper>
          </Grid>
          {/* Security PIN Section */}
          <Grid item xs={12} md={5}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                🔑 Security PIN
              </Typography>
              <TextField
                label="Current PIN"
                type="password"
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="New PIN"
                type="password"
                fullWidth
                sx={{ mb: 2 }}
              />
              <Button variant="contained" fullWidth>
                Update PIN
              </Button>
            </Paper>
          </Grid>
          {/* Change Username Section */}
          <Grid item xs={12} md={5}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                👤 Change Username
              </Typography>
              <TextField
                label="New Username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                fullWidth
                onClick={handleUsernameChange}
              >
                Update Username
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
