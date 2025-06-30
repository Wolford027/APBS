import React, { useState, useEffect } from "react"
import SideNav from "../Components/SideNav"
import Leaves from "../Components/Leaves"
import AttendanceDepartment from "../Components/AttendanceDepartment"
import Calendar from "../Components/Calendar"
import MiniStatisticsA from "../Components/MiniStatisticsA"
import MiniStatisticsI from "../Components/MiniStatisticsI"
import MiniStatisticsT from "../Components/MiniStatisticsT"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../_Auth/AuthContext"
import { Box, Grid, AppBar, Toolbar, Typography, Badge, IconButton } from "@mui/material"
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import ViewNotificationModal from "../_Modals/ViewNotificationModal"
import axios from "axios"
import countries from "../_Countries/countries.json"

export default function Dashboard() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [anchorEl, setAnchorEl] = useState(null)
  const [events, setEvents] = useState([])
  const [notifications, setNotifications] = useState([])

  const handleOpenNotification = (event) => {
    setAnchorEl(event.currentTarget) // Set anchor for dropdown
  }

  console.log(countries);
  
  const handleCloseNotification = () => {
    setAnchorEl(null)
  }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const drawerWidth = 240;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('http://localhost:8800/event');
        setEvents(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const checkTerminationDates = () => {
      const today = new Date();
      const notifications = events.filter((event) => {
        const terminationDate = new Date(event.dateofend);
        const differenceInDays = Math.abs(today - terminationDate) / (1000 * 3600 * 24);
        return differenceInDays <= 14;
      });
      setNotifications(notifications);
    };
    checkTerminationDates();
  }, [events]);

  return (
    <Box>
      <AppBar
        position="fixed"
        sx={{ 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">Dashboard</Typography>
          <IconButton sx={{position: 'absolute', marginLeft: 'auto', right: 10}} onClick={handleOpenNotification}>
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsNoneIcon sx={{ cursor: 'pointer' }} />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>
      <SideNav />
      <Box marginLeft={30} >
      <Grid container sx={{ padding: '20px', marginTop: -10 }}>
        <Grid container spacing={2} sx={{ padding: '20px' }}>
          <Grid item xs={12} sm={6} md={4} sx={{ flexBasis: '60%', transform: 'scale(0.75)' }}>
            <MiniStatisticsA />
          </Grid>
          <Grid item xs={12} sm={6} md={4} sx={{ flexBasis: '60%', transform: 'scale(0.75)' }}>
            <MiniStatisticsI />
          </Grid>
          <Grid item xs={12} sm={6} md={4} sx={{ flexBasis: '60%', transform: 'scale(0.75)' }}>
            <MiniStatisticsT />
          </Grid>
        </Grid>
      </Grid>

      {/* Calendar will be below MiniStatistics */}
      <Grid container sx={{ padding: '10px', marginTop: -10 }}>
        <Grid item xs={12} sm={12} md={12} sx={{ flexBasis: '100%', transform: 'scale(0.90)' }}>
          <Calendar />
        </Grid>
      </Grid>

      {/* AttendanceDepartment and Leaves below the Calendar */}
      <Grid container sx={{ padding: '10px', marginTop: -8 }}>
        <Grid item xs={12} sm={6} md={6} sx={{ flexBasis: '60%', transform: 'scale(0.80)' }}>
          <AttendanceDepartment />
        </Grid>
        <Grid item xs={12} sm={6} md={6} sx={{ flexBasis: '60%', transform: 'scale(0.80)' }}>
          <Leaves />
        </Grid>
      </Grid>
      </Box>
      <ViewNotificationModal anchorEl={anchorEl} onClose={handleCloseNotification} notifications={notifications} 
      />
    </Box>
  );
}
