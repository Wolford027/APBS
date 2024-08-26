import React, { useState } from 'react';
import { Paper, Box, TextField, Grid, Avatar, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/Logo.png';
import axios from 'axios';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    function handleSubmit(event) {
        event.preventDefault();
        axios.post('http://localhost:8800/login', { username, password })
            .then(res => {
                console.log(res);
                navigate('/loading');
            })
            .catch(err => console.log(err));
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
                                marginBottom: 10 
                            }} 
                        />
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