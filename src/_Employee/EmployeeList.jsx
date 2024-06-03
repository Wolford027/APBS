import { useEffect, useState } from 'react'
import SideNav from '../Components/SideNav'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { Button, Modal } from '@mui/material'
import axios from 'axios'
import Table from '@mui/joy/Table'
import AddCircleIcon from '@mui/icons-material/AddCircle';

const drawerWidth = 240;

export default function EmployeeList() {
  const [openModal, setOpenModal] = useState(false);
  const [emplist, setEmplist] = useState([]);

  useEffect(() => {
    getEmp();
  }, []);

  function getEmp() {
    axios.get('http://localhost/Another1/APBS/api/emplist/').then(function (response) {
      console.log(response.data);
      setEmplist(response.data);
    });
  }

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleArchive = (id, is_archived) => {
    axios.put('http://localhost/Another1/APBS/api/emplist/', { id: id, is_archived: is_archived })
      .then(response => {
        console.log(response.data);
        if (response.data.status === 1) {
          getEmp(); // Refresh the employee list after updating status
        } else {
          alert('Failed to update employee status');
        }
      })
      .catch(error => {
        console.error('There was an error updating the employee status!', error);
      });
  };

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <SideNav />
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              Employee List
            </Typography>
          </Toolbar>
          <AddCircleIcon color='primary' fontSize='large' style={{cursor: 'pointer', position: 'absolute', top: 550, right: 50}} onClick={handleOpenModal} />
        </AppBar>

        <Table hoverRow sx={{ marginTop: 10, marginLeft: -12 }} borderAxis='both'>
          <thead>
            <tr>
              <th style={{ width: '10%' }}>Employee Id</th>
              <th>Employee Name</th>
              <th>Employee Position</th>
              <th>Configuration</th>
            </tr>
          </thead>
          <tbody>
            {emplist.map((emp, key) =>
              <tr key={key}>
                <td style={{ cursor: 'pointer' }} onClick={handleOpenModal}>{emp.id}</td>
                <td style={{ cursor: 'pointer' }} onClick={handleOpenModal}>{emp.empName}</td>
                <td style={{ cursor: 'pointer' }} onClick={handleOpenModal}>{emp.position}</td>
                <td>
                  <Button variant='contained' style={{ marginRight: 5, width: '25%', fontSize: 12, fontWeight: 'bold' }} onClick={handleOpenModal}>Edit</Button>
                  <Button
                    variant='contained'
                    style={{ width: '25%', fontSize: 12, fontWeight: 'bold' }}
                    onClick={() => handleArchive(emp.id, 1)}
                  >
                    Archive
                  </Button>
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        <Modal
          open={openModal}
          onClose={handleCloseModal}
          closeAfterTransition
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              p: 2,
            }}
          >
            <Box
              sx={{
                backgroundColor: 'white',
                padding: 4,
                width: { xs: '80%', sm: '60%', md: '50%' },
                boxShadow: 24,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6" component="h2" sx={{ marginBottom: 2 }}>
                Generate Payroll Modal
              </Typography>
              <Box sx={{ marginTop: 2 }}>
                <Button
                  variant="outlined"
                  sx={{ marginRight: 2 }}
                  onClick={handleCloseModal}
                >
                  Generate Payroll
                </Button>
                <Button variant="outlined" onClick={handleCloseModal}>
                  Close Modal
                </Button>
              </Box>
            </Box>
          </Box>
        </Modal>
      </Box>
    </>
  );
}
