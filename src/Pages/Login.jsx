import { Avatar, Button, Grid, Paper, TextField } from '@mui/material';
import Logo from '../assets/B.png';
import * as React from 'react';

export default function Login() {
  const paperStyle = {
    padding: 20,
    height: '80vh',
    width: 320,
    margin: '0 auto',
    marginTop: '50px',
    marginLeft: '960px',
  };
  const textStyle = { margin: '10px 0' };
  const loginStyle = { borderRadius: 5, marginTop: 20 };
  const headerStyle = { margin: 0 };

  return (
    <div>
      <Grid container justifyContent="center">
        <Paper elevation={10} style={paperStyle}>
          <Grid align="center">
            <Avatar alt="Logo" src={Logo} sx={{ width: 120, height: 120 }} />
            <h2 style={headerStyle}>Login</h2>
          </Grid>
          <TextField label="Username" placeholder="Enter Username" style={textStyle} fullWidth />
          <TextField label="Password" placeholder="Enter Password" type="password" style={textStyle} fullWidth />
          <Button type="submit" color="primary" variant="contained" style={loginStyle} href="dashboard" fullWidth>
            Login button
          </Button>
        </Paper>
      </Grid>
    </div>
  );
}
