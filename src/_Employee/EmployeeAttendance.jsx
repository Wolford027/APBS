import * as React from 'react'
import SideNav from '../Components/SideNav'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import TableAttendance from '../Components/TableAttendance'
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined'
import SearchBar from '../Components/SearchBar'
import Grid from '@mui/joy/Grid';
import { Button, Modal, TextField, Autocomplete } from "@mui/material";


const drawerWidth = 240;

export default function EmployeeAttendance() {
  return (
    <>
    <Box sx={{display: "flex" }}>
    <SideNav/>
    <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Employee Attendance
          </Typography>
         
        </Toolbar>
        <PublishOutlinedIcon color='primary' fontSize='large' style={{cursor: 'pointer', position: 'absolute', top: 550, right: 50}}/>
    </AppBar>
    <Box sx={{ flexGrow: 1, p: 3, mt: 7, ml: -11 }}>
    <Grid container spacing={0} direction="row" sx={{ flexGrow: 1, justifyContent: "space-between",     alignItems: "center", marginBottom:0  }} >
            <Grid size={4} sx={{ marginLeft:-3 }}>
              <SearchBar />
            </Grid>
            <Button type='Submit' color="primary" variant="contained" sx={{ marginRight: 3, }} > Upload Attendance</Button>
          </Grid>
    <TableAttendance/>
    </Box>
    </Box>
    </>
  )
}
