import React, { useState } from 'react';
import { Paper, Box, TextField, Grid, Avatar, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/Logo.png';
import axios from 'axios';
import { useAuth } from '../_Auth/AuthContext';

function Login() {
    const { login } = useAuth()
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    function handleSubmit(event) {
        event.preventDefault();
        setError('');
    
        axios.post('http://localhost:8800/login', { username, password })
            .then(res => {
                console.log('Server Response:', res.data);
    
                if (res.data.message === "Log in Successfully") {
                    login(res.data.role);
    
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
            });
    }
    


    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} sm={8} md={6} lg={4}>
                    <Paper 
                        elevation={5} 
                        sx={{ 
                            padding: 3, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '80vh'
                        }}
                    >
                        <Avatar 
                            src={Logo} 
                            sx={{ 
                                width: { xs: '8rem', sm: '10rem', md: '12rem' }, 
                                height: 'auto', 
                                marginBottom: 5 
                            }} 
                        />
                        {error && (
                            <Typography color="error" variant="body2" sx={{ fontSize: 15, fontWeight: '700'}}>
                                {error}
                            </Typography>
                        )}
                        <TextField 
                            fullWidth 
                            id="standard-basic" 
                            label="Username" 
                            variant="standard" 
                            margin="normal"
                            onChange={e => setUsername(e.target.value)}
                        />
                        <TextField 
                            fullWidth 
                            id="standard-basic" 
                            label="Password" 
                            variant="standard" 
                            margin="normal"
                            type="password"
                            onChange={e => setPassword(e.target.value)}
                        />
                        <Button 
                            variant='contained' 
                            sx={{ 
                                width: { xs: '8rem', sm: '10rem', md: '12rem' }, 
                                mt: 5 
                            }}
                            onClick={handleSubmit}
                        >
                            Login
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Login;