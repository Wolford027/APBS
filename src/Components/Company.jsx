import {React} from 'react'
import {Box, ThemeProvider, Grid, Typography, Avatar } from '@mui/material'

export default function Company(){

  const companyName = "Company Name"


  return(

    <>
    <Box sx={{display: "flex", marginTop:-5, marginLeft:"270px"}}>
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
          width: 1080,
          height: 2,
          borderRadius: 1,
          bgcolor: 'primary.main',
        }}
      />
    </ThemeProvider>
    <Grid container wrap="nowrap" spacing={2} sx={{marginLeft: -135, marginTop: -9, marginBottom: 15}}>
          <Grid item>
            <Avatar src="/broken-image.jpg" sx={{cursor: "pointer"}}/>
          </Grid>
          <Grid item xs zeroMinWidth>
            <Typography noWrap>Welcome, HR!</Typography>
            <Typography noWrap>{companyName}</Typography>
          </Grid>
    </Grid>
    </Box>
    </>
  )
}