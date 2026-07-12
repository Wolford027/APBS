import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { durations, ease, fadeInUp } from '../../../shared/animations';
import Logo from '../../../assets/Logo.png';
import axios from 'axios';
import { useAuth } from '../hooks/AuthContext';

function Login() {
    const { login, logout } = useAuth()
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        logout()
    },[logout])

    function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setSubmitting(true);

        let today = new Date();
        let formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

        axios.post('http://localhost:8800/login', { user, password })
            .then(res => {
                if (res.data.message === "Log in Successfully") {
                    login(res.data.role, user);

                    // Log the login event
                    const loginEvent = {
                        emp_id: res.data.emp_id,
                        date: formattedDate,
                        role: res.data.role,
                        action: `The user ${user} logged in`,
                    };

                    // Send the login event to the database
                    axios.post('http://localhost:8800/login-history', loginEvent)
                    .catch(error => {
                        console.error('Error sending login history to database:', error);
                    });

                    // Navigate based on the user's role
                    if (res.data.role === 'admin') {
                        navigate('/loading');
                    } else if (res.data.role === 'user') {
                        navigate('/dashboard');
                    } else {
                        navigate('/loading');
                    }
                } else {
                    setError('Wrong Password or Username.');
                }
            })
            .catch(err => {
                console.error('Login Error:', err);
                setError('An error occurred. Please try again.');
            })
            .finally(() => {
                setSubmitting(false);
            });
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Brand panel */}
            <Box
                sx={{
                    flex: 1,
                    display: { xs: 'none', md: 'flex' },
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: 6,
                    color: '#fff',
                    background: 'linear-gradient(160deg, #0F172A 0%, #1E3A8A 60%, #2563EB 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        width: 420,
                        height: 420,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(14,165,233,0.3) 0%, transparent 70%)',
                        bottom: -140,
                        left: -100,
                        pointerEvents: 'none',
                    }}
                />
                <Link
                    component={RouterLink}
                    to="/"
                    underline="none"
                    sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, color: 'rgba(255,255,255,0.8)', fontSize: 14, '&:hover': { color: '#fff' } }}
                >
                    <ArrowBackIcon fontSize="small" /> Back to home
                </Link>
                <Box
                    component={motion.div}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    sx={{ position: 'relative' }}
                >
                    <Typography variant="h3" sx={{ fontSize: { md: 34, lg: 42 }, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                        Run payroll with
                        <Box component="span" sx={{ color: '#7DD3FC' }}> confidence.</Box>
                    </Typography>
                    <Typography sx={{ mt: 2, maxWidth: 420, color: 'rgba(255,255,255,0.72)', lineHeight: 1.8 }}>
                        RFID attendance, leave tracking, and automated payroll computation —
                        everything your HR team needs in one workspace.
                    </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)' }}>
                    © {new Date().getFullYear()} APBS — AttendeePay Business Suite
                </Typography>
            </Box>

            {/* Form panel */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: { xs: 2, sm: 4 },
                    bgcolor: 'background.default',
                }}
            >
                <Paper
                    component={motion.form}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    onSubmit={handleSubmit}
                    elevation={0}
                    sx={{
                        width: '100%',
                        maxWidth: 420,
                        p: { xs: 3, sm: 5 },
                        border: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Box component="img" src={Logo} alt="APBS — AttendeePay Business Suite" sx={{ height: 56, display: 'block', mx: 'auto' }} />
                    <Typography variant="h5" sx={{ mt: 3, textAlign: 'center' }}>
                        Welcome back
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3, textAlign: 'center' }}>
                        Sign in to your APBS workspace
                    </Typography>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                key="login-error"
                                initial={{ opacity: 0, height: 0, y: -8 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: durations.standard, ease }}
                                style={{ overflow: 'hidden' }}
                            >
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <TextField
                        fullWidth
                        label="Username"
                        margin="normal"
                        size="medium"
                        autoComplete="username"
                        autoFocus
                        value={user}
                        onChange={e => setUser(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        margin="normal"
                        size="medium"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <Link component={RouterLink} to="/forgot-password" variant="body2" underline="hover">
                            Forgot password?
                        </Link>
                    </Box>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={submitting}
                        sx={{ mt: 3, py: 1.3 }}
                    >
                        {submitting ? 'Signing in…' : 'Sign in'}
                    </Button>
                </Paper>
            </Box>
        </Box>
    );
}

export default Login;
