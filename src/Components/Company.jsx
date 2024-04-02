import {React, useState} from 'react'
import {Box, ThemeProvider, Grid, Typography, Avatar } from '@mui/material'
import SideNav from '../Components/SideNav'
import Profile from '../Components/Profle'

export default function Dashboard(){

  const companyName = "Company Name"
  const [showProfile, setShowProfile] = useState(false);

  const handleAvatarClick = () => {
    setShowProfile(true);
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
  };



  return(

    <>
    <Box sx={{display: "flex", marginTop:10, marginLeft:-10}}>
      <SideNav/>
      <ThemeProvider
      theme={{
        palette: {
          primary: {
            main: '#007FFF',
            dark: '#0066CC',
          },
        },
      }}
    >
      <Box
        sx={{
          width: 1450,
          height: 2,
          borderRadius: 1,
          bgcolor: 'primary.main',
        }}
      />
    </ThemeProvider>
    <Grid container wrap="nowrap" spacing={2} sx={{marginLeft: -135, marginTop: -9, marginBottom: 15}}>
          <Grid item>
            <Avatar src="/broken-image.jpg" sx={{cursor: "pointer"}} onClick={handleAvatarClick}/>
          </Grid>
          <Grid item xs zeroMinWidth>
            <Typography noWrap>Welcome, HR!</Typography>
            <Typography noWrap>{companyName}</Typography>
          </Grid>
    </Grid>
    </Box>
    {showProfile && <Profile onClose={handleCloseProfile} />}
    </>
  )
}