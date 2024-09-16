import * as React from "react";
import SideNav from "../Components/SideNav";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Table from "@mui/joy/Table";
import Typography from "@mui/material/Typography";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import SearchBar from "../Components/SearchBar";
import { Button, Modal, TextField, Autocomplete } from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Grid from '@mui/joy/Grid';

const drawerWidth = 240;

export default function EmployeeLeave() {
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
              Employee Leave
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ flexGrow: 1, p: 3, mt: 7, ml: -11 }}>
          {/*

         
          <div className="rowC" >
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{color: "#1976d2" , margin:1, marginTop:2 }}
            >
              Employee Name:
            </Typography>
            <Autocomplete
              sx={{ width: "20%", margin:1  }}
              renderInput={(params) => (
                <TextField {...params} label="Select Employee" />
              )}            />
             <Typography
              variant="h4"
              fontWeight="bold"
              sx={{color: "#1976d2"  , margin:1,marginTop:2}}
            >
              Date range:
            </Typography>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
                   <DatePicker 
                     label="From: 
                     Select Date"
                    // readOnly={true} 
                    // value={value1}
                    // onChange={(newValue) => setValue1(newValue)}
                     sx={{ width: '20%' , margin:1 }}                   />
                   </LocalizationProvider>
          </div>

          <div className="rowC" >
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{color: "#1976d2" , margin:1 , marginTop:2}}
            >
              Leave Type:
            </Typography>
            <Autocomplete
              sx={{ width: "20%", margin:1 , marginLeft: 10.5 }}
              renderInput={(params) => (
                <TextField {...params} label="Select Leave Type" />
              )}
            />

               <LocalizationProvider dateAdapter={AdapterDayjs}>
                   <DatePicker 
                     label="To: Select Date"
                    /// readOnly={true} 
                     //value={value1}
                     //onChange={(newValue) => setValue1(newValue)}
                     sx={{ width: '20%' , margin:1 ,  marginLeft: 25.5}}
                   />
                   </LocalizationProvider>
          </div>
 */}
          <Grid container spacing={0} direction="row" sx={{ flexGrow: 1, justifyContent: "space-between",     alignItems: "center", marginBottom:0  }} >
            <Grid size={4} sx={{ marginLeft:-3 }}>
              <SearchBar />
            </Grid>
            <Grid size={4}>
            <Button type='Submit' color="primary" variant="contained" sx={{ marginRight: 3, }} > Add Employee Leave</Button>
            </Grid>
          </Grid>

          <Grid container spacing={0} direction="row" sx={{ flexGrow: 1, justifyContent: "Flex-start",     alignItems: "center",  }} >
            <Grid size={4} sx={{ marginLeft:-5 }}>
              
            <Autocomplete
               spacing={0}
               sx={{ width: 210,marginBottom:2, marginLeft:5 }}
               size="small"
              renderInput={(params) => (
                <TextField {...params} label="Select Employee ID" />
              )}            />
              
            </Grid>
            <Grid size={4} sx={{ marginLeft:-3 }}>
              
            <Autocomplete
               spacing={0}
               sx={{ width: 250,marginBottom:2, marginLeft:5 }}
               size="small"
              renderInput={(params) => (
                <TextField {...params} label="Select Employee Name" />
              )}            />
              
            </Grid>
            <Grid size={4} sx={{ marginLeft:-3 }}>
              
            <Autocomplete
               spacing={0}
               sx={{ width: 200,marginBottom:2, marginLeft:5 }}
               size="small"
              renderInput={(params) => (
                <TextField {...params} label="Select Leave Type" />
              )}            />
              
            </Grid>
          </Grid>

          <Table hoverRow sx={{ }} borderAxis='both'>
          <thead>
            <tr>
              <th style={{ width: '10%' }}>Employee ID</th>
              <th style={{ width: '30%' }}>Employee Name</th>
              <th style={{ width: '15%' }}>Leave Type</th>
              <th style={{ width: '15%' }}>Earned Leave</th>
              <th style={{ width: '15%' }}>Consumed Leave</th>
              <th style={{ width: '15%' }}>Balance Leave</th>
            </tr>
          </thead>
          <tbody>

          <tr>
            <td style={{ cursor: 'pointer' }} ></td>
            <td style={{ cursor: 'pointer' }} ></td>
            <td style={{ cursor: 'pointer' }} ></td>
            <td style={{ cursor: 'pointer' }} ></td>
            <td style={{ cursor: 'pointer' }} ></td>
            <td style={{ cursor: 'pointer' }} ></td>
          
          
          </tr>

              
        
          </tbody>
        </Table>  
        

        </Box>
      </Box>
    </>
  );
}
