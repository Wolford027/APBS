import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import {Link} from 'react-router-dom';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Logo from '../assets/Logo.png';
import { Collapse } from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import PersonIcon from '@mui/icons-material/Person';
import ListIcon from '@mui/icons-material/List';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DashboardIcon from '@mui/icons-material/Dashboard';

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
  const [isReportCollapse, setIsReportCollapse] = React.useState(false);

  const handleEmployeeCollapse = () => {
    setIsEmployeeCollapse(!isEmployeeCollapse);
  };

  const handleReportCollapse = () => {
    setIsReportCollapse(!isReportCollapse);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            overflowY: 'scroll',
            scrollbarColor: 'transparent transparent',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '6px',
              height: '6px',
            },
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <img alt="Logo" src={Logo} style={LogoStyle}></img>
        <Toolbar />
        <Divider />
        <List>
        <ListItem disablePadding >
            <ListItemButton to="/dashboard">
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding onClick={handleEmployeeCollapse}>
            <ListItemButton>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Employee" />
              {isEmployeeCollapse ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={isEmployeeCollapse} timeout="auto" unmountOnExit>
            {[
              { text: 'Employee List', icon: <ListIcon />, to: '/employee-list' },
              { text: 'Employee Loan', icon: <CreditScoreIcon /> },
              { text: 'Employee Attendance', icon: <PermContactCalendarIcon /> }
            ].map((item, index) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={Link} to={item.to}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </Collapse>
          <ListItem disablePadding >
            <ListItemButton>
              <ListItemIcon>
                <ReceiptIcon />
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
                <PersonAddIcon />
              </ListItemIcon>
              <ListItemText primary="Create Account" />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider/>
        <List>
        <ListItem disablePadding onClick={handleReportCollapse}>
            <ListItemButton>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Report" />
              {isReportCollapse ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={isReportCollapse} timeout="auto" unmountOnExit>
            {[
              { text: 'Payroll Reports', icon: <ListIcon /> },
              { text: 'Payslip Report', icon: <CreditScoreIcon /> },
              { text: 'Employee Report', icon: <PermContactCalendarIcon /> }
            ].map((item, index) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </Collapse>
          </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
      </Box>
    </Box>
  );
}
