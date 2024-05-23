import React, {useState, useEffect} from 'react'
import SideNav from '../Components/SideNav'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Table from '@mui/joy/Table'
import { Button } from '@mui/material'
import axios from 'axios'


const drawerWidth = 240;

export default function ArchivedEmployee() {

  const [archivedlist, setArchivedlist] = useState([]);
  useEffect(() => {
    getArch();
  }, []);

  function getArch(){
    axios.get('http://localhost/Another1/APBS/api/user/archived/').then(function(response){
      console.log(response.data);
      setArchivedlist(response.data);
    });
  }

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
              Archived Employees
            </Typography>
          </Toolbar>
      </AppBar>

      <Table hoverRow sx={{marginTop:10, marginLeft:-12}} borderAxis='both'>
      <thead>
        <tr>
          <th style={{ width: '10%' }}>Employee Id</th>
          <th style={{ width: '20%' }}>Employee Name</th>
          <th >Employee Position</th>
          <th>Configuration</th>
        </tr>
      </thead>
      <tbody>
        {archivedlist.map((arch, key) =>
        <tr key={key}>
          <td style={{cursor:"pointer"}}>{arch.id}</td>
          <td style={{cursor:"pointer"}}>{arch.empname}</td>
          <td style={{cursor:"pointer"}}>{arch.position}</td>
          <td>
            <Button variant='contained' style={{width: '25%', fontSize: 12, fontWeight: 'bold'}}>Unarchive</Button>
          </td>
        </tr>
        )}
      </tbody>
    </Table>
    </Box>
    </>
  )
}
