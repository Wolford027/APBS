import * as React from 'react'
import SideNav from '../Components/SideNav'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import TableAttendance from '../Components/TableAttendance'
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined'
import SearchBar from '../Components/SearchBar'


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
          <SearchBar />
        </Toolbar>
        <PublishOutlinedIcon color='primary' fontSize='large' style={{cursor: 'pointer', position: 'absolute', top: 550, right: 50}}/>
    </AppBar>
    <TableAttendance/>
    </Box>
    </>
  )
}
