import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Toolbar from '@mui/material/Toolbar'
import List from '@mui/material/List'
import Typography from '@mui/material/Typography'
import { Link, useLocation } from 'react-router-dom'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Logo from '../../assets/Logo.png'
import { Collapse } from '@mui/material'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { motion } from 'motion/react'
import { durations, ease } from '../animations'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PersonIcon from '@mui/icons-material/Person'
import ListIcon from '@mui/icons-material/List'
import CreditScoreIcon from '@mui/icons-material/CreditScore'
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar'
import ReceiptIcon from '@mui/icons-material/Receipt'
import ArchiveIcon from '@mui/icons-material/Archive'
import EventNoteIcon from '@mui/icons-material/EventNote'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import GroupIcon from '@mui/icons-material/Group'
import TuneIcon from '@mui/icons-material/Tune'
import HistoryIcon from '@mui/icons-material/History'
import AssessmentIcon from '@mui/icons-material/Assessment'
import PersonSearchIcon from '@mui/icons-material/PersonSearch'
import SummarizeIcon from '@mui/icons-material/Summarize'
import BackupIcon from '@mui/icons-material/Backup'
import ContactlessIcon from '@mui/icons-material/Contactless'
import AppRegistrationIcon from '@mui/icons-material/AppRegistration'

export const drawerWidth = 250;

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { text: 'Dashboard', icon: <DashboardIcon />, to: '/dashboard' },
      {
        text: 'Employee',
        icon: <PersonIcon />,
        children: [
          { text: 'Employee List', icon: <ListIcon />, to: '/employee-list' },
          { text: 'Employee Leave', icon: <EventNoteIcon />, to: '/employee-leave' },
          { text: 'Archived Employee', icon: <ArchiveIcon />, to: '/archived-employee' },
          { text: 'Employee Attendance', icon: <PermContactCalendarIcon />, to: '/employee-attendance' },
        ],
      },
      {
        text: 'Payroll',
        icon: <ReceiptIcon />,
        children: [
          { text: 'Payroll', icon: <ListIcon />, to: '/payroll' },
          { text: 'Earnings/Deductions', icon: <CreditScoreIcon />, to: '/earings' },
          { text: 'Loans', icon: <AccountBalanceIcon />, to: '/loans' },
          { text: 'Payslip', icon: <ReceiptIcon />, to: '/payslip' },
        ],
      },
    ],
  },
  {
    label: 'Administration',
    items: [
      {
        text: 'Account',
        icon: <ManageAccountsIcon />,
        children: [
          { text: 'User Profile', icon: <AccountCircleIcon />, to: '/user-profile' },
          { text: 'Manage Account', icon: <GroupIcon />, to: '/manage-account' },
        ],
      },
      { text: 'System Variable', icon: <TuneIcon />, to: '/system-variable' },
      { text: 'Audit Trail', icon: <HistoryIcon />, to: '/audit-trail' },
      { text: 'Back up and Restore', icon: <BackupIcon />, to: '/backup-restore' },
    ],
  },
  {
    label: 'Reports',
    items: [
      {
        text: 'Reports',
        icon: <AssessmentIcon />,
        children: [
          { text: 'Employee Report', icon: <PersonSearchIcon />, to: '/employee-report' },
          { text: 'Payroll Report', icon: <SummarizeIcon />, to: '/payroll-report' },
        ],
      },
    ],
  },
  {
    label: 'RFID',
    items: [
      { text: 'RFID Attendance Panel', icon: <ContactlessIcon />, to: '/scan-rfid' },
      { text: 'Register RFID', icon: <AppRegistrationIcon />, to: '/register-rfid' },
    ],
  },
];

function NavLeaf({ item, nested }) {
  const location = useLocation();
  return (
    <ListItem disablePadding>
      <ListItemButton
        component={Link}
        to={item.to}
        selected={location.pathname === item.to}
        sx={nested ? { pl: 3.5 } : undefined}
      >
        <ListItemIcon>{item.icon}</ListItemIcon>
        <ListItemText
          primary={item.text}
          primaryTypographyProps={{ fontSize: 14, fontWeight: 500, noWrap: true }}
        />
      </ListItemButton>
    </ListItem>
  );
}

function NavGroup({ item }) {
  const location = useLocation();
  const hasActiveChild = item.children.some((child) => child.to === location.pathname);
  const [open, setOpen] = useState(hasActiveChild);

  return (
    <>
      <ListItem disablePadding>
        <ListItemButton onClick={() => setOpen(!open)}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText
            primary={item.text}
            primaryTypographyProps={{ fontSize: 14, fontWeight: 500, noWrap: true }}
          />
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: durations.micro, ease }}
            style={{ display: 'inline-flex' }}
          >
            <ExpandMore fontSize="small" />
          </motion.span>
        </ListItemButton>
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {item.children.map((child) => (
          <NavLeaf key={child.text} item={child} nested />
        ))}
      </Collapse>
    </>
  );
}

export function NavDrawer() {
  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'divider',
            borderRadius: '3px',
          },
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', px: 2, py: 2.5 }}>
        <Box component="img" alt="APBS — AttendeePay Business Suite" src={Logo} sx={{ width: '78%' }} />
      </Box>
      {NAV_SECTIONS.map((section) => (
        <React.Fragment key={section.label}>
          <Typography
            variant="overline"
            sx={{
              px: 2.5,
              pt: 1.5,
              display: 'block',
              color: 'text.secondary',
              fontWeight: 600,
              letterSpacing: '0.08em',
              fontSize: 11,
            }}
          >
            {section.label}
          </Typography>
          <List dense disablePadding sx={{ pb: 0.5 }}>
            {section.items.map((item) =>
              item.children
                ? <NavGroup key={item.text} item={item} />
                : <NavLeaf key={item.text} item={item} />
            )}
          </List>
        </React.Fragment>
      ))}
      <Box sx={{ flexGrow: 1 }} />
      <Typography variant="caption" sx={{ px: 2.5, py: 2, color: 'text.secondary' }}>
        APBS — AttendeePay Business Suite
      </Typography>
    </Drawer>
  );
}

export default function SideNav() {
  return (
    <Box sx={{ display: 'flex' }}>
      <NavDrawer />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
      </Box>
    </Box>
  );
}
