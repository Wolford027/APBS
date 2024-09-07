import React, { useState } from 'react';
import { Paper, Box, TextField, Grid, Button, Typography, Link } from '@mui/material';
import axios from 'axios';

function ForgotPass() {
  const [username, setUsername] = useState('');
  const [securityAnswers, setSecurityAnswers] = useState(['', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const securityQuestions = [
    "What is your mother's maiden name?",
    "What was the name of your first pet?",
    "What was the name of your elementary school?"
  ];

  const handleCheckUsername = () => {
    axios.get(`http://localhost:8800/username`, { params: { username } })
    .then(res => {
      console.log('Server Response:', res.data)
      if (res.data.usernameExists) {
        setStep(2);
        setError('')
      } else {
        setError('Username does not exist.');
      }
    })
    .catch(err => {
      console.error(err);
      setError('Error checking username.');
    });
  };

  const handleCheckSecurityAnswers = () => {
    // Logic to check if the security answers match
    const correctAnswers = ['Smith', 'Buddy', 'Lincoln']; // Simulate stored answers for the user
    if (securityAnswers.some(answer => !answer)) {
      setError('Please answer all security questions.');
      return;
    }

    const answersMatch = securityAnswers.every((answer, index) => answer === correctAnswers[index]);

    if (!answersMatch) {
      setError('Your answers do not match our records.');
      return;
    }

    setError('');
    setStep(3);
  };

  const handleResetPassword = () => {
    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }
    setError('');
    console.log('Password reset successfully');
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={8} md={6} lg={4}>
          <Paper 
            elevation={5} 
            sx={{ 
              padding: 5, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              alignItems: 'center',
              height: '80vh'
            }}
          >
            {error && (
              <Typography color="error" variant="body2" sx={{ fontSize: 15, fontWeight: '700'}}>
                {error}
              </Typography>
            )}
            {step === 1 && (
              <>
                <TextField 
                  fullWidth 
                  label="Username" 
                  variant="standard" 
                  margin="normal"
                  onChange={e => setUsername(e.target.value)}
                />
                <Button 
                  variant='contained' 
                  sx={{ width: { xs: '8rem', sm: '10rem', md: '12rem' }, mt: 5 }}
                  onClick={handleCheckUsername}
                >
                  Next
                </Button>
              </>
            )}
            {step === 2 && (
              <>
                {securityQuestions.map((question, index) => (
                  <TextField 
                    key={index}
                    fullWidth 
                    label={question} 
                    variant="standard" 
                    margin="normal"
                    onChange={e => {
                      const answers = [...securityAnswers];
                      answers[index] = e.target.value;
                      setSecurityAnswers(answers);
                    }}
                  />
                ))}
                <Button 
                  variant='contained' 
                  sx={{ width: { xs: '8rem', sm: '10rem', md: '12rem' }, mt: 5 }}
                  onClick={handleCheckSecurityAnswers}
                >
                  Next
                </Button>
              </>
            )}
            {step === 3 && (
              <>
                <TextField 
                  fullWidth 
                  label="New Password" 
                  variant="standard" 
                  margin="normal"
                  type="password"
                  onChange={e => setNewPassword(e.target.value)}
                />
                <Button 
                  variant='contained' 
                  sx={{ width: { xs: '8rem', sm: '10rem', md: '12rem' }, mt: 5 }}
                  onClick={handleResetPassword}
                >
                  Reset Password
                </Button>
              </>
            )}
            {step === 1 && (
              <Link href='/' sx={{ marginTop: 2 }}>Back to Login</Link>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ForgotPass;