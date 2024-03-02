import { Avatar, Button, Grid,Paper, TextField } from '@mui/material'
import Logo from '../assets/B.png'
import * as React from 'react'

export default function Login() {

    const paperStyle={padding:20, height:'70vh', width:280,  margin:"60px auto"}
    const textStyle={margin:"10px 0 0 30px"}
    const loginStytle={borderRadius:5, margin:"10px 0 0 100px"}
    const gridStyle={margin:30}
    const headerStyle={margin:-10}


  return (
    <div>
      <Grid>
        <Paper elevation={10} style={paperStyle}>
            <Grid align='center' style={gridStyle}>
            <Avatar alt='Logo'
            src={Logo}
            sx={{width:120, height:120}}></Avatar>
            <h2 style={headerStyle}>Login</h2>
            </Grid>
            <TextField label='Username' placeholder='Enter Username' style={textStyle}/>
            <TextField label='Password' placeholder='Enter Password' type='password' style={textStyle}/>
            <Button type='submit' color='primary' variant='contained' style={loginStytle} href='dashboard'>Login</Button>
        </Paper>
      </Grid>
    </div>
  )
}
