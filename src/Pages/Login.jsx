import { Avatar, Button, Grid, Paper, TextField } from '@mui/material';
import Logo from '../assets/B.png';
import * as React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

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

  const navigate = useNavigate(); // Initialize useNavigate hook
  const [inputs, setInputs] = React.useState({});
  const [error, setError] = React.useState(null);

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs(values => ({...values, [name]: value}));
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    axios.post('http://localhost/api/user/save', inputs).then(function(response){
      console.log(response.data);
      // If login is successful, navigate to the dashboard
      if (response.data.status === 1) {
        navigate('/dashboard');
      } else {
        // Handle login error
        setError(response.data.message);
      }
    }).catch(error => {
      console.error('Error during login:', error);
      setError('An error occurred during login.');
    });
  }

  return (
    <div>
      <Grid container justifyContent="center">
        <Paper elevation={10} style={paperStyle}>
          <Grid align="center">
            <Avatar alt="Logo" src={Logo} sx={{ width: 120, height: 120 }} />
            <h2 style={headerStyle}>Login</h2>
          </Grid>
          <form onSubmit={handleSubmit}>
            {error && <div style={{ color: 'red', fontSize: '14px', transition: 'opacity 0.3s ease-in' }}>{error}</div>}
            <TextField label="Username" placeholder="Enter Username" name='username' style={textStyle} fullWidth onChange={handleChange} />
            <TextField label="Password" placeholder="Enter Password" name='password' type="password" style={textStyle} fullWidth onChange={handleChange} />
            <Button type='submit' color="primary" variant="contained" style={loginStyle}  fullWidth>
              Login
            </Button>
          </form>
        </Paper>
      </Grid>
    </div>
  );
}
