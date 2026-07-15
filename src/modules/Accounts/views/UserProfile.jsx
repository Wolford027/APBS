import React, { useState } from 'react';
import PageLayout from '../../../shared/components/PageLayout';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Snackbar,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '../../../shared/animations';
import { useAuth } from '../../Auth/hooks/AuthContext';
import { useNavigate } from 'react-router-dom';

function SectionCard({ icon, title, description, children }) {
  return (
    <Paper
      component={motion.div}
      variants={staggerItem}
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        border: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.main',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {description}
          </Typography>
        </Box>
      </Box>
      {children}
    </Paper>
  );
}

export default function UsersAccount() {
  const { logout, username: authUsername, role } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(authUsername || 'admin123');
  const [newUsername, setNewUsername] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUsernameChange = () => {
    if (newUsername.trim() !== '') {
      setUsername(newUsername);
      setNewUsername('');
      setToast({ open: true, message: 'Username updated successfully.', severity: 'success' });
    } else {
      setToast({ open: true, message: 'Please enter a valid username.', severity: 'error' });
    }
  };

  const initials = (username || '?').slice(0, 2).toUpperCase();

  return (
    <PageLayout title="Account Settings">
      <Box
        component={motion.div}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        sx={{ maxWidth: 1080, mx: 'auto' }}
      >
        {/* Profile header */}
        <Paper
          component={motion.div}
          variants={staggerItem}
          elevation={0}
          sx={{ border: 1, borderColor: 'divider', overflow: 'hidden', mb: 3 }}
        >
          <Box
            sx={{
              height: 84,
              background: 'linear-gradient(160deg, #0F172A 0%, #1E3A8A 60%, #2563EB 100%)',
            }}
          />
          <Box
            sx={{
              px: 3,
              pb: 3,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              gap: 2,
            }}
          >
            <Avatar
              sx={{
                width: 88,
                height: 88,
                mt: -5.5,
                fontSize: 28,
                fontWeight: 700,
                color: '#fff',
                background: 'linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)',
                border: '4px solid #fff',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 200, pt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="h6">{username}</Typography>
                {role && (
                  <Chip
                    label={role}
                    size="small"
                    sx={{
                      textTransform: 'capitalize',
                      fontWeight: 600,
                      color: 'primary.main',
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    }}
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                Manage your credentials and account security
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Log out
            </Button>
          </Box>
        </Paper>

        {/* Security sections */}
        <Grid container spacing={3} alignItems="stretch">
          <Grid item xs={12} md={4}>
            <SectionCard
              icon={<LockOutlinedIcon />}
              title="Password"
              description="Update the password you use to sign in"
            >
              <TextField label="Current password" type="password" fullWidth sx={{ mb: 2 }} />
              <TextField label="New password" type="password" fullWidth sx={{ mb: 2.5 }} />
              <Button variant="contained" fullWidth sx={{ mt: 'auto' }}>
                Update password
              </Button>
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <SectionCard
              icon={<VpnKeyOutlinedIcon />}
              title="Security PIN"
              description="Used to authorize sensitive payroll actions"
            >
              <TextField label="Current PIN" type="password" fullWidth sx={{ mb: 2 }} />
              <TextField label="New PIN" type="password" fullWidth sx={{ mb: 2.5 }} />
              <Button variant="contained" fullWidth sx={{ mt: 'auto' }}>
                Update PIN
              </Button>
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <SectionCard
              icon={<PersonOutlineIcon />}
              title="Username"
              description="Change the name you sign in with"
            >
              <TextField
                label="New username"
                fullWidth
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                sx={{ mb: 2.5 }}
              />
              <Button variant="contained" fullWidth sx={{ mt: 'auto' }} onClick={handleUsernameChange}>
                Update username
              </Button>
            </SectionCard>
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
}
