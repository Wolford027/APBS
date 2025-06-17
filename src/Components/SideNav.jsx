import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Toolbar from '@mui/material/Toolbar'
import List from '@mui/material/List'
import {Link} from 'react-router-dom'
import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Logo from '../assets/Logo.png'
import { Collapse } from '@mui/material'
import ExpandMore from '@mui/icons-material/ExpandMore'
import ExpandLess from '@mui/icons-material/ExpandLess'
import PersonIcon from '@mui/icons-material/Person'
import ListIcon from '@mui/icons-material/List'
import CreditScoreIcon from '@mui/icons-material/CreditScore'
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar'
import ReceiptIcon from '@mui/icons-material/Receipt'
import DashboardIcon from '@mui/icons-material/Dashboard'

const drawerWidth = 240;

export default function SideNav() {
  const LogoStyle = {
    width: '75%',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: '-30px',
    marginTop: '30px',
  };

  const [isEmployeeCollapse, setIsEmployeeCollapse] = useState(false);
  const [isReportCollapse, setIsReportCollapse] = useState(false);
  const [isPayrollCollapse, setIsPayrollCollapse] = useState(false);
  const [isAccountCollapse, setIsAccountCollapse] = useState(false);

  const handleEmployeeCollapse = () => {
    setIsEmployeeCollapse(!isEmployeeCollapse);
  };

  const handleReportCollapse = () => {
    setIsReportCollapse(!isReportCollapse);
  };

  const handlePayrollCollapse = () => {
    setIsPayrollCollapse(!isPayrollCollapse);
  };

  const handleAccountCollapse = () => {
    setIsAccountCollapse(!isAccountCollapse);
  };


  return (
    <Box sx={{ display: 'flex' }}>
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
        <List>
        <ListItem disablePadding >
            <ListItemButton to="/dashboard" sx={{ '&:hover': { backgroundColor: '#ADD8E6' } }}>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding onClick={handleEmployeeCollapse}>
            <ListItemButton sx={{ '&:hover': { backgroundColor: '#ADD8E6' } }}>
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
              { text: 'Employee Leave', icon: <CreditScoreIcon />, to: '/employee-leave' },
              { text: 'Archived Employee', icon: <CreditScoreIcon />, to: '/archived-employee' },
              { text: 'Employee Attendance', icon: <PermContactCalendarIcon />, to: '/employee-attendance' }
            ].map((item, index) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={Link} to={item.to} sx={{ '&:hover': { backgroundColor: '#ADD8E6' } }}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </Collapse>
          <ListItem disablePadding onClick={handlePayrollCollapse}>
            <ListItemButton sx={{ '&:hover': { backgroundColor: '#ADD8E6' } }}>
              <ListItemIcon>
                <ReceiptIcon />
              </ListItemIcon>
              <ListItemText primary="Payroll" />
              {isPayrollCollapse ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={isPayrollCollapse} timeout="auto" unmountOnExit>
            {[
              { text: 'Payroll', icon: <ListIcon />, to: '/payroll' },
              { text: 'Earnings/Deductions', icon: <CreditScoreIcon />, to: '/earings' },
              { text: 'Loans', icon: <CreditScoreIcon />, to: '/loans' },
              { text: 'Payslip', icon: <CreditScoreIcon />, to: '/payslip' },
            ].map((item, index) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={Link} to={item.to} sx={{ '&:hover': { backgroundColor: '#ADD8E6' } }}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </Collapse>
        </List>
        <Divider/>
        <List>
        <ListItem disablePadding onClick={handleAccountCollapse}>
            <ListItemButton sx={{ '&:hover': { backgroundColor: '#ADD8E6' } }}>
              <ListItemIcon>
                <ReceiptIcon />
              </ListItemIcon>
              <ListItemText primary="Account" />
              {isAccountCollapse ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={isAccountCollapse} timeout="auto" unmountOnExit>
            {[
              { text: 'User Profile', icon: <ListIcon />, to: '/user-profile' },
              { text: 'Manage Account', icon: <CreditScoreIcon />, to: '/manage-account' }
            ].map((item, index) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={Link} to={item.to} sx={{ '&:hover': { backgroundColor: '#ADD8E6' } }}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </Collapse>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/system-variable" sx={{ '&:hover': { backgroundColor: '#ADD8E6' } }}>
              <ListItemIcon>
                <ReceiptIcon />
              </ListItemIcon>
              <ListItemText primary="System Variable" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/audit-trail" sx={{ '&:hover': { backgroundColor: '#ADD8E6' } }}>
              <ListItemIcon>
                <ReceiptIcon />
              </ListItemIcon>
              <ListItemText primary="Audit Trail" />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider/>
        <List>
        <ListItem disablePadding onClick={handleReportCollapse}>
            <ListItemButton sx={{ '&:hover': { backgroundColor: '#ADD8E6' } }}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Reports" />
              {isReportCollapse ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={isReportCollapse} timeout="auto" unmountOnExit>
            {[
              { text: 'Employee Report', icon: <ListIcon />, to: '/employee-report' },
              { text: 'Payroll Report', icon: <PermContactCalendarIcon />, to: '/payroll-report' }
            ].map((item, index) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={Link} to={item.to} sx={{ '&:hover': { backgroundColor: '#ADD8E6' } }}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </Collapse>
          </List>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/backup-restore" sx={{ '&:hover': { backgroundColor: '#ADD8E6' } }}>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Back up and Restore" />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/scan-rfid" sx={{ '&:hover': { backgroundColor: '#ADD8E6' } }}>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="RFID Attendance Panel" />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/register-rfid" sx={{ '&:hover': { backgroundColor: '#ADD8E6' } }}>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Register Rfid" />
              </ListItemButton>
            </ListItem>
          </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
      </Box>
    </Box>
  );
}