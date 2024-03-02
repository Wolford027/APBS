import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import Logo from '../assets/Logo.png';
import { Collapse } from '@mui/material';
import HeaderBar from './HeaderBar';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';

const drawerWidth = 240;

export default function PermanentDrawerLeft() {
  const LogoStyle = {
    width: '75%',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: '-30px',
    marginTop: '30px',
  };

  const [isEmployeeCollapse, setIsEmployeeCollapse] = React.useState(false);

  const handleEmployeeCollapse = () => {
    setIsEmployeeCollapse(!isEmployeeCollapse);
  };


  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <>
        <HeaderBar />
      </>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            overflow: 'hidden'
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <img alt="Logo" src={Logo} style={LogoStyle}></img>
        <Toolbar />
        <Divider />
        <List>
          <ListItem disablePadding onClick={handleEmployeeCollapse}>
            <ListItemButton>
              <ListItemIcon>
                <MailIcon />
              </ListItemIcon>
              <ListItemText primary="Employee" />
              {isEmployeeCollapse ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={isEmployeeCollapse} timeout="auto" unmountOnExit>
            {['Employee List', 'Employee Loan', 'Employee Attendance'].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton>
                  <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </Collapse>
          <ListItem disablePadding >
            <ListItemButton>
              <ListItemIcon>
                <MailIcon />
              </ListItemIcon>
              <ListItemText primary="Payroll" />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider/>
        <List>
          <ListItem disablePadding >
            <ListItemButton>
              <ListItemIcon>
                <MailIcon />
              </ListItemIcon>
              <ListItemText primary="Create Account" />
            </ListItemButton>
          </ListItem>
            {['Employee List', 'Empployee Loan', 'Attendance'].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton>
                  <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
        <Toolbar />
      </Box>
    </Box>
  );
}
