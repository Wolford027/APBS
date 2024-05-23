import React, {useState, useEffect} from 'react'
import SideNav from '../Components/SideNav'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Table from '@mui/joy/Table'
import axios from 'axios'
import { Button, Modal, Backdrop, Fade } from '@mui/material'


const drawerWidth = 240;

export default function Payroll() {

  const [openModal, setOpenModal] = useState(false); // State to control modal visibility


  const [payroll, setPayroll] = useState([]);
  useEffect(() => {
    getPayroll();
  }, []);

  function getPayroll(){
    axios.get('http://localhost/Another1/APBS/api/user/payroll/').then(function(response){
      console.log(response.data);
      setPayroll(response.data);
    });
  }

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  // Function to handle closing the modal
  const handleCloseModal = () => {
    setOpenModal(false);
  };


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
            Payroll
          </Typography>
        </Toolbar>
    </AppBar>

    <Table hoverRow sx={{marginTop:10, marginLeft:-12}} borderAxis='both'>
      <thead>
        <tr>
          <th style={{ width: '10%' }}>Payroll No.</th>
          <th style={{ width: '20%' }}>Date</th>
          <th >Year</th>
          <th>Month</th>
          <th>Period</th>
        </tr>
      </thead>
      <tbody>
        {payroll.map((pay, key) =>
        <tr key={key}>
          <td style={{cursor:"pointer"}}>{}</td>
          <td style={{cursor:"pointer"}}>{}</td>
          <td style={{cursor:"pointer"}}>{}</td>
          <td style={{cursor:"pointer"}}>{}</td>
          <td style={{cursor:"pointer"}}>{}</td>
        </tr>
        )}
      </tbody>
    </Table>
    <Button variant='outlined' style={{position: 'absolute',top: 520, right: 50, width: '10%', height: '10%'}} onClick={handleOpenModal}>Generate Payroll</Button>
            {/* Modal */}
    <Modal
      open={openModal}
      onClose={handleCloseModal}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}>
    <div style={{ padding: 20 }}>
      <h2>Generate Payroll Modal</h2>
      <p>You can add your form or content here...</p>
      <Button onClick={handleCloseModal}>Close Modal</Button>
    </div>
</Modal>
    </Box>
    </>
  )
}
