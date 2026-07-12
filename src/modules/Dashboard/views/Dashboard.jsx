import React, { useState, useEffect } from "react"
import PageLayout from "../../../shared/components/PageLayout"
import Leaves from "../components/Leaves"
import AttendanceDepartment from "../components/AttendanceDepartment"
import Calendar from "../components/Calendar"
import MiniStatisticsA from "../components/MiniStatisticsA"
import MiniStatisticsI from "../components/MiniStatisticsI"
import MiniStatisticsT from "../components/MiniStatisticsT"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../Auth/hooks/AuthContext"
import { Grid, Badge, IconButton } from "@mui/material"
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import ViewNotificationModal from "../components/ViewNotificationModal"
import axios from "axios"

export default function Dashboard() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [anchorEl, setAnchorEl] = useState(null)
  const [events, setEvents] = useState([])
  const [notifications, setNotifications] = useState([])

  const handleOpenNotification = (event) => {
    setAnchorEl(event.currentTarget) // Set anchor for dropdown
  }

  const handleCloseNotification = () => {
    setAnchorEl(null)
  }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
    <PageLayout
      title="Dashboard"
      actions={
        <IconButton color="inherit" aria-label="View notifications" onClick={handleOpenNotification}>
          <Badge badgeContent={notifications.length} color="error">
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>
      }
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <MiniStatisticsA />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MiniStatisticsI />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MiniStatisticsT />
        </Grid>
        <Grid item xs={12}>
          <Calendar />
        </Grid>
        <Grid item xs={12} md={6}>
          <AttendanceDepartment />
        </Grid>
        <Grid item xs={12} md={6}>
          <Leaves />
        </Grid>
      </Grid>
      <ViewNotificationModal anchorEl={anchorEl} onClose={handleCloseNotification} notifications={notifications} />
    </PageLayout>
  );
}
