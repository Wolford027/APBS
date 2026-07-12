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
import { Grid, Badge, IconButton, Typography } from "@mui/material"
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import ViewNotificationModal from "../components/ViewNotificationModal"
import axios from "axios"
import { motion } from "motion/react"
import { staggerContainer, staggerItem } from "../../../shared/animations"

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
      <Typography
        variant="overline"
        sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.08em', mb: 1.5, display: 'block' }}
      >
        Overview
      </Typography>
      <Grid
        container
        spacing={3}
        component={motion.div}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <Grid item xs={12} sm={6} md={4} component={motion.div} variants={staggerItem}>
          <MiniStatisticsA />
        </Grid>
        <Grid item xs={12} sm={6} md={4} component={motion.div} variants={staggerItem}>
          <MiniStatisticsI />
        </Grid>
        <Grid item xs={12} sm={6} md={4} component={motion.div} variants={staggerItem}>
          <MiniStatisticsT />
        </Grid>
      </Grid>

      <Grid
        container
        spacing={3}
        component={motion.div}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        sx={{ mt: 1 }}
      >
        <Grid item xs={12} component={motion.div} variants={staggerItem}>
          <Calendar />
        </Grid>
        <Grid item xs={12} md={6} component={motion.div} variants={staggerItem}>
          <AttendanceDepartment />
        </Grid>
        <Grid item xs={12} md={6} component={motion.div} variants={staggerItem}>
          <Leaves />
        </Grid>
      </Grid>
      <ViewNotificationModal anchorEl={anchorEl} onClose={handleCloseNotification} notifications={notifications} />
    </PageLayout>
  );
}
